import React from 'react';
import { AnimatePresence } from 'motion/react';

import { useStaffState } from './useStaffState';
import { StaffHeader } from './components/StaffHeader';
import { StaffList } from './components/StaffList';
import { PageShell } from '@/src/shared/design-system/PageShell';
import { cn } from '@/src/shared/utils/cn';
import { motion } from 'motion/react';
import { StaffSkeleton } from '@/src/modules/staff/presentation/components/StaffSkeleton';
import { StaffAddModal } from './components/StaffAddModal';
import { StaffDetailModal } from './components/StaffDetailModal';
import { ConfirmModal } from '@/src/shared/design-system/ConfirmModal';
import { PERMISSIONS } from '@/src/constants';

interface StaffWebViewProps {
  userRole: string;
  hasPermission: (permission: string) => boolean;
}

import { StaffWithSalary } from '../application/GetStaffList';
import { StaffSalaryPaymentModal } from './components/StaffSalaryPaymentModal';

/**
 * Staff WebView - Optimized for Desktop.
 */
export const StaffWebView: React.FC<StaffWebViewProps> = ({ userRole, hasPermission }) => {
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

  const [payingStaff, setPayingStaff] = React.useState<StaffWithSalary | null>(null);

  const hasEditPermission = hasPermission(PERMISSIONS.EDIT_STAFF);

  const handlePaymentClick = async (staff: import('@/src/modules/staff/application/GetStaffList').StaffWithSalary) => {
    if (staff.salaryDetails.isPaid) {
      await handleTogglePayment(staff); // Cancel payment is immediate
    } else {
      setPayingStaff(staff); // Show modal for payment
    }
  };

  const isInitialLoading = loading && staffList.length === 0;
  const isSubsequentLoading = loading && staffList.length > 0;

  if (isInitialLoading) {
    return <StaffSkeleton />;
  }

  return (
    <PageShell animate={true} className="slide-in-from-bottom-4">
      <StaffHeader 
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        setIsAddOpen={setIsAddOpen}
        hasEditPermission={hasEditPermission}
      />

      <div className="relative flex-1 overflow-hidden">
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] h-full w-full", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
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
    </PageShell>
  );
};

