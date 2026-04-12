import { supabase } from '../../../shared/infrastructure/supabase';
import { SupabaseRepository } from '../../../shared/infrastructure/SupabaseRepository';
import { Vehicle, PaymentItem, VehicleHistoryEntry } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleStatus, STAFF_CONSTANTS } from '../../../shared/domain/constants';
import { VehicleStateMachine } from '../domain/VehicleStateMachine';
import { calculateVehicleFinancials } from '../../../shared/utils/vehicle_calculations';

export class SupabaseVehicleRepository extends SupabaseRepository<Vehicle> implements VehicleRepository {
  constructor() {
    super('vehicles');
  }

  async getByCode(code: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) throw error;
    return data as Vehicle | null;
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .neq('status', VehicleStatus.SOLD)
      .order('id', { ascending: false });

    if (error) throw error;
    return data as Vehicle[];
  }

  async getSoldVehiclesByMonth(monthStr: string): Promise<Vehicle[]> {
    // monthStr format: 'YYYY-MM'
    const startOfMonth = `${monthStr}-01`;
    const date = new Date(monthStr + '-01');
    date.setMonth(date.getMonth() + 1);
    const endOfMonth = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', VehicleStatus.SOLD)
      .gte('sale_date', startOfMonth)
      .lt('sale_date', endOfMonth)
      .order('sale_date', { ascending: false });

    if (error) throw error;
    return data as Vehicle[];
  }

  async getAll(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    return data as Vehicle[];
  }

  async updateStatus(id: number, status: VehicleStatus, historyEntry: VehicleHistoryEntry, updates?: Partial<Vehicle>): Promise<void> {
    await this._applyStatusTransition(id, status, updates || {}, historyEntry);
  }

  async addPurchasePayment(id: number, payment: PaymentItem): Promise<void> {
    const { data: currentCar, error: fetchError } = await supabase
      .from(this.tableName)
      .select('purchase_paid_amount, purchase_payment_history')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newPaidAmount = (currentCar.purchase_paid_amount || 0) + payment.amount;
    const newHistory = [...(currentCar.purchase_payment_history || []), payment];

    const { error } = await supabase
      .from(this.tableName)
      .update({
        purchase_paid_amount: newPaidAmount,
        purchase_payment_history: newHistory
      } as any)
      .eq('id', id);

    if (error) throw error;
  }

  async addSalePayment(id: number, payment: PaymentItem, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number): Promise<void> {
    const { data: currentCar, error: fetchError } = await supabase
      .from(this.tableName)
      .select('received_amount, sale_payment_history, commission, sale_price')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newReceivedAmount = (currentCar.received_amount || 0) + payment.amount;
    const updatedPaymentHistory = [...(currentCar.sale_payment_history || []), payment];

    const updates: any = {
      received_amount: newReceivedAmount,
      sale_payment_history: updatedPaymentHistory,
      seller: seller
    };

    if (salePrice !== undefined && salePrice >= 0) updates.sale_price = salePrice;
    if (buyerName) updates.buyer_name = buyerName;
    if (commission !== undefined && commission >= 0) updates.commission = commission;

    if (nextStatus === VehicleStatus.SOLD) {
      updates.sale_date = payment.date;
      const finalPrice = (salePrice && salePrice > 0) ? salePrice : (currentCar.sale_price || 0);
      updates.received_amount = finalPrice;
      // Ensure sale_price matches final price at point of sale if not already updated
      if (finalPrice > 0) updates.sale_price = finalPrice;
    }

    // Default commission if not set (null) and not provided in this update
    if (currentCar.commission === null && updates.commission === undefined) {
      updates.commission = STAFF_CONSTANTS.DEFAULT_SALE_COMMISSION;
    }

    const historyEntry: VehicleHistoryEntry = {
      date: payment.date,
      status: nextStatus,
      user: seller,
      note: `Thanh toán: ${payment.amount.toLocaleString()}đ. ${payment.note || ''}`
    };

    await this._applyStatusTransition(id, nextStatus, updates, historyEntry);
  }

  async cancelSale(id: number, historyEntry: VehicleHistoryEntry): Promise<void> {
    const { data: currentCar, error: fetchError } = await supabase
      .from(this.tableName)
      .select('received_amount, sale_payment_history')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    let updatedPaymentHistory = [...(currentCar.sale_payment_history || [])];
    if (currentCar.received_amount > 0) {
      updatedPaymentHistory.push({
        amount: -currentCar.received_amount,
        note: 'Hoàn tiền cọc - Hủy giao dịch',
        date: historyEntry.date,
        receiver: historyEntry.user
      });
    }

    await this._applyStatusTransition(id, VehicleStatus.IN_STOCK, {
      sale_payment_history: updatedPaymentHistory
    }, historyEntry);
  }

  /**
   * Override update() để luôn recalculate profit và total_cost từ cost_history.
   * Ngăn chặn stale profit khi thêm/xóa chi phí.
   */
  async update(id: number | string, data: Partial<Vehicle>): Promise<Vehicle> {
    // Fetch current full vehicle để merge với update data
    const { data: currentCar, error: fetchError } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const merged = { ...currentCar, ...data };
    const financials = calculateVehicleFinancials(merged);

    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update({
        ...data,
        total_cost: financials.totalCost,
        profit: financials.netProfit,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated as Vehicle;
  }

  /**
   * Unified method to apply status transitions with data lifecycle policies.
   */
  private async _applyStatusTransition(
    id: number, 
    nextStatus: VehicleStatus, 
    updates: any, 
    historyEntry: VehicleHistoryEntry
  ): Promise<void> {
    // 1. Fetch current record
    const { data: currentCar, error: fetchError } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 2. Get transition rules (fields to reset)
    const resets = VehicleStateMachine.getFieldsToReset(nextStatus);

    // 3. Merge resets with provided updates
    // Updates take precedence over resets
    const mergedData = {
      ...currentCar,
      ...resets,
      ...updates,
      status: nextStatus
    };

    // 3.5 Recalculate financial fields for database integrity
    const financials = calculateVehicleFinancials(mergedData);
    const updateData = {
      ...resets,
      ...updates,
      status: nextStatus,
      total_cost: financials.totalCost,
      profit: financials.netProfit,
      history: [...(currentCar.history || []), historyEntry]
    };

    // 4. Perform the update
    const { error: updateError } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id);

    if (updateError) throw updateError;

    // 5. Handle Side Effects: Staff Tracking
    const finalSeller = updates.seller || currentCar.seller;
    // Only track if it's a seller change in a sale context
    if (finalSeller && finalSeller !== currentCar.seller && nextStatus !== VehicleStatus.IN_STOCK) {
      await this._assignVehicleToStaff(finalSeller, currentCar.code);
    }
  }

  subscribe(callback: (vehicles: Vehicle[]) => void): () => void {
    const channel = supabase
      .channel('vehicles_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: this.tableName },
        async () => {
          const vehicles = await this.getAll();
          callback(vehicles);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Private helper to assign a vehicle to a staff's tracked_cars array in the employees table.
   */
  private async _assignVehicleToStaff(staffCode: string, vehicleCode: string): Promise<void> {
    try {
      // 1. Lấy dữ liệu hiện tại của nhân viên
      const { data: staff, error: fetchError } = await supabase
        .from('employees')
        .select('tracked_cars')
        .eq('code', staffCode)
        .maybeSingle();

      if (fetchError || !staff) {
        console.warn(`Could not find staff with code ${staffCode} to assign vehicle.`);
        return;
      }

      // 2. Cập nhật mảng tracked_cars
      const currentTracked = staff.tracked_cars || [];
      if (!currentTracked.includes(vehicleCode)) {
        const updatedTracked = [...currentTracked, vehicleCode];
        const { error: updateError } = await supabase
          .from('employees')
          .update({ tracked_cars: updatedTracked } as any)
          .eq('code', staffCode);

        if (updateError) {
          console.error(`Error updating tracked_cars for staff ${staffCode}:`, updateError);
        }
      }
    } catch (err) {
      console.error('Unexpected error', err);
    }
  }


  async getVehiclesByStaff(staffCode: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`seller.eq."${staffCode}",coinvestor_code.eq."${staffCode}",buyer.eq."${staffCode}"`)
      .order('id', { ascending: false });

    if (error) throw error;
    return data as Vehicle[];
  }

  async getVehiclesByCodes(codes: string[]): Promise<Vehicle[]> {
    if (codes.length === 0) return [];
    
    // Tìm tất cả xe mà nhân viên trong danh sách codes có tham gia (Nhập/Bán/Góp vốn)
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`seller.in.(${codes.map(c => `"${c}"`).join(',')}),buyer.in.(${codes.map(c => `"${c}"`).join(',')}),coinvestor_code.in.(${codes.map(c => `"${c}"`).join(',')})`)
      .order('id', { ascending: false });

    if (error) throw error;
    return data as Vehicle[];
  }
}
