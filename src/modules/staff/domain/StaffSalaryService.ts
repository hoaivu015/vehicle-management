import { Staff, Vehicle } from '../../../shared/domain/types';
import { STAFF_CONSTANTS, VehicleStatus } from '../../../shared/domain/constants';
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

    // ✅ Rule #3: Identity Hardening - No Email Fallback
    const compareCode = (vehicleId: string | undefined, staff: Staff) => {
      if (!vehicleId) return false;
      return vehicleId.toLowerCase() === staff.code.toLowerCase();
    };

    const soldCars = cars.filter(c => 
      c && c.status === VehicleStatus.SOLD && 
      c.sale_date?.startsWith(monthStr) && 
      compareCode(c.seller, member)
    );

    const boughtCars = cars.filter(c => 
      c && c.purchase_date?.startsWith(monthStr) && 
      compareCode(c.buyer, member)
    );

    const salesCommission = soldCars.reduce((acc, c) => {
      // ✅ Rule R3 & R5: No "Ghost Commissions". Must use data from the vehicle record.
      // If commission is null/undefined in DB, it is 0. 
      // Do NOT fallback to member.commission_per_car here, as it causes profit share desync.
      const comm = c.commission || 0;
      return acc + comm;
    }, 0);

    const buyingCommission = boughtCars.reduce((acc, c) => {
      const comm = (c.buying_commission !== undefined && c.buying_commission !== null) 
        ? c.buying_commission 
        : 0;
      return acc + comm;
    }, 0);

    const completionRate = calcKPICompletion(soldCars.length, member.target);
    const kpiBonusMultiplier = calcKPIMultiplier(completionRate);

    // Co-investment profit share
    const coinvestedCars = cars.filter(c => 
      c && c.status === VehicleStatus.SOLD && 
      c.sale_date?.startsWith(monthStr) && 
      c.is_coinvested && 
      compareCode(c.coinvestor_code, member)
    );

    const coinvestProfitShare = coinvestedCars.reduce((acc, c) => {
      // ✅ Rule R2: UI/Service must only read results from calculateVehicleFinancials coordinator.
      const fin = calculateVehicleFinancials(c);
      // We allow the actual share value (even if negative/loss) to ensure sync with Vehicle Tab.
      return acc + (fin.partnerProfitShare || 0);
    }, 0);

    // ✅ Rule R1: Use atomic formulas for summation
    const totalCommission = calcStaffTotalCommissions(
      salesCommission, 
      kpiBonusMultiplier, 
      buyingCommission, 
      coinvestProfitShare
    );

    const totalSalary = calcTotalSalary(
      member.base_salary || 0, 
      salesCommission, 
      kpiBonusMultiplier, 
      buyingCommission + coinvestProfitShare
    );

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
