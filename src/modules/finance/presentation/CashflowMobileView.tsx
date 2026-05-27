import { Plus, TrendingUp, TrendingDown, Calendar, Wallet } from 'lucide-react';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { cn } from '@/src/shared/utils/cn';
import { FinancePresenter } from './FinancePresenter';

import { PERMISSIONS } from '@/src/constants';
import { useCashflowState } from './useCashflowState';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';
import { motion } from 'motion/react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { ReceivableDebtsList } from './components/ReceivableDebtsList';
import { PayableDebtsList } from './components/PayableDebtsList';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

const CashflowMobileSkeleton = () => (
  <NativePage className="bg-[#F8F9FA] px-4 py-6 space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="text" width={100} height={10} className="animate-pulse bg-black/5" />
        <Skeleton variant="text" width={80} height={28} className="animate-pulse bg-black/5" />
      </div>
      <Skeleton variant="rectangle" width={48} height={48} className="rounded-2xl animate-pulse bg-black/5" />
    </div>
    {/* Month picker skeleton */}
    <Skeleton variant="rectangle" width={160} height={48} className="rounded-full animate-pulse bg-black/5" />
    {/* Summary cards skeleton */}
    <div className="grid grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-[2rem] border border-black/5 space-y-4">
          <Skeleton variant="rectangle" width={40} height={40} className="rounded-xl animate-pulse bg-black/5" />
          <Skeleton variant="text" width={60} height={10} className="animate-pulse bg-black/5" />
          <Skeleton variant="text" width={100} height={18} className="animate-pulse bg-black/5" />
        </div>
      ))}
    </div>
    {/* Expense list skeleton */}
    <div className="space-y-3">
      <Skeleton variant="text" width={100} height={10} className="animate-pulse bg-black/5" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-[2rem] border border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton variant="rectangle" width={40} height={40} className="rounded-xl animate-pulse bg-black/5" />
            <div className="space-y-1.5">
              <Skeleton variant="text" width={100} height={14} className="animate-pulse bg-black/5" />
              <Skeleton variant="text" width={60} height={10} className="animate-pulse bg-black/5" />
            </div>
          </div>
          <Skeleton variant="text" width={70} height={16} className="animate-pulse bg-black/5" />
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
}

/**
 * 🍎 iPhone Native Cashflow View.
 */
export const CashflowMobileView: React.FC<CashflowMobileViewProps> = ({ presenter, hasPermission, onNavigate }) => {
  const {
    loading, data, filterMonth, showExpenseModal, setShowExpenseModal, showCapitalModal, setShowCapitalModal,
    expenseForm, setExpenseForm, editingExpenseId, setEditingExpenseId, tempCapital, setTempCapital,
    setIsEditingCapital, handleMonthChange, handleSubmitExpense, startEditExpense, errors,
    receivableDebts, totalReceivables, payableDebts, totalPayables, vehicles
  } = useCashflowState(presenter);

  const isInitialLoading = loading && !data;
  const isSubsequentLoading = loading && !!data;

  if (isInitialLoading) return <CashflowMobileSkeleton />;

  return (
    <NativePage className="bg-[#F8F9FA] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <NativeHeader>
        <div className="flex items-center justify-between">
          <div>
            <SecondaryLabel>Tài chính Showroom</SecondaryLabel>
            <LargeTitle>Dòng tiền</LargeTitle>
          </div>
          <button 
            onClick={() => { setIsEditingCapital(true); setShowCapitalModal(true); }}
            className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 active:scale-90 transition-transform"
          >
            <Wallet size={24} />
          </button>
        </div>

        {/* Month Picker - Native Style */}
        <div className="mt-6 relative inline-flex items-center gap-3 px-6 h-12 rounded-full border border-white/40 bg-white/70 backdrop-blur-md shadow-neural-t2 active:scale-95 transition-transform w-fit overflow-hidden">
          <Calendar size={16} className="text-kraft-accent shrink-0" />
          <span className="font-black uppercase text-[11px] tracking-widest text-kraft-ink pointer-events-none">
            {filterMonth ? `THÁNG ${filterMonth.split('-')[1]}/${filterMonth.split('-')[0]}` : 'CHỌN THÁNG'}
          </span>
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </NativeHeader>

      <div className="relative">
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
          <div className="space-y-6">
            {/* Main Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
              <SummaryCard 
                label="Tổng thu" 
                value={formatCurrency(data?.revenue || 0)} 
                icon={TrendingUp} 
                color="emerald" 
              />
              <SummaryCard 
                label="Tổng chi" 
                value={formatCurrency(data?.totalOutflow || 0)} 
                icon={TrendingDown} 
                color="red" 
              />
            </div>

            {/* Expense List Section */}
            <div>
              <SecondaryLabel className="mb-4 block">Chi phí vận hành</SecondaryLabel>
              <div className="space-y-3">
                {(data?.allExpenses || []).map((exp, index) => (
                  <motion.button
                    key={exp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startEditExpense(exp)}
                    className="w-full bg-white p-5 rounded-[1.5rem] border border-black/5 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                        <TrendingDown size={20} />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-sm text-kraft-ink">{exp.name}</div>
                        <div className="text-[10px] opacity-40 uppercase font-bold">{formatDate(exp.date)}</div>
                      </div>
                    </div>
                    <div className="font-black text-red-500">-{formatCurrency(exp.amount)}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Báo cáo Công nợ */}
            <div className="space-y-6">
              <ReceivableDebtsList 
                debts={receivableDebts} 
                total={totalReceivables} 
                isCompact={true} 
                onVehicleClick={(vehicleId) => {
                  const v = vehicles.find(x => x.id === vehicleId);
                  if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
                }}
              />
              <PayableDebtsList 
                debts={payableDebts} 
                total={totalPayables} 
                isCompact={true} 
                onVehicleClick={(vehicleId) => {
                  const v = vehicles.find(x => x.id === vehicleId);
                  if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
                }}
              />
            </div>
          </div>
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

      {/* FAB for Expense */}
      {hasPermission(PERMISSIONS.EDIT_CASHFLOW) && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowExpenseModal(true)}
          className="fixed bottom-[100px] right-6 w-16 h-16 bg-kraft-ink text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-4 border-white"
        >
          <Plus size={32} strokeWidth={3} />
        </motion.button>
      )}

      {/* Modals */}
      <ExpenseFormModal 
        isOpen={showExpenseModal} 
        onClose={() => { 
          setShowExpenseModal(false); 
          setEditingExpenseId(null); 
          setExpenseForm({ 
            name: '', 
            amount: 0, 
            category: 'Vận hành', 
            date: new Date().toISOString().split('T')[0] 
          }); 
        }} 
        isEditing={!!editingExpenseId} 
        form={expenseForm} 
        setForm={setExpenseForm} 
        onSubmit={handleSubmitExpense} 
        errors={errors}
      />
      <CapitalModal 
        isOpen={showCapitalModal} 
        onClose={() => { setShowCapitalModal(false); setIsEditingCapital(false); }} 
        value={tempCapital} 
        onChange={setTempCapital} 
        onSubmit={() => { presenter.updateCapital(tempCapital); setShowCapitalModal(false); setIsEditingCapital(false); }} 
      />
    </NativePage>
  );
};

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: 'emerald' | 'red';
}

const SummaryCard = ({ label, value, icon: Icon, color }: SummaryCardProps) => (
  <div className="bg-white p-5 rounded-[2rem] border border-black/5 shadow-sm">
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
      color === 'emerald' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
    )}>
      <Icon size={20} />
    </div>
    <div className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1">{label}</div>
    <div className={cn("text-lg font-black tracking-tight", color === 'emerald' ? "text-emerald-600" : "text-red-600")}>
      {value}
    </div>
  </div>
);

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: { name: string; amount: number; category: string; date: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; amount: number; category: string; date: string }>>;
  onSubmit: (e: React.FormEvent) => void;
  errors?: Record<string, string>;
}

const ExpenseFormModal = ({ isOpen, onClose, isEditing, form, setForm, onSubmit, errors }: ExpenseFormModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Chỉnh sửa chi phí" : "Ghi chi phí showroom"} height="auto">
    <form onSubmit={onSubmit}>
      <ModalBody className="space-y-5 px-6">
        <BaseInput 
          label="Tên chi phí"
          required
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          placeholder="VD: Tiền điện, Marketing..."
          variant="dense"
          error={errors?.name}
        />

        <SmartAmountInput 
          label="Số tiền chi (VNĐ)" 
          value={form.amount} 
          onChange={(val: number) => setForm({...form, amount: val})} 
          variant="dense"
          error={errors?.amount}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput 
            label="Ngày thực hiện"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({...form, date: e.target.value})}
            icon={Calendar}
            variant="dense"
            error={errors?.date}
          />

          <BaseSelect 
            label="Hạng mục"
            required
            value={form.category}
            onChange={(e) => setForm({...form, category: e.target.value})}
            variant="dense"
            error={errors?.category}
          >
            <option value="Vận hành">Vận hành Showroom</option>
            <option value="Marketing">Marketing / Quảng cáo</option>
            <option value="Sửa chữa">Sửa chữa / Bảo trì TB</option>
            <option value="Tiền điện/nước">Tiền điện / nước / Net</option>
            <option value="Tiếp khách">Tiếp khách / Ăn uống</option>
            <option value="Khác">Khác</option>
          </BaseSelect>
        </div>
      </ModalBody>
      <div className="p-6 border-t border-black/5 bg-white/50 backdrop-blur-md safe-pb">
        <button
          type="submit"
          className="w-full h-14 rounded-2xl bg-kraft-ink text-white font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-black/10"
        >
          {isEditing ? "Lưu thay đổi" : "Ghi chi phí"}
        </button>
      </div>
    </form>
  </Modal>
);

interface CapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: number;
  onChange: (val: number) => void;
  onSubmit: () => void;
}

const CapitalModal = ({ isOpen, onClose, value, onChange, onSubmit }: CapitalModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Điều chỉnh vốn" height="auto">
    <ModalBody>
      <div className="p-6 bg-kraft-accent/5 rounded-3xl border border-kraft-accent/10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent"><Wallet size={20} /></div>
        <p className="text-[11px] font-bold leading-relaxed">Điều chỉnh tổng vốn lưu động hệ thống. Ảnh hưởng đến báo cáo tài chính.</p>
      </div>
      <SmartAmountInput label="Tổng vốn thực tế (VNĐ)" value={value} onChange={onChange} />
    </ModalBody>
    <ModalFooter onCancel={onClose} onSubmit={onSubmit} submitLabel="Chốt số dư vốn" />
  </Modal>
);
