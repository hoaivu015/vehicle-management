import React from 'react';
import { CircleDollarSign, Plus, TrendingUp, TrendingDown, Wallet, BarChart3, Calendar, Trash2, Edit2, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { cn } from '../../../utils/cn';
import { SmartAmountInput } from '../../../components/SmartAmountInput';
import { Modal } from '../../../components/Modal';
import { FinancePresenter } from './FinancePresenter';
import { CashflowSkeleton } from './components/CashflowSkeleton';
import { PERMISSIONS } from '../../../constants';
import { useCashflowState } from './useCashflowState';

interface CashflowPageProps {
  presenter: FinancePresenter;
  userRole: string;
  hasPermission: (permission: string) => boolean;
}

export const CashflowPage: React.FC<CashflowPageProps> = ({ presenter, userRole, hasPermission }) => {
  const {
    loading, data, filterMonth, showExpenseModal, setShowExpenseModal, showCapitalModal, setShowCapitalModal,
    expenseForm, setExpenseForm, editingExpenseId, setEditingExpenseId, tempCapital, setTempCapital,
    allCarCosts, handleMonthChange, handleSubmitExpense, startEditExpense
  } = useCashflowState(presenter, '');

  if (loading && !data) return <CashflowSkeleton />;

  const totalOutflow = (data?.purchaseOutflow || 0) + (data?.carCosts || 0) + (data?.operatingExpenses || 0) + (data?.salaries || 0);

  return (
    <div className="space-y-10 md:space-y-14 py-6 md:py-10 px-6 md:px-12 max-w-[1700px] mx-auto pb-24 h-full overflow-y-auto scrollbar-hidden">
      <CashflowHeader filterMonth={filterMonth} onMonthChange={handleMonthChange} onShowCapital={() => setShowCapitalModal(true)} onShowExpense={() => setShowExpenseModal(true)} hasPermission={hasPermission} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard delay={0.1} label="Tổng thu" value={formatCurrency(data?.revenue || 0)} icon={TrendingUp} color="emerald" />
        <StatCard delay={0.2} label="Tổng chi" value={formatCurrency(totalOutflow)} icon={TrendingDown} color="red" />
        <StatCard delay={0.3} label="Lợi nhuận ròng" value={formatCurrency(data?.netProfit || 0)} icon={BarChart3} color={(data?.netProfit || 0) >= 0 ? "emerald" : "red"} />
        <StatCard delay={0.4} label="Dòng tiền thuần" value={formatCurrency(data?.netCashflow || 0)} icon={CircleDollarSign} color={(data?.netCashflow || 0) >= 0 ? "indigo" : "red"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <ExpensesList expenses={data?.allExpenses || []} onEdit={startEditExpense} onDelete={(id) => presenter.deleteExpense(id)} />
          <CarCostsList costs={allCarCosts} />
        </div>
        <BreakdownCard data={data} total={totalOutflow} />
      </div>

      <ExpenseFormModal isOpen={showExpenseModal} onClose={() => { setShowExpenseModal(false); setEditingExpenseId(null); setExpenseForm({ name: '', amount: 0, category: 'Vận hành', date: new Date().toISOString().split('T')[0] }); }} isEditing={!!editingExpenseId} form={expenseForm} setForm={setExpenseForm} onSubmit={handleSubmitExpense} />
      <CapitalModal isOpen={showCapitalModal} onClose={() => setShowCapitalModal(false)} value={tempCapital} onChange={setTempCapital} onSubmit={() => { presenter.updateCapital(tempCapital); setShowCapitalModal(false); }} />
    </div>
  );
};

// --- Sub-components ---

const CashflowHeader = ({ filterMonth, onMonthChange, onShowCapital, onShowExpense, hasPermission }: any) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10">
    <div className="text-center lg:text-left">
      <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-6 justify-center lg:justify-start">
        <div className="w-16 h-16 rounded-[2rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20"><CircleDollarSign size={38} strokeWidth={2.5} /></div>
        Dòng tiền
      </h2>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-4 opacity-30 flex items-center gap-3 justify-center lg:justify-start"><span className="w-2 h-2 rounded-full bg-kraft-accent animate-pulse" />Quản lý thu chi và cân đối tài chính Showroom</p>
    </div>
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
      <div className="flex items-center gap-4 liquid-glass-core rounded-[1.5rem] px-6 py-4 shadow-xl h-16 w-full sm:w-auto min-w-[220px]">
        <Calendar size={20} className="text-kraft-accent" />
        <input type="month" value={filterMonth} onChange={(e) => onMonthChange(e.target.value)} className="text-[11px] font-black outline-none bg-transparent text-kraft-ink uppercase tracking-widest w-full sm:w-60 cursor-pointer" />
      </div>
      {hasPermission(PERMISSIONS.EDIT_CASHFLOW) && (
        <div className="flex gap-4 w-full sm:w-auto">
          <button onClick={onShowCapital} className="liquid-button-secondary h-16 px-8 flex items-center gap-3 flex-1 sm:flex-none justify-center rounded-[1.5rem]"><Wallet size={18} className="text-kraft-accent outline-4" /><span className="text-[10px] font-black uppercase tracking-widest">Chốt vốn</span></button>
          <button onClick={onShowExpense} className="liquid-button-primary h-16 px-8 flex items-center gap-3 flex-1 sm:flex-none justify-center rounded-[1.5rem]"><Plus size={20} strokeWidth={3} /><span className="text-[10px] font-black uppercase tracking-widest">Ghi chi phí</span></button>
        </div>
      )}
    </div>
  </motion.div>
);

const StatCard = ({ label, value, icon: Icon, color, delay }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }} className="liquid-card !p-10 flex flex-col items-center text-center group hover:scale-[1.03] transition-all duration-500 shadow-xl border-white/60">
    <div className={cn("w-20 h-20 rounded-[2.5rem] shadow-lg mb-8 flex items-center justify-center transition-all duration-500 group-hover:rotate-12", color === 'emerald' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : color === 'red' ? "bg-red-500/10 text-red-600 border border-red-500/20" : "bg-kraft-accent/10 text-kraft-accent border border-kraft-accent/20")}>
      <Icon size={32} strokeWidth={2.5} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-kraft-ink opacity-30 mb-4">{label}</span>
    <span className={cn("text-3xl font-black tracking-tighter", color === 'emerald' ? "text-emerald-600" : color === 'red' ? "text-red-500" : "text-kraft-ink")}>{value}</span>
    <div className="mt-8 w-12 h-1 bg-current opacity-10 rounded-full" />
  </motion.div>
);

const ExpensesList = ({ expenses, onEdit, onDelete }: any) => (
  <section className="liquid-card border-white/60 !p-0 overflow-hidden shadow-2xl">
    <div className="p-8 border-b border-black/5 flex items-center justify-between bg-white/20">
      <h3 className="text-2xl font-black uppercase flex items-center gap-4"><div className="p-3 rounded-2xl bg-red-500/10 text-red-500"><TrendingDown size={24} strokeWidth={2.5} /></div>Chi phí vận hành</h3>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">{expenses.length} Giao dịch</p>
    </div>
    <div className="overflow-x-auto min-h-[400px]">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-kraft-accent/5">
            {['Hạng mục', 'Số tiền', 'Ngày', 'Thao tác'].map((h, i) => <th key={i} className={cn("py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60", i === 3 && "text-right")}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {expenses.map((exp: any) => (
            <tr key={exp.id} className="group hover:bg-kraft-accent/5 transition-all">
              <td className="py-6 px-8"><p className="font-black text-base text-kraft-ink">{exp.name}</p><p className="text-[9px] font-bold uppercase opacity-30 mt-1">{exp.category || 'Chung'}</p></td>
              <td className="py-6 px-8"><span className="font-black text-lg text-red-500">{formatCurrency(exp.amount)}</span></td>
              <td className="py-6 px-8"><span className="text-xs font-black opacity-40 uppercase">{formatDate(exp.date)}</span></td>
              <td className="py-6 px-8 text-right">
                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => onEdit(exp)} className="w-10 h-10 rounded-xl bg-kraft-accent/10 text-kraft-accent flex items-center justify-center hover:bg-kraft-accent hover:text-white"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(exp.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const CarCostsList = ({ costs }: any) => (
  <section className="liquid-card border-white/60 !p-0 overflow-hidden shadow-2xl">
    <div className="p-8 border-b border-black/5 flex items-center justify-between bg-amber-500/5">
      <h3 className="text-2xl font-black uppercase flex items-center gap-4 text-amber-600"><div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500"><Wrench size={24} strokeWidth={2.5} /></div>Chi phí phát sinh xe</h3>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">{costs.length} Ghi nhận</p>
    </div>
    <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-kraft-accent/5">
            {['Tài sản', 'Hạng mục', 'Số tiền', 'Ngày'].map((h, i) => <th key={i} className={cn("py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60", i >= 2 && "text-right")}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {costs.map((cost: any, idx: number) => (
            <tr key={idx} className="hover:bg-kraft-accent/5 transition-all">
              <td className="py-6 px-8"><p className="font-black text-base text-kraft-ink">{cost.carName}</p><p className="text-[9px] font-bold uppercase opacity-30 mt-1">{cost.carCode}</p></td>
              <td className="py-6 px-8"><p className="font-black text-sm text-kraft-ink">{cost.note}</p></td>
              <td className="py-6 px-8 text-right"><span className="font-black text-base text-amber-600">{formatCurrency(cost.amount)}</span></td>
              <td className="py-6 px-8 text-right"><span className="text-xs font-black opacity-40 uppercase">{formatDate(cost.date)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const BreakdownCard = ({ data, total }: any) => (
  <section className="liquid-card border-none bg-kraft-ink text-white p-10 shadow-2xl relative h-fit">
    <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10"><BarChart3 size={24} /></div>Cấu trúc chi</h3>
    <div className="space-y-8">
      <BreakdownRow label="Mua xe" value={data?.purchaseOutflow || 0} total={total} color="bg-blue-400" />
      <BreakdownRow label="Chi phí xe" value={data?.carCosts || 0} total={total} color="bg-amber-400" />
      <BreakdownRow label="Vận hành" value={data?.operatingExpenses || 0} total={total} color="bg-rose-400" />
      <BreakdownRow label="Lương nhân viên" value={data?.salaries || 0} total={total} color="bg-emerald-400" />
    </div>
  </section>
);

const BreakdownRow = ({ label, value, total, color }: any) => {
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

const ExpenseFormModal = ({ isOpen, onClose, isEditing, form, setForm, onSubmit }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Chỉnh sửa chi phí" : "Thêm chi phí vận hành"}>
    <form onSubmit={onSubmit} className="p-8 space-y-8">
      <div className="space-y-3"><label className="text-[9px] font-black uppercase opacity-40 px-2">Tên chi phí</label><input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="liquid-input h-14 liquid-glass-core font-black" placeholder="VD: Tiền điện, Marketing..." /></div>
      <SmartAmountInput label="Số tiền chi (VNĐ)" value={form.amount} onChange={(val) => setForm({...form, amount: val})} />
      <div className="space-y-3"><label className="text-[9px] font-black uppercase opacity-40 px-2">Ngày chi</label><div className="relative"><Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-kraft-accent/30" size={18} /><input type="date" required value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="liquid-input h-14 pl-14 liquid-glass-core font-black" /></div></div>
      <button type="submit" className="w-full liquid-button-primary h-16 shadow-kraft-deep"><span className="font-black uppercase tracking-[0.2em]">{isEditing ? "Lưu thay đổi" : "Xác nhận ghi chi phí"}</span></button>
    </form>
  </Modal>
);

const CapitalModal = ({ isOpen, onClose, value, onChange, onSubmit }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Điều chỉnh vốn">
    <div className="p-8 space-y-8">
      <div className="p-6 bg-kraft-accent/5 rounded-3xl border border-kraft-accent/10 flex items-start gap-4"><div className="w-10 h-10 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent"><Wallet size={20} /></div><p className="text-[11px] font-bold leading-relaxed">Điều chỉnh tổng vốn lưu động hệ thống. Ảnh hưởng đến báo cáo tài chính.</p></div>
      <SmartAmountInput label="Tổng vốn thực tế (VNĐ)" value={value} onChange={onChange} />
      <button onClick={onSubmit} className="w-full liquid-button-primary h-16 shadow-kraft-deep"><span className="font-black uppercase tracking-[0.2em]">Chốt số dư vốn</span></button>
    </div>
  </Modal>
);
