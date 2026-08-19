import React, { useState, useEffect, Suspense } from 'react';
import { Calendar, LogOut, Key, UserCircle, DollarSign, Clock, CheckCircle, Car, Settings, Edit2, Trash2, ShoppingBag, ArrowUpRight, Award, Share2, ReceiptText, ChevronRight } from 'lucide-react';
import { StaffSalaryService, SalaryDetails } from '@/src/modules/staff/domain/StaffSalaryService';
import { UserRole, VehicleStatus } from '@/src/shared/domain/constants';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';
import { motion, AnimatePresence } from 'motion/react';
import { Staff, Vehicle, StaffExpense } from '@/src/shared/domain/types';
import { formatCurrency } from '@/src/shared/utils/currency';
import { cn } from '@/src/shared/utils/cn';
import { formatDate } from '@/src/shared/utils/date';
import { UpdateVehicleInput } from '@/src/modules/inventory/domain/VehicleSchema';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { Skeleton } from '@/src/shared/design-system/Skeleton';
import { AnimatedNumber } from '@/src/shared/design-system/AnimatedNumber';
import { haptics } from '@/src/shared/utils/haptics';
import { PersonalState } from '@/src/modules/personal/presentation/usePersonalState';

// Lazy-load heavy modals to optimize initial mobile render time
const VehicleDetailModal = React.lazy(() => 
  import('@/src/modules/inventory/presentation/components/VehicleDetailModal').then(m => ({ default: m.VehicleDetailModal }))
);
const StaffAddExpenseModal = React.lazy(() => 
  import('@/src/modules/staff/presentation/components/StaffAddExpenseModal').then(m => ({ default: m.StaffAddExpenseModal }))
);
const PasswordModal = React.lazy(() => 
  import('./components/PersonalModals').then(m => ({ default: m.PasswordModal }))
);
const ProfileModal = React.lazy(() => 
  import('./components/PersonalModals').then(m => ({ default: m.ProfileModal }))
);

const PersonalMobileSkeleton = () => {
  return (
    <NativePage className="bg-kraft-bg px-4 py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" width={64} height={64} className="rounded-full shrink-0 animate-pulse bg-black/5" />
          <div className="space-y-2">
            <Skeleton variant="text" width={80} height={12} className="animate-pulse bg-black/5" />
            <Skeleton variant="text" width={140} height={24} className="animate-pulse bg-black/5" />
          </div>
        </div>
        <Skeleton variant="circle" width={40} height={40} className="rounded-full shrink-0 animate-pulse bg-black/5" />
      </div>

      {/* Month picker skeleton */}
      <Skeleton variant="rectangle" width={140} height={48} className="rounded-full animate-pulse bg-black/5" />

      {/* Big Earnings card skeleton */}
      <div className="bg-kraft-ink p-6 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2">
          <Skeleton variant="text" width={120} height={12} className="bg-white/10 animate-pulse" />
          <Skeleton variant="text" width={200} height={32} className="bg-white/20 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
          <div className="space-y-2">
            <Skeleton variant="text" width={60} height={10} className="bg-white/10 animate-pulse" />
            <Skeleton variant="text" width={100} height={16} className="bg-white/20 animate-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" width={60} height={10} className="bg-white/10 animate-pulse" />
            <Skeleton variant="text" width={100} height={16} className="bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Performance grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-black/5 space-y-3 shadow-sm">
          <Skeleton variant="text" width="50%" height={10} className="mx-auto animate-pulse bg-black/5" />
          <Skeleton variant="text" width="70%" height={20} className="mx-auto animate-pulse bg-black/5" />
          <Skeleton variant="rectangle" width="100%" height={6} className="rounded-full animate-pulse bg-black/5" />
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-black/5 flex flex-col justify-center items-center space-y-3 shadow-sm">
          <Skeleton variant="text" width="60%" height={10} className="animate-pulse bg-black/5" />
          <Skeleton variant="text" width="50%" height={20} className="animate-pulse bg-black/5" />
        </div>
      </div>

      {/* Expense section title */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" width={18} height={18} className="rounded-full animate-pulse bg-black/5" />
          <Skeleton variant="text" width={120} height={10} className="animate-pulse bg-black/5" />
        </div>
        <Skeleton variant="rectangle" width={70} height={20} className="rounded-lg animate-pulse bg-black/5" />
      </div>

      {/* Expense card skeleton */}
      <div className="bg-white p-5 rounded-[2rem] border border-black/5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton variant="rectangle" width={40} height={40} className="rounded-xl shrink-0 animate-pulse bg-black/5" />
            <div className="space-y-2">
              <Skeleton variant="text" width={100} height={14} className="animate-pulse bg-black/5" />
              <Skeleton variant="text" width={60} height={10} className="animate-pulse bg-black/5" />
            </div>
          </div>
          <Skeleton variant="text" width={70} height={16} className="animate-pulse bg-black/5" />
        </div>
      </div>
    </NativePage>
  );
};

interface PersonalMobileViewProps {
  user: Staff | null;
  onUpdateUser?: (email: string, data: Partial<Staff> & { password?: string }) => void;
  onLogout?: () => void;
  state: PersonalState;
}

/**
 * 🍎 iPhone Native Personal View.
 */
export const PersonalMobileView: React.FC<PersonalMobileViewProps> = ({ 
  user, 
  onLogout, 
  state 
}) => {
  const {
    selectedMonth, setSelectedMonth,
    selectedVehicle, setSelectedVehicle,
    isVehicleDetailOpen, setIsVehicleDetailOpen,
    isModalOpen, setIsModalOpen, 
    isEditModalOpen, setIsEditModalOpen,
    newPassword, setNewPassword, 
    editFormData, setEditFormData, 
    handleChangePassword, handleUpdateProfile,
    handleUpdateStatus,
    handleDeleteVehicle,
    handleUpdateVehicle,
    handleAddCost,
    handleDeleteCost,
    handlePin,
    handleAddPurchasePayment,
    handleAddSalePayment,
    handleCancelSale,
    handleAddStaffExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    isExpenseModalOpen, setIsExpenseModalOpen,
    editingExpense, setEditingExpense,
    allVehicles,
    staffData,
    loading,
    isSubmitting
  } = state;

  const isInitialLoading = loading && !staffData;
  const [showSettings, setShowSettings] = useState(false);

  const { staffRepo } = useDependencies();
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    staffRepo.getAll().then(list => {
      setStaffList(list.filter(s => s.role !== UserRole.ADMIN));
    });
  }, [staffRepo]);

  if (isInitialLoading) {
    return <PersonalMobileSkeleton />;
  }

  if (!user) return null;

  const salaryDetails = staffData?.salaryDetails || StaffSalaryService.calculateMonthlySalary(user, allVehicles, selectedMonth);

  const handleSelectCar = (vehicle: Vehicle) => {
    haptics.light();
    setSelectedVehicle(vehicle);
    setIsVehicleDetailOpen(true);
  };

  return (
    <NativePage className="bg-kraft-bg animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <NativeHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-kraft-accent flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <SecondaryLabel className="!text-[10px] uppercase tracking-widest">{user.department || 'Phòng Kinh doanh'}</SecondaryLabel>
              <LargeTitle className="!text-xl font-heading">{user.name}</LargeTitle>
            </div>
          </div>
          {onLogout && (
            <motion.button 
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                haptics.heavy();
                onLogout();
              }}
              className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 transition-transform active:bg-red-100"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </motion.button>
          )}
        </div>

        {/* Month Picker - Native Style */}
        <div className="mt-5 relative inline-flex items-center gap-2.5 px-5 h-11 rounded-full border border-white/60 bg-white/80 backdrop-blur-md shadow-sm active:scale-95 transition-transform w-fit overflow-hidden">
          <Calendar size={14} className="text-kraft-accent shrink-0" />
          <span className="font-black uppercase text-[10px] tracking-widest text-kraft-ink pointer-events-none">
            {selectedMonth ? `THÁNG ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}` : 'CHỌN THÁNG'}
          </span>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => {
              haptics.light();
              setSelectedMonth(e.target.value);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </NativeHeader>

      <div className="space-y-6 px-1">
        {/* Earnings Summary Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 0.1 }}
          className="bg-kraft-ink text-white p-6 rounded-[2.2rem] shadow-xl relative overflow-hidden border border-white/10"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <SecondaryLabel className="text-white/50 !text-[10px] uppercase tracking-widest">Tổng thu nhập tháng</SecondaryLabel>
          <div className="text-3xl font-black mt-1">
            <AnimatedNumber value={salaryDetails.netSalary} isCurrency={true} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/10">
            <div>
              <div className="text-[9px] uppercase font-black opacity-40 tracking-wider">Lương cứng</div>
              <div className="font-bold text-sm">{formatCurrency(user.base_salary || 0)}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase font-black opacity-40 tracking-wider">Hoa hồng & Thưởng</div>
              <div className="font-bold text-sm text-emerald-400">
                +<AnimatedNumber value={salaryDetails.totalCommission} isCurrency={true} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Collapsible */}
        <div>
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              haptics.light();
              setShowSettings(!showSettings);
            }}
            className="w-full flex items-center justify-between px-2 mb-3 group"
          >
            <SecondaryLabel className="!mb-0 uppercase tracking-widest text-[10px] font-black">Cài đặt tài khoản</SecondaryLabel>
            <div className={cn(
              "text-[9px] font-black uppercase tracking-widest text-kraft-accent px-3 py-1 bg-kraft-accent/10 rounded-full transition-all",
              showSettings ? "bg-kraft-ink text-white" : ""
            )}>
              {showSettings ? 'Đóng' : 'Mở'}
            </div>
          </motion.button>
          
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-[1.8rem] border border-black/5 overflow-hidden shadow-sm mb-3 divide-y divide-black/5">
                  <SettingsItem 
                    icon={UserCircle} 
                    label="Chỉnh sửa hồ sơ" 
                    onClick={() => { 
                      haptics.light();
                      setIsEditModalOpen(true); 
                      setShowSettings(false); 
                    }} 
                    color="blue"
                  />
                  <SettingsItem 
                    icon={Key} 
                    label="Đổi mật khẩu" 
                    onClick={() => { 
                      haptics.light();
                      setIsModalOpen(true); 
                      setShowSettings(false); 
                    }} 
                    color="orange"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
            className="bg-white p-4.5 rounded-[1.8rem] border border-black/5 shadow-sm text-center"
          >
            <div className="text-[9px] font-black uppercase opacity-40 tracking-wider mb-1">KPI Tháng</div>
            <div className="text-lg font-black text-kraft-ink">{salaryDetails.soldCars.length}/{user.target || 0} xe</div>
            <div className="mt-2 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-kraft-accent transition-all" style={{ width: `${Math.min(salaryDetails.completionRate, 100)}%` }} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.25 }}
            className="bg-white p-4.5 rounded-[1.8rem] border border-black/5 shadow-sm text-center flex flex-col justify-center"
          >
            <div className="text-[9px] font-black uppercase opacity-40 tracking-wider mb-1">Tỉ lệ hoàn thành</div>
            <div className="text-lg font-black text-emerald-600">{Math.round(salaryDetails.completionRate)}%</div>
          </motion.div>
        </div>

        {/* Unified Expenses Section */}
        <div className="pt-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-3 px-2"
          >
             <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-kraft-accent" />
                <SecondaryLabel className="!mb-0 uppercase tracking-widest text-[10px] font-black">Chi phí & Hoàn ứng</SecondaryLabel>
             </div>
             <motion.button 
               whileTap={{ scale: 0.94 }}
               onClick={() => { 
                 haptics.light();
                 setEditingExpense(null); 
                 setIsExpenseModalOpen(true); 
               }}
               className="text-[9px] font-black uppercase tracking-widest text-kraft-accent px-3 py-1 bg-kraft-accent/10 rounded-full border border-kraft-accent/20 active:bg-kraft-accent/20 transition-all shadow-sm"
             >
               + Ghi thêm
             </motion.button>
          </motion.div>
          <UnifiedExpenseList 
            expenses={staffData?.expenses || []} 
            selectedMonth={selectedMonth}
            onEdit={(exp) => { 
              haptics.light();
              setEditingExpense(exp); 
              setIsExpenseModalOpen(true); 
            }} 
            onDelete={(id) => {
              haptics.heavy();
              handleDeleteExpense(id);
            }}
          />
        </div>

        {/* Salary Statement Section with Tap-to-View Vehicle */}
        <div className="pt-4 space-y-3">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-between px-2"
          >
            <div className="flex items-center gap-2">
              <ReceiptText size={16} className="text-kraft-accent" />
              <SecondaryLabel className="!mb-0 uppercase tracking-widest text-[10px] font-black">Bảng kê chi tiết lương</SecondaryLabel>
            </div>
            <span className="text-[9px] font-bold text-sub-label opacity-50 uppercase tracking-wider">Chạm xe để xem</span>
          </motion.div>
          
          <SalaryStatement 
            salaryDetails={salaryDetails} 
            onSelectVehicle={handleSelectCar}
          />
        </div>
      </div>

      {/* Shared Modals */}
      <Suspense fallback={null}>
        {isModalOpen && (
          <PasswordModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            value={newPassword} 
            onChange={setNewPassword} 
            onSubmit={handleChangePassword} 
            isSubmitting={isSubmitting}
          />
        )}
        
        {isEditModalOpen && (
          <ProfileModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            data={editFormData} 
            onChange={(data) => setEditFormData({ ...editFormData, ...data })} 
            onSubmit={handleUpdateProfile} 
            isSubmitting={isSubmitting}
          />
        )}

        <AnimatePresence>
          {isVehicleDetailOpen && selectedVehicle && (
            <VehicleDetailModal 
              isOpen={isVehicleDetailOpen}
              vehicle={selectedVehicle}
              onClose={() => setIsVehicleDetailOpen(false)}
              onUpdateStatus={(id, nextStatus, extra) => handleUpdateStatus(id, nextStatus, extra || {})}
              onDeleteVehicle={handleDeleteVehicle}
              onUpdateVehicle={(id, data) => handleUpdateVehicle(id, data as UpdateVehicleInput)}
              onAddCost={handleAddCost}
              onDeleteCost={handleDeleteCost}
              onPin={handlePin}
              onAddPurchasePayment={handleAddPurchasePayment}
              onAddSalePayment={(id, amount, note, receiver, status, seller, bName, sPrice, comm, bBonus) => 
                handleAddSalePayment(id, amount, note, receiver, status as VehicleStatus, seller, bName, sPrice, comm, bBonus)
              }
              onCancelSale={handleCancelSale}
              staffList={staffList}
              userRole={user.role}
              userCode={user.code}
            />
          )}
        </AnimatePresence>

        {isExpenseModalOpen && (
          <StaffAddExpenseModal 
            isOpen={isExpenseModalOpen}
            onClose={() => {
              setIsExpenseModalOpen(false);
              setEditingExpense(null);
            }}
            staffName={user.name}
            expense={editingExpense || undefined}
            onAdd={async (data) => {
              if (editingExpense) {
                await handleUpdateExpense(String(editingExpense.id), { ...data, id: String(editingExpense.id) });
              } else {
                await handleAddStaffExpense(data);
              }
              setIsExpenseModalOpen(false);
              setEditingExpense(null);
            }}
            onDelete={async () => {
              if (editingExpense) {
                await handleDeleteExpense(String(editingExpense.id));
                setIsExpenseModalOpen(false);
                setEditingExpense(null);
              }
            }}
            vehicles={allVehicles}
          />
        )}
      </Suspense>
    </NativePage>
  );
};

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color: 'blue' | 'orange';
}

const SettingsItem = ({ icon: Icon, label, onClick, color }: SettingsItemProps) => (
  <motion.button 
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-transparent active:bg-black/5 transition-colors text-left"
  >
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center",
        color === 'blue' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
      )}>
        <Icon size={16} />
      </div>
      <span className="text-xs font-black text-kraft-ink uppercase tracking-wider">{label}</span>
    </div>
    <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center text-kraft-ink/40">
      <Settings size={12} />
    </div>
  </motion.button>
);

interface SalaryStatementItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  icon: React.ElementType;
  color: 'blue' | 'amber' | 'orange' | 'emerald';
  vehicle: Vehicle;
}

const SalaryStatement = ({ 
  salaryDetails, 
  onSelectVehicle 
}: { 
  salaryDetails: SalaryDetails;
  onSelectVehicle: (vehicle: Vehicle) => void;
}) => {
  const items: SalaryStatementItem[] = [];

  // 1. Xe bán
  salaryDetails.soldCars.forEach((c: Vehicle) => {
    const amount = (c.commission || 0) * (salaryDetails.kpiBonusMultiplier || 1);
    if (amount > 0) {
      items.push({
        id: `sale-${c.id}`,
        title: c.name,
        subtitle: `Bán: #${c.code}`,
        amount: amount,
        icon: ArrowUpRight,
        color: 'blue',
        vehicle: c
      });
    }
  });

  // 2. Xe mua & Thưởng
  salaryDetails.boughtCars.forEach((c: Vehicle) => {
    if ((c.buying_commission || 0) > 0) {
      items.push({
        id: `buy-${c.id}`,
        title: c.name,
        subtitle: `Mua: #${c.code}`,
        amount: c.buying_commission || 0,
        icon: ShoppingBag,
        color: 'amber',
        vehicle: c
      });
    }
    
    if ((c.buying_bonus || 0) > 0) {
      items.push({
        id: `buy-bonus-${c.id}`,
        title: c.name,
        subtitle: `Thưởng mua: #${c.code}`,
        amount: c.buying_bonus || 0,
        icon: Award,
        color: 'orange',
        vehicle: c
      });
    }
  });

  // 3. Góp vốn
  salaryDetails.coinvestedCars.forEach((c: Vehicle) => {
    const financials = calculateVehicleFinancials(c);
    const amount = c.partner_profit_shared ? 0 : financials.partnerProfitShare;
    if (amount > 0) {
      items.push({
        id: `coinvest-${c.id}`,
        title: c.name,
        subtitle: `Góp vốn: #${c.code}`,
        amount: amount,
        icon: Share2,
        color: 'emerald',
        vehicle: c
      });
    }
  });

  if (items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-[1.8rem] text-center border border-black/5 shadow-sm">
        <div className="text-[10px] font-black uppercase opacity-30 tracking-widest">
          Chưa có giao dịch phát sinh hoa hồng
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[1.8rem] border border-black/5 shadow-sm overflow-hidden">
      <div className="divide-y divide-black/5">
        {items.map((item, index) => (
          <motion.button 
            key={item.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectVehicle(item.vehicle)}
            className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                item.color === 'blue' ? "bg-blue-50 text-blue-600" : 
                item.color === 'amber' ? "bg-amber-50 text-amber-600" : 
                item.color === 'orange' ? "bg-orange-50 text-orange-600" : 
                "bg-emerald-50 text-emerald-600"
              )}>
                <item.icon size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-kraft-ink leading-tight truncate group-hover:text-kraft-accent transition-colors">
                  {item.title}
                </div>
                <div className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-0.5">
                  {item.subtitle}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pl-2">
              <span className="text-xs font-black text-emerald-600 whitespace-nowrap">
                +{formatCurrency(item.amount)}
              </span>
              <ChevronRight size={14} className="text-sub-label opacity-30 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
        <div className="p-4 bg-black/[0.02] flex items-center justify-between border-t border-black/5">
          <div className="text-[10px] font-black uppercase opacity-40">Tổng hoa hồng thực nhận</div>
          <div className="text-sm font-black text-emerald-600">
            {formatCurrency(salaryDetails.totalCommission)}
          </div>
        </div>
      </div>
    </div>
  );
};

interface UnifiedExpenseListProps {
  expenses: StaffExpense[];
  selectedMonth: string;
  onEdit: (exp: StaffExpense) => void;
  onDelete: (id: string) => void;
}

const UnifiedExpenseList: React.FC<UnifiedExpenseListProps> = ({ 
  expenses, 
  selectedMonth,
  onEdit,
  onDelete
}) => {
  const pending = expenses.filter(e => !e.is_reimbursed).sort((a, b) => b.date.localeCompare(a.date));
  const reimbursed = expenses.filter(e => e.is_reimbursed && e.date.startsWith(selectedMonth)).sort((a, b) => b.date.localeCompare(a.date));

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-[1.8rem] text-center border border-black/5 shadow-sm">
        <div className="text-[10px] font-black uppercase opacity-30 tracking-widest">
          Chưa có khoản chi phí nào
        </div>
      </div>
    );
  }

  const renderCard = (exp: StaffExpense, index: number) => (
    <motion.div 
      key={exp.id} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group relative bg-white py-3 px-4 rounded-[1.5rem] border border-black/5 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            exp.type === 'vehicle' ? "bg-blue-50 text-blue-500" : "bg-kraft-accent/10 text-kraft-accent"
          )}>
            {exp.type === 'vehicle' ? <Car size={16} /> : <Settings size={16} />}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-kraft-ink leading-tight truncate">{exp.note}</div>
            <div className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-0.5">
              {formatDate(exp.date)} {exp.vehicle_code ? `• #${exp.vehicle_code}` : ''}
            </div>
          </div>
        </div>
        <div className="text-xs font-black text-kraft-ink whitespace-nowrap pl-2">
          {formatCurrency(exp.amount)}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5">
        <span className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[8px] uppercase tracking-widest",
          exp.is_reimbursed ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
        )}>
          {exp.is_reimbursed ? <CheckCircle size={9} /> : <Clock size={9} />}
          {exp.is_reimbursed ? 'Đã hoàn ứng' : 'Chờ duyệt chi'}
        </span>

        <div className="flex items-center gap-1">
          {!exp.is_reimbursed && (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onEdit(exp); }}
              className="w-7 h-7 flex items-center justify-center text-kraft-ink/30 hover:text-kraft-accent active:bg-black/5 rounded-lg transition-colors"
            >
              <Edit2 size={13} />
            </motion.button>
          )}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { 
              e.stopPropagation(); 
              if (window.confirm('Xóa khoản chi này?')) onDelete(exp.id); 
            }}
            className="w-7 h-7 flex items-center justify-center text-kraft-ink/30 hover:text-red-500 active:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <Clock size={11} className="text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Chờ hoàn tiền ({pending.length})</span>
            <div className="h-px flex-1 bg-amber-500/10" />
          </div>
          {pending.map((exp, i) => renderCard(exp, i))}
        </div>
      )}

      {reimbursed.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <CheckCircle size={11} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Đã chi tháng {selectedMonth.split('-')[1]} ({reimbursed.length})</span>
            <div className="h-px flex-1 bg-emerald-500/10" />
          </div>
          {reimbursed.map((exp, i) => renderCard(exp, i))}
        </div>
      )}
    </div>
  );
};
