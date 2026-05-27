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

export const calcProfitShare = (netProfit: number, capital: number, totalNeeded: number): number => {
  if (totalNeeded <= 0) return Math.round(netProfit);
  const ratio = capital / totalNeeded;
  return Math.round(netProfit * ratio);
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

/**
 * COMPANY & FINANCE MATH
 */

export const calcCompanyMonthlyNetProfit = (
  monthlySalesProfit: number, 
  operationalExpenses: number, 
  totalStaffSalaries: number
): number => {
  return Math.round(monthlySalesProfit - operationalExpenses - totalStaffSalaries);
};
