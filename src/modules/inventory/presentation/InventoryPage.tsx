import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Package, Plus, RefreshCw, Filter, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { InventoryPresenter, InventoryView } from './InventoryPresenter';
import { GetInventoryList } from '@/src/modules/inventory/application/GetInventoryList';
import { UpdateVehicleStatus } from '@/src/modules/inventory/application/UpdateVehicleStatus';
import { AddVehicle, AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';
import { DeleteVehicle } from '@/src/modules/inventory/application/DeleteVehicle';
import { GetNextVehicleCode } from '@/src/modules/inventory/application/GetNextVehicleCode';
import { SupabaseVehicleRepository } from '@/src/modules/inventory/infrastructure/SupabaseVehicleRepository';
import { CloudinaryVehicleStorageRepository } from '@/src/modules/inventory/infrastructure/CloudinaryVehicleStorageRepository';
import { SupabaseStaffRepository } from '@/src/modules/staff/infrastructure/SupabaseStaffRepository';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, UserRole, STAFF_CONSTANTS } from '@/src/shared/domain/constants';
import { cn } from '@/src/utils/cn';
import { formatCurrency } from '@/src/utils/currency';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';
import { Z_INDEX } from '@/src/constants';

import { CarCard } from './components/CarCard';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { InventorySkeleton } from './components/InventorySkeleton';
import { InventoryPerformanceBar } from './components/InventoryPerformanceBar';

interface InventoryPageProps {
  userRole: string;
  currentUser: any;
  initialSearch?: string;
  initialFilter?: string;
  initialAction?: string;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ 
  userRole, 
  currentUser,
  initialSearch = '',
  initialFilter = 'ALL',
  initialAction = ''
}) => {
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

  // NEW: Helper for async actions
  const withSubmitState = (fn: Function) => async (...args: any[]) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fn(...args);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dependency Injection
  const { presenter, addVehicleUseCase } = useMemo(() => {
    const repository = new SupabaseVehicleRepository();
    const storageRepo = new CloudinaryVehicleStorageRepository();
    const getListUseCase = new GetInventoryList(repository);
    const updateUseCase = new UpdateVehicleStatus(repository);
    const deleteUseCase = new DeleteVehicle(repository, storageRepo);
    const addUseCase = new AddVehicle(repository);
    const nextCodeUseCase = new GetNextVehicleCode(repository);

    return {
      presenter: new InventoryPresenter(getListUseCase, updateUseCase, deleteUseCase, nextCodeUseCase),
      addVehicleUseCase: addUseCase
    };
  }, []);

  const sortVehicles = useCallback((cars: Vehicle[]) => {
    return [...cars].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // Secondary sort by purchase date
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
      // Không đóng modal ngay để người dùng thấy thay đổi
      presenter.loadAvailable(); 
    },
    onVehicleUpdated: (vehicle: Vehicle) => setSelectedVehicle(vehicle),
  }), [presenter]);

  useEffect(() => {
    presenter.attachView(view);
    const staffRepo = new SupabaseStaffRepository();
    staffRepo.getAll().then(list => {
      setStaffList(list.filter(s => s.role !== UserRole.ADMIN));
    });

    const loadData = async () => {
      const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT;
      const isManager = userRole === UserRole.MANAGER;

      if (isAdmin) {
        // 1. Admin/Kế toán: Xem toàn bộ kho xe
        await presenter.loadAvailable();
        if (activeTab === 'SOLD') {
          await presenter.loadSold(soldMonth);
        }
      } else if (isManager) {
        // 2. Trưởng phòng: Chỉ thấy xe của phòng ban (bao gồm cả xe Trong kho & Đã bán)
        if (currentUser?.department) {
          const codes = await staffRepo.getCodesByDepartment(currentUser.department);
          await presenter.loadDepartment(codes);
        } else {
          await presenter.loadAvailable();
          if (activeTab === 'SOLD') await presenter.loadSold(soldMonth);
        }
      } else {
        // 3. Nhân viên: Chỉ thấy xe liên quan (Nhập/Bán/Góp vốn)
        if (currentUser?.code) {
          await presenter.loadPersonal(currentUser.code);
        } else {
          await presenter.loadAvailable();
          if (activeTab === 'SOLD') await presenter.loadSold(soldMonth);
        }
      }

      if (initialFilter && initialFilter !== 'ALL') {
        presenter.filter(initialFilter);
      }
    };

    loadData();

    return () => presenter.detachView();
  }, [presenter, view, activeTab, soldMonth, initialFilter, userRole, currentUser]);

  // Luôn đồng bộ selectedVehicle với dữ liệu mới nhất từ server
  useEffect(() => {
    setSelectedVehicle(current => {
      if (!current) return current;
      const updated = [...availableCars, ...soldCars].find(c => c.id === current.id);
      return updated || current;
    });
  }, [availableCars, soldCars]);


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
    // Note: Confirmation is handled inside VehicleDetailModal's custom UI
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
    // Note: Confirmation is handled inside VehicleDetailModal's custom UI
    await presenter.cancelSale(id, userCode);
  });

  return (
    <div className="space-y-12 py-8 md:py-12 px-6 md:px-12 max-w-[1700px] mx-auto h-full flex flex-col overflow-hidden animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-10 shrink-0 border-b border-black/5 pb-12 relative z-30">
        <div className="text-center lg:text-left">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-6 justify-center lg:justify-start">
             <div className="w-16 h-16 rounded-[2rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20 shadow-inner">
               <Package size={38} strokeWidth={2.5} />
             </div>
             Kho xe
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-4 opacity-30 flex items-center gap-3 justify-center lg:justify-start">
            <span className="w-2 h-2 rounded-full bg-kraft-accent animate-pulse" />
            Vòng đời: Cọc mua → Spa → Sẵn sàng kinh doanh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center lg:justify-end">
          {/* Month Picker Synced with Dashboard - ONLY SHOW FOR SOLD TAB */}
          {activeTab === 'SOLD' && (
            <div className="relative group min-w-[160px] md:w-48 animate-in fade-in zoom-in slide-in-from-right-4 duration-500">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-kraft-accent/60 group-hover:text-kraft-accent transition-colors">
                <Calendar size={16} />
              </div>
              <input 
                type="month" 
                value={soldMonth}
                onChange={(e) => setSoldMonth(e.target.value)}
                className="pl-12 pr-6 h-14 w-full bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 text-[11px] font-black uppercase tracking-widest text-kraft-ink focus:border-kraft-accent/40 focus:ring-4 focus:ring-kraft-accent/5 transition-all outline-none shadow-sm"
              />
            </div>
          )}

          <div className="flex bg-white/40 backdrop-blur-2xl p-1 rounded-full border border-white/60 shadow-lg scale-95 sm:scale-100">
            <button 
              onClick={() => setActiveTab('AVAILABLE')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                activeTab === 'AVAILABLE' ? "bg-black text-white shadow-xl scale-105" : "text-kraft-ink/30 hover:text-kraft-ink/60"
              )}
            >
              Trong kho
            </button>
            <button 
              onClick={() => setActiveTab('SOLD')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                activeTab === 'SOLD' ? "bg-emerald-600 text-white shadow-2xl scale-105" : "text-kraft-ink/30 hover:text-kraft-ink/60"
              )}
            >
              Đã bán
            </button>
          </div>

          <button 
            onClick={() => setIsAddOpen(true)}
            className="w-12 h-12 liquid-button-primary p-0 flex items-center justify-center shrink-0 rounded-full hover:rotate-90 transition-transform duration-500 shadow-xl"
            title="Nhập xe mới"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </div>


      {/* Main Grid Content */}
      <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar min-h-0">
        {loading ? (
          <InventorySkeleton hideHeader />
        ) : (activeTab === 'AVAILABLE' ? availableCars : soldCars).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20 justify-items-center">
            {(activeTab === 'AVAILABLE' ? availableCars : soldCars).map((car) => (
              <div key={car.id} className="w-full max-w-[380px] h-full">
                <CarCard 
                  car={car} 
                  userRole={userRole}
                  userCode={currentUser?.code || 'SYSTEM'}
                  onPin={handlePin}
                  onClick={(c) => {
                    setSelectedVehicle(c);
                    setIsDetailOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-48 gap-8 opacity-20">
             <Package size={80} strokeWidth={1} />
             <p className="text-xs font-black uppercase tracking-[0.5em] italic">Danh bạ kho trống</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isDetailOpen && (
          <VehicleDetailModal 
            isOpen={isDetailOpen}
            vehicle={selectedVehicle}
            onClose={() => setIsDetailOpen(false)}
            onUpdateStatus={handleUpdateStatus}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateVehicle={(id, data) => presenter.updateVehicle(id, data)}
            onAddCost={(vehicle, name, amount) => presenter.addVehicleCost(vehicle, name, amount)}
            onDeleteCost={(vehicle, idx) => presenter.deleteVehicleCost(vehicle, idx)}
            onPin={handlePin}
            onAddPurchasePayment={handleAddPurchasePayment}
            onAddSalePayment={handleAddSalePayment}
            onCancelSale={handleCancelSale}
            staffList={staffList}
            userRole={userRole}
            userCode={currentUser?.code || 'SYSTEM'}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddOpen && (
          <AddVehicleModal 
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onSubmit={handleAddVehicle}
            staffList={staffList}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
