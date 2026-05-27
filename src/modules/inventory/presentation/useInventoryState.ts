import { useState, useMemo, useEffect } from 'react';
import { useNotification } from '@/src/shared/presentation/useNotification';
import { useActionResponse } from '@/src/shared/presentation/useActionResponse';
import { InventoryView } from './InventoryPresenter';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, INVENTORY_CONSTANTS } from '@/src/shared/domain/constants';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';



interface UseInventoryProps {
  userRole: string;
  currentUser: import('@/src/shared/domain/types').Staff | null;
  initialSearch?: string;
  initialFilter?: string;
  initialAction?: string;
}

export const useInventoryState = ({
  userRole,
  currentUser,
  initialSearch = '',
  initialFilter = 'ALL',
  initialAction = ''
}: UseInventoryProps) => {
  const [availableCars, setAvailableCars] = useState<Vehicle[]>([]);
  const [soldCars, setSoldCars] = useState<Vehicle[]>([]);
  const [staffList, setStaffList] = useState<import('@/src/shared/domain/types').Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'SOLD'>('AVAILABLE');
  const [soldMonth, setSoldMonth] = useState(new Date().toISOString().slice(0, 7));

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { executeAction } = useActionResponse();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filterCriteria, setFilterCriteria] = useState(initialFilter);
  const [hasHandledAction, setHasHandledAction] = useState(false);
  const { inventory, createInventoryPresenter } = useDependencies();
  const notification = useNotification();

  // Dependency Injection
  const { presenter, addVehicleUseCase } = useMemo(() => ({
    presenter: createInventoryPresenter(),
    addVehicleUseCase: inventory.addVehicle
  }), [createInventoryPresenter, inventory.addVehicle]);



  const view: InventoryView = useMemo(() => ({
    showAvailableCars: (cars) => setAvailableCars(cars),
    showSoldCars: (cars) => setSoldCars(cars),
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
    showError: (msg) => notification.error(msg),
    onStatusUpdated: () => {
      presenter.loadAvailable();
    },
    onVehicleUpdated: (vehicle: Vehicle) => {
      setSelectedVehicle(vehicle);
    },
    setStaffList: setStaffList,
  }), [presenter]);

  useEffect(() => {
    presenter.attachView(view);
    const loadData = async () => {
      await presenter.loadInventory(userRole, currentUser?.code || null, soldMonth);

      if (initialFilter) {
        presenter.filter(initialFilter);
        setFilterCriteria(initialFilter);
        if (initialFilter === 'AGING_25') {
          setActiveTab('AVAILABLE');
        }
      }
      if (initialSearch) {
        presenter.search(initialSearch);
      }
    };

    loadData();
    return () => {
      presenter.detachView();
      setHasHandledAction(false);
    };
  }, [presenter, view, activeTab, soldMonth, initialFilter, userRole, currentUser, initialSearch]);

  // Separate effect for post-load actions to ensure data is ready in state
  useEffect(() => {
    if (initialAction === 'adjust_price' && availableCars.length > 0 && !hasHandledAction) {
      let targetCar: Vehicle | undefined;
      
      if (initialFilter === 'AGING_25') {
        const limit = new Date(); limit.setDate(limit.getDate() - INVENTORY_CONSTANTS.AGING_THRESHOLD_DAYS);
        targetCar = availableCars.find(c => c.purchase_date && new Date(c.purchase_date) <= limit);
      } else {
        targetCar = availableCars[0];
      }

      if (targetCar) {
        setSelectedVehicle(targetCar);
        setIsDetailOpen(true);
        setHasHandledAction(true);
      }
    }
  }, [availableCars, initialAction, initialFilter, hasHandledAction]);

  // Effect to automatically open vehicle details if initialAction is 'view_vehicle'
  useEffect(() => {
    if (initialAction === 'view_vehicle' && (availableCars.length > 0 || soldCars.length > 0) && !hasHandledAction) {
      const allCars = [...availableCars, ...soldCars];
      const targetCar = allCars.find(c => c.code === initialSearch || c.name === initialSearch);
      if (targetCar) {
        setSelectedVehicle(targetCar);
        setIsDetailOpen(true);
        if (soldCars.includes(targetCar)) {
          setActiveTab('SOLD');
        } else {
          setActiveTab('AVAILABLE');
        }
        setHasHandledAction(true);
      }
    }
  }, [availableCars, soldCars, initialAction, initialSearch, hasHandledAction]);

  useEffect(() => {
    setSelectedVehicle(current => {
      if (!current) return current;
      const updated = [...availableCars, ...soldCars].find(c => c.id === current.id);
      return updated || current;
    });
  }, [availableCars, soldCars]);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const handleAddVehicle = (data: AddVehicleRequest) => 
    executeAction(async () => {
      await addVehicleUseCase.execute(data);
      presenter.loadAvailable();
    }, { successMessage: 'Nhập xe mới thành công!' });

  const handleUpdateStatus = (id: number, nextStatus: VehicleStatus, extra?: Record<string, unknown>) => 
    executeAction(() => presenter.updateVehicleStatus({
      id,
      nextStatus,
      user: currentUser?.code || 'SYSTEM',
      ...extra
    }, userRole), { successMessage: 'Cập nhật trạng thái thành công!' });

   const handleDeleteVehicle = (id: number) => 
    executeAction(async () => {
      await presenter.deleteVehicle(id, userRole);
      setIsDetailOpen(false);
    }, { successMessage: 'Đã xóa xe thành công!' });

  const handleUpdateVehicle = (id: number, data: Partial<Vehicle>) => 
    executeAction(() => presenter.updateVehicle(id, data, userRole), { successMessage: 'Cập nhật thông tin thành công!' });

  const handleAddCost = (id: number, name: string, amount: number) => 
    executeAction(() => presenter.addVehicleCost(id, name, amount, currentUser?.id, userRole), { successMessage: 'Đã thêm chi phí thành công!' });

  const handleDeleteCost = (id: number, costIndex: number) => 
    executeAction(() => presenter.deleteVehicleCost(id, costIndex, userRole), { successMessage: 'Đã xóa chi phí!' });

   const handlePin = (id: number, isPinned: boolean) => 
    executeAction(() => presenter.togglePin(id, isPinned), { successMessage: isPinned ? 'Đã ghim xe!' : 'Đã bỏ ghim xe!' });

  const handleAddPurchasePayment = (id: number, amount: number, note: string, receiver: string) => 
    executeAction(() => presenter.addPurchasePayment(id, amount, note, receiver, userRole), { successMessage: 'Thanh toán thành công!' });

  const handleAddSalePayment = (id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number, buyingBonus?: number) => 
    executeAction(() => presenter.addSalePayment(id, amount, note, receiver, nextStatus, seller, buyerName, salePrice, commission, buyingBonus, userRole), { successMessage: 'Giao dịch thành công!' });

  const handleCancelSale = (id: number, userCode: string) => 
    executeAction(() => presenter.cancelSale(id, userCode, userRole), { successMessage: 'Đã hủy giao dịch!' });

  return {
    availableCars,
    soldCars,
    staffList,
    loading,
    activeTab,
    setActiveTab,
    soldMonth,
    setSoldMonth,
    selectedVehicle,
    setSelectedVehicle,
    isDetailOpen,
    setIsDetailOpen,
    isAddOpen,
    setIsAddOpen,
    searchQuery,
    setSearchQuery,
    presenter,
    filterCriteria,
    setFilterCriteria: (c: string) => {
      setFilterCriteria(c);
      presenter.filter(c);
    },
    handleAddVehicle,
    handleUpdateStatus,
    handleDeleteVehicle,
    handleUpdateVehicle,
    handleAddCost,
    handleDeleteCost,
    handlePin,
    handleAddPurchasePayment,
    handleAddSalePayment,
    handleCancelSale
  };
};
