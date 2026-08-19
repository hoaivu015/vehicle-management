import { VehicleStatus, INVENTORY_CONSTANTS } from '@/src/shared/domain/constants';
import { calcProfitShare } from './financial_formulas';

/**
 * Vehicle Calculation Utilities
 * Project: Auto-28
 * Goal: Centralized business logic for vehicle metrics, inventory aging, and financials.
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

export interface InventoryAgingInput {
  status: VehicleStatus;
  purchase_date?: string | null;
  sale_date?: string | null;
  history?: Array<{ date: string; status: VehicleStatus }> | null;
}

export interface InventoryAgingTier {
  tier: 1 | 2 | 3 | 4;
  label: string;
  badgeClass: string;
  colorClass: string;
  isAging: boolean;
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
    ? costHistory.reduce((sum: number, item: { amount?: number }) => sum + (item.amount || 0), 0)
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
 * Tính số ngày lịch chuẩn giữa 2 mốc thời gian (quy về 00:00:00).
 * Tránh lỗi chênh lệch múi giờ hoặc số giờ lẻ trong ngày.
 */
export const diffCalendarDays = (
  startDateStr: string | null | undefined,
  endDateStr?: string | null | undefined
): number => {
  if (!startDateStr) return 0;
  
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  // Chuẩn hóa về 00:00:00 theo local date
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  
  const diffTime = endMidnight - startMidnight;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * 1. CHỈ SỐ TÀI CHÍNH: Tổng ngày nắm giữ (Financial Holding Days)
 * Tính từ ngày chi tiền mua (purchase_date) đến ngày chốt bán (sale_date) hoặc hôm nay.
 */
export const calculateAgingDays = (
  purchaseDate: string | null | undefined,
  saleDate?: string | null | undefined
): number => {
  return diffCalendarDays(purchaseDate, saleDate);
};

/**
 * 2. CHỈ SỐ VẬN HÀNH & KPI: Số ngày mở bán thực tế (Active Selling Days)
 * Chỉ tính thời gian xe thực sự ở sàn kho (IN_STOCK).
 * Tự động dừng khi xe nhận cọc (DEPOSIT_SALE, BANK_DEPOSIT, BANK_CONFIRMED) hoặc đã bán (SOLD).
 * Trừ bỏ thời gian Dọn/Spa (SPA, DEPOSIT_BUY).
 */
export const calculateActiveSellingDays = (vehicle: InventoryAgingInput): number => {
  // 1. Nếu xe đang ở giai đoạn tiền kho (Cọc mua hoặc Dọn Spa) -> Chưa mở bán
  if (vehicle.status === VehicleStatus.DEPOSIT_BUY || vehicle.status === VehicleStatus.SPA) {
    return 0;
  }

  const history = vehicle.history || [];
  
  // Nếu không có lịch sử chi tiết, tính từ purchase_date với mốc kết thúc theo trạng thái hiện tại
  if (!history || history.length === 0) {
    const startDate = vehicle.purchase_date;
    if (!startDate) return 0;
    
    if (vehicle.status === VehicleStatus.SOLD) {
      return diffCalendarDays(startDate, vehicle.sale_date);
    }
    return diffCalendarDays(startDate, null);
  }

  // Sắp xếp lịch sử theo thời gian tăng dần
  const sortedHistory = [...history]
    .filter(h => h.date && !isNaN(new Date(h.date).getTime()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedHistory.length === 0) {
    const startDate = vehicle.purchase_date;
    if (!startDate) return 0;
    return vehicle.status === VehicleStatus.SOLD
      ? diffCalendarDays(startDate, vehicle.sale_date)
      : diffCalendarDays(startDate, null);
  }

  // Tìm mốc đầu tiên xe vào kho IN_STOCK
  const firstInStockIndex = sortedHistory.findIndex(h => h.status === VehicleStatus.IN_STOCK);
  
  // Nếu chưa từng có bản ghi IN_STOCK trong history nhưng trạng thái hiện tại là IN_STOCK/bán/cọc
  const effectiveStartDate = firstInStockIndex !== -1 
    ? sortedHistory[firstInStockIndex].date 
    : (vehicle.purchase_date || sortedHistory[0].date);

  // Tính tổng số ngày ở các chặng IN_STOCK
  let totalActiveDays = 0;
  let currentInStockStart: string | null = null;

  // Khởi tạo trạng thái ban đầu từ điểm bắt đầu hiệu lực
  if (firstInStockIndex !== -1) {
    currentInStockStart = sortedHistory[firstInStockIndex].date;
  } else {
    currentInStockStart = effectiveStartDate;
  }

  const startIdx = firstInStockIndex !== -1 ? firstInStockIndex + 1 : 0;

  for (let i = startIdx; i < sortedHistory.length; i++) {
    const entry = sortedHistory[i];
    const isDepositOrSold = [
      VehicleStatus.DEPOSIT_SALE,
      VehicleStatus.BANK_DEPOSIT,
      VehicleStatus.BANK_CONFIRMED,
      VehicleStatus.SOLD,
      VehicleStatus.SPA,
      VehicleStatus.DEPOSIT_BUY
    ].includes(entry.status);

    if (currentInStockStart && isDepositOrSold) {
      // Kết thúc một chu kỳ IN_STOCK
      totalActiveDays += diffCalendarDays(currentInStockStart, entry.date);
      currentInStockStart = null;
    } else if (!currentInStockStart && entry.status === VehicleStatus.IN_STOCK) {
      // Bắt đầu một chu kỳ IN_STOCK mới (ví dụ sau khi hủy cọc)
      currentInStockStart = entry.date;
    }
  }

  // Nếu chu kỳ IN_STOCK hiện tại vẫn đang mở
  if (currentInStockStart) {
    if (vehicle.status === VehicleStatus.IN_STOCK) {
      totalActiveDays += diffCalendarDays(currentInStockStart, null);
    } else if (vehicle.status === VehicleStatus.SOLD && vehicle.sale_date) {
      totalActiveDays += diffCalendarDays(currentInStockStart, vehicle.sale_date);
    }
  }

  return Math.max(0, totalActiveDays);
};

/**
 * 3. HỆ THỐNG PHÂN TẦNG TỒN KHO TRỰC QUAN (4 Tiers)
 * Chuẩn Geneva-Meta / Swiss Precision (Auto 28 Edition)
 */
export const getInventoryAgingTier = (days: number): InventoryAgingTier => {
  const safeDays = Math.max(0, Math.round(days || 0));
  
  if (safeDays >= 35) {
    return {
      tier: 4,
      label: 'Đọng vốn (≥35d)',
      badgeClass: 'glass-badge-red',
      colorClass: 'text-expense',
      isAging: true
    };
  }
  
  if (safeDays >= 25) {
    return {
      tier: 3,
      label: 'Tồn lâu (≥25d)',
      badgeClass: 'glass-badge-orange',
      colorClass: 'text-warning',
      isAging: true
    };
  }
  
  if (safeDays >= 15) {
    return {
      tier: 2,
      label: 'Tiêu chuẩn',
      badgeClass: 'glass-badge-slate',
      colorClass: 'text-sub-label',
      isAging: false
    };
  }
  
  return {
    tier: 1,
    label: 'Vòng quay nhanh',
    badgeClass: 'glass-badge-emerald',
    colorClass: 'text-income',
    isAging: false
  };
};

/**
 * Kiểm tra xem xe có thuộc diện tồn kho lâu hay không.
 * Hỗ trợ truyền vào: Vehicle object, số ngày (number), hoặc ngày mua (string).
 */
export const isVehicleAging = (
  vehicleOrDaysOrPurchaseDate: InventoryAgingInput | number | string | null | undefined,
  thresholdDays: number = INVENTORY_CONSTANTS.AGING_THRESHOLD_DAYS
): boolean => {
  if (vehicleOrDaysOrPurchaseDate === null || vehicleOrDaysOrPurchaseDate === undefined) {
    return false;
  }
  
  if (typeof vehicleOrDaysOrPurchaseDate === 'number') {
    return vehicleOrDaysOrPurchaseDate >= thresholdDays;
  }
  
  if (typeof vehicleOrDaysOrPurchaseDate === 'string') {
    return diffCalendarDays(vehicleOrDaysOrPurchaseDate, null) >= thresholdDays;
  }
  
  return calculateActiveSellingDays(vehicleOrDaysOrPurchaseDate) >= thresholdDays;
};

