import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateVehicle } from '../modules/inventory/application/UpdateVehicle';
import { AddSalePayment } from '../modules/inventory/application/AddSalePayment';
import { StaffSalaryService } from '../modules/staff/domain/StaffSalaryService';
import { calculateVehicleFinancials } from '../shared/utils/vehicle_calculations';
import { VehicleStatus } from '../shared/domain/constants';
import { Vehicle, StaffExpense } from '../shared/domain/types';

describe('E2E Workflow: The Perfect Sale', () => {
  // Mocks
  const mockVehicleRepo = {
    update: vi.fn(),
    addSalePayment: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
  };
  const mockExpenseRepo = {
    add: vi.fn(),
    getByVehicleId: vi.fn(),
  };
  const mockStaffRepo = {
    addExpense: vi.fn(),
    getExpensesByStaffId: vi.fn(),
    getStaffList: vi.fn(),
    getStaffByCode: vi.fn(),
    getByCode: vi.fn(),
    update: vi.fn(),
  };

  const updateVehicle = new UpdateVehicle(mockVehicleRepo as any, mockExpenseRepo as any, mockStaffRepo as any);
  const addSalePayment = new AddSalePayment(mockVehicleRepo as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should flow correctly from import to sale and salary calculation', async () => {
    // 1. Initial Vehicle State (Imported)
    const baseVehicle: Vehicle = {
      id: 1,
      vehicle_code: 'CAR001',
      status: VehicleStatus.IN_STOCK,
      purchase_price: 500000000,
      is_coinvested: false,
      date_imported: '2026-04-01',
    } as any;

    // 2. Add Costs (e.g., Repair cost of 10M)
    const repairExpense: StaffExpense = {
      id: 'e1',
      amount: 10000000,
      type: 'vehicle',
      vehicle_code: 'CAR001',
      date: '2026-04-05',
      note: 'Repair',
      is_reimbursed: false
    };
    mockExpenseRepo.getByVehicleId.mockResolvedValue([repairExpense]);

    // 3. Sell the car (Sale Price 600M, Commission 5M)
    const saleRequest = {
      vehicleId: 1,
      amount: 600000000,
      nextStatus: VehicleStatus.SOLD,
      seller: 'NV01',
      salePrice: 600000000,
      commission: 5000000,
      date: '2026-04-20'
    };
    await addSalePayment.execute(saleRequest as any);
    
    expect(mockVehicleRepo.addSalePayment).toHaveBeenCalledWith(
      1, expect.any(Object), VehicleStatus.SOLD, 'NV01', undefined, 600000000, 5000000, undefined
    );

    // 4. Update the vehicle state in our mock "snapshot"
    const soldVehicle: Vehicle = {
      ...baseVehicle,
      status: VehicleStatus.SOLD,
      sale_price: 600000000,
      seller: 'NV01',
      commission: 5000000,
      sale_date: '2026-04-20',
      cost_history: [repairExpense]
    } as any;

    // 5. Calculate Financials
    const financials = calculateVehicleFinancials(soldVehicle as any);
    expect(financials.grossProfit).toBe(90000000); // 600M - 500M - 10M
    expect(financials.netProfit).toBe(85000000); // 90M - 5M commission

    // 6. Check Staff Salary for NV01 in April
    mockStaffRepo.getExpensesByStaffId.mockResolvedValue([]); // No other expenses
    const salaryData = StaffSalaryService.calculateMonthlySalary(
      { code: 'NV01', base_salary: 10000000, target: 1 } as any,
      [soldVehicle],
      '2026-04'
    );

    expect(salaryData.salesCommission).toBe(5000000);
    expect(salaryData.totalSalary).toBe(15000000); // 10M base + 5M commission
  });

  it('should flow correctly for a co-investment sale', async () => {
    // 1. Co-invested Vehicle (NV02 is partner)
    const vehicle: Vehicle = {
      id: 2,
      vehicle_code: 'CAR002',
      name: 'Mercedes S450',
      code: 'CAR002',
      status: VehicleStatus.SOLD,
      purchase_price: 400000000,
      sale_price: 500000000,
      is_coinvested: true,
      coinvestor_code: 'NV02',
      coinvest_amount: 200000000, // 50% of 400M
      sale_date: '2026-04-25',
      partner_profit_shared: false,
      cost_history: []
    } as any;

    // 2. Calculate Profit Share
    const financials = calculateVehicleFinancials(vehicle as any);
    expect(financials.partnerProfitShare).toBe(50000000); // 50% of (500M - 400M)

    // 3. Check NV02 Salary (Should include the profit share)
    let salaryData = StaffSalaryService.calculateMonthlySalary(
      { code: 'NV02', base_salary: 10000000 } as any,
      [vehicle],
      '2026-04'
    );
    expect(salaryData.coinvestProfitShare).toBe(50000000);
    expect(salaryData.totalSalary).toBe(60000000); // 10M + 50M

    // 4. Mark as PAID via UpdateVehicle Use Case
    mockVehicleRepo.getById.mockResolvedValue(vehicle);
    mockVehicleRepo.update.mockResolvedValue({ ...vehicle, partner_profit_shared: true });
    mockStaffRepo.getByCode.mockResolvedValue({ id: 's1', code: 'NV02', name: 'Partner' });
    await updateVehicle.execute({ id: 2, data: { partner_profit_shared: true } });

    // 5. Verify that it syncs to Staff Repository
    expect(mockStaffRepo.update).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({
        expenses: expect.arrayContaining([
          expect.objectContaining({
            amount: 50000000,
            note: expect.stringContaining('Chia LN đối tác: Mercedes S450 (CAR002)')
          })
        ])
      })
    );

    // 6. Check NV02 Salary again (Should now be 10M since profit is paid)
    const paidVehicle = { ...vehicle, partner_profit_shared: true };
    salaryData = StaffSalaryService.calculateMonthlySalary(
      { code: 'NV02', base_salary: 10000000 } as any,
      [paidVehicle],
      '2026-04'
    );
    expect(salaryData.coinvestProfitShare).toBe(0);
    expect(salaryData.totalSalary).toBe(10000000);
  });
});
