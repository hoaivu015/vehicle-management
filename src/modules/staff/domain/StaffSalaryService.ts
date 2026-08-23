import { Staff, Vehicle } from '../../../shared/domain/types';
import { VehicleStatus } from '../../../shared/domain/constants';
import { calculateVehicleFinancials } from '../../../shared/utils/vehicle_calculations';
import { 
  calcKPICompletion, 
  calcKPIMultiplier, 
  calcTotalSalary, 
  calcStaffTotalCommissions
} from '../../../shared/utils/financial_formulas';

export interface SalaryDetails {
  base: number;
  salesCommission: number;
  buyingCommission: number;
  buyingBonus: number;
  coinvestProfitShare: number;
  kpiBonusMultiplier: number;
  totalCommission: number;
  totalLaborCommission: number;
  totalLaborSalary: number;
  totalSalary: number;
  soldCount: number;
  boughtCount: number;
  completionRate: number;
  // Detailed lists
  soldCars: Vehicle[];
  boughtCars: Vehicle[];
  coinvestedCars: Vehicle[];
  // Reimbursables & Advances & Net
  totalReimbursements: number;
  totalAdvances: number;
  carryOverAdvances: number;
  carryOverReimbursements?: number;
  netSalary: number;
  isPaid: boolean;
  targetExpenseIds: string[];
  partialAdvance?: {
    id: string;
    deductedAmount: number;
    remainingAmount: number;
  };
  targetVehicleIds: number[];
  targetCoinvestVehicleIds: number[];
  snapshot?: Record<string, unknown> | null;
}

export class StaffSalaryService {
  /**
   * Phân loại khoản chi phí là Tạm ứng lương (khấu trừ) hay Hoàn ứng chi hộ (cộng vào).
   */
  static isSalaryAdvance(expense: { type?: string; category?: string; note?: string }): boolean {
    if (expense.type === 'advance') return true;
    if (expense.category === 'Tạm ứng lương') return true;
    const note = (expense.note || '').toLowerCase();
    return note.startsWith('tạm ứng') || note.includes('ứng lương');
  }

  /**
   * Tính toán chi tiết lương cho một nhân viên dựa trên danh sách xe trong một tháng.
   */
  static calculateMonthlySalary(member: Staff, cars: Vehicle[], monthStr: string): SalaryDetails {
    if (!member) {
      return this.getEmptySalaryDetails();
    }

    const compareCode = (vehicleStaffCode: string | null | undefined, staff: Staff) => {
      if (!vehicleStaffCode) return false;
      return vehicleStaffCode.toLowerCase() === staff.code.toLowerCase();
    };

    const soldCars = cars.filter(c => 
      c.status === VehicleStatus.SOLD && 
      (c.sale_date || '').startsWith(monthStr) && 
      compareCode(c.seller || '', member)
    );

    // Current month bought cars (used to compute buyingCommission)
    const currentMonthBoughtCars = cars.filter(c => 
      (c.purchase_date || '').startsWith(monthStr) && 
      compareCode(c.buyer || '', member)
    );

    // Unpaid buying bonuses / commissions from previous months
    const previousUnpaidBoughtCars = cars.filter(c => {
      const isBuyer = compareCode(c.buyer || '', member);
      if (!isBuyer) return false;
      const isOld = c.purchase_date && c.purchase_date < monthStr;
      const isUnpaidBonus = !c.buying_bonus_paid && isOld;
      const isUnpaidCommission = c.buying_commission_paid === false && isOld;
      return !!(isUnpaidBonus || isUnpaidCommission);
    });

    // Unified bought cars for display
    const boughtCars = [
      ...currentMonthBoughtCars,
      ...previousUnpaidBoughtCars.map(c => ({
        ...c,
        buying_commission: c.buying_commission_paid === false ? (c.buying_commission || 0) : 0,
        buying_bonus: !c.buying_bonus_paid ? (c.buying_bonus || 0) : 0
      }))
    ];

    const salesCommission = soldCars.reduce((acc, c) => acc + (c.commission || 0), 0);
    
    // buyingCommission includes current month acquisitions and unpaid previous commissions
    const buyingCommission = currentMonthBoughtCars.reduce((acc, c) => acc + (c.buying_commission || 0), 0) +
      previousUnpaidBoughtCars.filter(c => c.buying_commission_paid === false).reduce((acc, c) => acc + (c.buying_commission || 0), 0);

    // buyingBonus sums up bonuses from all unified bought cars
    const buyingBonus = boughtCars.reduce((acc, c) => acc + (c.buying_bonus || 0), 0);

    const completionRate = calcKPICompletion(soldCars.length, member.target || 0);
    const kpiBonusMultiplier = calcKPIMultiplier(completionRate);

    const coinvestedCars = cars.filter(c => {
      const isCoinvestor = c.is_coinvested && compareCode(c.coinvestor_code || '', member);
      if (!isCoinvestor) return false;
      
      const isSoldInMonth = c.status === VehicleStatus.SOLD && (c.sale_date || '').startsWith(monthStr);
      const isUnpaidPrevious = c.status === VehicleStatus.SOLD && !c.partner_profit_shared && c.sale_date && c.sale_date < monthStr;
      
      return !!(isSoldInMonth || isUnpaidPrevious);
    });

    const coinvestProfitShare = coinvestedCars
      .filter(c => !c.partner_profit_shared)
      .reduce((acc, c) => {
        const fin = calculateVehicleFinancials(c);
        // SSoT Financial Integrity: Tiền lãi góp vốn trên bảng lương chỉ ghi nhận khi có lãi (>= 0).
        // Trường hợp bán cắt lỗ, khoản lỗ của đối tác đã được khấu trừ trực tiếp vào vốn gốc hoàn lại (refundablePartnerCapital).
        return acc + Math.max(0, fin.partnerProfitShare);
      }, 0);

    const totalLaborCommission = calcStaffTotalCommissions(
      salesCommission,
      kpiBonusMultiplier,
      buyingCommission,
      buyingBonus,
      0
    );

    const totalLaborSalary = calcTotalSalary(
      member.base_salary || 0,
      salesCommission,
      kpiBonusMultiplier,
      buyingCommission + buyingBonus
    );

    const totalCommission = calcStaffTotalCommissions(
      salesCommission, 
      kpiBonusMultiplier, 
      buyingCommission, 
      buyingBonus,
      coinvestProfitShare
    );

    const totalSalary = calcTotalSalary(
      member.base_salary || 0, 
      salesCommission, 
      kpiBonusMultiplier, 
      buyingCommission + buyingBonus + coinvestProfitShare
    );

    const expenses = member.expenses || [];
    
    // 1. Phân loại Hoàn ứng chi hộ (Reimbursements) vs Tạm ứng lương (Advances)
    const pendingExpenses = expenses.filter(e => !e.is_reimbursed && (e.date.startsWith(monthStr) || e.date < monthStr));
    
    let totalReimbursements = 0;
    let totalAdvances = 0;
    let carryOverReimbursements = 0;

    pendingExpenses.forEach(e => {
      const isAdvance = this.isSalaryAdvance(e);
      if (isAdvance) {
        totalAdvances += e.amount;
      } else {
        totalReimbursements += e.amount;
        if (e.date && e.date < monthStr) {
          carryOverReimbursements += e.amount;
        }
      }
    });

    // Sắp xếp các khoản tạm ứng theo thứ tự thời gian cũ trước mới sau để khấu trừ lần lượt
    const pendingReimbursements = pendingExpenses.filter(e => !this.isSalaryAdvance(e));
    const pendingAdvances = pendingExpenses
      .filter(e => this.isSalaryAdvance(e))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    // Lương ròng: Nếu tổng tạm ứng lớn hơn tổng thu nhập + hoàn ứng, netSalary = 0 và nợ còn lại bảo lưu sang tháng sau
    const grossIncomeAndReimbursements = totalSalary + totalReimbursements;
    const actualDeductedAdvances = Math.min(totalAdvances, grossIncomeAndReimbursements);
    const netSalary = Math.max(0, grossIncomeAndReimbursements - actualDeductedAdvances);
    const remainingAdvanceDebt = totalAdvances - actualDeductedAdvances;

    // Phân bổ ngân sách cấn trừ tạm ứng (hỗ trợ cấn trừ toàn phần và cấn trừ từng phần)
    let runningDeductionBudget = grossIncomeAndReimbursements;
    const settledAdvanceIds: string[] = [];
    let partialAdvance: { id: string; deductedAmount: number; remainingAmount: number } | undefined;

    for (const adv of pendingAdvances) {
      if (runningDeductionBudget >= adv.amount) {
        settledAdvanceIds.push(adv.id);
        runningDeductionBudget -= adv.amount;
      } else if (runningDeductionBudget > 0) {
        partialAdvance = {
          id: adv.id,
          deductedAmount: runningDeductionBudget,
          remainingAmount: adv.amount - runningDeductionBudget
        };
        runningDeductionBudget = 0;
        break;
      } else {
        break;
      }
    }

    const settledExpenseIds = [
      ...pendingReimbursements.map(e => e.id),
      ...settledAdvanceIds
    ];

    const isPaid = (member.paid_months || []).includes(monthStr);

    return {
      base: member.base_salary || 0,
      salesCommission: salesCommission * kpiBonusMultiplier,
      buyingCommission,
      buyingBonus,
      coinvestProfitShare,
      kpiBonusMultiplier,
      totalCommission,
      totalLaborCommission,
      totalLaborSalary,
      totalSalary,
      soldCount: soldCars.length,
      boughtCount: boughtCars.length,
      completionRate,
      soldCars,
      boughtCars,
      coinvestedCars,
      totalReimbursements,
      totalAdvances,
      carryOverAdvances: remainingAdvanceDebt,
      carryOverReimbursements,
      netSalary,
      isPaid,
      targetExpenseIds: settledExpenseIds,
      partialAdvance,
      targetVehicleIds: cars.filter(c => {
        const isBuyer = compareCode(c.buyer || '', member);
        if (!isBuyer) return false;
        const isCurrentMonth = (c.purchase_date || '').startsWith(monthStr);
        const isUnpaidPrevious = (!c.buying_bonus_paid || c.buying_commission_paid === false) && c.purchase_date && c.purchase_date < monthStr;
        return !!(isCurrentMonth || isUnpaidPrevious);
      }).map(c => c.id),
      targetCoinvestVehicleIds: coinvestedCars
        .filter(c => !c.partner_profit_shared)
        .map(c => c.id)
    };
  }

  private static getEmptySalaryDetails(): SalaryDetails {
    return {
      base: 0,
      salesCommission: 0,
      buyingCommission: 0,
      buyingBonus: 0,
      coinvestProfitShare: 0,
      kpiBonusMultiplier: 1,
      totalCommission: 0,
      totalLaborCommission: 0,
      totalLaborSalary: 0,
      totalSalary: 0,
      soldCount: 0,
      boughtCount: 0,
      completionRate: 0,
      soldCars: [],
      boughtCars: [],
      coinvestedCars: [],
      totalReimbursements: 0,
      totalAdvances: 0,
      carryOverAdvances: 0,
      netSalary: 0,
      isPaid: false,
      targetExpenseIds: [],
      targetVehicleIds: [],
      targetCoinvestVehicleIds: []
    };
  }
}
