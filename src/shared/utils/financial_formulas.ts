import { STAFF_CONSTANTS } from '../domain/constants';

/**
 * VEHICLE & PARTNER MATH
 */

export const calcTotalCapitalNeeded = (purchasePrice: number, totalCost: number): number => {
  return purchasePrice + totalCost;
};

export const calcTotalInvestment = (
  purchasePrice: number, 
  totalCost: number, 
  buyingComm: number, 
  sellingComm: number,
  isSold: boolean
): number => {
  return purchasePrice + totalCost + buyingComm + (isSold ? sellingComm : 0);
};

export const calcShowroomCapital = (totalNeeded: number, coinvestAmount: number): number => {
  return Math.max(0, totalNeeded - coinvestAmount);
};

export const calcGrossProfit = (salePrice: number, purchasePrice: number, totalCost: number): number => {
  if (salePrice <= 0) return 0;
  return salePrice - calcTotalCapitalNeeded(purchasePrice, totalCost);
};

export const calcNetProfit = (grossProfit: number, buyingComm: number, sellingComm: number): number => {
  return grossProfit - (buyingComm + sellingComm);
};

export const calcProfitShare = (netProfit: number, capital: number, totalNeeded: number): number => {
  if (totalNeeded <= 0) return netProfit;
  const ratio = capital / totalNeeded;
  return netProfit * ratio;
};

/**
 * STAFF SALARY & KPI MATH
 */

export const calcStaffTotalCommissions = (
  salesComm: number, 
  kpiMultiplier: number, 
  buyingComm: number, 
  profitShare: number
): number => {
  return (salesComm * kpiMultiplier) + buyingComm + profitShare;
};

export const calcKPICompletion = (actualSales: number, target: number): number => {
  if (target <= 0) return 100;
  return (actualSales / target) * 100;
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
  otherCommissions: number = 0 // buyingComm + profitShare
): number => {
  return baseSalary + (salesCommissions * kpiMultiplier) + otherCommissions;
};

/**
 * COMPANY & FINANCE MATH
 */

export const calcCompanyMonthlyNetProfit = (
  monthlySalesProfit: number, 
  operationalExpenses: number, 
  staffBaseSalaries: number
): number => {
  return monthlySalesProfit - operationalExpenses - staffBaseSalaries;
};
