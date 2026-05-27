import { describe, it, expect } from 'vitest';
import { calculateVehicleFinancials } from '../vehicle_calculations';
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

  it('should handle co-investment shares correctly', () => {
    const vehicle = createMockVehicle({
      purchase_price: 1000,
      total_cost: 100,
      buying_commission: 50,
      buying_bonus: 20,
      commission: 30,
      sale_price: 1500,
      status: VehicleStatus.SOLD,
      is_coinvested: true,
      coinvest_amount: 220, // 20% of 1100 (1000+100)
    });

    const financials = calculateVehicleFinancials(vehicle);
    
    // Total capital needed = 1000 + 100 = 1100
    // Coinvest = 220 (20%)
    // Showroom = 880 (80%)
    expect(financials.showroomCapital).toBe(880);
    expect(financials.isCoinvested).toBe(true);
    
    // Net profit = 300
    // Showroom share = 300 * 0.8 = 240
    // Partner share = 300 - 240 = 60
    expect(financials.showroomProfitShare).toBe(240);
    expect(financials.partnerProfitShare).toBe(60);
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
});
