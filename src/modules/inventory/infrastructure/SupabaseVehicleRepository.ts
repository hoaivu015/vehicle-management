import { supabase } from '../../../shared/infrastructure/supabase';
import { Vehicle, PaymentItem, VehicleHistoryEntry } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleStateMachine } from '../domain/VehicleStateMachine';
import { VehicleEntity } from '../domain/VehicleEntity';
import { VehicleSchema, VehicleDTO, VehicleRowSchema } from '../domain/VehicleSchema';
import { EntityNotFoundError } from '../../../shared/domain/errors';
import { createValidatedRepository } from '../../../shared/infrastructure/RepositoryFactory';

export class SupabaseVehicleRepository implements VehicleRepository {
  private readonly tableName = 'vehicles';
  private readonly baseRepo = createValidatedRepository<Vehicle, VehicleDTO>(
    this.tableName, 
    VehicleSchema,
    {
      toDomain: (dto) => dto as Vehicle,
      toDTO: (domain) => {
        // Chỉ lấy các trường có trong DB thực tế
        const result = VehicleRowSchema.partial().safeParse(domain);
        if (!result.success) return domain as Partial<VehicleDTO>;

        const sanitized: any = {};
        for (const key of Object.keys(domain)) {
          if (key in result.data) {
            sanitized[key] = (result.data as any)[key];
          }
        }
        return sanitized as Partial<VehicleDTO>;
      }
    }
  );

  async getAll(): Promise<Vehicle[]> {
    return this.baseRepo.getAll();
  }

  async getById(id: string | number): Promise<Vehicle | null> {
    return this.baseRepo.getById(id);
  }

  async create(item: Partial<Vehicle>): Promise<Vehicle> {
    return this.baseRepo.create(item);
  }

  async update(id: string | number, item: Partial<Vehicle>): Promise<Vehicle> {
    const current = await this.getById(id);
    if (!current) throw new EntityNotFoundError('Vehicle', id);

    const merged = { ...current, ...item };
    const entity = new VehicleEntity(merged);
    const financials = entity.financials;

    return this.baseRepo.update(id, {
      ...item,
      total_cost: financials.totalCost,
      profit: financials.netProfit
    });
  }

  async delete(id: string | number): Promise<void> {
    return this.baseRepo.delete(id);
  }

  async getByCode(code: string): Promise<Vehicle | null> {
    const { data, error } = await supabase.from(this.tableName).select('*').eq('code', code).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return VehicleSchema.parse(data);
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase.from(this.tableName).select('*').neq('status', VehicleStatus.SOLD).order('id', { ascending: false });
    if (error) throw error;
    return (data || []).map(v => VehicleSchema.parse(v));
  }

  async getSoldVehiclesByMonth(monthStr: string): Promise<Vehicle[]> {
    const start = `${monthStr}-01`;
    const date = new Date(monthStr + '-01'); date.setMonth(date.getMonth() + 1);
    const end = date.toISOString().split('T')[0];
    const { data, error } = await supabase.from(this.tableName).select('*').eq('status', VehicleStatus.SOLD).gte('sale_date', start).lt('sale_date', end).order('sale_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(v => VehicleSchema.parse(v));
  }

  async updateStatus(id: number, status: VehicleStatus, history: VehicleHistoryEntry, updates?: Partial<Vehicle>): Promise<void> {
    await this._applyStatusTransition(id, status, (updates as Partial<VehicleDTO>) || {}, history);
  }

  async addPurchasePayment(id: number, payment: PaymentItem): Promise<void> {
    const current = await this.getById(id);
    if (!current) throw new EntityNotFoundError('Vehicle', id);

    const { error } = await supabase.from(this.tableName).update(this._sanitize({
      purchase_paid_amount: (current.purchase_paid_amount || 0) + payment.amount,
      purchase_payment_history: [...(current.purchase_payment_history || []), payment]
    })).eq('id', id);
    
    if (error) throw error;
  }

  async addSalePayment(id: number, payment: PaymentItem, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number, buyingBonus?: number): Promise<void> {
    const car = await this.getById(id);
    if (!car) throw new EntityNotFoundError('Vehicle', id);

    const updates: Partial<VehicleDTO> = {
      received_amount: (car.received_amount || 0) + payment.amount,
      sale_payment_history: [...(car.sale_payment_history || []), payment],
      seller
    };
    if (salePrice !== undefined && salePrice >= 0) updates.sale_price = salePrice;
    if (buyerName) updates.customer_name = buyerName;
    if (commission !== undefined && commission >= 0) updates.commission = commission;
    
    if (typeof buyingBonus === 'number' && buyingBonus >= 0) {
      updates.buying_bonus = buyingBonus;
    }

    if (nextStatus === VehicleStatus.SOLD) {
      updates.sale_date = payment.date;
      updates.received_amount = (salePrice && salePrice > 0) ? salePrice : (car.sale_price || 0);
      if (updates.received_amount > 0) updates.sale_price = updates.received_amount;
    }

    await this._applyStatusTransition(id, nextStatus, updates, { date: payment.date, status: nextStatus, user: seller, note: `Thanh toán: ${payment.amount.toLocaleString('vi-VN', { maximumFractionDigits: 3 })}đ. ${payment.note || ''}` });
  }

  async cancelSale(id: number, history: VehicleHistoryEntry): Promise<void> {
    const car = await this.getById(id);
    if (!car) throw new EntityNotFoundError('Vehicle', id);

    const updatedHistory = [...(car.sale_payment_history || [])];
    if ((car.received_amount || 0) > 0) {
      updatedHistory.push({ amount: -(car.received_amount || 0), note: 'Hoàn tiền cọc - Hủy giao dịch', date: history.date, receiver: history.user, staff_id: '', staff_expense_id: '' });
    }
    await this._applyStatusTransition(id, VehicleStatus.IN_STOCK, { sale_payment_history: updatedHistory }, history);
  }

  private _sanitize(data: Partial<Vehicle>): any {
    const result = VehicleRowSchema.partial().safeParse(data);
    if (!result.success) return data;
    
    // Chỉ giữ lại các trường thực sự có trong data đầu vào để tránh việc Zod tự điền default/transformer cho các trường thiếu
    const sanitized: any = {};
    for (const key of Object.keys(data)) {
      if (key in result.data) {
        sanitized[key] = (result.data as any)[key];
      }
    }
    return sanitized;
  }

  private async _applyStatusTransition(id: number, nextStatus: VehicleStatus, updates: Partial<VehicleDTO>, historyEntry: VehicleHistoryEntry): Promise<void> {
    const current = await this.getById(id);
    if (!current) throw new EntityNotFoundError('Vehicle', id);

    const merged = { ...current, ...VehicleStateMachine.getFieldsToReset(nextStatus), ...updates, status: nextStatus };
    const entity = new VehicleEntity(merged);
    const financials = entity.financials;
    
    const updateData = { 
      ...VehicleStateMachine.getFieldsToReset(nextStatus), 
      ...updates, 
      status: nextStatus, 
      total_cost: financials.totalCost, 
      profit: financials.netProfit, 
      history: [...(current.history || []), historyEntry] 
    };

    const { error } = await supabase.from(this.tableName).update(this._sanitize(updateData)).eq('id', id);
    if (error) throw error;
  }

  subscribe(callback: (vehicles: Vehicle[]) => void): () => void {
    const channel = supabase.channel('vehicles_realtime').on('postgres_changes', { event: '*', schema: 'public', table: this.tableName }, async () => callback(await this.getAll())).subscribe();
    return () => { supabase.removeChannel(channel); };
  }

  async getVehiclesByStaff(staffCode: string): Promise<Vehicle[]> {
    const { data, error } = await supabase.from(this.tableName).select('*').or(`seller.eq."${staffCode}",coinvestor_code.eq."${staffCode}",buyer.eq."${staffCode}"`).order('id', { ascending: false });
    if (error) throw error;
    return (data || []).map(v => VehicleSchema.parse(v));
  }

  async getVehiclesByCodes(codes: string[]): Promise<Vehicle[]> {
    if (codes.length === 0) return [];
    const { data, error } = await supabase.from(this.tableName).select('*').or(`seller.in.(${codes.map(c => `"${c}"`).join(',')}),buyer.in.(${codes.map(c => `"${c}"`).join(',')}),coinvestor_code.in.(${codes.map(c => `"${c}"`).join(',')})`).order('id', { ascending: false });
    if (error) throw error;
    return (data || []).map(v => VehicleSchema.parse(v));
  }
}

