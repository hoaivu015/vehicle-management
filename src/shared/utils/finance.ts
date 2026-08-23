import { VehicleStatus } from '@/src/shared/domain/constants';
import { StaffSalaryService, SalaryDetails as StaffSalaryDetails } from '@/src/modules/staff/domain/StaffSalaryService';
import { FinanceService } from '@/src/modules/finance/domain/FinanceService';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { calculateVehicleFinancials } from './vehicle_calculations';

export type { StaffSalaryDetails };

export const INVENTORY_ACTIVE_STATUSES = [
  VehicleStatus.SPA,
  VehicleStatus.IN_STOCK,
  VehicleStatus.DEPOSIT_SALE,
  VehicleStatus.BANK_DEPOSIT,
  VehicleStatus.BANK_CONFIRMED
];

/**
 * Calculates the total stock value of cars currently in inventory.
 */
export const calculateStockValue = (cars: Vehicle[]) => {
  return cars.reduce((acc, car) => {
    if (car && INVENTORY_ACTIVE_STATUSES.includes(car.status as VehicleStatus)) {
      return acc + (car.purchase_price || 0);
    }
    return acc;
  }, 0);
};

/**
 * Calculates the monthly revenue from REAL cash received (sale_payment_history).
 * @deprecated Use FinanceService.calculateMonthlyRevenue instead.
 */
export const calculateMonthlyRevenue = (cars: Vehicle[], month: string) => {
  return FinanceService.calculateMonthlyRevenue(cars, month);
};

/**
 * Calculates the total profit from sold cars in a given month using SSoT financial calculations.
 * @deprecated Use FinanceService.calculateMonthlySalesProfit instead.
 */
export const calculateTotalProfit = (cars: Vehicle[], month: string) => {
  return FinanceService.calculateMonthlySalesProfit(cars, month);
};

/**
 * Calculates the total salaries to be paid for a given month using UNIFIED logic.
 */
export const calculateTotalSalaries = (staff: Staff[], cars: Vehicle[], month: string) => {
  const staffSalaries = staff.filter(s => s && s.code).map(s => {
    const details = StaffSalaryService.calculateMonthlySalary(s, cars, month);
    return details.totalSalary;
  });
  
  return staffSalaries.reduce((acc, s) => acc + s, 0);
};

/**
 * Calculates the total investment in current inventory.
 */
export const calculateCurrentCarInvestment = (cars: Vehicle[]) => {
  return cars
    .filter(c => c && INVENTORY_ACTIVE_STATUSES.includes(c.status as VehicleStatus))
    .reduce((acc, c) => {
      const fin = calculateVehicleFinancials(c);
      return acc + (fin.purchasePrice + fin.totalCost);
    }, 0);
};

/**
 * Calculates detailed salary information for a staff member using UNIFIED logic.
 */
export const calculateStaffSalaryDetails = (member: Staff | null, cars: Vehicle[], month: string) => {
  if (!member) return {
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
    totalReimbursements: 0,
    netSalary: 0,
    isPaid: false,
    soldCars: [],
    boughtCars: [],
    coinvestedCars: [],
    targetExpenseIds: []
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
    completionRate: details.completionRate,
    totalReimbursements: details.totalReimbursements,
    netSalary: details.netSalary,
    isPaid: details.isPaid,
    soldCars: details.soldCars,
    boughtCars: details.boughtCars,
    coinvestedCars: details.coinvestedCars,
    targetExpenseIds: details.targetExpenseIds
  };
};
