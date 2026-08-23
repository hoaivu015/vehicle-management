import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffPresenter, StaffView } from '../StaffPresenter';
import { StaffListPresenter } from '../StaffListPresenter';
import { StaffActionPresenter } from '../StaffActionPresenter';
import { StaffExpensePresenter } from '../StaffExpensePresenter';
import { PayrollPresenter } from '../PayrollPresenter';
import { UpdateVehicle } from '@/src/modules/inventory/application/UpdateVehicle';
import { supabase } from '@/src/shared/infrastructure/supabase';

vi.mock('@/src/shared/infrastructure/supabase', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn().mockReturnThis(),
  };

  return {
    supabase: {
      channel: vi.fn().mockReturnValue(mockChannel),
      removeChannel: vi.fn().mockResolvedValue(undefined),
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })
    }
  };
});

describe('StaffRealtimeSync', () => {
  let presenter: StaffPresenter;
  let mockListPresenter: Partial<StaffListPresenter>;
  let mockActionPresenter: Partial<StaffActionPresenter>;
  let mockExpensePresenter: Partial<StaffExpensePresenter>;
  let mockPayrollPresenter: Partial<PayrollPresenter>;
  let mockUpdateVehicle: Partial<UpdateVehicle>;
  let mockView: Partial<StaffView>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockListPresenter = {
      attachView: vi.fn(),
      detachView: vi.fn(),
      loadStaff: vi.fn().mockResolvedValue(undefined),
      loadVehicles: vi.fn().mockResolvedValue(undefined),
      filterStaff: vi.fn(),
    };

    mockActionPresenter = {
      attachView: vi.fn(),
      detachView: vi.fn(),
    };

    mockExpensePresenter = {
      attachView: vi.fn(),
      detachView: vi.fn(),
    };

    mockPayrollPresenter = {
      attachView: vi.fn(),
      detachView: vi.fn(),
    };

    mockUpdateVehicle = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    mockView = {
      showStaffList: vi.fn(),
      showVehicles: vi.fn(),
      onStaffAdded: vi.fn(),
      onStaffUpdated: vi.fn(),
      onStaffDeleted: vi.fn(),
      onExpenseAdded: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showError: vi.fn(),
    };

    presenter = new StaffPresenter(
      mockListPresenter as StaffListPresenter,
      mockActionPresenter as StaffActionPresenter,
      mockExpensePresenter as StaffExpensePresenter,
      mockPayrollPresenter as PayrollPresenter,
      mockUpdateVehicle as UpdateVehicle
    );
  });

  it('lắng nghe 3 bảng employees, vehicles, operating_expenses khi subscribeToChanges', async () => {
    presenter.attachView(mockView as StaffView);
    await presenter.subscribeToChanges('2026-08');

    expect(supabase.channel).toHaveBeenCalledWith(expect.stringContaining('staff_changes_'));
    const channelMock = supabase.channel('test');
    expect(channelMock.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ table: 'employees' }),
      expect.any(Function)
    );
    expect(channelMock.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ table: 'vehicles' }),
      expect.any(Function)
    );
    expect(channelMock.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ table: 'operating_expenses' }),
      expect.any(Function)
    );
  });

  it('dọn dẹp subscription khi detachView', async () => {
    presenter.attachView(mockView as StaffView);
    await presenter.subscribeToChanges('2026-08');
    presenter.detachView();

    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
