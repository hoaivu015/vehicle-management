import { Vehicle } from '../domain/types';
import { STAFF_CONSTANTS, VehicleStatus } from '../domain/constants';

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
  
  isCoinvested: boolean;
  coinvestAmount: number;
  showroomCapital: number;
  showroomProfitShare: number; // Showroom's portion of net profit
  
  isEstimated: boolean;
}

export function calculateVehicleFinancials(vehicle: Vehicle): VehicleFinancials {
  const purchasePrice = vehicle.purchase_price || 0;
  const totalCost = vehicle.total_cost || 0;
  const buyingCommission = vehicle.buying_commission ?? STAFF_CONSTANTS.DEFAULT_BUYING_COMMISSION;
  const sellingCommission = vehicle.commission ?? STAFF_CONSTANTS.DEFAULT_SALE_COMMISSION;
  
  // Total investment includes all costs and commissions
  const totalInvestment = purchasePrice + totalCost + buyingCommission + (vehicle.status === VehicleStatus.SOLD ? sellingCommission : 0);
  
  const salePrice = vehicle.sale_price || 0;
  const receivedAmount = vehicle.received_amount || 0;
  
  const grossProfit = salePrice > 0 ? (salePrice - (purchasePrice + totalCost)) : 0;
  const netProfit = salePrice > 0 ? (salePrice - (purchasePrice + totalCost + buyingCommission + sellingCommission)) : 0;
  
  const isCoinvested = !!vehicle.is_coinvested;
  const coinvestAmount = vehicle.coinvest_amount || 0;
  const showroomCapital = Math.max(0, purchasePrice - coinvestAmount);
  
  // Profit share calculation
  let showroomProfitShare = netProfit;
  if (isCoinvested && purchasePrice > 0) {
    const showroomRatio = showroomCapital / purchasePrice;
    showroomProfitShare = netProfit * showroomRatio;
  }

  return {
    purchasePrice,
    totalCost,
    buyingCommission,
    sellingCommission,
    totalInvestment,
    salePrice,
    receivedAmount,
    grossProfit,
    netProfit,
    isCoinvested,
    coinvestAmount,
    showroomCapital,
    showroomProfitShare,
    isEstimated: vehicle.status !== VehicleStatus.SOLD
  };
}
