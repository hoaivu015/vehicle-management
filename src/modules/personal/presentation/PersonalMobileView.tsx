import { useState, useEffect } from 'react';
import { Calendar, LogOut, Key, UserCircle, DollarSign, Clock, CheckCircle, Car, Settings, Edit2, Trash2 } from 'lucide-react';
import { calculateStaffSalaryDetails } from '@/src/shared/utils/finance';
import { UserRole } from '@/src/shared/domain/constants';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { VehicleDetailModal } from '@/src/modules/inventory/presentation/components/VehicleDetailModal';
import { usePersonalState } from '@/src/modules/personal/presentation/usePersonalState';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';
import { motion, AnimatePresence } from 'motion/react';
import { Staff } from '@/src/shared/domain/types';
import { formatCurrency } from '@/src/shared/utils/currency';
import { cn } from '@/src/shared/utils/cn';
import { formatDate } from '@/src/shared/utils/date';
import { ShoppingBag, ArrowUpRight, Award, Share2, ReceiptText } from 'lucide-react';
import { StaffAddExpenseModal } from '@/src/modules/staff/presentation/components/StaffAddExpenseModal';
import { StaffSalaryDetails } from '@/src/shared/utils/finance';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { Skeleton } from '@/src/shared/design-system/Skeleton';



const PersonalMobileSkeleton = () => {
  return (
    <NativePage className="bg-[#F8F9FA] px-4 py-6 space-y-6">
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

      {/* Settings list toggle skeleton */}
      <div className="flex items-center justify-between px-2">
        <Skeleton variant="text" width={100} height={10} className="animate-pulse bg-black/5" />
        <Skeleton variant="rectangle" width={50} height={20} className="rounded-lg animate-pulse bg-black/5" />
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
        <div className="flex justify-between items-center pt-2">
          <Skeleton variant="rectangle" width={80} height={18} className="rounded-lg animate-pulse bg-black/5" />
          <div className="flex gap-2">
            <Skeleton variant="circle" width={32} height={32} className="rounded-full animate-pulse bg-black/5" />
            <Skeleton variant="circle" width={32} height={32} className="rounded-full animate-pulse bg-black/5" />
          </div>
        </div>
      </div>
    </NativePage>
  );
};

interface PersonalMobileViewProps {
  user: Staff | null;
  onUpdateUser?: (docId: string, data: Partial<Staff>) => void;
  onLogout?: () => void;
}

/**
 * 🍎 iPhone Native Personal View.
 */
export const PersonalMobileView = ({ user, onUpdateUser, onLogout }: PersonalMobileViewProps) => {
  const {
    selectedMonth, setSelectedMonth,
    selectedVehicle,
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
    loading
  } = usePersonalState(user as Staff, onUpdateUser);

  const isInitialLoading = loading && !staffData;
  const isSubsequentLoading = loading && !!staffData;

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

  const salaryDetails = staffData?.salaryDetails || calculateStaffSalaryDetails(user, allVehicles, selectedMonth);

  return (
    <NativePage className="bg-[#F8F9FA] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <NativeHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-kraft-accent flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <SecondaryLabel>{user.department || 'Thành viên'}</SecondaryLabel>
              <LargeTitle>{user.name}</LargeTitle>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 transition-transform"
          >
            <LogOut size={18} />
          </motion.button>
        </div>

        {/* Month Picker - Native Style */}
        <div className="mt-6 relative inline-flex items-center gap-3 px-6 h-12 rounded-full border border-white/40 bg-white/70 backdrop-blur-md shadow-neural-t2 active:scale-95 transition-transform w-fit overflow-hidden">
          <Calendar size={16} className="text-kraft-accent shrink-0" />
          <span className="font-black uppercase text-[11px] tracking-widest text-kraft-ink pointer-events-none">
            {selectedMonth ? `THÁNG ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}` : 'CHỌN THÁNG'}
          </span>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </NativeHeader>

      <div className="relative">
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
          <div className="space-y-6">
            {/* Earnings Summary Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 0.1 }}
              className="bg-kraft-ink text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <SecondaryLabel className="text-white/50">Tổng thu nhập tháng</SecondaryLabel>
              <div className="text-3xl font-black mt-1">{formatCurrency(salaryDetails.totalSalary)}</div>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                  <div className="text-[10px] uppercase font-black opacity-40">Lương cứng</div>
                  <div className="font-bold">{formatCurrency(user.base_salary || 0)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black opacity-40">Hoa hồng</div>
                  <div className="font-bold text-emerald-400">+{formatCurrency(salaryDetails.totalCommission)}</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions List - Collapsible */}
            <div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between px-2 mb-4 group"
              >
                <SecondaryLabel className="!mb-0 uppercase tracking-widest text-[10px] font-black">Cài đặt tài khoản</SecondaryLabel>
                <div className={cn(
                  "text-[10px] font-black uppercase tracking-widest text-kraft-accent px-3 py-1 bg-kraft-accent/10 rounded-lg transition-all",
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
                    <div className="bg-white rounded-[2rem] border border-black/5 overflow-hidden shadow-sm mb-4">
                      <SettingsItem 
                        icon={UserCircle} 
                        label="Chỉnh sửa hồ sơ" 
                        onClick={() => { setIsEditModalOpen(true); setShowSettings(false); }} 
                        color="blue"
                      />
                      <SettingsItem 
                        icon={Key} 
                        label="Đổi mật khẩu" 
                        onClick={() => { setIsModalOpen(true); setShowSettings(false); }} 
                        color="orange"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
                className="bg-white p-5 rounded-[2rem] border border-black/5 shadow-sm text-center"
              >
                <div className="text-[10px] font-black uppercase opacity-30 mb-1">KPI Tháng</div>
                <div className="text-xl font-black text-kraft-ink">{salaryDetails.soldCars.length}/{user.target || 0} xe</div>
                <div className="mt-2 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-kraft-accent" style={{ width: `${Math.min(salaryDetails.completionRate, 100)}%` }} />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.25 }}
                className="bg-white p-5 rounded-[2rem] border border-black/5 shadow-sm text-center flex flex-col justify-center"
              >
                <div className="text-[10px] font-black uppercase opacity-30 mb-1">Tỉ lệ hoàn thành</div>
                <div className="text-xl font-black text-emerald-600">{Math.round(salaryDetails.completionRate)}%</div>
              </motion.div>
            </div>

            {/* Unified Expenses Section */}
            <div className="pt-2">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
                className="flex items-center justify-between mb-4 px-2"
              >
                 <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-kraft-accent" />
                    <SecondaryLabel className="!mb-0 uppercase tracking-widest text-[10px] font-black">Chi phí & Hoàn ứng</SecondaryLabel>
                 </div>
                 <motion.button 
                   whileTap={{ scale: 0.95 }}
                   onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }}
                   className="text-[10px] font-black uppercase tracking-widest text-kraft-accent px-3 py-1 bg-kraft-accent/10 rounded-lg"
                 >
                   + Ghi thêm
                 </motion.button>
              </motion.div>
              <UnifiedExpenseList 
                expenses={staffData?.expenses || []} 
                selectedMonth={selectedMonth}
                onEdit={(exp) => { setEditingExpense(exp); setIsExpenseModalOpen(true); }} 
                onDelete={handleDeleteExpense}
              />
            </div>
          </div>

          {/* Salary Statement Section */}
          <div className="mt-8 px-4 pb-32 space-y-6">
            <section>
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.35 }}
                className="flex items-center gap-2 mb-4"
              >
                <ReceiptText size={18} className="text-kraft-accent" />
                <SecondaryLabel className="!mb-0 uppercase tracking-widest text-[10px] font-black">Bảng kê chi tiết lương</SecondaryLabel>
              </motion.div>
              <SalaryStatement salaryDetails={salaryDetails as any} />
            </section>
          </div>
        </div>

        {/* LỚP PHỦ KÍNH THỞ (Liquid Flow Glass Overlay) */}
        {isSubsequentLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/5 backdrop-blur-[6px] border border-white/10 rounded-[2.5rem] flex items-center justify-center z-50 pointer-events-none"
            style={{
              animation: 'breathe-glow 3s ease-in-out infinite'
            }}
          >
            {/* Volumetric Mesh Gradient */}
            <div className="absolute inset-0 -z-10 opacity-30 mix-blend-color-dodge pointer-events-none overflow-hidden rounded-[2.5rem]">
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-10 bg-[radial-gradient(circle_at_30%_30%,#00f2fe_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#4facfe_0%,transparent_50%)] blur-[40px]"
              />
            </div>
            
            <div className="w-2.5 h-2.5 rounded-full bg-kraft-accent shadow-neon-glow" />
          </motion.div>
        )}
      </div>

      {/* Modals (Standardized) */}
      <PasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} value={newPassword} onChange={setNewPassword} onSubmit={handleChangePassword} />
      <ProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} data={editFormData} onChange={(data) => setEditFormData({ ...editFormData, ...data })} onSubmit={handleUpdateProfile} />

      <AnimatePresence>
        {isVehicleDetailOpen && selectedVehicle && (
          <VehicleDetailModal 
            isOpen={isVehicleDetailOpen}
            vehicle={selectedVehicle}
            onClose={() => setIsVehicleDetailOpen(false)}
            onUpdateStatus={(id, nextStatus, extra) => handleUpdateStatus(id, nextStatus, extra || {})}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateVehicle={(id, data) => handleUpdateVehicle(id, data as any)}
            onAddCost={handleAddCost}
            onDeleteCost={handleDeleteCost}
            onPin={handlePin}
            onAddPurchasePayment={handleAddPurchasePayment}
            onAddSalePayment={(...args) => handleAddSalePayment(args[0], args[1], args[2], args[3], args[4] as any, args[5], args[6] || '', args[7] || 0, args[8], args[9])}
            onCancelSale={handleCancelSale}
            staffList={staffList}
            userRole={user.role}
            userCode={user.code}
          />
        )}
      </AnimatePresence>

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
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 hover:bg-black/5 transition-colors active:bg-black/10"
  >
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        color === 'blue' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
      )}>
        <Icon size={20} />
      </div>
      <span className="font-bold text-sm text-kraft-ink">{label}</span>
    </div>
    <div className="text-kraft-ink/20 font-black">→</div>
  </motion.button>
);

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
}

const PasswordModal = ({ isOpen, onClose, value, onChange, onSubmit }: PasswordModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu">
    <ModalBody>
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase opacity-40 px-2">Mật khẩu mới</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="liquid-input h-14 bg-black/5 border-none rounded-2xl px-5 font-black w-full" placeholder="Mật khẩu mới..." />
      </div>
    </ModalBody>
    <ModalFooter onCancel={onClose} onSubmit={onSubmit} submitLabel="Lưu" />
  </Modal>
);

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { name: string; phone: string; department?: string };
  onChange: (data: { name: string; phone: string; department?: string }) => void;
  onSubmit: () => void;
}

const ProfileModal = ({ isOpen, onClose, data, onChange, onSubmit }: ProfileModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa hồ sơ">
    <ModalBody>
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase opacity-40 px-2">Họ và tên</label>
          <input type="text" value={data.name} onChange={(e) => onChange({...data, name: e.target.value})} className="liquid-input h-14 bg-black/5 border-none rounded-2xl px-5 font-black w-full" />
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase opacity-40 px-2">Số điện thoại</label>
          <input type="text" value={data.phone} onChange={(e) => onChange({...data, phone: e.target.value})} className="liquid-input h-14 bg-black/5 border-none rounded-2xl px-5 font-black w-full" />
        </div>
      </div>
    </ModalBody>
    <ModalFooter onCancel={onClose} onSubmit={onSubmit} submitLabel="Lưu" />
  </Modal>
);

const SalaryStatement = ({ salaryDetails }: { salaryDetails: StaffSalaryDetails }) => {
  const items: any[] = [];

  // 1. Xe bán (Hoa hồng bán xe)
  salaryDetails.soldCars.forEach((c: any) => {
    const amount = c.commission * (salaryDetails.kpiBonusMultiplier || 1);
    if (amount > 0) {
      items.push({
        id: `sale-${c.id}`,
        title: c.name,
        subtitle: `Bán: ${c.code}`,
        amount: amount,
        icon: ArrowUpRight,
        color: 'blue'
      });
    }
  });

  // 2. Xe mua (Hoa hồng nhập xe & Thưởng thêm nếu có)
  salaryDetails.boughtCars.forEach((c: any) => {
    if (c.buying_commission > 0) {
      items.push({
        id: `buy-${c.id}`,
        title: c.name,
        subtitle: `Mua: ${c.code}`,
        amount: c.buying_commission,
        icon: ShoppingBag,
        color: 'amber'
      });
    }
    
    if (c.buying_bonus > 0) {
      items.push({
        id: `buy-bonus-${c.id}`,
        title: c.name,
        subtitle: `Thưởng mua: ${c.code}`,
        amount: c.buying_bonus,
        icon: Award,
        color: 'orange'
      });
    }
  });

  // 3. Góp vốn (Chia sẻ lợi nhuận góp vốn)
  salaryDetails.coinvestedCars.forEach((c: any) => {
    const financials = calculateVehicleFinancials(c);
    const amount = c.partner_profit_shared ? 0 : financials.partnerProfitShare;
    if (amount > 0) {
      items.push({
        id: `coinvest-${c.id}`,
        title: c.name,
        subtitle: `Góp vốn: ${c.code}`,
        amount: amount,
        icon: Share2,
        color: 'indigo'
      });
    }
  });

  if (items.length === 0) {
    return (
      <div className="glass-purity p-8 rounded-[2rem] text-center border border-black/5">
        <div className="text-[10px] font-black uppercase opacity-20 tracking-widest">Chưa có giao dịch phát sinh hoa hồng</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
      <div className="divide-y divide-black/5">
        {items.map((item, index) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            layout
            className="flex items-center justify-between p-5 active:bg-black/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                item.color === 'blue' ? "bg-blue-50 text-blue-600" : 
                item.color === 'amber' ? "bg-amber-50 text-amber-600" : 
                item.color === 'orange' ? "bg-orange-50 text-orange-600" : 
                "bg-indigo-50 text-indigo-600"
              )}>
                <item.icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-kraft-ink leading-none mb-1 truncate">{item.title}</div>
                <div className="text-[10px] font-bold opacity-30 uppercase">{item.subtitle}</div>
              </div>
            </div>
            <div className="text-sm font-black text-emerald-600">+{formatCurrency(item.amount)}</div>
          </motion.div>
        ))}
        <div className="p-5 bg-black/5 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase opacity-40">Tổng hoa hồng thực nhận</div>
          <div className="text-base font-black text-emerald-600">{formatCurrency(salaryDetails.totalCommission)}</div>
        </div>
      </div>
    </div>
  );
};

const UnifiedExpenseList = ({ expenses, selectedMonth, onEdit, onDelete }: { 
  expenses: any[], 
  selectedMonth: string,
  onEdit: (exp: any) => void,
  onDelete: (id: string) => void
}) => {
  const pending = expenses.filter(e => !e.is_reimbursed).sort((a, b) => b.date.localeCompare(a.date));
  const reimbursed = expenses.filter(e => e.is_reimbursed && e.date.startsWith(selectedMonth)).sort((a, b) => b.date.localeCompare(a.date));

  if (expenses.length === 0) {
    return (
      <div className="glass-purity p-8 rounded-[2rem] text-center border border-black/5 mx-2">
        <div className="text-[10px] font-black uppercase opacity-20 tracking-widest">Chưa có khoản chi phí nào</div>
      </div>
    );
  }

  const renderCard = (exp: any, index: number) => (
    <motion.div 
      key={exp.id} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      layout
      className="group relative bg-white py-3 px-5 rounded-[2rem] border border-black/5 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            exp.type === 'vehicle' ? "bg-blue-50 text-blue-500" : "bg-kraft-accent/10 text-kraft-accent"
          )}>
            {exp.type === 'vehicle' ? <Car size={18} /> : <Settings size={18} />}
          </div>
          <div>
            <div className="text-sm font-black text-kraft-ink leading-none mb-1">{exp.note}</div>
            <div className="text-[10px] font-bold opacity-30 uppercase">
              {formatDate(exp.date)} {exp.vehicle_code ? `• #${exp.vehicle_code}` : ''}
            </div>
          </div>
        </div>
        <div className="text-sm font-black text-kraft-ink">{formatCurrency(exp.amount)}</div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest",
          exp.is_reimbursed ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
        )}>
          {exp.is_reimbursed ? <CheckCircle size={10} /> : <Clock size={10} />}
          {exp.is_reimbursed ? 'Đã hoàn ứng' : 'Chờ chi'}
        </div>

        <div className="flex items-center gap-1">
          {!exp.is_reimbursed && (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onEdit(exp); }}
              className="w-9 h-9 flex items-center justify-center text-kraft-ink/20 hover:text-kraft-accent transition-colors"
            >
              <Edit2 size={14} />
            </motion.button>
          )}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { 
              e.stopPropagation(); 
              if (confirm('Xóa khoản chi này?')) onDelete(exp.id); 
            }}
            className="w-9 h-9 flex items-center justify-center text-kraft-ink/20 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 px-2">
      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Clock size={12} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Chờ hoàn tiền</span>
            <div className="h-px flex-1 bg-amber-500/10 ml-2" />
          </div>
          {pending.map((exp, i) => renderCard(exp, i))}
        </div>
      )}

      {reimbursed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <CheckCircle size={12} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Đã chi tháng {selectedMonth.split('-')[1]}</span>
            <div className="h-px flex-1 bg-emerald-500/10 ml-2" />
          </div>
          {reimbursed.map((exp, i) => renderCard(exp, i))}
        </div>
      )}
    </div>
  );
};
