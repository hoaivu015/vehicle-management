import { Staff, Vehicle } from '../../../shared/domain/types';
import { STAFF_CONSTANTS, VehicleStatus } from '../../../shared/domain/constants';

export interface SalaryDetails {
  base: number;
  salesCommission: number;
  buyingCommission: number;
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
}

export class StaffSalaryService {
  /**
   * Tính toán chi tiết lương cho một nhân viên dựa trên danh sách xe trong một tháng.
   */
  static calculateMonthlySalary(member: Staff, cars: Vehicle[], monthStr: string): SalaryDetails {
    if (!member) {
      return this.getEmptySalaryDetails();
    }

    const soldCars = cars.filter(c => 
      c && c.status === VehicleStatus.SOLD && 
      c.sale_date?.startsWith(monthStr) && 
      (c.seller === member.code)
    );

    const boughtCars = cars.filter(c => 
      c && c.purchase_date?.startsWith(monthStr) && 
      (c.buyer === member.code)
    );

    const salesCommission = soldCars.reduce((acc, c) => {
      const comm = (c.commission !== undefined && c.commission !== null) 
        ? c.commission 
        : (member.commission_per_car || STAFF_CONSTANTS.DEFAULT_SALE_COMMISSION);
      return acc + comm;
    }, 0);

    const buyingCommission = boughtCars.reduce((acc, c) => {
      const comm = (c.buying_commission !== undefined && c.buying_commission !== null) 
        ? c.buying_commission 
        : STAFF_CONSTANTS.DEFAULT_BUYING_COMMISSION;
      return acc + comm;
    }, 0);

    const completionRate = (member.target || 0) > 0 ? (soldCars.length / member.target) * 100 : 0;
    const kpiBonusMultiplier = completionRate >= STAFF_CONSTANTS.BONUS_THRESHOLD_PERCENT 
      ? STAFF_CONSTANTS.BONUS_MULTIPLIER_FULL 
      : STAFF_CONSTANTS.BONUS_MULTIPLIER_REDUCED;

    // Co-investment profit share
    const coinvestedCars = cars.filter(c => 
      c && c.status === VehicleStatus.SOLD && 
      c.sale_date?.startsWith(monthStr) && 
      c.is_coinvested && 
      c.coinvestor_code === member.code
    );

    const coinvestProfitShare = coinvestedCars.reduce((acc, c) => {
      // Use standard calculation utility for consistency
      const purchasePrice = c.purchase_price || 0;
      if (purchasePrice <= 0) return acc;
      
      const profit = (c.sale_price || 0) - purchasePrice - (c.total_cost || 0);
      const share = (c.coinvest_amount / purchasePrice) * profit;
      return acc + (share > 0 ? share : 0);
    }, 0);

    const totalCommission = (salesCommission * kpiBonusMultiplier) + buyingCommission + coinvestProfitShare;
    const totalSalary = (member.base_salary || 0) + totalCommission;

    return {
      base: member.base_salary || 0,
      salesCommission: salesCommission * kpiBonusMultiplier,
      buyingCommission,
      coinvestProfitShare,
      kpiBonusMultiplier,
      totalCommission,
      totalSalary,
      soldCount: soldCars.length,
      boughtCount: boughtCars.length,
      completionRate,
      soldCars,
      boughtCars,
      coinvestedCars
    };
  }

  private static getEmptySalaryDetails(): SalaryDetails {
    return {
      base: 0,
      salesCommission: 0,
      buyingCommission: 0,
      coinvestProfitShare: 0,
      kpiBonusMultiplier: 1,
      totalCommission: 0,
      totalSalary: 0,
      soldCount: 0,
      boughtCount: 0,
      completionRate: 0,
      soldCars: [],
      boughtCars: [],
      coinvestedCars: []
    };
  }
}
