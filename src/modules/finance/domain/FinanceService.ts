import { VehicleStatus } from '@/src/shared/domain/constants';
import { Vehicle } from '@/src/shared/domain/types';
import { StaffSalaryService } from '@/src/modules/staff/domain/StaffSalaryService';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';

import { Expense } from './ExpenseRepository';
export type { Expense };

export interface SalaryCalculation {
  staffId: string;
  staffName: string;
  baseSalary: number;
  salesCommission: number;
  buyingCommission: number;
  buyingBonus: number;
  coinvestProfitShare: number;
  regularIncome: number;
  bonusMultiplier: number;
  totalIncome: number;
  soldCarsCount: number;
  boughtCarsCount: number;
}

export interface UnifiedLedgerEntry {
  id: string;
  date: string;
  amount: number;
  type: 'inflow' | 'outflow';
  scope: 'sale' | 'purchase' | 'car_cost' | 'operating' | 'salary' | 'advance' | 'partner' | 'other_income' | 'deposit_refund' | 'coinvest';
  category: string;
  title: string;
  subtitle?: string;
  vehicleId?: number | string;
  vehicleCode?: string;
  staffId?: string;
  rawExpenseId?: string | number;
  sourceRef?: string;
  editable?: boolean;
}

export class FinanceService {
  /**
   * Tính toán lương và hoa hồng cho nhân viên trong một tháng.
   */
  static calculateMonthlySalaries(
    staff: import('../../../shared/domain/types').Staff[],
    vehicles: Vehicle[],
    month: string
  ): SalaryCalculation[] {
    return staff.map(s => {
      const details = StaffSalaryService.calculateMonthlySalary(s, vehicles, month);
      const regularIncome = (details.base || 0) + (details.salesCommission || 0) + (details.buyingCommission || 0) + (details.buyingBonus || 0);
      
      return {
        staffId: String(s.id),
        staffName: s.name,
        baseSalary: details.base,
        salesCommission: details.salesCommission,
        buyingCommission: details.buyingCommission,
        buyingBonus: details.buyingBonus || 0,
        coinvestProfitShare: details.coinvestProfitShare || 0,
        regularIncome,
        bonusMultiplier: details.kpiBonusMultiplier,
        totalIncome: details.totalSalary,
        soldCarsCount: details.soldCount,
        boughtCarsCount: details.boughtCount
      };
    });
  }

  /**
   * Tính toán doanh thu từ việc bán xe trong tháng (theo dòng tiền thực tế).
   */
  static calculateMonthlyRevenue(vehicles: Vehicle[], month: string): number {
    return vehicles.reduce((acc, v) => {
      const monthPayments = (v.sale_payment_history || [])
        .filter(p => p.date?.startsWith(month))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      return acc + monthPayments;
    }, 0);
  }

  /**
   * Tính toán tổng doanh số theo hợp đồng bán xe chốt trong tháng (Accrual Basis).
   */
  static calculateMonthlyContractRevenue(vehicles: Vehicle[], month: string): number {
    return vehicles
      .filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(month))
      .reduce((acc, v) => acc + (v.sale_price || 0), 0);
  }

  /**
   * Tính toán lợi nhuận gộp từ việc bán xe (đã trừ vốn và chi phí xe).
   * Vẫn tính theo xe đã bán (Realized Profit).
   */
  static calculateMonthlySalesProfit(vehicles: Vehicle[], month: string): number {
    return vehicles
      .filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(month))
      .reduce((acc, v) => {
        const fin = calculateVehicleFinancials(v);
        // Doanh thu gộp của Showroom = Lợi nhuận gộp - Phần chia cho đối tác
        return acc + (fin.grossProfit - (fin.partnerProfitShare || 0));
      }, 0);
  }

  /**
   * Tính toán tổng dòng tiền chi ra cho việc mua xe trong tháng (theo dòng tiền thực tế).
   */
  static calculateMonthlyPurchaseOutflow(vehicles: Vehicle[], month: string): number {
    return vehicles.reduce((acc, v) => {
      const monthPayments = (v.purchase_payment_history || [])
        .filter(p => p.date?.startsWith(month))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      return acc + monthPayments;
    }, 0);
  }

  /**
   * Tính toán tổng chi phí sửa chữa/spa phát sinh trong tháng.
   * directOnly: true để loại bỏ chi phí do NV ứng (đã tính qua phiếu chi hoàn ứng).
   */
  static calculateMonthlyCarCosts(vehicles: Vehicle[], month: string, directOnly: boolean = false): number {
    return vehicles.reduce((acc, v) => {
      const monthCosts = (v.cost_history || [])
        .filter(cost => {
          if (!cost.date?.startsWith(month)) return false;
          if (directOnly && cost.staff_id) return false;
          return true;
        })
        .reduce((sum, cost) => sum + (cost.amount || 0), 0);
      return acc + monthCosts;
    }, 0);
  }

  /**
   * Tính toán tổng chi trả cho đối tác trong tháng (Vốn + Lợi nhuận).
   * Ưu tiên tính theo dòng tiền thực chi từ operating_expenses (Cash-basis SSoT).
   */
  static calculateMonthlyPartnerPayouts(vehicles: Vehicle[], month: string, allExpenses?: Expense[]): number {
    if (allExpenses && allExpenses.length > 0) {
      return allExpenses
        .filter(e => e.date?.startsWith(month) && e.category === 'Đối tác' && !FinanceService.isInflowExpense(e))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
    }

    return vehicles
      .filter(v => v.status === VehicleStatus.SOLD && v.is_coinvested)
      .reduce((acc, v) => {
        const fin = calculateVehicleFinancials(v);
        let payout = 0;
        if (v.sale_date?.startsWith(month)) {
          if (v.partner_capital_repaid) payout += (fin.refundablePartnerCapital ?? fin.coinvestAmount);
          if (v.partner_profit_shared && fin.partnerProfitShare > 0) payout += fin.partnerProfitShare;
        }
        return acc + payout;
      }, 0);
  }

  /**
   * Tính toán dữ liệu biểu đồ tuần dựa trên dòng tiền thực tế (Cash-basis).
   */
  static calculateWeeklyCashflow(
    vehicles: Vehicle[], 
    month: string,
    expenses: Expense[]
  ) {
    const weeks = [
      { name: 'Tuần 1', start: 1, end: 7, thu: 0, chi: 0 },
      { name: 'Tuần 2', start: 8, end: 14, thu: 0, chi: 0 },
      { name: 'Tuần 3', start: 15, end: 21, thu: 0, chi: 0 },
      { name: 'Tuần 4', start: 22, end: 31, thu: 0, chi: 0 }
    ];

    vehicles.forEach(v => {
      // 1. Thu tiền bán xe từ khách
      if (v.sale_payment_history && v.sale_payment_history.length > 0) {
        v.sale_payment_history
          .filter(p => p.date?.startsWith(month))
          .forEach(p => {
            const day = parseInt(p.date.split('-')[2]);
            const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
            week.thu += (p.amount || 0);
          });
      }

      // 2. Thu tiền góp vốn từ đối tác/nhân viên khi nhập xe vào quỹ công ty
      const coinvestDate = v.coinvest_date || v.purchase_date || (v.created_at ? v.created_at.split('T')[0] : '');
      if (v.is_coinvested && v.coinvest_amount && v.coinvest_amount > 0 && coinvestDate.startsWith(month)) {
        const day = parseInt(coinvestDate.split('-')[2]) || 1;
        const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
        week.thu += v.coinvest_amount;
      }

      // 3. Chi tiền mua xe
      if (v.purchase_payment_history && v.purchase_payment_history.length > 0) {
        v.purchase_payment_history
          .filter(p => p.date?.startsWith(month))
          .forEach(p => {
            const day = parseInt(p.date.split('-')[2]);
            const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
            week.chi += (p.amount || 0);
          });
      }

      // 4. Chỉ trừ chi phí xe do Showroom trực tiếp chi tiền mặt (không bao gồm nhân viên ứng)
      (v.cost_history || [])
        .filter(c => !c.staff_id && c.date?.startsWith(month))
        .forEach(c => {
          const day = parseInt(c.date.split('-')[2]);
          const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
          week.chi += (c.amount || 0);
        });
    });

    expenses
      .filter(e => e.date?.startsWith(month))
      .forEach(e => {
        const day = parseInt(e.date.split('-')[2]);
        const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
        if (FinanceService.isInflowExpense(e)) {
          week.thu += Math.abs(e.amount || 0);
        } else {
          week.chi += (e.amount || 0);
        }
      });

    return weeks.map(({ name, thu, chi }) => ({ name, thu, chi }));
  }

  /**
   * Helper xác định một bản ghi trong operating_expenses là Phiếu Thu (Inflow) hay Phiếu Chi (Outflow).
   */
  static isInflowExpense(e: { category?: string; name?: string; amount?: number }): boolean {
    if (!e) return false;
    return (
      e.category === 'Thu nhập khác' ||
      e.category === 'Thu khác' ||
      (e.name || '').startsWith('[Thu]') ||
      (typeof e.amount === 'number' && e.amount < 0)
    );
  }

  /**
   * Xây dựng Sổ Cái Giao Dịch Hợp Nhất (Single Source of Truth Virtual Ledger).
   * Chuẩn hóa toàn bộ dòng tiền từ xe, chi phí vận hành, lương, hoàn ứng, và đối tác.
   */
  static buildUnifiedLedger(
    vehicles: Vehicle[],
    expenses: Expense[],
    monthFilter?: string
  ): UnifiedLedgerEntry[] {
    const rawItems: UnifiedLedgerEntry[] = [];

    // 1. Dòng tiền từ Bán xe (Thu thanh toán, cọc, hoàn cọc, điều chuyển cọc)
    vehicles.forEach(v => {
      (v.sale_payment_history || []).forEach((p, pIdx) => {
        if (!p.date) return;
        if (monthFilter && !p.date.startsWith(monthFilter)) return;

        const isNegative = (p.amount || 0) < 0;
        const isForfeitAdjustment = isNegative && (p.note || '').includes('Tịch thu');

        rawItems.push({
          id: `sale-${v.id}-${pIdx}-${p.date}`,
          date: p.date,
          amount: Math.abs(p.amount || 0),
          type: isNegative ? 'outflow' : 'inflow',
          scope: isForfeitAdjustment ? 'other_income' : isNegative ? 'deposit_refund' : 'sale',
          category: isForfeitAdjustment ? 'Thu nhập khác' : isNegative ? 'Hoàn cọc' : 'Bán xe',
          title: isForfeitAdjustment
            ? (p.note || `Điều chuyển tịch thu cọc xe ${v.name}`)
            : isNegative
              ? (p.note || `Hoàn tiền cọc xe ${v.name}`)
              : `Bán xe ${v.name}`,
          subtitle: `Mã xe: ${v.code}${v.seller ? ` • NV: ${v.seller}` : ''}`,
          vehicleId: v.id,
          vehicleCode: v.code,
          sourceRef: `vehicles.sale_payment_history[${pIdx}]`,
          editable: false
        });
      });
    });

    // 2. Dòng tiền Vốn góp Đối tác khi nhập xe vào quỹ
    vehicles.forEach(v => {
      if (!v.is_coinvested || !v.coinvest_amount || v.coinvest_amount <= 0) return;
      const coinvestDate = v.coinvest_date || v.purchase_date || (v.created_at ? v.created_at.split('T')[0] : '');
      if (!coinvestDate) return;
      if (monthFilter && !coinvestDate.startsWith(monthFilter)) return;

      rawItems.push({
        id: `coinvest-${v.id}-${coinvestDate}`,
        date: coinvestDate,
        amount: v.coinvest_amount,
        type: 'inflow',
        scope: 'coinvest',
        category: 'Góp vốn',
        title: `Thu vốn góp xe ${v.name}`,
        subtitle: `Mã xe: ${v.code}${v.coinvestor_code ? ` • Đối tác: ${v.coinvestor_code}` : ''}`,
        vehicleId: v.id,
        vehicleCode: v.code,
        sourceRef: `vehicles.coinvest_amount`,
        editable: false
      });
    });

    // 3. Dòng tiền Chi Mua Xe
    vehicles.forEach(v => {
      (v.purchase_payment_history || []).forEach((p, pIdx) => {
        if (!p.date) return;
        if (monthFilter && !p.date.startsWith(monthFilter)) return;

        rawItems.push({
          id: `purchase-${v.id}-${pIdx}-${p.date}`,
          date: p.date,
          amount: Math.abs(p.amount || 0),
          type: 'outflow',
          scope: 'purchase',
          category: 'Mua xe',
          title: `Mua xe ${v.name}`,
          subtitle: `Mã xe: ${v.code}${v.buyer ? ` • NV mua: ${v.buyer}` : ''}`,
          vehicleId: v.id,
          vehicleCode: v.code,
          sourceRef: `vehicles.purchase_payment_history[${pIdx}]`,
          editable: false
        });
      });
    });

    // 4. Dòng tiền Chi Phí Xe do Showroom chi trực tiếp (Loại trừ khoản do NV ứng tiền trước)
    vehicles.forEach(v => {
      (v.cost_history || []).forEach((c, cIdx) => {
        if (!c.date || c.staff_id) return;
        if (monthFilter && !c.date.startsWith(monthFilter)) return;

        rawItems.push({
          id: `cost-${v.id}-${cIdx}-${c.date}`,
          date: c.date,
          amount: Math.abs(c.amount || 0),
          type: 'outflow',
          scope: 'car_cost',
          category: 'Chi phí xe',
          title: c.note || 'Chi phí xe',
          subtitle: `${v.name} (${v.code})`,
          vehicleId: v.id,
          vehicleCode: v.code,
          sourceRef: `vehicles.cost_history[${cIdx}]`,
          editable: false
        });
      });
    });

    // 5. Dòng tiền từ Operating Expenses (Chi phí vận hành, lương, tạm ứng, hoàn trả đối tác, thu khác)
    (expenses || []).forEach(exp => {
      if (!exp.date) return;
      if (monthFilter && !exp.date.startsWith(monthFilter)) return;

      const isInflow = FinanceService.isInflowExpense(exp);
      const isPartner = exp.category === 'Đối tác';
      const isSalary = exp.category === 'Lương nhân sự' || (exp.name || '').toLowerCase().includes('chi lương');
      const isAdvance = exp.category === 'Tạm ứng lương' || (exp.name || '').toLowerCase().includes('tạm ứng');

      let scope: UnifiedLedgerEntry['scope'] = 'operating';
      if (isInflow) {
        scope = 'other_income';
      } else if (isPartner) {
        scope = 'partner';
      } else if (isSalary) {
        scope = 'salary';
      } else if (isAdvance) {
        scope = 'advance';
      }

      rawItems.push({
        id: `exp-${exp.id}`,
        date: exp.date,
        amount: Math.abs(exp.amount || 0),
        type: isInflow ? 'inflow' : 'outflow',
        scope,
        category: exp.category || (isInflow ? 'Thu khác' : 'Vận hành'),
        title: exp.name || (isInflow ? 'Khoản thu khác' : 'Khoản chi vận hành'),
        subtitle: exp.category || (isInflow ? 'Thu khác' : 'Vận hành'),
        rawExpenseId: exp.id,
        sourceRef: `operating_expenses[${exp.id}]`,
        editable: true
      });
    });

    return rawItems;
  }

  /**
   * Tính toán số dư tiền mặt dồn tích (Cash Balance) dựa trên lịch sử toàn thời gian.
   */
  static calculateTotalCashBalance(
    totalCapital: number,
    vehicles: Vehicle[],
    allExpenses: Expense[]
  ): number {
    const ledger = FinanceService.buildUnifiedLedger(vehicles, allExpenses);
    const totalInflows = ledger.filter(e => e.type === 'inflow').reduce((sum, e) => sum + e.amount, 0);
    const totalOutflows = ledger.filter(e => e.type === 'outflow').reduce((sum, e) => sum + e.amount, 0);
    return Math.round(totalCapital + totalInflows - totalOutflows);
  }

  /**
   * Tính toán số dư tiền mặt đầu kỳ (Opening Cash Balance) trước ngày 01 của tháng được chọn.
   * Hỗ trợ chốt số dư bất biến (Fiscal Period Lock Anchor) nếu tháng trước đã được khóa sổ.
   */
  static calculateOpeningCashBalance(
    totalCapital: number,
    vehicles: Vehicle[],
    allExpenses: Expense[],
    month: string,
    lockedPeriods?: Record<string, number>
  ): number {
    // Nếu tháng trước đã được khóa sổ, lấy thẳng số dư chốt làm mốc bất biến
    const [year, mNum] = month.split('-').map(Number);
    const prevDate = new Date(year, mNum - 2, 1);
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (lockedPeriods && lockedPeriods[prevMonthStr] !== undefined) {
      return lockedPeriods[prevMonthStr];
    }

    const startOfMonth = `${month}-01`;
    const pastLedger = FinanceService.buildUnifiedLedger(vehicles, allExpenses).filter(e => e.date && e.date < startOfMonth);
    const pastInflows = pastLedger.filter(e => e.type === 'inflow').reduce((sum, e) => sum + e.amount, 0);
    const pastOutflows = pastLedger.filter(e => e.type === 'outflow').reduce((sum, e) => sum + e.amount, 0);
    return Math.round(totalCapital + pastInflows - pastOutflows);
  }
}
