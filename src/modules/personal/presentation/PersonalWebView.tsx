import { useState, useEffect } from 'react';
import { User, Calendar } from 'lucide-react';
import { calculateStaffSalaryDetails } from '@/src/shared/utils/finance';
import { UserRole } from '@/src/shared/domain/constants';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { StaffAddExpenseModal } from '@/src/modules/staff/presentation/components/StaffAddExpenseModal';
import { VehicleDetailModal } from '@/src/modules/inventory/presentation/components/VehicleDetailModal';
import { usePersonalState } from '@/src/modules/personal/presentation/usePersonalState';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';

import { PersonalSidebar } from './components/PersonalSidebar';
import { SalaryBreakdownCard } from './components/SalaryBreakdownCard';
import { PersonalAdvancesCard } from './components/PersonalAdvancesCard';
import { PersonalVehiclesSection } from './components/PersonalVehiclesSection';
import { motion, AnimatePresence } from 'motion/react';
import { Staff } from '@/src/shared/domain/types';
import { cn } from '@/src/shared/utils/cn';
import { PersonalSkeleton } from './components/PersonalSkeleton';

interface PersonalWebViewProps {
  user: Staff | null;
  onUpdateUser?: (docId: string, data: Partial<Staff>) => void;
  onLogout?: () => void;
}

export const PersonalWebView = ({ user, onUpdateUser, onLogout }: PersonalWebViewProps) => {
  const {
    allVehicles, selectedMonth, setSelectedMonth, staffData, 
    isExpenseModalOpen, setIsExpenseModalOpen,
    editingExpense, setEditingExpense,
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
    loading
  } = usePersonalState(user as Staff, onUpdateUser);

  const { staffRepo } = useDependencies();
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    staffRepo.getAll().then(list => {
      setStaffList(list.filter(s => s.role !== UserRole.ADMIN));
    });
  }, [staffRepo]);

  const isInitialLoading = loading && !staffData;
  const isSubsequentLoading = loading && !!staffData;

  if (isInitialLoading) {
    return <PersonalSkeleton />;
  }

  if (!user) return null;

  const salaryDetails = staffData?.salaryDetails || calculateStaffSalaryDetails(user, allVehicles, selectedMonth);
  const { soldCars, boughtCars, coinvestedCars } = salaryDetails;

  return (
    <div className="h-full space-y-8 md:space-y-14 overflow-y-auto px-4 md:px-12 py-6 md:py-12 custom-scrollbar pb-32 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-8 md:pb-10">
        <div className="text-left w-full">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-4 sm:gap-6 justify-start font-heading">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-t2 bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20 shrink-0">
              <User size={28} className="sm:w-10 sm:h-10" strokeWidth={2.5} />
            </div>
            Cá nhân
          </h2>
          <p className="text-[10px] sm:text-sub-label !opacity-30 mt-3 flex items-center gap-2 sm:gap-3 justify-start tracking-widest uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-kraft-accent animate-pulse" />
            Hiệu suất và thu nhập
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md rounded-t2 px-6 py-4 border border-white/60 shadow-xl h-14 md:h-16 w-full sm:w-auto min-w-[220px]">
          <Calendar size={18} className="text-kraft-accent" />
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="text-[11px] font-black outline-none bg-transparent text-kraft-ink uppercase tracking-widest w-full cursor-pointer" />
        </div>
      </header>

      <div className="relative">
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <PersonalSidebar user={user} onLogout={onLogout} setIsEditModalOpen={setIsEditModalOpen} setIsModalOpen={setIsModalOpen} onUpdateUser={onUpdateUser} />
            <div className="lg:col-span-3 space-y-12">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <SalaryBreakdownCard salaryDetails={salaryDetails} selectedMonth={selectedMonth} />
                <PersonalAdvancesCard 
                  expenses={staffData?.expenses || []} 
                  selectedMonth={selectedMonth}
                  onAddClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} 
                  onEditClick={(e) => { setEditingExpense(e); setIsExpenseModalOpen(true); }} 
                  onDeleteClick={handleDeleteExpense} 
                />
              </div>
            </div>
          </div>

          <PersonalVehiclesSection 
            soldCars={soldCars} 
            boughtCars={boughtCars} 
            coinvestedCars={coinvestedCars} 
            selectedMonth={selectedMonth} 
            user={user}
            onSelectVehicle={(v) => {
              setSelectedVehicle(v);
              setIsVehicleDetailOpen(true);
            }}
          />
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

      {/* Modals */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <StaffAddExpenseModal 
            isOpen={isExpenseModalOpen} 
            onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }} 
            staffName={user.name} 
            expense={editingExpense as import('@/src/shared/domain/types').StaffExpense | undefined} 
            onAdd={(data) => editingExpense ? handleUpdateExpense(String(editingExpense.id), { ...data, id: String(editingExpense.id) }) : handleAddStaffExpense(data)} 
            onDelete={(id) => handleDeleteExpense(String(id))}
            vehicles={allVehicles}
          />
        )}
      </AnimatePresence>

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
            onAddSalePayment={(...args) => handleAddSalePayment(args[0], args[1], args[2], args[3], args[4] as any, args[5], args[6], args[7], args[8], args[9])}
            onCancelSale={handleCancelSale}
            staffList={staffList}
            userRole={user.role}
            userCode={user.code}
          />
        )}
      </AnimatePresence>

      <PasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} value={newPassword} onChange={setNewPassword} onSubmit={handleChangePassword} />
      <ProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} data={editFormData} onChange={(data) => setEditFormData({ ...editFormData, ...data })} onSubmit={handleUpdateProfile} />
    </div>
  );
};

// --- Sub-components (Copied for preservation) ---
interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
}

const PasswordModal = ({ isOpen, onClose, value, onChange, onSubmit }: PasswordModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu" maxWidth="sm">
    <ModalBody>
      <div className="space-y-2">
        <label className="text-sub-label ml-1">Mật khẩu mới</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="liquid-input h-14 px-6 text-sm w-full" placeholder="Mật khẩu mới..." />
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
  <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa hồ sơ" maxWidth="md">
    <ModalBody>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-sub-label ml-1">Họ và tên</label>
          <input type="text" value={data.name} onChange={(e) => onChange({...data, name: e.target.value})} className="liquid-input h-14 px-6 text-sm w-full font-black tracking-tight" />
        </div>
        <div className="space-y-3">
          <label className="text-sub-label ml-1">Số điện thoại</label>
          <input type="text" value={data.phone} onChange={(e) => onChange({...data, phone: e.target.value})} className="liquid-input h-14 px-6 text-sm w-full font-black tracking-tight" />
        </div>
      </div>
    </ModalBody>
    <ModalFooter onCancel={onClose} onSubmit={onSubmit} submitLabel="Lưu" />
  </Modal>
);
