import { VehicleStatus } from '@/src/shared/domain/constants';
import { calcProfitShare } from './financial_formulas';

/**
 * Vehicle Calculation Utilities
 * Project: Auto-28
 * Goal: Centralized business logic for vehicle metrics and financials.
 */

export interface VehicleFinancials {
  purchasePrice: number;
  totalCost: number;
  totalInvestment: number; // purchasePrice + totalCost
  salePrice: number;
  grossProfit: number;
  netProfit: number;
  showroomCapital: number;
  isCoinvested: boolean;
  coinvestAmount: number; // Partner investment
  showroomProfitShare: number;
  partnerProfitShare: number;
  isEstimated: boolean;
  // Commissions
  buyingCommission: number;
  buyingBonus: number;
  sellingCommission: number;
}

export interface FinancialInput {
  purchase_price?: number | null;
  total_cost?: number | null;
  sale_price?: number | null;
  buying_commission?: number | null;
  buying_bonus?: number | null;
  commission?: number | null;
  is_coinvested?: boolean | null;
  coinvest_amount?: number | null;
  status: VehicleStatus;
  cost_history?: { amount: number }[] | null;
}

/**
 * Calculates comprehensive financials for a vehicle.
 * Ensures consistent profit calculation across the app.
 */
export const calculateVehicleFinancials = (vehicle: FinancialInput): VehicleFinancials => {
  const purchasePrice = vehicle.purchase_price || 0;
  
  // Use cost_history if available, otherwise fallback to total_cost field
  const costHistory = vehicle.cost_history || [];
  const totalCost = costHistory.length > 0
    ? costHistory.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
    : (vehicle.total_cost || 0);

  const totalInvestment = purchasePrice + totalCost;
  const salePrice = vehicle.sale_price || 0;
  const buyingCommission = vehicle.buying_commission || 0;
  const buyingBonus = vehicle.buying_bonus || 0;
  const sellingCommission = vehicle.commission || 0;

  // Gross Profit = Sale - (Purchase + Costs)
  const grossProfit = salePrice > 0 ? salePrice - totalInvestment : 0;
  
  // Net Profit = Gross Profit - (All Commissions & Bonuses)
  const netProfit = salePrice > 0 ? grossProfit - (buyingCommission + buyingBonus + sellingCommission) : 0;

  const isCoinvested = vehicle.is_coinvested || false;
  const coinvestAmount = vehicle.coinvest_amount || 0;

  let showroomCapital = totalInvestment;
  let partnerProfitShare = 0;
  let showroomProfitShare = netProfit;

  if (isCoinvested && totalInvestment > 0) {
    showroomCapital = totalInvestment - coinvestAmount;
    partnerProfitShare = calcProfitShare(netProfit, coinvestAmount, totalInvestment);
    showroomProfitShare = netProfit - partnerProfitShare;
  }

  return {
    purchasePrice,
    totalCost,
    totalInvestment,
    salePrice,
    grossProfit,
    netProfit,
    showroomCapital,
    isCoinvested,
    coinvestAmount,
    showroomProfitShare,
    partnerProfitShare,
    isEstimated: vehicle.status !== VehicleStatus.SOLD,
    buyingCommission,
    buyingBonus,
    sellingCommission
  };
};

/**
 * Calculates the number of days since the vehicle was purchased.
 * @param purchaseDate Date string (YYYY-MM-DD)
 * @returns Number of days (Math.floor)
 */
export const calculateAgingDays = (purchaseDate: string | null | undefined): number => {
  if (!purchaseDate) return 0;
  
  const start = new Date(purchaseDate);
  const now = new Date();
  
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 ? diffDays : 0;
};

/**
 * Checks if a vehicle is considered "Aging" based on a threshold.
 */
export const isVehicleAging = (purchaseDate: string | null | undefined, thresholdDays: number): boolean => {
  return calculateAgingDays(purchaseDate) >= thresholdDays;
};
