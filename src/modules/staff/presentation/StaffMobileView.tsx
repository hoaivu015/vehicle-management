import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Users, Calendar } from 'lucide-react';
import { Skeleton } from '@/src/shared/design-system/Skeleton';
import { cn } from '@/src/shared/utils/cn';

import { useStaffState } from './useStaffState';
import { StaffList } from './components/StaffList';
import { StaffAddModal } from './components/StaffAddModal';
import { StaffDetailModal } from './components/StaffDetailModal';
import { ConfirmModal } from '@/src/shared/design-system/ConfirmModal';
import { PERMISSIONS } from '@/src/constants';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';

import { StaffSalaryPaymentModal } from './components/StaffSalaryPaymentModal';

const StaffMobileSkeleton = () => (
  <NativePage className="bg-white px-4 py-6 space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="text" width={80} height={10} className="animate-pulse bg-black/5" />
        <Skeleton variant="text" width={80} height={28} className="animate-pulse bg-black/5" />
      </div>
      <Skeleton variant="rectangle" width={44} height={44} className="rounded-2xl animate-pulse bg-black/5" />
    </div>
    {/* Month picker skeleton */}
    <Skeleton variant="rectangle" width={160} height={48} className="rounded-full animate-pulse bg-black/5" />
    {/* Staff card skeletons */}
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white border border-black/5 rounded-[2rem] p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" width={48} height={48} className="rounded-full animate-pulse bg-black/5" />
            <div className="flex-1 space-y-1.5">
              <Skeleton variant="text" width="60%" height={16} className="animate-pulse bg-black/5" />
              <Skeleton variant="text" width="40%" height={10} className="animate-pulse bg-black/5" />
            </div>
            <Skeleton variant="rectangle" width={70} height={28} className="rounded-xl animate-pulse bg-black/5" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-black/5">
            <Skeleton variant="text" width={80} height={10} className="animate-pulse bg-black/5" />
            <Skeleton variant="text" width={100} height={16} className="animate-pulse bg-black/5" />
          </div>
        </div>
      ))}
    </div>
  </NativePage>
);

interface StaffMobileViewProps {
  userRole: string;
  hasPermission: (permission: string) => boolean;
}

/**
 * 🍎 iPhone Native Staff View.
 */
export const StaffMobileView: React.FC<StaffMobileViewProps> = ({ userRole, hasPermission }) => {
  const {
    filterMonth, setFilterMonth,
    staffList,
    loading,
    error,
    isAddOpen, setIsAddOpen,
    editingStaff, setEditingStaff,
    deletingStaff, setDeletingStaff,
    selectedStaff, setSelectedStaff,
    isSubmitting,
    presenter,
    handleAddStaff,
    handleUpdateStaff,
    handleDelete,
    handleTogglePayment,
    handleReimburseMultiple,
    handleUpdateVehicle,
    handleAddExpense,
    handleToggleReimbursement,
    handleDeleteExpense,
    handleUpdateExpense,
    vehicles
  } = useStaffState(new Date().toISOString().slice(0, 7), userRole);

  const [payingStaff, setPayingStaff] = React.useState<import('@/src/modules/staff/application/GetStaffList').StaffWithSalary | null>(null);

  const hasEditPermission = hasPermission(PERMISSIONS.EDIT_STAFF);

  const handlePaymentClick = async (staff: import('@/src/modules/staff/application/GetStaffList').StaffWithSalary) => {
    if (staff.salaryDetails.isPaid) {
      await handleTogglePayment(staff);
    } else {
      setPayingStaff(staff);
    }
  };

  const isInitialLoading = loading && !staffList.length;
  const isSubsequentLoading = loading && !!staffList.length;

  if (isInitialLoading) return <StaffMobileSkeleton />;

  return (
    <NativePage className="bg-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <NativeHeader>
        <div className="flex items-center justify-between">
          <div>
            <SecondaryLabel>Đội ngũ của bạn</SecondaryLabel>
            <LargeTitle>Nhân sự</LargeTitle>
          </div>
          {hasEditPermission ? (
            <button 
              onClick={() => setIsAddOpen(true)}
              className="w-touch h-touch rounded-2xl bg-kraft-accent text-white shadow-kraft flex items-center justify-center native-interactive"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          ) : (
            <div className="w-touch h-touch rounded-2xl bg-kraft-folder flex items-center justify-center text-kraft-accent border border-hairline-soft">
              <Users size={24} />
            </div>
          )}
        </div>

        {/* Month Picker - Native Style */}
        <div className="mt-g3 relative inline-flex items-center gap-3 px-6 h-12 rounded-full border border-white/40 bg-white/70 backdrop-blur-md shadow-neural-t2 active:scale-95 transition-transform w-fit overflow-hidden">
          <Calendar size={16} className="text-kraft-accent shrink-0" />
          <span className="font-black uppercase text-[11px] tracking-widest text-kraft-ink pointer-events-none">
            {filterMonth ? `THÁNG ${filterMonth.split('-')[1]}/${filterMonth.split('-')[0]}` : 'CHỌN THÁNG'}
          </span>
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </NativeHeader>

      <div className="relative mt-2">
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
          <StaffList 
            loading={loading}
            staffList={staffList}
            error={error}
            onRefresh={() => presenter.loadStaff(filterMonth)}
            onEdit={(staff) => setEditingStaff(staff)}
            onDelete={(staff) => setDeletingStaff(staff)}
            onViewDetail={(staff) => setSelectedStaff(staff)}
            onTogglePayment={handlePaymentClick}
            isSubmitting={isSubmitting}
            hasEditPermission={hasEditPermission}
            setIsAddOpen={setIsAddOpen}
          />
        </div>

        {/* LỚP PHỦ KÍNH THỞ (Liquid Flow Glass Overlay) */}
        {isSubsequentLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/5 backdrop-blur-[6px] border border-white/10 rounded-[2.5rem] flex items-center justify-center z-50 pointer-events-none"
            style={{ animation: 'breathe-glow 3s ease-in-out infinite' }}
          >
            <div className="absolute inset-0 -z-10 opacity-30 mix-blend-color-dodge pointer-events-none overflow-hidden rounded-[2.5rem]">
              <motion.div
                animate={{ scale: [1, 1.12, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-10 bg-[radial-gradient(circle_at_30%_30%,#00f2fe_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#4facfe_0%,transparent_50%)] blur-[40px]"
              />
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-kraft-accent shadow-neon-glow" />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {(isAddOpen || editingStaff) && (
          <StaffAddModal
            isOpen={isAddOpen || !!editingStaff}
            member={editingStaff ?? undefined}
            onClose={() => {
              setIsAddOpen(false);
              setEditingStaff(null);
            }}
            onAdd={(data) => editingStaff
              ? handleUpdateStaff({ ...data, id: editingStaff.id })
              : handleAddStaff(data)
            }
          />
        )}
        {selectedStaff && (
          <StaffDetailModal
            member={selectedStaff}
            isOpen={!!selectedStaff}
            onClose={() => setSelectedStaff(null)}
            filterMonth={filterMonth}
            onAddExpense={handleAddExpense}
            onToggleReimbursement={handleToggleReimbursement}
            onDeleteExpense={handleDeleteExpense}
            onUpdateExpense={handleUpdateExpense}
            onReimburseMultiple={handleReimburseMultiple}
            onUpdateVehicle={handleUpdateVehicle}
            userRole={userRole}
            vehicles={vehicles}
          />
        )}
        {payingStaff && (
          <StaffSalaryPaymentModal
            isOpen={!!payingStaff}
            onClose={() => setPayingStaff(null)}
            staff={payingStaff}
            month={filterMonth}
            isLoading={isSubmitting}
            onConfirm={(date) => handleTogglePayment(payingStaff, date)}
          />
        )}
        {deletingStaff && (
          <ConfirmModal
            isOpen={!!deletingStaff}
            onClose={() => setDeletingStaff(null)}
            onConfirm={handleDelete}
            isLoading={isSubmitting}
            title="Xác nhận xóa?"
            message={`Bạn có chắc chắn muốn xóa nhân viên ${deletingStaff.name}? Dữ liệu này sẽ không thể khôi phục.`}
          />
        )}
      </AnimatePresence>
    </NativePage>
  );
};

