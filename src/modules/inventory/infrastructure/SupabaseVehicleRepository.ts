import { supabase } from '../../../shared/infrastructure/supabase';
import { SupabaseRepository } from '../../../shared/infrastructure/SupabaseRepository';
import { Vehicle, PaymentItem, VehicleHistoryEntry } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleStateMachine } from '../domain/VehicleStateMachine';
import { calculateVehicleFinancials } from '../../../shared/utils/vehicle_calculations';
import { VehicleStaffManager } from './VehicleStaffManager';

export class SupabaseVehicleRepository extends SupabaseRepository<Vehicle> implements VehicleRepository {
  constructor() { super('vehicles'); }

  async getByCode(code: string): Promise<Vehicle | null> {
    const { data, error } = await supabase.from(this.tableName).select('*').eq('code', code).maybeSingle();
    if (error) throw error;
    return data as Vehicle | null;
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase.from(this.tableName).select('*').neq('status', VehicleStatus.SOLD).order('id', { ascending: false });
    if (error) throw error;
    return data as Vehicle[];
  }

  async getSoldVehiclesByMonth(monthStr: string): Promise<Vehicle[]> {
    const start = `${monthStr}-01`;
    const date = new Date(monthStr + '-01'); date.setMonth(date.getMonth() + 1);
    const end = date.toISOString().split('T')[0];
    const { data, error } = await supabase.from(this.tableName).select('*').eq('status', VehicleStatus.SOLD).gte('sale_date', start).lt('sale_date', end).order('sale_date', { ascending: false });
    if (error) throw error;
    return data as Vehicle[];
  }

  async getAll(): Promise<Vehicle[]> {
    const { data, error } = await supabase.from(this.tableName).select('*').order('id', { ascending: false });
    if (error) throw error;
    return data as Vehicle[];
  }

  async updateStatus(id: number, status: VehicleStatus, history: VehicleHistoryEntry, updates?: Partial<Vehicle>): Promise<void> {
    await this._applyStatusTransition(id, status, updates || {}, history);
  }

  async addPurchasePayment(id: number, payment: PaymentItem): Promise<void> {
    const { data: car, error: fetchError } = await supabase.from(this.tableName).select('purchase_paid_amount, purchase_payment_history').eq('id', id).single();
    if (fetchError) throw fetchError;
    const { error } = await supabase.from(this.tableName).update({
      purchase_paid_amount: (car.purchase_paid_amount || 0) + payment.amount,
      purchase_payment_history: [...(car.purchase_payment_history || []), payment]
    } as any).eq('id', id);
    if (error) throw error;
  }

  async addSalePayment(id: number, payment: PaymentItem, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number): Promise<void> {
    const { data: car, error: fetchError } = await supabase.from(this.tableName).select('received_amount, sale_payment_history, commission, sale_price').eq('id', id).single();
    if (fetchError) throw fetchError;

    const updates: any = {
      received_amount: (car.received_amount || 0) + payment.amount,
      sale_payment_history: [...(car.sale_payment_history || []), payment],
      seller
    };
    if (salePrice !== undefined && salePrice >= 0) updates.sale_price = salePrice;
    if (buyerName) updates.buyer_name = buyerName;
    if (commission !== undefined && commission >= 0) updates.commission = commission;

    if (nextStatus === VehicleStatus.SOLD) {
      updates.sale_date = payment.date;
      updates.received_amount = (salePrice && salePrice > 0) ? salePrice : (car.sale_price || 0);
      if (updates.received_amount > 0) updates.sale_price = updates.received_amount;
    }

    await this._applyStatusTransition(id, nextStatus, updates, { date: payment.date, status: nextStatus, user: seller, note: `Thanh toán: ${payment.amount.toLocaleString()}đ. ${payment.note || ''}` });
  }

  async cancelSale(id: number, history: VehicleHistoryEntry): Promise<void> {
    const { data: car, error: fetchError } = await supabase.from(this.tableName).select('received_amount, sale_payment_history').eq('id', id).single();
    if (fetchError) throw fetchError;

    const updatedHistory = [...(car.sale_payment_history || [])];
    if (car.received_amount > 0) {
      updatedHistory.push({ amount: -car.received_amount, note: 'Hoàn tiền cọc - Hủy giao dịch', date: history.date, receiver: history.user });
    }
    await this._applyStatusTransition(id, VehicleStatus.IN_STOCK, { sale_payment_history: updatedHistory }, history);
  }

  async update(id: number | string, data: Partial<Vehicle>): Promise<Vehicle> {
    const { data: current, error: fetchError } = await supabase.from(this.tableName).select('*').eq('id', id).single();
    if (fetchError) throw fetchError;

    const merged = { ...current, ...data };
    const financials = calculateVehicleFinancials(merged);
    const updates: any = { ...data };
    if (data.buyer && data.buyer !== current.buyer) updates.buyer_name = await VehicleStaffManager.getStaffName(data.buyer);
    if (data.seller && data.seller !== current.seller) updates.seller_name = await VehicleStaffManager.getStaffName(data.seller);

    const { data: updated, error } = await supabase.from(this.tableName).update({ ...updates, total_cost: financials.totalCost, profit: financials.netProfit }).eq('id', id).select().single();
    if (error) throw error;
    return updated as Vehicle;
  }

  private async _applyStatusTransition(id: number, nextStatus: VehicleStatus, updates: any, historyEntry: VehicleHistoryEntry): Promise<void> {
    const { data: current, error: fetchError } = await supabase.from(this.tableName).select('*').eq('id', id).single();
    if (fetchError) throw fetchError;

    const merged = { ...current, ...VehicleStateMachine.getFieldsToReset(nextStatus), ...updates, status: nextStatus };
    const financials = calculateVehicleFinancials(merged);
    const finalUpdates = { ...updates };
    if (updates.seller && updates.seller !== current.seller) finalUpdates.seller_name = await VehicleStaffManager.getStaffName(updates.seller);
    if (current.buyer && !current.buyer_name) finalUpdates.buyer_name = await VehicleStaffManager.getStaffName(current.buyer);

    const updateData: any = { ...VehicleStateMachine.getFieldsToReset(nextStatus), ...finalUpdates, status: nextStatus, total_cost: financials.totalCost, profit: financials.netProfit, history: [...(current.history || []), historyEntry] };
    if (nextStatus === VehicleStatus.SOLD) {
      updateData.final_financials = { grossProfit: financials.grossProfit, netProfit: financials.netProfit, showroomProfitShare: financials.showroomProfitShare, partnerProfitShare: financials.netProfit - financials.showroomProfitShare, buyingCommission: financials.buyingCommission, sellingCommission: financials.sellingCommission, totalInvestment: financials.totalInvestment, lockedAt: new Date().toISOString() };
    }

    const { error } = await supabase.from(this.tableName).update(updateData).eq('id', id);
    if (error) throw error;

    const finalSeller = updates.seller || current.seller;
    if (finalSeller && finalSeller !== current.seller && nextStatus !== VehicleStatus.IN_STOCK) {
      await VehicleStaffManager.assignVehicleToStaff(finalSeller, current.code);
    }
  }

  subscribe(callback: (vehicles: Vehicle[]) => void): () => void {
    const channel = supabase.channel('vehicles_realtime').on('postgres_changes', { event: '*', schema: 'public', table: this.tableName }, async () => callback(await this.getAll())).subscribe();
    return () => { supabase.removeChannel(channel); };
  }

  async getVehiclesByStaff(staffCode: string): Promise<Vehicle[]> {
    const { data, error } = await supabase.from(this.tableName).select('*').or(`seller.eq."${staffCode}",coinvestor_code.eq."${staffCode}",buyer.eq."${staffCode}"`).order('id', { ascending: false });
    if (error) throw error;
    return data as Vehicle[];
  }

  async getVehiclesByCodes(codes: string[]): Promise<Vehicle[]> {
    if (codes.length === 0) return [];
    const { data, error } = await supabase.from(this.tableName).select('*').or(`seller.in.(${codes.map(c => `"${c}"`).join(',')}),buyer.in.(${codes.map(c => `"${c}"`).join(',')}),coinvestor_code.in.(${codes.map(c => `"${c}"`).join(',')})`).order('id', { ascending: false });
    if (error) throw error;
    return data as Vehicle[];
  }

  async delete(id: string): Promise<void> {
    const { data: car } = await supabase.from(this.tableName).select('code').eq('id', id).single();
    if (car) await VehicleStaffManager.removeFromStaffTracking(car.code);
    await super.delete(id);
  }
}
