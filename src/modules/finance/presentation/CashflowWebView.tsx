import React from 'react';
import { CircleDollarSign, Plus, TrendingUp, TrendingDown, Wallet, BarChart3, Calendar, Trash2, Edit2, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { cn } from '@/src/shared/utils/cn';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { FinancePresenter } from './FinancePresenter';

import { Expense } from '../domain/ExpenseRepository';
import { MonthlyFinanceData } from '../application/GetMonthlyFinance';
import { ExpenseDTO } from '@/src/shared/domain/schemas';
import { PERMISSIONS } from '@/src/constants';
import { useCashflowState } from './useCashflowState';
import { BaseCard as CardShell, CardContentSection } from '@/src/shared/design-system/BaseCard';
import { PageShell, PageHeaderShell } from '@/src/shared/design-system/PageShell';
import { CashflowSkeleton } from '@/src/modules/finance/presentation/components/CashflowSkeleton';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { ReceivableDebtsList } from './components/ReceivableDebtsList';
import { PayableDebtsList } from './components/PayableDebtsList';
import { PillButton, SlidingPillSwitcher } from '@/src/shared/design-system/Buttons';

interface CashflowWebViewProps {
  presenter: FinancePresenter;
  hasPermission: (permission: string) => boolean;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
}

export const CashflowWebView: React.FC<CashflowWebViewProps> = ({ presenter, hasPermission, onNavigate }) => {
  const {
    loading, data, filterMonth, showExpenseModal, setShowExpenseModal, showCapitalModal, setShowCapitalModal,
    expenseForm, setExpenseForm, editingExpenseId, setEditingExpenseId, tempCapital, setTempCapital,
    setIsEditingCapital, allCarCosts, handleMonthChange, handleSubmitExpense, startEditExpense,
    receivableDebts, totalReceivables, payableDebts, totalPayables, vehicles
  } = useCashflowState(presenter);

  const [isCompact, setIsCompact] = React.useState(false);

  const isInitialLoading = loading && !data;
  const isSubsequentLoading = loading && !!data;

  if (isInitialLoading) {
    return <CashflowSkeleton />;
  }

  const totalOutflow = data?.totalOutflow || 0;

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
          isCompact={isCompact}
          setIsCompact={setIsCompact}
        />
      </PageHeaderShell>

      <div className="relative">
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] space-y-12", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 render-boundary-isolated">
            {([  
              { label: 'Tổng thu', value: formatCurrency(data?.revenue || 0), icon: TrendingUp, color: 'emerald' },
              { label: 'Tổng chi', value: formatCurrency(totalOutflow), icon: TrendingDown, color: 'red' },
              { label: 'Lợi nhuận ròng', value: formatCurrency(data?.netProfit || 0), icon: BarChart3, color: (data?.netProfit || 0) >= 0 ? 'emerald' : 'red' },
              { label: 'Dòng tiền thuần', value: formatCurrency(data?.netCashflow || 0), icon: CircleDollarSign, color: (data?.netCashflow || 0) >= 0 ? 'indigo' : 'red' },
            ] as const).map((stat, i) => (
              <motion.div 
                key={stat.label} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.08, type: 'spring' as const, damping: 25, stiffness: 200 }}
                style={{ willChange: 'transform, opacity' }}
                className="scroll-reveal-item"
              >
                <StatCard label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 render-boundary-isolated">
            <div className="lg:col-span-2 space-y-12">
              <ExpensesList 
                expenses={data?.allExpenses || []} 
                onEdit={startEditExpense} 
                onDelete={(id: string | number) => presenter.deleteExpense(id)} 
                isCompact={isCompact}
              />
              <CarCostsList costs={allCarCosts} isCompact={isCompact} />
            </div>
            <BreakdownCard data={data} total={totalOutflow} />
          </div>

          {/* Lưới 2 cột Báo cáo Công nợ chuẩn Design System */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mt-12">
            <ReceivableDebtsList 
              debts={receivableDebts} 
              total={totalReceivables} 
              isCompact={isCompact} 
              onVehicleClick={(vehicleId) => {
                const v = vehicles.find(x => x.id === vehicleId);
                if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
              }}
            />
            <PayableDebtsList 
              debts={payableDebts} 
              total={totalPayables} 
              isCompact={isCompact} 
              onVehicleClick={(vehicleId) => {
                const v = vehicles.find(x => x.id === vehicleId);
                if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
              }}
            />
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

      <ExpenseFormModal isOpen={showExpenseModal} onClose={() => { setShowExpenseModal(false); setEditingExpenseId(null); setExpenseForm({ name: '', amount: 0, category: 'Vận hành', date: new Date().toISOString().split('T')[0] }); }} isEditing={!!editingExpenseId} form={expenseForm} setForm={setExpenseForm} onSubmit={handleSubmitExpense} />
      <CapitalModal isOpen={showCapitalModal} onClose={() => { setShowCapitalModal(false); setIsEditingCapital(false); }} value={tempCapital} onChange={setTempCapital} onSubmit={() => { presenter.updateCapital(tempCapital); setShowCapitalModal(false); setIsEditingCapital(false); }} />
    </PageShell>
  );
};

// --- Sub-component Interfaces ---
interface CashflowHeaderProps {
  filterMonth: string;
  onMonthChange: (month: string) => void;
  onShowCapital: () => void;
  onShowExpense: () => void;
  hasPermission: (permission: string) => boolean;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ size: number; strokeWidth?: number; className?: string }>;
  color: string;
}

interface ExpensesListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string | number) => void;
  isCompact: boolean;
}

interface CarCostItem {
  carName: string;
  carCode: string;
  note: string;
  amount: number;
  date: string;
}

interface CarCostsListProps {
  costs: CarCostItem[];
  isCompact: boolean;
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

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: ExpenseDTO;
  setForm: React.Dispatch<React.SetStateAction<ExpenseDTO>>;
  onSubmit: (e: React.FormEvent) => void;
}

interface CapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: number;
  onChange: (val: number) => void;
  onSubmit: () => void;
}

// --- Sub-components (Copied from original for preservation) ---
const CashflowHeader: React.FC<CashflowHeaderProps> = ({ filterMonth, onMonthChange, onShowCapital, onShowExpense, hasPermission, isCompact, setIsCompact }) => (
  <div className="flex flex-col lg:flex-row justify-between items-start gap-8 w-full">
    <div className="text-left">
      <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-6 justify-start">
        <div className="w-16 h-16 rounded-[2rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20"><CircleDollarSign size={38} strokeWidth={2.5} /></div>
        Dòng tiền
      </h2>
      <p className="text-liquid-label mt-4 opacity-30 flex items-center gap-3 justify-start"><span className="w-2 h-2 rounded-full bg-kraft-accent animate-pulse" />Quản lý thu chi và cân đối tài chính Showroom</p>
    </div>
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
      {/* Premium Sliding-Pill Switcher for Grid/List view */}
      <div className="hidden lg:flex mr-4 shrink-0">
        <SlidingPillSwitcher isCompact={isCompact} onChange={setIsCompact} />
      </div>

      <div className="w-full sm:w-auto">
        <BaseInput 
          type="month" 
          value={filterMonth} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMonthChange(e.target.value)} 
          icon={Calendar}
          className="min-w-[220px]"
        />
      </div>
      {hasPermission(PERMISSIONS.EDIT_CASHFLOW) && (
        <div className="flex gap-4 w-full sm:w-auto">
          <PillButton 
            onClick={onShowCapital} 
            variant="secondary" 
            icon={Wallet} 
            className="flex-1 sm:flex-none justify-start"
          >
            Chốt vốn
          </PillButton>
          <PillButton 
            onClick={onShowExpense} 
            variant="primary" 
            icon={Plus} 
            className="flex-1 sm:flex-none justify-start"
          >
            Thêm chi
          </PillButton>
        </div>
      )}
    </div>
  </div>
);

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => (
  <CardShell minHeight="min-h-[320px]">
    <CardContentSection padding="p-10" className="flex flex-col items-start text-left group hover:scale-[1.03] transition-all duration-500">
      <div className={cn("w-20 h-20 rounded-[2.5rem] shadow-lg mb-8 flex items-center justify-center transition-all duration-500 group-hover:rotate-12", color === 'emerald' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : color === 'red' ? "bg-red-500/10 text-red-600 border border-red-500/20" : "bg-kraft-accent/10 text-kraft-accent border border-kraft-accent/20")}>
        <Icon size={32} strokeWidth={2.5} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-kraft-ink opacity-30 mb-4">{label}</span>
      <span className={cn("text-3xl font-black tracking-tighter", color === 'emerald' ? "text-emerald-600" : color === 'red' ? "text-red-500" : "text-kraft-ink")}>{value}</span>
      <div className="mt-8 w-12 h-1 bg-current opacity-10 rounded-full" />
    </CardContentSection>
  </CardShell>
);

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses, onEdit, onDelete, isCompact }) => (
  <section className="liquid-card border-white/60 !p-0 overflow-hidden shadow-2xl">
    <div className={cn("p-8 border-b border-black/5 flex items-center justify-between bg-white/20", isCompact && "p-4 md:p-6")}>
      <h3 className={cn("text-2xl font-black uppercase flex items-center gap-4", isCompact && "text-lg")}><div className={cn("p-3 rounded-2xl bg-red-500/10 text-red-500", isCompact && "p-2 rounded-xl")}><TrendingDown size={isCompact ? 18 : 24} strokeWidth={2.5} /></div>Chi phí vận hành</h3>
      <p className="text-liquid-label !text-black opacity-30 italic">{expenses.length} Giao dịch</p>
    </div>
    <div className="overflow-x-auto min-h-[400px] render-boundary-isolated">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-kraft-accent/5">
            {['Hạng mục', 'Số tiền', 'Ngày', 'Thao tác'].map((h, i) => <th key={i} className={cn("py-6 px-8 text-liquid-label !text-kraft-accent/60", i === 3 && "text-right", isCompact && "py-3 px-6 text-[10px]")}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {expenses.map((exp, index) => (
            <motion.tr
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 25, delay: index * 0.04 }}
              style={{ willChange: 'transform, opacity' }}
              className="group hover:bg-kraft-accent/5 transition-all scroll-reveal-item"
            >
              <td className={cn("py-6 px-8", isCompact && "py-2 px-6")}>
                <p className={cn("font-black text-base text-kraft-ink", isCompact && "text-sm")}>{exp.name}</p>
                {!isCompact && <p className="text-liquid-label mt-1">{exp.category || 'Chung'}</p>}
              </td>
              <td className={cn("py-6 px-8", isCompact && "py-2 px-6")}>
                <span className={cn("font-black text-lg text-red-500", isCompact && "text-sm")}>{formatCurrency(exp.amount)}</span>
              </td>
              <td className={cn("py-6 px-8", isCompact && "py-2 px-6")}>
                <span className="text-xs font-black opacity-40 uppercase">{formatDate(exp.date)}</span>
              </td>
              <td className={cn("py-6 px-8 text-right", isCompact && "py-2 px-6")}>
                <div className={cn("flex justify-end gap-3", !isCompact && "opacity-0 group-hover:opacity-100 transition-all")}>
                  <button onClick={() => onEdit(exp)} className={cn("w-10 h-10 rounded-xl bg-kraft-accent/10 text-kraft-accent flex items-center justify-center hover:bg-kraft-accent hover:text-white", isCompact && "w-7 h-7 rounded-lg")}><Edit2 size={isCompact ? 14 : 16} /></button>
                  <button onClick={() => onDelete(exp.id)} className={cn("w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white", isCompact && "w-7 h-7 rounded-lg")}><Trash2 size={isCompact ? 14 : 16} /></button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const CarCostsList: React.FC<CarCostsListProps> = ({ costs, isCompact }) => (
  <section className="liquid-card border-white/60 !p-0 overflow-hidden shadow-2xl">
    <div className={cn("p-8 border-b border-black/5 flex items-center justify-between bg-amber-500/5", isCompact && "p-4 md:p-6")}>
      <h3 className={cn("text-2xl font-black uppercase flex items-center gap-4 text-amber-600", isCompact && "text-lg")}><div className={cn("p-3 rounded-2xl bg-amber-500/10 text-amber-500", isCompact && "p-2 rounded-xl")}><Wrench size={isCompact ? 18 : 24} strokeWidth={2.5} /></div>Chi phí phát sinh xe</h3>
      <p className="text-liquid-label !text-black opacity-40 italic">{costs.length} Ghi nhận</p>
    </div>
    <div className="overflow-x-auto max-h-[400px] custom-scrollbar render-boundary-isolated">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-kraft-accent/5">
            {['Tài sản', 'Hạng mục', 'Số tiền', 'Ngày'].map((h, i) => <th key={i} className={cn("py-6 px-8 text-liquid-label !text-kraft-accent/60", (i >= 2 && "text-right"), isCompact && "py-3 px-6 text-[10px]")}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {costs.map((cost, idx) => (
            <motion.tr
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 25, delay: idx * 0.04 }}
              style={{ willChange: 'transform, opacity' }}
              className="hover:bg-kraft-accent/5 transition-all scroll-reveal-item"
            >
              <td className={cn("py-6 px-8", isCompact && "py-2 px-6")}>
                <p className={cn("font-black text-base text-kraft-ink", isCompact && "text-sm")}>{cost.carName}</p>
                {!isCompact && <p className="text-liquid-label mt-1">{cost.carCode}</p>}
              </td>
              <td className={cn("py-6 px-8", isCompact && "py-2 px-6")}><p className={cn("font-black text-sm text-kraft-ink", isCompact && "text-xs")}>{cost.note}</p></td>
              <td className={cn("py-6 px-8 text-right", isCompact && "py-2 px-6")}><span className={cn("font-black text-base text-amber-600", isCompact && "text-sm")}>{formatCurrency(cost.amount)}</span></td>
              <td className={cn("py-6 px-8 text-right", isCompact && "py-2 px-6")}><span className="text-xs font-black opacity-40 uppercase">{formatDate(cost.date)}</span></td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const BreakdownCard: React.FC<BreakdownCardProps> = ({ data, total }) => (
  <section className="liquid-card border-none bg-kraft-ink text-white p-10 shadow-2xl relative h-fit">
    <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10"><BarChart3 size={24} /></div>Cấu trúc chi</h3>
    <div className="space-y-8">
      <BreakdownRow label="Mua xe" value={data?.purchaseOutflow || 0} total={total} color="bg-blue-400" />
      <BreakdownRow label="Chi phí xe" value={data?.carCosts || 0} total={total} color="bg-amber-400" />
      <BreakdownRow label="Vận hành" value={data?.operatingExpenses || 0} total={total} color="bg-rose-400" />
      <BreakdownRow label="Vốn & LN Đối tác" value={data?.partnerPayouts || 0} total={total} color="bg-purple-400" />
      <BreakdownRow label="Lương nhân viên" value={data?.salaries || 0} total={total} color="bg-emerald-400" />
    </div>
  </section>
);

const BreakdownRow: React.FC<BreakdownRowProps> = ({ label, value, total, color }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest"><span className="opacity-40">{label}</span><span className="text-white">{formatCurrency(value)}</span></div>
      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(percent, 100)}%` }} transition={{ duration: 1 }} className={cn("h-full rounded-full shadow-lg", color)} />
      </div>
    </div>
  );
};

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose, isEditing, form, setForm, onSubmit }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Chỉnh sửa chi phí" : "Thêm chi phí vận hành"}>
    <form onSubmit={onSubmit}>
      <ModalBody>
        <div className="space-y-6">
          <BaseInput 
            label="Tên chi phí"
            required 
            value={form.name} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, name: e.target.value})} 
            placeholder="VD: Tiền điện, Marketing..." 
          />
          <SmartAmountInput label="Số tiền chi (VNĐ)" value={form.amount} onChange={(val: number) => setForm({...form, amount: val})} />
          <BaseInput 
            label="Ngày chi"
            type="date" 
            required 
            value={form.date} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, date: e.target.value})} 
            icon={Calendar}
          />
        </div>
      </ModalBody>
      <ModalFooter onCancel={onClose} onSubmit={onSubmit} submitLabel={isEditing ? "Lưu thay đổi" : "Ghi chi phí"} />
    </form>
  </Modal>
);

const CapitalModal: React.FC<CapitalModalProps> = ({ isOpen, onClose, value, onChange, onSubmit }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Điều chỉnh vốn">
    <ModalBody>
      <div className="space-y-8">
        <div className="p-6 bg-kraft-accent/5 rounded-3xl border border-kraft-accent/10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent"><Wallet size={20} /></div>
          <p className="text-[11px] font-bold leading-relaxed">Điều chỉnh tổng vốn lưu động hệ thống. Ảnh hưởng đến báo cáo tài chính.</p>
        </div>
        <SmartAmountInput label="Tổng vốn thực tế (VNĐ)" value={value} onChange={onChange} />
      </div>
    </ModalBody>
    <ModalFooter onCancel={onClose} onSubmit={onSubmit} submitLabel="Chốt số dư vốn" />
  </Modal>
);

