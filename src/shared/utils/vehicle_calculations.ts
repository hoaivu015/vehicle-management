import { Vehicle } from '../domain/types';
import { VehicleStatus } from '../domain/constants';
import { 
  calcGrossProfit, 
  calcNetProfit, 
  calcProfitShare, 
  calcTotalCapitalNeeded, 
  calcShowroomCapital, 
  calcTotalInvestment 
} from './financial_formulas';

export interface VehicleFinancials {
  purchasePrice: number;
  totalCost: number; // Spa, repair
  buyingCommission: number;
  sellingCommission: number;
  totalInvestment: number;
  
  salePrice: number;
  receivedAmount: number;
  
  grossProfit: number; // Sale - (Purchase + Spa)
  netProfit: number;   // Gross - Commissions
  preCommissionProfit: number; // Same as grossProfit (for clarity)
  
  isCoinvested: boolean;
  coinvestAmount: number;
  showroomCapital: number;
  showroomProfitShare: number; // Showroom's portion of net profit
  partnerProfitShare: number;   // Partner's portion of net profit
  
  isEstimated: boolean;
}

/**
 * COORDINATOR FUNCTION
 * Aggregates data and uses atomic formulas to build the full financials object.
 */
export function calculateVehicleFinancials(vehicle: Vehicle): VehicleFinancials {
  // Priority 1: Use finalized snapshot if exists
  if (vehicle.final_financials) {
    const s = vehicle.final_financials;
    const grossProfit = s.grossProfit;
    const purchasePrice = vehicle.purchase_price || 0;
    const costFromHistory = (vehicle.cost_history || []).reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalCost = costFromHistory > 0 ? costFromHistory : (vehicle.total_cost || 0);

    return {
      purchasePrice,
      totalCost,
      buyingCommission: s.buyingCommission,
      sellingCommission: s.sellingCommission,
      totalInvestment: s.totalInvestment,
      salePrice: vehicle.sale_price || 0,
      receivedAmount: vehicle.received_amount || 0,
      grossProfit: grossProfit,
      netProfit: s.netProfit,
      preCommissionProfit: grossProfit,
      isCoinvested: !!vehicle.is_coinvested,
      coinvestAmount: vehicle.coinvest_amount || 0,
      showroomCapital: calcShowroomCapital(calcTotalCapitalNeeded(purchasePrice, totalCost), vehicle.coinvest_amount || 0),
      showroomProfitShare: s.showroomProfitShare,
      partnerProfitShare: s.partnerProfitShare || (s.netProfit - s.showroomProfitShare),
      isEstimated: false
    };
  }

  const purchasePrice = vehicle.purchase_price || 0;
  const costFromHistory = (vehicle.cost_history || []).reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalCost = costFromHistory > 0 ? costFromHistory : (vehicle.total_cost || 0);
  const buyingCommission = vehicle.buying_commission ?? 0;
  const sellingCommission = vehicle.commission ?? 0;
  
  const salePrice = vehicle.sale_price || 0;
  const receivedAmount = vehicle.received_amount || 0;
  
  // Use atomic formulas
  const grossProfit = calcGrossProfit(salePrice, purchasePrice, totalCost);
  const netProfit = calcNetProfit(grossProfit, buyingCommission, sellingCommission);
  
  const isCoinvested = !!vehicle.is_coinvested;
  const coinvestAmount = vehicle.coinvest_amount || 0;
  const totalCapitalNeeded = calcTotalCapitalNeeded(purchasePrice, totalCost);
  
  const showroomCapital = calcShowroomCapital(totalCapitalNeeded, coinvestAmount);
  
  // Use atomic formula for profit share
  const showroomProfitShare = calcProfitShare(netProfit, showroomCapital, totalCapitalNeeded);
  const partnerProfitShare = netProfit - showroomProfitShare;

  return {
    purchasePrice,
    totalCost,
    buyingCommission,
    sellingCommission,
    totalInvestment: calcTotalInvestment(
      purchasePrice, 
      totalCost, 
      buyingCommission, 
      sellingCommission, 
      vehicle.status === VehicleStatus.SOLD
    ),
    salePrice,
    receivedAmount,
    grossProfit,
    netProfit,
    preCommissionProfit: grossProfit,
    isCoinvested,
    coinvestAmount,
    showroomCapital,
    showroomProfitShare,
    partnerProfitShare,
    isEstimated: vehicle.status !== VehicleStatus.SOLD
  };
}
