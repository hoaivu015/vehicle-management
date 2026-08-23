import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordExpense } from '../../../finance/application/RecordExpense';

describe('RecordExpense Use Case', () => {
  const mockStaffRepo = {
    getById: vi.fn(),
    update: vi.fn(),
  };

  const mockVehicleRepo = {
    getById: vi.fn(),
    update: vi.fn(),
  };

  const mockExpenseRepo = {
    add: vi.fn(),
  };

  let useCase: RecordExpense;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RecordExpense(
      mockStaffRepo as unknown as import('../../domain/StaffRepository').StaffRepository,
      mockVehicleRepo as unknown as import('../../../inventory/domain/VehicleRepository').VehicleRepository,
      mockExpenseRepo as unknown as import('../../../finance/domain/ExpenseRepository').ExpenseRepository
    );
  });

  it('should sync with vehicle cost if type is vehicle', async () => {
    mockStaffRepo.getById.mockResolvedValue({ id: 's1', name: 'NV A', expenses: [] });
    mockVehicleRepo.getById.mockResolvedValue({ id: 1, code: 'V01', cost_history: [] });
    
    await useCase.execute({
      staffId: 's1',
      amount: 500,
      name: 'Repair',
      date: '2023-01-01',
      type: 'vehicle',
      vehicleId: 1,
      category: 'Vận hành'
    });

    // 1. Verify vehicle updated with cost history
    expect(mockVehicleRepo.update).toHaveBeenCalledWith('1', expect.objectContaining({
      cost_history: expect.arrayContaining([
        expect.objectContaining({
          amount: 500,
          note: expect.stringContaining('Repair')
        })
      ])
    }));

    // 2. Verify staff updated with expense
    expect(mockStaffRepo.update).toHaveBeenCalledWith('s1', expect.objectContaining({
      expenses: expect.arrayContaining([
        expect.objectContaining({
          amount: 500,
          type: 'vehicle',
          is_reimbursed: false
        })
      ])
    }));
  });

  it('should record staff advance without premature cash deduction when staffId is provided for operating expense', async () => {
    mockStaffRepo.getById.mockResolvedValue({ id: 's1', name: 'NV A', expenses: [] });
    
    await useCase.execute({
      staffId: 's1',
      amount: 200,
      name: 'Office Supplies',
      date: '2023-01-01',
      type: 'operating',
      category: 'Office'
    });

    // 1. Verify staff updated with unreimbursed advance
    expect(mockStaffRepo.update).toHaveBeenCalledWith('s1', expect.objectContaining({
      expenses: expect.arrayContaining([
        expect.objectContaining({
          amount: 200,
          type: 'operating',
          is_reimbursed: false
        })
      ])
    }));

    // 2. Verify global cash expense repo NOT called prematurely (to prevent double cash deduction)
    expect(mockExpenseRepo.add).not.toHaveBeenCalled();
  });

  it('should record direct company operating expense when staffId is undefined', async () => {
    await useCase.execute({
      amount: 500000,
      name: 'Tiền điện showroom',
      date: '2026-08-01',
      type: 'operating',
      category: 'Vận hành'
    });

    // Verify global expense added immediately
    expect(mockExpenseRepo.add).toHaveBeenCalledWith(expect.objectContaining({
      amount: 500000,
      name: 'Tiền điện showroom',
      category: 'Vận hành'
    }));
  });

  it('should record other cash inflow when flowType is inflow', async () => {
    await useCase.execute({
      amount: 2000000,
      name: 'Thu tiền hoa hồng bảo hiểm',
      date: '2026-08-10',
      type: 'operating',
      flowType: 'inflow',
      category: 'Thu khác'
    });

    // Verify inflow added with proper prefix and category
    expect(mockExpenseRepo.add).toHaveBeenCalledWith(expect.objectContaining({
      amount: 2000000,
      name: '[Thu] Thu tiền hoa hồng bảo hiểm',
      category: 'Thu khác'
    }));
  });

  it('should record direct company vehicle cost when staffId is undefined (default showroom cost)', async () => {
    mockVehicleRepo.getById.mockResolvedValue({ id: 1, code: 'V01', cost_history: [] });

    await useCase.execute({
      amount: 6000000,
      name: 'Hoa hồng',
      date: '2026-08-19',
      type: 'vehicle',
      vehicleId: 1,
      category: 'Vận hành'
    });

    // 1. Verify vehicle updated with clean note (NO [NV ứng] prefix) and empty staff_id
    expect(mockVehicleRepo.update).toHaveBeenCalledWith('1', expect.objectContaining({
      cost_history: expect.arrayContaining([
        expect.objectContaining({
          amount: 6000000,
          note: 'Hoa hồng',
          staff_id: ''
        })
      ])
    }));

    // 2. Verify staff repository was NOT called (no staff advance created)
    expect(mockStaffRepo.update).not.toHaveBeenCalled();
  });
});
