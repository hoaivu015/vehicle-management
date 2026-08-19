import React, { Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import { Plus, Users, Calendar } from 'lucide-react';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

import { useStaffState, StaffState } from './useStaffState';
import { StaffList } from './components/StaffList';
import { PERMISSIONS } from '@/src/constants';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';

const StaffAddModal = React.lazy(() => import('./components/StaffAddModal').then(m => ({ default: m.StaffAddModal })));
const StaffDetailModal = React.lazy(() => import('./components/StaffDetailModal').then(m => ({ default: m.StaffDetailModal })));
const StaffSalaryPaymentModal = React.lazy(() => import('./components/StaffSalaryPaymentModal').then(m => ({ default: m.StaffSalaryPaymentModal })));
const ConfirmModal = React.lazy(() => import('@/src/shared/design-system/ConfirmModal').then(m => ({ default: m.ConfirmModal })));

const StaffMobileSkeleton = () => (
  <NativePage className="bg-white px-4 py-6 space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="text" width={100} height={10} className="animate-pulse bg-black/5" />
        <Skeleton variant="text" width={80} height={28} className="animate-pulse bg-black/5" />
      </div>
      <Skeleton variant="circle" width={48} height={48} className="rounded-full animate-pulse bg-black/5" />
    </div>
    {/* Month selector skeleton */}
    <Skeleton variant="rectangle" width={140} height={48} className="rounded-full animate-pulse bg-black/8" />
    {/* Staff card skeletons */}
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-[2rem] border border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" width={48} height={48} className="rounded-full animate-pulse bg-black/5" />
            <div className="space-y-2">
              <Skeleton variant="text" width={120} height={14} className="animate-pulse bg-black/5" />
              <Skeleton variant="text" width={80} height={10} className="animate-pulse bg-black/5" />
            </div>
          </div>
          <Skeleton variant="text" width={60} height={18} className="animate-pulse bg-black/5" />
        </div>
      ))}
    </div>
  </NativePage>
);

interface StaffMobileViewProps {
  userRole: string;
  hasPermission: (permission: string) => boolean;
  state?: StaffState;
}

/**
 * 🍎 iPhone Native Staff View.
 * Implements high-end native feel with safe areas and premium interactions.
 */
export const StaffMobileView: React.FC<StaffMobileViewProps> = ({ userRole, hasPermission, state: propState }) => {
  const internalState = useStaffState(new Date().toISOString().slice(0, 7), userRole);
  const state = propState || internalState;
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
  } = state;

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
        <div className="transition-all duration-500">
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
      </div>

      <AnimatePresence>
        {(isAddOpen || editingStaff) && (
          <Suspense fallback={null}>
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
          </Suspense>
        )}
        {selectedStaff && (
          <Suspense fallback={null}>
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
          </Suspense>
        )}
        {payingStaff && (
          <Suspense fallback={null}>
            <StaffSalaryPaymentModal
              isOpen={!!payingStaff}
              onClose={() => setPayingStaff(null)}
              staff={payingStaff}
              month={filterMonth}
              isLoading={isSubmitting}
              onConfirm={(date) => handleTogglePayment(payingStaff, date)}
            />
          </Suspense>
        )}
        {deletingStaff && (
          <Suspense fallback={null}>
            <ConfirmModal
              isOpen={!!deletingStaff}
              onClose={() => setDeletingStaff(null)}
              onConfirm={handleDelete}
              isLoading={isSubmitting}
              title="Xác nhận xóa?"
              message={`Bạn có chắc chắn muốn xóa nhân viên ${deletingStaff.name}? Dữ liệu này sẽ không thể khôi phục.`}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </NativePage>
  );
};

