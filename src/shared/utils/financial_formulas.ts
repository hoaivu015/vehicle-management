import { STAFF_CONSTANTS } from '@/src/shared/domain/constants';

/**
 * VEHICLE & PARTNER MATH
 */

export const calcTotalCapitalNeeded = (purchasePrice: number, totalCost: number): number => {
  return Math.round(purchasePrice + totalCost);
};

export const calcTotalInvestment = (
  purchasePrice: number, 
  totalCost: number, 
  buyingComm: number, 
  buyingBonus: number,
  sellingComm: number,
  isSold: boolean
): number => {
  return Math.round(purchasePrice + totalCost + buyingComm + buyingBonus + (isSold ? sellingComm : 0));
};

export const calcShowroomCapital = (totalNeeded: number, coinvestAmount: number): number => {
  return Math.max(0, Math.round(totalNeeded - coinvestAmount));
};

export const calcGrossProfit = (salePrice: number, purchasePrice: number, totalCost: number): number => {
  if (salePrice <= 0) return 0;
  return Math.round(salePrice - calcTotalCapitalNeeded(purchasePrice, totalCost));
};

export const calcNetProfit = (grossProfit: number, buyingComm: number, buyingBonus: number, sellingComm: number): number => {
  return Math.round(grossProfit - (buyingComm + buyingBonus + sellingComm));
};

export const calcProfitShare = (netProfit: number, capital: number, basePrice: number): number => {
  if (basePrice <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, capital / basePrice));
  return Math.round(netProfit * ratio);
};

export const calcRefundablePartnerCapital = (
  coinvestAmount: number,
  partnerProfitShare: number,
  isSold: boolean = false
): number => {
  if (!isSold) return Math.round(coinvestAmount);
  // Nếu bán lỗ (partnerProfitShare < 0), khấu trừ phần lỗ của đối tác vào số vốn hoàn trả
  if (partnerProfitShare < 0) {
    return Math.max(0, Math.round(coinvestAmount + partnerProfitShare));
  }
  return Math.round(coinvestAmount);
};

/**
 * STAFF SALARY & KPI MATH
 */

export const calcStaffTotalCommissions = (
  salesComm: number, 
  kpiMultiplier: number, 
  buyingComm: number, 
  buyingBonus: number,
  profitShare: number
): number => {
  return Math.round((salesComm * kpiMultiplier) + buyingComm + buyingBonus + profitShare);
};

export const calcKPICompletion = (actualSales: number, target: number): number => {
  if (target <= 0) return 100;
  return Math.round((actualSales / target) * 100);
};

export const calcKPIMultiplier = (
  completionRate: number, 
  threshold: number = STAFF_CONSTANTS.BONUS_THRESHOLD_PERCENT,
  full: number = STAFF_CONSTANTS.BONUS_MULTIPLIER_FULL,
  reduced: number = STAFF_CONSTANTS.BONUS_MULTIPLIER_REDUCED
): number => {
  return completionRate >= threshold ? full : reduced;
};

export const calcTotalSalary = (
  baseSalary: number, 
  salesCommissions: number, 
  kpiMultiplier: number, 
  otherCommissions: number = 0 // buyingComm + buyingBonus + profitShare
): number => {
  return Math.round(baseSalary + (salesCommissions * kpiMultiplier) + otherCommissions);
};

export const calcNetSalaryWithAdvances = (
  totalSalary: number,
  totalReimbursements: number = 0,
  totalAdvances: number = 0
): number => {
  return Math.round(totalSalary + totalReimbursements - totalAdvances);
};

/**
 * COMPANY & FINANCE MATH
 */

export const calcCompanyMonthlyNetProfit = (
  monthlySalesProfit: number, 
  operationalExpenses: number, 
  totalStaffSalaries: number,
  otherInflows: number = 0
): number => {
  return Math.round(monthlySalesProfit + otherInflows - operationalExpenses - totalStaffSalaries);
};

export const isMonthLocked = (monthStr: string, lockedMonths?: string[]): boolean => {
  if (!lockedMonths || lockedMonths.length === 0) return false;
  return lockedMonths.includes(monthStr);
};

/**
 * Tính Dòng tiền thuần trực tiếp (Direct Cashflow Method)
 */
export const calcNetCashflowDirect = (totalInflows: number, totalOutflows: number): number => {
  return Math.round(totalInflows - totalOutflows);
};

/**
 * Kiểm tra và đối soát số dư dòng tiền (Reconciliation Invariant Check)
 */
export const reconcileCashBalance = (
  openingBalance: number,
  netCashflow: number,
  closingBalance: number
): boolean => {
  return Math.round(openingBalance + netCashflow) === Math.round(closingBalance);
};

