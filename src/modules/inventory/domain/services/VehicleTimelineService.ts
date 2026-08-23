import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS } from '@/src/shared/domain/constants';

export type TimelineCategory = 'all' | 'income' | 'expense' | 'status';

export type TimelineEventType = 
  | 'STATUS_CHANGE'
  | 'INCOME'
  | 'EXPENSE_PURCHASE'
  | 'EXPENSE_COST'
  | 'REFUND'
  | 'FORFEIT';

export interface UnifiedTimelineEvent {
  id: string;
  date: string;
  category: 'income' | 'expense' | 'status';
  type: TimelineEventType;
  title: string;
  amount?: number;
  status?: VehicleStatus;
  user?: string;
  receiver?: string;
  note?: string;
  orderKey: number; // For chronological sorting
}

export interface TimelineFinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
}

export class VehicleTimelineService {
  /**
   * Tạo danh sách Dòng thời gian toàn diện (Unified Timeline) từ toàn bộ dữ liệu xe.
   */
  static buildUnifiedTimeline(vehicle: Vehicle): UnifiedTimelineEvent[] {
    const events: UnifiedTimelineEvent[] = [];
    let sequenceCounter = 0;

    // 1. Xử lý các bản ghi trong history (Trạng thái và các giao dịch bán kèm theo)
    const historyList = vehicle.history || [];

    historyList.forEach((h, idx) => {
      sequenceCounter++;
      const isPaymentNote = (h.note || '').includes('Thanh toán:');
      
      // Parse amount nếu có trong note
      let parsedAmount: number | undefined = undefined;
      if (isPaymentNote) {
        const match = h.note.match(/Thanh toán:\s*([0-9.,]+)đ/);
        if (match && match[1]) {
          const rawNum = match[1].replace(/\./g, '').replace(/,/g, '');
          parsedAmount = Number(rawNum) || undefined;
        }
      }

      if (isPaymentNote || h.status === VehicleStatus.SOLD || (h.status === VehicleStatus.DEPOSIT_SALE && parsedAmount)) {
        events.push({
          id: `hist-inc-${idx}-${sequenceCounter}`,
          date: h.date,
          category: 'income',
          type: 'INCOME',
          title: VEHICLE_STATUS_LABELS[h.status as VehicleStatus] || `Giao dịch ${h.status}`,
          amount: parsedAmount,
          status: h.status as VehicleStatus,
          user: h.user,
          note: h.note,
          orderKey: this._toTimestamp(h.date, idx)
        });
      } else {
        events.push({
          id: `hist-stat-${idx}-${sequenceCounter}`,
          date: h.date,
          category: 'status',
          type: 'STATUS_CHANGE',
          title: VEHICLE_STATUS_LABELS[h.status as VehicleStatus] || `Chuyển trạng thái`,
          status: h.status as VehicleStatus,
          user: h.user,
          note: h.note,
          orderKey: this._toTimestamp(h.date, idx)
        });
      }
    });

    // 2. Xử lý các đợt chi tiền nhập xe (purchase_payment_history)
    const purchasePayments = vehicle.purchase_payment_history || [];
    purchasePayments.forEach((p, idx) => {
      sequenceCounter++;
      events.push({
        id: `purch-exp-${idx}-${sequenceCounter}`,
        date: p.date,
        category: 'expense',
        type: 'EXPENSE_PURCHASE',
        title: p.note || 'Thanh toán tiền nhập xe',
        amount: p.amount,
        receiver: p.receiver || 'Chủ xe / Đối tác',
        user: p.staff_id,
        note: p.note,
        orderKey: this._toTimestamp(p.date, idx + 0.1)
      });
    });

    // 3. Xử lý các đợt chi phí Spa / Dọn dẹp / Sửa chữa (cost_history)
    const costHistory = vehicle.cost_history || [];
    costHistory.forEach((c, idx) => {
      sequenceCounter++;
      events.push({
        id: `cost-exp-${idx}-${sequenceCounter}`,
        date: c.date || vehicle.purchase_date || '',
        category: 'expense',
        type: 'EXPENSE_COST',
        title: c.note || 'Chi phí Spa / Làm đẹp',
        amount: c.amount,
        user: c.staff_id,
        note: c.note,
        orderKey: this._toTimestamp(c.date || vehicle.purchase_date, idx + 0.2)
      });
    });

    // 4. Bổ sung các đợt thu bán xe từ sale_payment_history nếu chưa có trong history
    const salePayments = vehicle.sale_payment_history || [];
    salePayments.forEach((sp, idx) => {
      // Kiểm tra xem đã có event income trùng date và amount chưa
      const isAlreadyInHistory = events.some(e => 
        e.category === 'income' && 
        e.date === sp.date && 
        e.amount === sp.amount
      );

      if (!isAlreadyInHistory) {
        sequenceCounter++;
        const isNegative = (sp.amount || 0) < 0;
        events.push({
          id: `sale-pay-${idx}-${sequenceCounter}`,
          date: sp.date,
          category: isNegative ? 'expense' : 'income',
          type: isNegative ? 'REFUND' : 'INCOME',
          title: sp.note || (isNegative ? 'Hoàn tiền cọc' : 'Thu tiền bán xe'),
          amount: Math.abs(sp.amount || 0),
          receiver: sp.receiver,
          user: sp.staff_id,
          note: sp.note,
          orderKey: this._toTimestamp(sp.date, idx + 0.3)
        });
      }
    });

    // Sắp xếp sự kiện theo trình tự thời gian (Cũ nhất trước, mới nhất sau cùng)
    return events.sort((a, b) => a.orderKey - b.orderKey);
  }

  /**
   * Tính toán tóm tắt tài chính từ các sự kiện dòng tiền của xe
   */
  static calculateFinancialSummary(vehicle: Vehicle, events: UnifiedTimelineEvent[]): TimelineFinancialSummary {
    const totalIncome = events
      .filter(e => e.category === 'income')
      .reduce((sum, e) => sum + (e.amount || 0), 0) || (vehicle.received_amount || 0);

    const totalCostHistory = (vehicle.cost_history || []).reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalPurchasePaid = (vehicle.purchase_payment_history || []).reduce((sum, p) => sum + (p.amount || 0), 0) || (vehicle.purchase_paid_amount || vehicle.purchase_price || 0);

    const totalExpense = totalPurchasePaid + totalCostHistory;
    const netCashFlow = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netCashFlow
    };
  }

  /**
   * Lọc sự kiện theo phân loại
   */
  static filterEvents(events: UnifiedTimelineEvent[], category: TimelineCategory): UnifiedTimelineEvent[] {
    if (category === 'all') return events;
    return events.filter(e => e.category === category);
  }

  private static _toTimestamp(dateStr?: string, subOrder: number = 0): number {
    if (!dateStr) return subOrder;
    const time = new Date(dateStr).getTime();
    return isNaN(time) ? subOrder : time + subOrder;
  }
}
