/**
 * @file vehicle_calculations.ts
 * @description SSoT Re-export wrapper for Vehicle Domain Calculations.
 * Canonical Source: '@/src/modules/inventory/domain/services/VehicleFinancialService'
 */

export {
  calculateVehicleFinancials,
  calcVehicleReceivableDebt,
  calcVehiclePayableDebt,
  diffCalendarDays,
  calculateAgingDays,
  calculateActiveSellingDays,
  getInventoryAgingTier,
  isVehicleAging,
} from '@/src/modules/inventory/domain/services/VehicleFinancialService';

export {
  calcProfitShare,
  calcRefundablePartnerCapital,
} from '@/src/shared/utils/financial_formulas';

export * from '@/src/modules/inventory/domain/services/VehicleFinancialService';

