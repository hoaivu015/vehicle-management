import React, { Suspense } from 'react';
import { CircleDollarSign, Plus, Wallet, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/src/shared/utils/currency';
import { cn } from '@/src/shared/utils/cn';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { FinancePresenter } from './FinancePresenter';

import { MonthlyFinanceData } from '../application/GetMonthlyFinance';
import { PERMISSIONS } from '@/src/constants';
import { useCashflowState, CashflowState } from './useCashflowState';
import { PageShell, PageHeaderShell } from '@/src/shared/design-system/PageShell';
import { CashflowSkeleton } from '@/src/modules/finance/presentation/components/CashflowSkeleton';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { ReceivableDebtsList } from './components/ReceivableDebtsList';
import { PayableDebtsList } from './components/PayableDebtsList';
import { HeldPartnerCapitalList } from './components/HeldPartnerCapitalList';
import { PillButton } from '@/src/shared/design-system/Buttons';
import { CashflowMetricRibbon } from './components/CashflowMetricRibbon';
import { SmartFinancialEntryDock } from './components/SmartFinancialEntryDock';
import { UnifiedCashJournal } from './components/UnifiedCashJournal';

const ShowroomExpenseModal = React.lazy(() => 
  import('./components/ShowroomExpenseModal').then(m => ({ default: m.ShowroomExpenseModal }))
);

interface CashflowWebViewProps {
  presenter: FinancePresenter;
  hasPermission: (permission: string) => boolean;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
  state?: CashflowState;
}

export const CashflowWebView: React.FC<CashflowWebViewProps> = ({
  presenter,
  hasPermission,
  onNavigate,
  state: propState
}) => {
  // If state is not passed from dispatcher, fallback to internal state
  const fallbackState = useCashflowState(presenter);
  const state = propState || fallbackState;

  const {
    loading,
    data,
    filterMonth,
    showExpenseModal,
    setShowExpenseModal,
    showCapitalModal,
    setShowCapitalModal,
    expenseForm,
    setExpenseForm,
    editingExpenseId,
    setEditingExpenseId,
    tempCapital,
    setTempCapital,
    setIsEditingCapital,
    handleMonthChange,
    handleSubmitExpense,
    startEditExpense,
    errors,
    receivableDebts,
    totalReceivables,
    payableDebts,
    totalPayables,
    heldPartnerCapitals,
    totalHeldPartnerCapital,
    vehicles,
    staff,
    allJournalTransactions,
    filteredTransactions,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    typeFilter,
    setTypeFilter,
    recordUnifiedTransaction
  } = state;

  const isInitialLoading = loading && !data;
  const isSubsequentLoading = loading && !!data;

  if (isInitialLoading) {
    return <CashflowSkeleton />;
  }

  const totalOutflow = data?.totalOutflow || 0;
  const openingBalance = data?.openingCashBalance || 0;
  const closingBalance = data?.closingCashBalance || 0;
  const revenue = data?.revenue || 0;
  const netCashflow = data?.netCashflow || 0;

  return (
    <PageShell scrollable maxWidth="max-w-[1700px]" animate={true} className="slide-in-from-bottom-4">
      <PageHeaderShell>
        <CashflowHeader
          filterMonth={filterMonth}
          onMonthChange={handleMonthChange}
          onShowCapital={() => {
            setIsEditingCapital(true);
            setShowCapitalModal(true);
          }}
          onShowExpense={() => setShowExpenseModal(true)}
          hasPermission={hasPermission}
        />
      </PageHeaderShell>

      <div className="relative space-y-8 md:space-y-10">
        <div
          className={cn(
            "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] space-y-8 md:space-y-10",
            isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none"
          )}
        >
          {/* 1. Cash-Basis Metric Ribbon */}
          <CashflowMetricRibbon
            openingBalance={openingBalance}
            revenue={revenue}
            totalOutflow={totalOutflow}
            closingBalance={closingBalance}
            netCashflow={netCashflow}
            heldPartnerCapital={totalHeldPartnerCapital}
            onShowCapital={() => {
              setIsEditingCapital(true);
              setShowCapitalModal(true);
            }}
            canEditCapital={hasPermission(PERMISSIONS.EDIT_CASHFLOW)}
          />

          {/* 2. Main Accounting Workspace (Split Screen) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left: Smart Entry Dock & Cost Breakdown */}
            <div className="xl:col-span-4 space-y-8">
              {hasPermission(PERMISSIONS.EDIT_CASHFLOW) && (
                <SmartFinancialEntryDock
                  vehicles={vehicles}
                  staff={staff}
                  currentBalance={closingBalance}
                  onRecord={recordUnifiedTransaction}
                  filterMonth={filterMonth}
                />
              )}

              <BreakdownCard data={data} total={totalOutflow} />
            </div>

            {/* Right: Unified Cash Journal Ledger */}
            <div className="xl:col-span-8">
              <UnifiedCashJournal
                transactions={filteredTransactions}
                allTransactions={allJournalTransactions}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                onEditExpense={(rawId) => {
                  const exp = (data?.allExpenses || []).find(e => String(e.id) === String(rawId));
                  if (exp) startEditExpense(exp);
                }}
                onDeleteExpense={(rawId) => presenter.deleteExpense(rawId)}
                onVehicleClick={(vehicleId) => {
                  const v = vehicles.find(x => String(x.id) === String(vehicleId));
                  if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
                }}
                filterMonth={filterMonth}
              />
            </div>
          </div>

          {/* 3. Expected Upcoming Cash Movements (Accounts Receivable & Payable) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10">
            <ReceivableDebtsList
              debts={receivableDebts}
              total={totalReceivables}
              onVehicleClick={(vehicleId) => {
                const v = vehicles.find(x => x.id === vehicleId);
                if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
              }}
            />
            <PayableDebtsList
              debts={payableDebts}
              total={totalPayables}
              onVehicleClick={(vehicleId) => {
                const v = vehicles.find(x => x.id === vehicleId);
                if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
              }}
            />
            <HeldPartnerCapitalList
              items={heldPartnerCapitals}
              total={totalHeldPartnerCapital}
              onVehicleClick={(vehicleId) => {
                const v = vehicles.find(x => x.id === vehicleId);
                if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
              }}
            />
          </div>
        </div>

        {/* Liquid Flow Glass Overlay while refetching */}
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
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-neon-glow" />
          </motion.div>
        )}
      </div>

      {/* Traditional Modal fallback for editing */}
      <Suspense fallback={null}>
        {showExpenseModal && (
          <ShowroomExpenseModal
            isOpen={showExpenseModal}
            onClose={() => {
              setShowExpenseModal(false);
              setEditingExpenseId(null);
              setExpenseForm({ name: '', amount: 0, category: 'Vận hành', date: new Date().toISOString().split('T')[0] });
            }}
            isEditing={!!editingExpenseId}
            form={expenseForm}
            setForm={setExpenseForm}
            onSubmit={handleSubmitExpense}
            errors={errors}
          />
        )}
      </Suspense>

      <CapitalModal
        isOpen={showCapitalModal}
        onClose={() => {
          setShowCapitalModal(false);
          setIsEditingCapital(false);
        }}
        value={tempCapital}
        onChange={setTempCapital}
        onSubmit={() => {
          presenter.updateCapital(tempCapital);
          setShowCapitalModal(false);
          setIsEditingCapital(false);
        }}
      />
    </PageShell>
  );
};

// --- Sub-components ---
interface CashflowHeaderProps {
  filterMonth: string;
  onMonthChange: (month: string) => void;
  onShowCapital: () => void;
  onShowExpense: () => void;
  hasPermission: (permission: string) => boolean;
}

interface BreakdownCardProps {
  data?: MonthlyFinanceData | null;
  total: number;
}

interface BreakdownRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

interface CapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: number;
  onChange: (val: number) => void;
  onSubmit: () => void;
}

const CashflowHeader: React.FC<CashflowHeaderProps> = ({
  filterMonth,
  onMonthChange,
  onShowCapital,
  onShowExpense,
  hasPermission
}) => (
  <div className="flex flex-col lg:flex-row justify-between items-start gap-8 w-full">
    <div className="text-left">
      <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-5 justify-start">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
          <CircleDollarSign size={34} strokeWidth={2.5} />
        </div>
        Dòng Tiền & Sổ Quỹ
      </h2>
      <p className="text-liquid-label mt-3 opacity-40 flex items-center gap-3 justify-start">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Sổ nhật ký thu chi, quản lý quỹ tiền mặt và hạch toán dòng tiền Showroom
      </p>
    </div>
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 w-full lg:w-auto">
      <div className="w-full sm:w-auto">
        <BaseInput
          type="month"
          value={filterMonth}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMonthChange(e.target.value)}
          icon={Calendar}
          className="min-w-[200px]"
        />
      </div>
      {hasPermission(PERMISSIONS.EDIT_CASHFLOW) && (
        <div className="flex gap-3 w-full sm:w-auto">
          <PillButton onClick={onShowCapital} variant="secondary" icon={Wallet} className="flex-1 sm:flex-none">
            Chốt vốn
          </PillButton>
          <PillButton onClick={onShowExpense} variant="primary" icon={Plus} className="flex-1 sm:flex-none">
            Ghi phiếu
          </PillButton>
        </div>
      )}
    </div>
  </div>
);

const BreakdownCard: React.FC<BreakdownCardProps> = ({ data, total }) => (
  <section className="p-6 md:p-7 rounded-[28px] bg-white border border-hairline-soft text-kraft-ink shadow-kraft-deep relative h-fit space-y-6">
    <div className="flex items-center justify-between border-b border-hairline-soft pb-4">
      <h3 className="text-base font-black uppercase flex items-center gap-3 text-kraft-ink">
        <div className="w-8 h-8 rounded-xl bg-kraft-accent/10 text-kraft-accent flex items-center justify-center border border-kraft-accent/20">
          <CircleDollarSign size={16} />
        </div>
        Cấu Trúc Dòng Tiền Chi
      </h3>
      <span className="text-xs font-mono font-bold text-kraft-ink">{formatCurrency(total)}</span>
    </div>

    <div className="space-y-5">
      <BreakdownRow label="Tiền nhập xe vào kho" value={data?.purchaseOutflow || 0} total={total} color="bg-blue-500" />
      <BreakdownRow label="Chi phí làm đẹp & hoàn thiện xe" value={data?.carCosts || 0} total={total} color="bg-amber-500" />
      <BreakdownRow label="Vận hành Showroom" value={data?.operatingExpenses || 0} total={total} color="bg-rose-500" />
      <BreakdownRow label="Vốn & Lợi nhuận đối tác" value={data?.partnerPayouts || 0} total={total} color="bg-cyan-500" />
      <BreakdownRow label="Lương & Tạm ứng nhân sự (Thực chi)" value={data?.paidPayrollOutflow || 0} total={total} color="bg-emerald-500" />
      {(data?.depositRefundsOutflow || 0) > 0 && (
        <BreakdownRow label="Hoàn tiền cọc bán xe" value={data?.depositRefundsOutflow || 0} total={total} color="bg-orange-500" />
      )}
    </div>
  </section>
);

const BreakdownRow: React.FC<BreakdownRowProps> = ({ label, value, total, color }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
        <span className="text-sub-label">{label}</span>
        <span className="text-kraft-ink font-bold">
          {formatCurrency(value)} <span className="text-sub-label font-normal text-[9px]">({percent.toFixed(1)}%)</span>
        </span>
      </div>
      <div className="h-2 w-full bg-surface-soft rounded-full overflow-hidden p-0.5 border border-hairline-soft">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn("h-full rounded-full shadow-xs", color)}
        />
      </div>
    </div>
  );
};

const CapitalModal: React.FC<CapitalModalProps> = ({ isOpen, onClose, value, onChange, onSubmit }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Chốt Số Dư Vốn">
    <ModalBody>
      <div className="space-y-6">
        <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
            <Wallet size={20} />
          </div>
          <p className="text-xs font-bold leading-relaxed text-amber-900">
            Điều chỉnh tổng vốn lưu động hệ thống. Số dư này sẽ làm mốc khởi đầu để tính số dư tiền mặt tại quỹ.
          </p>
        </div>
        <SmartAmountInput label="Tổng vốn thực tế (VNĐ)" value={value} onChange={onChange} />
      </div>
    </ModalBody>
    <ModalFooter onCancel={onClose} onSubmit={onSubmit} submitLabel="Chốt số dư vốn" />
  </Modal>
);
