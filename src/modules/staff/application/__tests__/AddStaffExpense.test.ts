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
      mockStaffRepo as any,
      mockVehicleRepo as any,
      mockExpenseRepo as any
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

  it('should sync with global expenses if type is operating', async () => {
    mockStaffRepo.getById.mockResolvedValue({ id: 's1', name: 'NV A', expenses: [] });
    
    await useCase.execute({
      staffId: 's1',
      amount: 200,
      name: 'Office',
      date: '2023-01-01',
      type: 'operating',
      category: 'Office'
    });

    // Verify global expense added
    expect(mockExpenseRepo.add).toHaveBeenCalledWith(expect.objectContaining({
      amount: 200,
      name: expect.stringContaining('Office')
    }));
  });
});
