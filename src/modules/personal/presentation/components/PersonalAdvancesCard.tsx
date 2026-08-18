import React from 'react';
import { DollarSign, Clock, CheckCircle, Plus, Car, Settings, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { formatCurrency } from '@/src/shared/utils/currency';
import { StaffExpense } from '@/src/shared/domain/types';

interface PersonalAdvancesCardProps {
  expenses: StaffExpense[];
  onAddClick: () => void;
  onEditClick: (expense: StaffExpense) => void;
  onDeleteClick: (expenseId: string) => void;
  selectedMonth: string;
}

export const PersonalAdvancesCard: React.FC<PersonalAdvancesCardProps> = ({ 
  expenses, 
  onAddClick,
  onEditClick,
  onDeleteClick,
  selectedMonth
}) => {
  const unreimbursed = React.useMemo(() => 
    expenses.filter(e => !e.is_reimbursed).sort((a, b) => b.date.localeCompare(a.date)),
  [expenses]);

  const reimbursedInSelectedMonth = React.useMemo(() => 
    expenses.filter(e => e.is_reimbursed && e.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date)),
  [expenses, selectedMonth]);

  const totalUnreimbursedAmount = React.useMemo(() => 
    unreimbursed.reduce((sum, e) => sum + e.amount, 0),
  [unreimbursed]);

  const totalReimbursedInMonth = React.useMemo(() => 
    reimbursedInSelectedMonth.reduce((sum, e) => sum + e.amount, 0),
  [reimbursedInSelectedMonth]);



  const renderExpenseCard = (expense: StaffExpense) => (
    <div key={expense.id} className="group relative glass-surface-soft border border-hairline-soft rounded-xl py-3 px-5 hover:border-kraft-accent/30 transition-all duration-300 shadow-sm hover:shadow-kraft-deep">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
            expense.type === 'vehicle' ? "bg-brand/10 text-brand border-brand/20" : "bg-kraft-accent/10 text-kraft-accent border-kraft-accent/20"
          )}>
            {expense.type === 'vehicle' ? <Car size={18} /> : <Settings size={18} />}
          </div>
          <div>
            <p className="font-black text-xs text-kraft-ink tracking-tight uppercase leading-tight">{expense.note}</p>
            <p className="text-[10px] font-bold text-sub-label uppercase mt-1">
              {expense.date} {expense.vehicle_code ? `• #${expense.vehicle_code}` : ''}
            </p>
          </div>
        </div>
        <p className="font-black text-sm text-kraft-ink tracking-tighter shrink-0 whitespace-nowrap">
          {formatCurrency(expense.amount)}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-black text-[10px] uppercase tracking-widest whitespace-nowrap",
          expense.is_reimbursed 
            ? "bg-income/10 border-income/20 text-income" 
            : "bg-expense-light/40 border-expense/20 text-expense"
        )}>
          {expense.is_reimbursed ? <CheckCircle size={10} /> : <Clock size={10} />}
          {expense.is_reimbursed ? 'Đã chi lại' : 'Chờ hoàn'}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!expense.is_reimbursed && (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => onEditClick(expense)}
              className="w-10 h-10 flex items-center justify-center text-sub-label hover:text-kraft-accent hover:bg-kraft-accent/10 rounded-xl transition-all"
            >
              <Edit2 size={16} />
            </motion.button>
          )}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (confirm('Xóa khoản chi này?')) onDeleteClick(expense.id);
            }}
            className="w-10 h-10 flex items-center justify-center text-sub-label hover:text-expense hover:bg-expense-light rounded-xl transition-all"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, x: 20, rotate: 1, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, x: 0, rotate: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.35 }}
      style={{ willChange: 'transform, opacity' }}
      className="liquid-card border-white/60 !p-0 shadow-[var(--shadow-kraft-deep)] overflow-hidden rounded-t1 flex flex-col h-full"
    >
      <div className="p-4 md:p-8 border-b border-hairline-soft bg-kraft-accent/5 flex items-center justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-lg md:text-xl font-black uppercase flex items-center gap-3 md:gap-4 text-kraft-accent font-heading tracking-tighter">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-kraft-accent/10 flex items-center justify-center shrink-0">
              <DollarSign size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
            Chi phí & Hoàn ứng
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-1 ml-12 md:ml-16">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-sub-label whitespace-nowrap">Chờ hoàn:</span>
              <span className="text-xs font-black text-kraft-accent tracking-tighter whitespace-nowrap">{formatCurrency(totalUnreimbursedAmount)}</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-sub-label whitespace-nowrap">Đã chi ({selectedMonth}):</span>
              <span className="text-xs font-black text-income tracking-tighter whitespace-nowrap">{formatCurrency(totalReimbursedInMonth)}</span>
            </div>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={onAddClick}
          className="w-10 h-10 md:w-11 md:h-11 bg-kraft-accent text-white rounded-xl hover:opacity-80 transition-all shadow-kraft-deep flex items-center justify-center shrink-0"
          title="Thêm khoản chi"
        >
          <Plus size={18} className="md:w-5 md:h-5" strokeWidth={3} />
        </motion.button>
      </div>
      
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto custom-scrollbar max-h-[600px]">
        {unreimbursed.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 px-1 md:px-2">
              <Clock size={14} className="text-expense shrink-0" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-expense whitespace-nowrap">Chờ hoàn tiền</h4>
              <div className="h-px flex-1 bg-expense/10 ml-2" />
            </div>
            <div className="space-y-3 md:space-y-4">
              {unreimbursed.map(renderExpenseCard)}
            </div>
          </div>
        )}

        {reimbursedInSelectedMonth.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between px-1 md:px-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-income shrink-0" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-income whitespace-nowrap">Đã chi tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}</h4>
              </div>
              <span className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest whitespace-nowrap">
                Tổng tháng: <span className="text-emerald-600 whitespace-nowrap">{formatCurrency(totalReimbursedInMonth)}</span>
              </span>
            </div>
            <div className="space-y-3 md:space-y-4">
              {reimbursedInSelectedMonth.map(renderExpenseCard)}
            </div>
          </div>
        )}

        {expenses.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-kraft-accent/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-kraft-accent/10 opacity-30">
              <DollarSign size={24} className="text-kraft-accent" />
            </div>
            <p className="text-sub-label !opacity-30 italic">Chưa có khoản chi phí nào</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
