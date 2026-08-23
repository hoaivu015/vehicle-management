import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { User, Calendar } from 'lucide-react';
import { StaffSalaryService } from '@/src/modules/staff/domain/StaffSalaryService';
import { UserRole, VehicleStatus } from '@/src/shared/domain/constants';
import { PersonalState } from '@/src/modules/personal/presentation/usePersonalState';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { UpdateVehicleInput } from '@/src/modules/inventory/domain/VehicleSchema';
import { PageShell, PageHeaderShell } from '@/src/shared/design-system/PageShell';
import { PersonalMetricRibbon } from './components/PersonalMetricRibbon';
import { PersonalSidebar } from './components/PersonalSidebar';
import { SalaryBreakdownCard } from './components/SalaryBreakdownCard';
import { PersonalAdvancesCard } from './components/PersonalAdvancesCard';
import { PersonalVehiclesSection } from './components/PersonalVehiclesSection';
import { motion, AnimatePresence } from 'motion/react';
import { Staff, Vehicle } from '@/src/shared/domain/types';
import { cn } from '@/src/shared/utils/cn';
import { PersonalSkeleton } from './components/PersonalSkeleton';

// Lazy-load modals for desktop performance
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

interface PersonalWebViewProps {
  user: Staff | null;
  onUpdateUser?: (email: string, data: Partial<Staff> & { password?: string }) => void;
  onLogout?: () => void;
  state: PersonalState;
}

export const PersonalWebView: React.FC<PersonalWebViewProps> = ({ 
  user, 
  onUpdateUser, 
  onLogout, 
  state 
}) => {
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
    loading,
    isSubmitting
  } = state;

  const { staffRepo } = useDependencies();
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    staffRepo.getAll().then(list => {
      setStaffList(list.filter(s => s.role !== UserRole.ADMIN));
    });
  }, [staffRepo]);

  const isInitialLoading = loading && !staffData;
  const isSubsequentLoading = loading && !!staffData;

  // Lấy toàn bộ xe người này đang góp vốn (cả đang trong kho lẫn đã bán)
  const userCode = user?.code || '';
  const allMyCoinvestedCars = useMemo(() => {
    if (!userCode) return [];
    return allVehicles.filter((v: Vehicle) => 
      v.is_coinvested && 
      (v.coinvestor_code || '').trim().toLowerCase() === userCode.trim().toLowerCase()
    );
  }, [allVehicles, userCode]);

  const totalHeldCapital = useMemo(() => {
    return allMyCoinvestedCars
      .filter((v: Vehicle) => !v.partner_capital_repaid)
      .reduce((sum: number, v: Vehicle) => sum + (v.coinvest_amount || 0), 0);
  }, [allMyCoinvestedCars]);

  if (isInitialLoading) {
    return <PersonalSkeleton />;
  }

  if (!user) return null;

  const salaryDetails = staffData?.salaryDetails || StaffSalaryService.calculateMonthlySalary(user, allVehicles, selectedMonth);
  const { soldCars, boughtCars } = salaryDetails;

  const unreimbursedAmount = (staffData?.expenses || [])
    .filter(e => !e.is_reimbursed && !StaffSalaryService.isSalaryAdvance(e))
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <PageShell scrollable maxWidth="max-w-[1700px]" animate={true} className="slide-in-from-bottom-4">
      {/* Header */}
      <PageHeaderShell>
        <div className="text-left w-full sm:w-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-kraft-ink uppercase flex items-center gap-4 justify-start font-heading">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-t2 bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20 shrink-0">
              <User size={28} strokeWidth={2.5} />
            </div>
            Cá nhân
          </h2>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-sub-label opacity-50 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-kraft-accent animate-pulse" />
            Hiệu suất và thu nhập • Auto 28
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md rounded-full px-5 py-3 border border-hairline-soft shadow-sm w-full sm:w-auto min-w-[200px]">
          <Calendar size={16} className="text-kraft-accent shrink-0" />
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            className="text-xs font-black outline-none bg-transparent text-kraft-ink uppercase tracking-wider w-full cursor-pointer" 
          />
        </div>
      </PageHeaderShell>

      <div className="relative space-y-8 md:space-y-10">
        <div className={cn(
          "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] space-y-8 md:space-y-10",
          isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none"
        )}>
          {/* 1. Hero KPI Metric Ribbon */}
          <PersonalMetricRibbon
            netSalary={salaryDetails.netSalary}
            isPaid={salaryDetails.isPaid}
            totalCommission={salaryDetails.totalCommission}
            soldCarsCount={salaryDetails.soldCount}
            targetCount={user.target || 0}
            completionRate={salaryDetails.completionRate}
            unreimbursedAmount={unreimbursedAmount}
            selectedMonth={selectedMonth}
          />

          {/* 2. Main Workspace Split Layout (12 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
            {/* Left: Personal Profile & Actions (4 cols) */}
            <div className="xl:col-span-4 h-full">
              <PersonalSidebar 
                user={user} 
                onLogout={onLogout} 
                setIsEditModalOpen={setIsEditModalOpen} 
                setIsModalOpen={setIsModalOpen} 
                onUpdateUser={onUpdateUser} 
              />
            </div>

            {/* Right: Salary Breakdown & Advances (8 cols) */}
            <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              <SalaryBreakdownCard 
                salaryDetails={salaryDetails} 
                selectedMonth={selectedMonth} 
                totalHeldCapital={totalHeldCapital}
              />
              <PersonalAdvancesCard 
                expenses={staffData?.expenses || []} 
                selectedMonth={selectedMonth}
                onAddClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} 
                onEditClick={(e) => { setEditingExpense(e); setIsExpenseModalOpen(true); }} 
                onDeleteClick={handleDeleteExpense} 
              />
            </div>
          </div>

          {/* 3. Detailed Transaction Ledger (Full Width) */}
          <PersonalVehiclesSection 
            soldCars={soldCars} 
            boughtCars={boughtCars} 
            coinvestedCars={allMyCoinvestedCars} 
            selectedMonth={selectedMonth} 
            user={user}
            onSelectVehicle={(v) => {
              setSelectedVehicle(v);
              setIsVehicleDetailOpen(true);
            }}
          />
        </div>

        {/* Liquid Flow Glass Overlay during month switch */}
        {isSubsequentLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/10 backdrop-blur-[4px] border border-white/20 rounded-t2 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="w-3 h-3 rounded-full bg-kraft-accent animate-ping" />
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {isExpenseModalOpen && (
            <StaffAddExpenseModal 
              isOpen={isExpenseModalOpen} 
              onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }} 
              staffName={user.name} 
              expense={editingExpense || undefined} 
              onAdd={(data) => editingExpense 
                ? handleUpdateExpense(String(editingExpense.id), { ...data, id: String(editingExpense.id) }) 
                : handleAddStaffExpense(data)
              } 
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
      </Suspense>
    </PageShell>
  );
};
