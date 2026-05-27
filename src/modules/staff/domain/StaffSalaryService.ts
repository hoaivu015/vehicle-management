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
  totalSalary: number;
  soldCount: number;
  boughtCount: number;
  completionRate: number;
  // Detailed lists
  soldCars: Vehicle[];
  boughtCars: Vehicle[];
  coinvestedCars: Vehicle[];
  // Reimbursables & Net
  totalReimbursements: number;
  carryOverAdvances: number;
  netSalary: number;
  isPaid: boolean;
  targetExpenseIds: string[];
  targetVehicleIds: number[];
  targetCoinvestVehicleIds: number[];
}

export class StaffSalaryService {
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

    // Unpaid buying bonuses from previous months
    const previousUnpaidBoughtCars = cars.filter(c => {
      const isBuyer = compareCode(c.buyer || '', member);
      if (!isBuyer) return false;
      const isUnpaidPrevious = !c.buying_bonus_paid && c.purchase_date && c.purchase_date < monthStr;
      return !!isUnpaidPrevious;
    });

    // Unified bought cars for display (mapping buying_commission to 0 for old cars to avoid double counting)
    const boughtCars = [
      ...currentMonthBoughtCars,
      ...previousUnpaidBoughtCars.map(c => ({
        ...c,
        buying_commission: 0
      }))
    ];

    const salesCommission = soldCars.reduce((acc, c) => acc + (c.commission || 0), 0);
    
    // buyingCommission only includes current month acquisitions
    const buyingCommission = currentMonthBoughtCars.reduce((acc, c) => acc + (c.buying_commission || 0), 0);

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
        return acc + fin.partnerProfitShare;
      }, 0);

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
    const currentMonthExpenses = expenses
      .filter(e => e.date.startsWith(monthStr) && !e.is_reimbursed)
      .reduce((acc, e) => acc + e.amount, 0);

    const carryOverExpenses = expenses
      .filter(e => !e.is_reimbursed && e.date < monthStr)
      .reduce((acc, e) => acc + e.amount, 0);

    const totalReimbursements = currentMonthExpenses + carryOverExpenses;
    const netSalary = totalSalary + totalReimbursements;
    const isPaid = (member.paid_months || []).includes(monthStr);

    return {
      base: member.base_salary || 0,
      salesCommission: salesCommission * kpiBonusMultiplier,
      buyingCommission,
      buyingBonus,
      coinvestProfitShare,
      kpiBonusMultiplier,
      totalCommission,
      totalSalary,
      soldCount: soldCars.length,
      boughtCount: boughtCars.length,
      completionRate,
      soldCars,
      boughtCars,
      coinvestedCars,
      totalReimbursements,
      carryOverAdvances: carryOverExpenses,
      netSalary,
      isPaid,
      targetExpenseIds: expenses
        .filter(e => !e.is_reimbursed && (e.date.startsWith(monthStr) || e.date < monthStr))
        .map(e => e.id),
      targetVehicleIds: cars.filter(c => {
        const isBuyer = compareCode(c.buyer || '', member);
        if (!isBuyer) return false;
        const isCurrentMonth = (c.purchase_date || '').startsWith(monthStr);
        const isUnpaidPrevious = !c.buying_bonus_paid && c.purchase_date && c.purchase_date < monthStr;
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
      totalSalary: 0,
      soldCount: 0,
      boughtCount: 0,
      completionRate: 0,
      soldCars: [],
      boughtCars: [],
      coinvestedCars: [],
      totalReimbursements: 0,
      carryOverAdvances: 0,
      netSalary: 0,
      isPaid: false,
      targetExpenseIds: [],
      targetVehicleIds: [],
      targetCoinvestVehicleIds: []
    };
  }
}
