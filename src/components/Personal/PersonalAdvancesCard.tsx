import React from 'react';
import { DollarSign, Clock, CheckCircle, Plus, Car, Settings, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/utils/cn';
import { formatCurrency } from '@/src/utils/currency';
import { StaffExpense } from '@/src/shared/domain/types';

interface PersonalAdvancesCardProps {
  expenses: StaffExpense[];
  onAddClick: () => void;
  onEditClick: (expense: StaffExpense) => void;
  onDeleteClick: (expenseId: string) => void;
}

export const PersonalAdvancesCard: React.FC<PersonalAdvancesCardProps> = ({ 
  expenses, 
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
      className="liquid-card border-white/60 !p-0 shadow-[var(--shadow-kraft-deep)] overflow-hidden rounded-t1 flex flex-col h-full"
    >
      <div className="p-8 border-b border-black/5 bg-kraft-accent/5 flex items-center justify-between">
        <h3 className="text-xl font-black uppercase flex items-center gap-4 text-kraft-accent font-heading tracking-tighter">
          <div className="p-3 rounded-t3 bg-kraft-accent/10">
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
          Tạm ứng & Chi phí
        </h3>
        <button 
          onClick={onAddClick}
          className="bg-kraft-accent text-white p-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-kraft-accent/20 active:scale-95"
          title="Thêm khoản chi"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>
      
      <div className="p-8 space-y-4 flex-1 overflow-y-auto custom-scrollbar max-h-[600px]">
        {expenses.slice(0, 15).sort((a, b) => b.date.localeCompare(a.date)).map((expense, i) => (
          <div key={expense.id} className="group relative bg-white/40 border border-white/60 rounded-t2 p-5 hover:border-kraft-accent/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                  expense.type === 'vehicle' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                )}>
                  {expense.type === 'vehicle' ? <Car size={14} /> : <Settings size={14} />}
                </div>
                <div>
                  <p className="font-black text-[12px] text-kraft-ink tracking-tight uppercase leading-tight">{expense.note}</p>
                  <p className="text-[9px] font-bold text-kraft-ink/30 uppercase mt-1">
                    {expense.date} {expense.vehicle_code ? `• #${expense.vehicle_code}` : ''}
                  </p>
                </div>
              </div>
              <p className="font-black text-sm text-red-500 tracking-tighter shrink-0">
                {formatCurrency(expense.amount)}
              </p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-black text-[8px] uppercase tracking-widest",
                expense.is_reimbursed 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                  : "bg-amber-500/5 border-amber-500/20 text-amber-600"
              )}>
                {expense.is_reimbursed ? <CheckCircle size={10} /> : <Clock size={10} />}
                {expense.is_reimbursed ? 'Đã chi lại' : 'Chờ hoàn'}
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!expense.is_reimbursed && (
                  <button 
                    onClick={() => onEditClick(expense)}
                    className="p-1.5 text-kraft-ink/30 hover:text-kraft-accent hover:bg-kraft-accent/10 rounded-lg transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (confirm('Xóa khoản chi này?')) onDeleteClick(expense.id);
                  }}
                  className="p-1.5 text-kraft-ink/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {expenses.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-kraft-accent/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-kraft-accent/10 opacity-30">
              <DollarSign size={24} className="text-kraft-accent" />
            </div>
            <p className="text-sub-label !opacity-30 italic">Chưa có khoản tạm ứng nào</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
