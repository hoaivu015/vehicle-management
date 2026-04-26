import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { InventoryPresenter, InventoryView } from './InventoryPresenter';
import { GetInventoryList } from '@/src/modules/inventory/application/GetInventoryList';
import { UpdateVehicleStatus } from '@/src/modules/inventory/application/UpdateVehicleStatus';
import { DeleteVehicle } from '@/src/modules/inventory/application/DeleteVehicle';
import { AddVehicle, AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';
import { GetNextVehicleCode } from '@/src/modules/inventory/application/GetNextVehicleCode';
import { AddVehicleCost } from '@/src/modules/inventory/application/AddVehicleCost';
import { AddPurchasePayment } from '@/src/modules/inventory/application/AddPurchasePayment';
import { AddSalePayment } from '@/src/modules/inventory/application/AddSalePayment';
import { CancelSale } from '@/src/modules/inventory/application/CancelSale';
import { UpdateVehicle } from '@/src/modules/inventory/application/UpdateVehicle';
import { DeleteVehicleCost } from '@/src/modules/inventory/application/DeleteVehicleCost';
import { SupabaseVehicleRepository } from '@/src/modules/inventory/infrastructure/SupabaseVehicleRepository';
import { CloudinaryVehicleStorageRepository } from '@/src/modules/inventory/infrastructure/CloudinaryVehicleStorageRepository';
import { SupabaseStaffRepository } from '@/src/modules/staff/infrastructure/SupabaseStaffRepository';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, UserRole } from '@/src/shared/domain/constants';

interface UseInventoryProps {
  userRole: string;
  currentUser: any;
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
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'SOLD'>('AVAILABLE');
  const [soldMonth, setSoldMonth] = useState(new Date().toISOString().slice(0, 7));

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filterCriteria, setFilterCriteria] = useState(initialFilter);
  const [hasHandledAction, setHasHandledAction] = useState(false);

  const withSubmitState = useCallback((fn: Function) => async (...args: any[]) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fn(...args);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  // Dependency Injection
  const { presenter, addVehicleUseCase, repository } = useMemo(() => {
    const repository = new SupabaseVehicleRepository();
    const storageRepo = new CloudinaryVehicleStorageRepository();
    const getListUseCase = new GetInventoryList(repository);
    const updateUseCase = new UpdateVehicleStatus(repository);
    const deleteUseCase = new DeleteVehicle(repository, storageRepo);
    const addUseCase = new AddVehicle(repository);
    const nextCodeUseCase = new GetNextVehicleCode(repository);
    const addCostUseCase = new AddVehicleCost(repository);
    const addPurchasePaymentUseCase = new AddPurchasePayment(repository);
    const addSalePaymentUseCase = new AddSalePayment(repository);
    const cancelSaleUseCase = new CancelSale(repository);
    const updateVehicleUseCase = new UpdateVehicle(repository);
    const deleteVehicleCostUseCase = new DeleteVehicleCost(repository, new SupabaseStaffRepository());

    return {
      presenter: new InventoryPresenter(
        getListUseCase, 
        updateUseCase, 
        deleteUseCase, 
        nextCodeUseCase,
        addCostUseCase,
        addPurchasePaymentUseCase,
        addSalePaymentUseCase,
        cancelSaleUseCase,
        updateVehicleUseCase,
        deleteVehicleCostUseCase
      ),
      addVehicleUseCase: addUseCase,
      repository
    };
  }, []);

  const sortVehicles = useCallback((cars: Vehicle[]) => {
    return [...cars].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      const dateA = a.purchase_date ? new Date(a.purchase_date).getTime() : 0;
      const dateB = b.purchase_date ? new Date(b.purchase_date).getTime() : 0;
      return dateB - dateA;
    });
  }, []);

  // View Implementation
  const view: InventoryView = useMemo(() => ({
    showAvailableCars: (cars) => setAvailableCars(sortVehicles(cars)),
    showSoldCars: (cars) => setSoldCars(sortVehicles(cars)),
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
    showError: (msg) => toast.error(msg),
    onStatusUpdated: () => {
      toast.success('Cập nhật thành công!');
      presenter.loadAvailable();
    },
    onVehicleUpdated: (vehicle: Vehicle) => setSelectedVehicle(vehicle),
  }), [presenter, sortVehicles]);

  useEffect(() => {
    presenter.attachView(view);
    const staffRepo = new SupabaseStaffRepository();
    staffRepo.getAll().then(list => {
      setStaffList(list.filter(s => s.role !== UserRole.ADMIN));
    });

    const loadData = async () => {
      const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT;
      const isManager = userRole === UserRole.MANAGER;

      let carsForAction: Vehicle[] = [];

      if (isAdmin) {
        await presenter.loadAvailable();
        carsForAction = await repository.getAvailableVehicles();
        if (activeTab === 'SOLD') {
          await presenter.loadSold(soldMonth);
        }
      } else if (isManager) {
        if (currentUser?.department) {
          const codes = await staffRepo.getCodesByDepartment(currentUser.department);
          await presenter.loadDepartment(codes, soldMonth);
          const deptCars = await repository.getVehiclesByCodes(codes);
          carsForAction = deptCars.filter(c => c.status !== VehicleStatus.SOLD);
        } else {
          await presenter.loadAvailable();
          carsForAction = await repository.getAvailableVehicles();
          if (activeTab === 'SOLD') await presenter.loadSold(soldMonth);
        }
      } else {
        if (currentUser?.code) {
          await presenter.loadPersonal(currentUser.code, soldMonth);
          const personalCars = await repository.getVehiclesByStaff(currentUser.code);
          carsForAction = personalCars.filter(c => c.status !== VehicleStatus.SOLD);
        } else {
          await presenter.loadAvailable();
          carsForAction = await repository.getAvailableVehicles();
          if (activeTab === 'SOLD') await presenter.loadSold(soldMonth);
        }
      }

      if (initialFilter && initialFilter !== 'ALL') {
        presenter.filter(initialFilter);
        setFilterCriteria(initialFilter);
      }
      if (initialSearch) {
        presenter.search(initialSearch);
      }
    };

    loadData();
    return () => {
      presenter.detachView();
      setHasHandledAction(false); // Reset on unmount
    };
  }, [presenter, view, activeTab, soldMonth, initialFilter, userRole, currentUser, initialSearch, repository]);

  // Separate effect for post-load actions to ensure data is ready in state
  useEffect(() => {
    if (initialAction === 'adjust_price' && availableCars.length > 0 && !hasHandledAction) {
      let targetCar: Vehicle | undefined;
      
      if (initialFilter === 'AGING_25') {
        const limit = new Date(); limit.setDate(limit.getDate() - 25);
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

  const handleAddVehicle = withSubmitState(async (data: AddVehicleRequest) => {
    try {
      await addVehicleUseCase.execute(data);
      toast.success('Nhập xe mới thành công!');
      presenter.loadAvailable();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi nhập xe');
      throw error;
    }
  });

  const handleUpdateStatus = withSubmitState(async (id: number, nextStatus: VehicleStatus, extra?: any) => {
    await presenter.updateVehicleStatus({
      id,
      nextStatus,
      user: currentUser?.code || 'SYSTEM',
      ...extra
    });
  });

  const handleDeleteVehicle = withSubmitState(async (id: number) => {
    await presenter.deleteVehicle(id);
    setIsDetailOpen(false);
  });

  const handlePin = async (id: number, isPinned: boolean) => {
    await presenter.togglePin(id, isPinned);
  };

  const handleAddPurchasePayment = async (id: number, amount: number, note: string, receiver: string) => {
    await presenter.addPurchasePayment(id, amount, note, receiver);
  };

  const handleAddSalePayment = async (id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number) => {
    await presenter.addSalePayment(id, amount, note, receiver, nextStatus, seller, buyerName, salePrice, commission);
  };

  const handleCancelSale = withSubmitState(async (id: number, userCode: string) => {
    await presenter.cancelSale(id, userCode);
  });

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
    handlePin,
    handleAddPurchasePayment,
    handleAddSalePayment,
    handleCancelSale
  };
};
