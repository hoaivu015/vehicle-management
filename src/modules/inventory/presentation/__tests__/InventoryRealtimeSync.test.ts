import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryPresenter, InventoryView } from '../InventoryPresenter';
import { InventoryListPresenter } from '../InventoryListPresenter';
import { VehicleActionPresenter } from '../VehicleActionPresenter';
import { VehicleTransactionPresenter } from '../VehicleTransactionPresenter';
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
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockResolvedValue({ data: null, error: null }),
        delete: vi.fn().mockResolvedValue({ data: null, error: null }),
      })
    }
  };
});

describe('InventoryRealtimeSync', () => {
  let presenter: InventoryPresenter;
  let mockListPresenter: Partial<InventoryListPresenter>;
  let mockActionPresenter: Partial<VehicleActionPresenter>;
  let mockTransactionPresenter: Partial<VehicleTransactionPresenter>;
  let mockView: Partial<InventoryView>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockListPresenter = {
      attachView: vi.fn(),
      detachView: vi.fn(),
      loadAvailable: vi.fn().mockResolvedValue(undefined),
      loadSold: vi.fn().mockResolvedValue(undefined),
      loadPersonal: vi.fn().mockResolvedValue(undefined),
      filterCriteria: 'ALL',
      searchQueryValue: '',
    };

    mockActionPresenter = {
      attachView: vi.fn(),
      detachView: vi.fn(),
    };

    mockTransactionPresenter = {
      attachView: vi.fn(),
      detachView: vi.fn(),
    };

    mockView = {
      showAvailableCars: vi.fn(),
      showSoldCars: vi.fn(),
      onStatusUpdated: vi.fn(),
      onVehicleUpdated: vi.fn(),
      setStaffList: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showError: vi.fn(),
    };

    presenter = new InventoryPresenter(
      mockListPresenter as InventoryListPresenter,
      mockActionPresenter as VehicleActionPresenter,
      mockTransactionPresenter as VehicleTransactionPresenter
    );
  });

  it('đăng ký subscription realtime khi gọi subscribeToChanges', async () => {
    presenter.attachView(mockView as InventoryView);
    await presenter.subscribeToChanges();

    expect(supabase.channel).toHaveBeenCalledWith(expect.stringContaining('inventory_changes_'));
  });

  it('dọn dẹp subscription qua removeChannel khi detachView', async () => {
    presenter.attachView(mockView as InventoryView);
    await presenter.subscribeToChanges();
    presenter.detachView();

    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
