import React, { useState, Suspense } from 'react';
import { Plus, TrendingUp, TrendingDown, Calendar, Wallet, CircleDollarSign, Search } from 'lucide-react';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { cn } from '@/src/shared/utils/cn';
import { FinancePresenter } from './FinancePresenter';

import { PERMISSIONS } from '@/src/constants';
import { useCashflowState, CashflowState } from './useCashflowState';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';
import { motion } from 'motion/react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { ReceivableDebtsList } from './components/ReceivableDebtsList';
import { PayableDebtsList } from './components/PayableDebtsList';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

const ShowroomExpenseModal = React.lazy(() => 
  import('./components/ShowroomExpenseModal').then(m => ({ default: m.ShowroomExpenseModal }))
);

const CashflowMobileSkeleton = () => (
  <NativePage className="bg-slate-50 px-4 py-6 space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="text" width={100} height={10} className="animate-pulse bg-black/5" />
        <Skeleton variant="text" width={80} height={28} className="animate-pulse bg-black/5" />
      </div>
      <Skeleton variant="rectangle" width={48} height={48} className="rounded-2xl animate-pulse bg-black/5" />
    </div>
    <Skeleton variant="rectangle" width={160} height={48} className="rounded-full animate-pulse bg-black/5" />
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-[2rem] border border-black/5 space-y-3">
          <Skeleton variant="rectangle" width={36} height={36} className="rounded-xl animate-pulse bg-black/5" />
          <Skeleton variant="text" width={60} height={10} className="animate-pulse bg-black/5" />
          <Skeleton variant="text" width={100} height={18} className="animate-pulse bg-black/5" />
        </div>
      ))}
    </div>
  </NativePage>
);

interface CashflowMobileViewProps {
  presenter: FinancePresenter;
  userRole: string;
  hasPermission: (permission: string) => boolean;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
  state?: CashflowState;
}

type MobileTab = 'ledger' | 'car_costs' | 'debts' | 'breakdown';

/**
 * 🍎 iPhone Native Cashflow View with Unified Ledger and Segmented Tabs.
 */
export const CashflowMobileView: React.FC<CashflowMobileViewProps> = ({
  presenter,
  hasPermission,
  onNavigate,
  state: propState
}) => {
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
    errors,
    receivableDebts,
    totalReceivables,
    payableDebts,
    totalPayables,
    vehicles,
    allJournalTransactions,
    filteredTransactions,
    searchQuery,
    setSearchQuery,
    allCarCosts
  } = state;

  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('ledger');

  const isInitialLoading = loading && !data;

  if (isInitialLoading) return <CashflowMobileSkeleton />;

  const openingBalance = data?.openingCashBalance || 0;
  const closingBalance = data?.closingCashBalance || 0;
  const revenue = data?.revenue || 0;
  const totalOutflow = data?.totalOutflow || 0;
  const netCashflow = data?.netCashflow || 0;

  return (
    <NativePage className="bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28">
      <NativeHeader>
        <div className="flex items-center justify-between">
          <div>
            <SecondaryLabel>Tài chính Showroom</SecondaryLabel>
            <LargeTitle>Dòng tiền</LargeTitle>
          </div>
          <button
            onClick={() => {
              setIsEditingCapital(true);
              setShowCapitalModal(true);
            }}
            className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 active:scale-90 transition-transform cursor-pointer"
          >
            <Wallet size={24} />
          </button>
        </div>

        {/* Month Picker - Native Style */}
        <div className="mt-5 relative inline-flex items-center gap-3 px-5 h-11 rounded-full border border-white/60 bg-white/80 backdrop-blur-md shadow-sm active:scale-95 transition-transform w-fit overflow-hidden">
          <Calendar size={15} className="text-amber-600 shrink-0" />
          <span className="font-black uppercase text-[11px] tracking-widest text-kraft-ink pointer-events-none">
            {filterMonth ? `THÁNG ${filterMonth.split('-')[1]}/${filterMonth.split('-')[0]}` : 'CHỌN THÁNG'}
          </span>
          <input
            type="month"
            value={filterMonth}
            onChange={e => handleMonthChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </NativeHeader>

      <div className="space-y-6 mt-4">
        {/* 4 Native Metric Cards (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-3.5">
          <SummaryCard
            label="Đầu kỳ"
            sublabel="Vốn chuyển sang"
            value={formatCurrency(openingBalance)}
            icon={Wallet}
            color="slate"
          />
          <SummaryCard
            label="Thực thu"
            sublabel="Cọc & bán xe"
            value={`+${formatCurrency(revenue)}`}
            icon={TrendingUp}
            color="emerald"
          />
          <SummaryCard
            label="Thực chi"
            sublabel="Mua xe & vận hành"
            value={`-${formatCurrency(totalOutflow)}`}
            icon={TrendingDown}
            color="red"
          />
          <SummaryCard
            label="Quỹ hiện tại"
            sublabel={`${netCashflow >= 0 ? '+' : ''}${formatCurrency(netCashflow)}`}
            value={formatCurrency(closingBalance)}
            icon={CircleDollarSign}
            color="accent"
            highlight
          />
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center p-1 bg-black/5 rounded-2xl overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveMobileTab('ledger')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all text-center",
              activeMobileTab === 'ledger' ? "bg-white text-kraft-ink shadow-xs" : "text-sub-label"
            )}
          >
            Sổ Quỹ ({allJournalTransactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('car_costs')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all text-center",
              activeMobileTab === 'car_costs' ? "bg-white text-kraft-ink shadow-xs" : "text-sub-label"
            )}
          >
            Chi Phí Xe ({allCarCosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('debts')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all text-center",
              activeMobileTab === 'debts' ? "bg-white text-kraft-ink shadow-xs" : "text-sub-label"
            )}
          >
            Công Nợ
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('breakdown')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all text-center",
              activeMobileTab === 'breakdown' ? "bg-white text-kraft-ink shadow-xs" : "text-sub-label"
            )}
          >
            Cấu Trúc
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 space-y-6 mt-4">
        {/* Tab 1: Sổ Quỹ (General Ledger) */}
        {activeMobileTab === 'ledger' && (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-3xl bg-white border border-black/5 shadow-xs space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-sub-label">Đầu kỳ</span>
                <p className="text-sm font-black text-kraft-ink font-mono">{formatCurrency(openingBalance)}</p>
              </div>
              <div className="p-4 rounded-3xl bg-white border border-black/5 shadow-xs space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-sub-label">Cuối kỳ</span>
                <p className="text-sm font-black text-kraft-ink font-mono">{formatCurrency(closingBalance)}</p>
              </div>
              <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Tổng Thu</span>
                <p className="text-sm font-black text-emerald-700 font-mono">+{formatCurrency(revenue)}</p>
              </div>
              <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-700">Tổng Chi</span>
                <p className="text-sm font-black text-rose-700 font-mono">-{formatCurrency(totalOutflow)}</p>
              </div>
            </div>

            {/* Net Cashflow Banner */}
            <div className={cn(
              "p-4 rounded-3xl flex items-center justify-between text-white shadow-lg",
              netCashflow >= 0 ? "bg-emerald-600" : "bg-rose-600"
            )}>
              <div className="flex items-center gap-2.5">
                {netCashflow >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                <span className="text-xs font-black uppercase tracking-wider">Dòng tiền thuần</span>
              </div>
              <span className="font-mono font-black text-base">{formatCurrency(netCashflow)}</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sub-label" />
              <input
                type="text"
                placeholder="Tìm kiếm giao dịch..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-kraft-ink placeholder:text-sub-label shadow-xs"
              />
            </div>

            {/* Transactions List */}
            <div className="space-y-2.5">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-black/5 text-xs text-sub-label">
                  Không tìm thấy giao dịch nào
                </div>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const isInflow = tx.type === 'inflow';
                  return (
                    <motion.div
                      key={tx.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 flex-1">
                          <p className="font-black text-xs text-kraft-ink leading-snug">{tx.title}</p>
                          <p className="text-[10px] text-sub-label">{tx.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className={cn(
                              "font-mono font-black text-sm",
                              isInflow ? "text-emerald-600" : "text-rose-600"
                            )}
                          >
                            {isInflow ? '+' : '-'}{formatCurrency(tx.amount)}
                          </div>
                          <div className="text-[9px] font-mono text-sub-label">{formatDate(tx.date)}</div>
                        </div>
                      </div>

                      {/* Bottom row: Running balance & Tag */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-black/5 text-sub-label font-bold uppercase tracking-wider">
                          {tx.category}
                        </span>
                        <span className="font-mono font-bold text-kraft-ink">
                          Dư quỹ: <strong>{formatCurrency(tx.runningBalance)}</strong>
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Chi Phí Xe (Car Costs) */}
        {activeMobileTab === 'car_costs' && (
          <div className="space-y-2.5">
            {allCarCosts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-black/5 text-xs text-sub-label">
                Chưa có chi phí phát sinh cho xe trong tháng này
              </div>
            ) : (
              allCarCosts.map((cost, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-black/5 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-kraft-ink">{cost.carName}</span>
                    <span className="font-black text-sm text-amber-600">{formatCurrency(cost.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-sub-label">
                    <span>{cost.note} ({cost.carCode})</span>
                    <span>{formatDate(cost.date)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Báo cáo Công Nợ (Debts) */}
        {activeMobileTab === 'debts' && (
          <div className="space-y-6">
            <ReceivableDebtsList
              debts={receivableDebts}
              total={totalReceivables}
              isCompact={true}
              onVehicleClick={vehicleId => {
                const v = vehicles.find(x => x.id === vehicleId);
                if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
              }}
            />
            <PayableDebtsList
              debts={payableDebts}
              total={totalPayables}
              isCompact={true}
              onVehicleClick={vehicleId => {
                const v = vehicles.find(x => x.id === vehicleId);
                if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
              }}
            />
          </div>
        )}

        {/* Tab 4: Cấu trúc chi (Breakdown) */}
        {activeMobileTab === 'breakdown' && (
          <div className="p-6 rounded-3xl bg-kraft-ink text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-black uppercase">Cấu trúc chi tháng này</h4>
              <span className="font-mono text-xs text-amber-400">{formatCurrency(totalOutflow)}</span>
            </div>
            <div className="space-y-3.5 text-xs">
              <MobileBreakdownItem label="Mua xe" value={data?.purchaseOutflow || 0} total={totalOutflow} color="bg-blue-400" />
              <MobileBreakdownItem label="Chi phí xe" value={data?.carCosts || 0} total={totalOutflow} color="bg-amber-400" />
              <MobileBreakdownItem label="Vận hành" value={data?.operatingExpenses || 0} total={totalOutflow} color="bg-rose-400" />
              <MobileBreakdownItem label="Đối tác" value={data?.partnerPayouts || 0} total={totalOutflow} color="bg-cyan-400" />
              <MobileBreakdownItem label="Lương nhân sự" value={data?.salaries || 0} total={totalOutflow} color="bg-emerald-400" />
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for adding expense */}
      {hasPermission(PERMISSIONS.EDIT_CASHFLOW) && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowExpenseModal(true)}
          className="fixed bottom-[96px] right-5 w-14 h-14 bg-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-2 border-white cursor-pointer active:scale-95"
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Modals */}
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
    </NativePage>
  );
};

interface SummaryCardProps {
  label: string;
  sublabel: string;
  value: string;
  icon: React.ElementType;
  color: 'emerald' | 'red' | 'slate' | 'accent';
  highlight?: boolean;
}

const SummaryCard = ({ label, sublabel, value, icon: Icon, color, highlight }: SummaryCardProps) => (
  <div
    className={cn(
      "p-4 rounded-3xl border shadow-xs flex flex-col justify-between",
      highlight
        ? "bg-gradient-to-br from-kraft-ink to-slate-900 text-white border-white/10"
        : "bg-white border-black/5"
    )}
  >
    <div className="flex items-center justify-between">
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center",
          highlight
            ? "bg-amber-400/20 text-amber-300"
            : color === 'emerald'
            ? "bg-emerald-50 text-emerald-600"
            : color === 'red'
            ? "bg-rose-50 text-rose-600"
            : "bg-black/5 text-kraft-ink"
        )}
      >
        <Icon size={18} />
      </div>
      <span className={cn("text-[9px] font-medium", highlight ? "text-slate-300" : "text-sub-label")}>
        {sublabel}
      </span>
    </div>

    <div className="mt-3">
      <div className={cn("text-[10px] font-black uppercase tracking-wider", highlight ? "text-amber-300/80" : "text-sub-label")}>
        {label}
      </div>
      <div
        className={cn(
          "text-base font-black tracking-tight mt-0.5",
          highlight
            ? "text-amber-400"
            : color === 'emerald'
            ? "text-emerald-600"
            : color === 'red'
            ? "text-rose-600"
            : "text-kraft-ink"
        )}
      >
        {value}
      </div>
    </div>
  </div>
);

const MobileBreakdownItem = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="opacity-70">{label}</span>
        <span className="font-bold">{formatCurrency(value)} ({percent.toFixed(0)}%)</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div style={{ width: `${Math.min(percent, 100)}%` }} className={cn("h-full rounded-full", color)} />
      </div>
    </div>
  );
};

interface CapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: number;
  onChange: (val: number) => void;
  onSubmit: () => void;
}

const CapitalModal = ({ isOpen, onClose, value, onChange, onSubmit }: CapitalModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Chốt Số Dư Vốn" height="auto">
    <ModalBody>
      <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
          <Wallet size={18} />
        </div>
        <p className="text-xs font-bold leading-relaxed text-amber-900">
          Điều chỉnh tổng vốn lưu động hệ thống để làm mốc tính số dư quỹ.
        </p>
      </div>
      <div className="mt-4">
        <SmartAmountInput label="Tổng vốn thực tế (VNĐ)" value={value} onChange={onChange} />
      </div>
    </ModalBody>
    <ModalFooter onCancel={onClose} onSubmit={onSubmit} submitLabel="Chốt số dư vốn" />
  </Modal>
);
