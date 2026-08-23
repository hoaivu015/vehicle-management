import { describe, it, expect } from 'vitest';
import { calculateVehicleFinancials, calcVehicleReceivableDebt, calcVehiclePayableDebt } from '../vehicle_calculations';
import { VehicleStatus } from '../../domain/constants';
import { createMockVehicle } from './mock_data';

describe('Vehicle Calculations', () => {
  it('should calculate basic financials correctly for a sold vehicle', () => {
    const vehicle = createMockVehicle({
      purchase_price: 1000,
      total_cost: 100,
      buying_commission: 50,
      buying_bonus: 20,
      commission: 30, // selling commission
      sale_price: 1500,
      status: VehicleStatus.SOLD
    });

    const financials = calculateVehicleFinancials(vehicle);
    
    expect(financials.purchasePrice).toBe(1000);
    expect(financials.totalCost).toBe(100);
    expect(financials.grossProfit).toBe(400); // 1500 - (1000 + 100)
    expect(financials.netProfit).toBe(300); // 400 - (50 + 20 + 30)
  });

  it('should handle co-investment shares correctly based on total investment', () => {
    const vehicle = createMockVehicle({
      purchase_price: 1000,
      total_cost: 100,
      buying_commission: 50,
      buying_bonus: 20,
      commission: 30,
      sale_price: 1500,
      status: VehicleStatus.SOLD,
      is_coinvested: true,
      coinvest_amount: 200, // 200 of 1100 total investment (purchase_price + total_cost)
    });

    const financials = calculateVehicleFinancials(vehicle);
    
    // Total capital needed = 1000 + 100 = 1100
    // Coinvest = 200
    // Showroom capital = 1100 - 200 = 900
    expect(financials.showroomCapital).toBe(900);
    expect(financials.isCoinvested).toBe(true);
    
    // Net profit = 1500 - 1100 - 100 = 300
    // Partner share = Math.round(300 * (200 / 1100)) = 55
    // Showroom share = 300 - 55 = 245
    expect(financials.partnerProfitShare).toBe(55);
    expect(financials.showroomProfitShare).toBe(245);
  });

  it('should mark as estimated if not SOLD', () => {
    const vehicle = createMockVehicle({ status: VehicleStatus.IN_STOCK });
    const financials = calculateVehicleFinancials(vehicle);
    expect(financials.isEstimated).toBe(true);
  });

  it('should sum costs from cost_history and ignore total_cost field if history exists', () => {
    const vehicle = createMockVehicle({ 
      total_cost: 999, // Should be ignored
      cost_history: [
        { amount: 50, note: 'Tires', date: '2023-01-01', staff_id: '', staff_expense_id: '' },
        { amount: 50, note: 'Oil', date: '2023-01-02', staff_id: '', staff_expense_id: '' }
      ]
    });
    const financials = calculateVehicleFinancials(vehicle);
    expect(financials.totalCost).toBe(100);
  });

  it('should handle zero commission/bonus cases', () => {
    const vehicle = createMockVehicle({
      purchase_price: 1000,
      total_cost: 0,
      buying_commission: 0,
      buying_bonus: 0,
      commission: 0,
      sale_price: 1200,
      status: VehicleStatus.SOLD
    });
    const financials = calculateVehicleFinancials(vehicle);
    expect(financials.netProfit).toBe(200);
  });

  it('should calculate receivable debt consistently across sale phases', () => {
    // In-stock vehicle should have 0 receivable debt
    const stockVehicle = createMockVehicle({
      status: VehicleStatus.IN_STOCK,
      sale_price: 1000,
      received_amount: 0
    });
    expect(calcVehicleReceivableDebt(stockVehicle)).toBe(0);

    // Deposit sale vehicle with partial payment
    const depositVehicle = createMockVehicle({
      status: VehicleStatus.DEPOSIT_SALE,
      sale_price: 1000,
      received_amount: 200
    });
    expect(calcVehicleReceivableDebt(depositVehicle)).toBe(800);

    // Sold vehicle with outstanding customer debt
    const soldVehicle = createMockVehicle({
      status: VehicleStatus.SOLD,
      sale_price: 1500,
      received_amount: 1000
    });
    expect(calcVehicleReceivableDebt(soldVehicle)).toBe(500);
  });

  it('should calculate payable debt accurately for suppliers/sellers', () => {
    const unpaidCar = createMockVehicle({
      purchase_price: 1000,
      purchase_paid_amount: 300
    });
    expect(calcVehiclePayableDebt(unpaidCar)).toBe(700);

    const fullyPaidCar = createMockVehicle({
      purchase_price: 1000,
      purchase_paid_amount: 1000
    });
    expect(calcVehiclePayableDebt(fullyPaidCar)).toBe(0);
  });
});
