import { STAFF_CONSTANTS, VehicleStatus } from '../shared/domain/constants';
import { StaffSalaryService } from '../modules/staff/domain/StaffSalaryService';

/**
 * Calculates the total stock value of cars currently in inventory.
 */
export const calculateStockValue = (cars: any[]) => {
  return cars.reduce((acc, car) => acc + (car && car.status !== VehicleStatus.SOLD ? (car.purchase_price || 0) : 0), 0);
};

/**
 * Calculates the monthly revenue from REAL cash received (sale_payment_history).
 */
export const calculateMonthlyRevenue = (cars: any[], month: string) => {
  return cars.reduce((acc, car) => {
    if (!car || !car.sale_payment_history) return acc;
    const monthPayments = car.sale_payment_history
      .filter((p: any) => p.date?.startsWith(month))
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    return acc + monthPayments;
  }, 0);
};

/**
 * Calculates the total profit from sold cars in a given month.
 * Note: Still uses the 'profit' field which should be auto-updated in DB.
 */
export const calculateTotalProfit = (cars: any[], month: string) => {
  return cars
    .filter(c => c && c.status === VehicleStatus.SOLD && c.sale_date?.startsWith(month))
    .reduce((acc, car) => acc + (car.profit || 0), 0);
};

/**
 * Calculates the total salaries to be paid for a given month using UNIFIED logic.
 */
export const calculateTotalSalaries = (staff: any[], cars: any[], month: string) => {
  const staffSalaries = staff.filter(s => s && s.code).map(s => {
    const details = StaffSalaryService.calculateMonthlySalary(s, cars, month);
    return details.totalSalary;
  });
  
  return staffSalaries.reduce((acc, s) => acc + s, 0);
};

/**
 * Calculates the total investment in current inventory.
 */
export const calculateCurrentCarInvestment = (cars: any[]) => {
  return cars
    .filter(c => c && [VehicleStatus.IN_STOCK, VehicleStatus.DEPOSIT_SALE, VehicleStatus.BANK_DEPOSIT, VehicleStatus.BANK_CONFIRMED].includes(c.status))
    .reduce((acc, c) => acc + ((c.purchase_price || 0) + (c.total_cost || 0)), 0);
};

/**
 * Calculates detailed salary information for a staff member using UNIFIED logic.
 */
export const calculateStaffSalaryDetails = (member: any, cars: any[], month: string) => {
  if (!member) return {
    base: 0,
    salesCommission: 0,
    buyingCommission: 0,
    kpiBonusMultiplier: 1,
    totalCommission: 0,
    totalSalary: 0,
    soldCount: 0,
    boughtCount: 0,
    completionRate: 0
  };

  const details = StaffSalaryService.calculateMonthlySalary(member, cars, month);

  return {
    base: details.base,
    salesCommission: details.salesCommission,
    buyingCommission: details.buyingCommission,
    coinvestProfitShare: details.coinvestProfitShare,
    kpiBonusMultiplier: details.kpiBonusMultiplier,
    totalCommission: details.totalCommission,
    totalSalary: details.totalSalary,
    soldCount: details.soldCount,
    boughtCount: details.boughtCount,
    completionRate: details.completionRate
  };
};
