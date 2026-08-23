import React from 'react';
import { DollarSign, Clock, CheckCircle2, Plus, Car, Settings, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { formatCurrency } from '@/src/shared/utils/currency';
import { StaffExpense } from '@/src/shared/domain/types';
import { haptics } from '@/src/shared/utils/haptics';
import { formatDate } from '@/src/shared/utils/date';

import { StaffSalaryService } from '@/src/modules/staff/domain/StaffSalaryService';

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
  // Khoản chi hộ (công ty nợ nhân viên)
  const unreimbursedReimbursements = React.useMemo(() => 
    expenses.filter(e => !e.is_reimbursed && !StaffSalaryService.isSalaryAdvance(e))
      .sort((a, b) => b.date.localeCompare(a.date)),
  [expenses]);

  // Khoản tạm ứng lương (nhân viên đã nhận trước, sẽ khấu trừ khi tính lương)
  const unreimbursedAdvances = React.useMemo(() => 
    expenses.filter(e => !e.is_reimbursed && StaffSalaryService.isSalaryAdvance(e))
      .sort((a, b) => b.date.localeCompare(a.date)),
  [expenses]);

  const reimbursedInSelectedMonth = React.useMemo(() => 
    expenses.filter(e => e.is_reimbursed && e.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date)),
  [expenses, selectedMonth]);

  const totalReimbursementsToReceive = React.useMemo(() => 
    unreimbursedReimbursements.reduce((sum, e) => sum + e.amount, 0),
  [unreimbursedReimbursements]);

  const totalAdvancesToDeduct = React.useMemo(() => 
    unreimbursedAdvances.reduce((sum, e) => sum + e.amount, 0),
  [unreimbursedAdvances]);

  const totalReimbursedInMonth = React.useMemo(() => 
    reimbursedInSelectedMonth.reduce((sum, e) => sum + e.amount, 0),
  [reimbursedInSelectedMonth]);

  const handleAdd = () => {
    haptics.light();
    onAddClick();
  };

  const handleEdit = (exp: StaffExpense) => {
    haptics.light();
    onEditClick(exp);
  };

  const handleDelete = (id: string) => {
    haptics.heavy();
    if (window.confirm('Bạn có chắc chắn muốn xóa khoản chi phí này?')) {
      onDeleteClick(id);
    }
  };

  const renderExpenseCard = (expense: StaffExpense) => {
    const isAdvance = StaffSalaryService.isSalaryAdvance(expense);
    return (
      <div 
        key={expense.id} 
        className="group relative bg-white/70 backdrop-blur-sm border border-hairline-soft rounded-xl p-4 hover:border-kraft-accent/30 transition-all duration-300 shadow-sm hover:shadow-kraft-deep"
      >
        <div className="flex justify-between items-start mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
              isAdvance 
                ? "bg-amber-50 text-amber-600 border-amber-200" 
                : expense.type === 'vehicle' 
                  ? "bg-blue-50 text-blue-600 border-blue-100" 
                  : "bg-kraft-accent/10 text-kraft-accent border-kraft-accent/20"
            )}>
              {isAdvance ? <DollarSign size={16} /> : expense.type === 'vehicle' ? <Car size={16} /> : <Settings size={16} />}
            </div>
            <div className="min-w-0">
              <p className="font-black text-xs text-kraft-ink tracking-tight uppercase leading-snug truncate">
                {expense.note}
              </p>
              <p className="text-[10px] font-bold text-sub-label opacity-60 uppercase mt-0.5">
                {formatDate(expense.date)} {expense.vehicle_code ? `• #${expense.vehicle_code}` : ''}
              </p>
            </div>
          </div>
          <p className={cn(
            "font-black text-xs sm:text-sm tracking-tight shrink-0 whitespace-nowrap pl-2",
            isAdvance ? "text-amber-600" : "text-kraft-ink"
          )}>
            {isAdvance ? `-${formatCurrency(expense.amount)}` : `+${formatCurrency(expense.amount)}`}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-black text-[9px] uppercase tracking-widest whitespace-nowrap shadow-sm",
            isAdvance
              ? expense.is_reimbursed 
                ? "bg-income/10 border-income/20 text-income"
                : "bg-amber-500/10 border-amber-500/20 text-amber-700"
              : expense.is_reimbursed 
                ? "bg-income/10 border-income/20 text-income" 
                : "bg-blue-500/10 border-blue-500/20 text-blue-700"
          )}>
            {expense.is_reimbursed ? <CheckCircle2 size={10} /> : <Clock size={10} />}
            {isAdvance
              ? (expense.is_reimbursed ? 'Đã khấu trừ lương' : 'Tạm ứng • Trừ vào lương')
              : (expense.is_reimbursed ? 'Đã hoàn ứng' : 'Chi hộ • Chờ hoàn tiền')}
          </span>

          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {!expense.is_reimbursed && (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEdit(expense)}
                className="w-8 h-8 flex items-center justify-center text-sub-label hover:text-kraft-accent hover:bg-kraft-accent/10 rounded-lg transition-colors"
                title="Chỉnh sửa"
              >
                <Edit2 size={14} />
              </motion.button>
            )}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDelete(expense.id)}
              className="w-8 h-8 flex items-center justify-center text-sub-label hover:text-expense hover:bg-expense-light rounded-lg transition-colors"
              title="Xóa khoản chi"
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, x: 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.35 }}
      style={{ willChange: 'transform, opacity' }}
      className="liquid-card border-hairline-soft !p-0 shadow-kraft-deep overflow-hidden rounded-t2 flex flex-col justify-between h-full"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-hairline-soft bg-kraft-accent/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-kraft-accent/10 flex items-center justify-center shrink-0 border border-kraft-accent/20">
            <DollarSign size={20} strokeWidth={2.5} className="text-kraft-accent" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase text-kraft-accent font-heading tracking-tight">
              Chi phí & Tạm ứng
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black uppercase tracking-widest text-sub-label mt-0.5">
              <span>Chờ hoàn (+): <b className={totalReimbursementsToReceive > 0 ? "text-blue-600 font-black" : "text-sub-label"}>{formatCurrency(totalReimbursementsToReceive)}</b></span>
              {totalAdvancesToDeduct > 0 && (
                <span>Đã tạm ứng (-): <b className="text-amber-600 font-black">{formatCurrency(totalAdvancesToDeduct)}</b></span>
              )}
            </div>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className="w-10 h-10 bg-kraft-accent text-white rounded-xl hover:brightness-110 transition-all shadow-kraft-deep flex items-center justify-center shrink-0"
          title="Ghi thêm khoản chi/tạm ứng"
        >
          <Plus size={18} strokeWidth={3} />
        </motion.button>
      </div>
      
      {/* Expense list */}
      <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar max-h-[420px]">
        {/* 1. Khoản chi hộ chờ hoàn ứng */}
        {unreimbursedReimbursements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-600 shrink-0" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                Khoản chi hộ chờ hoàn tiền ({unreimbursedReimbursements.length})
              </h4>
              <div className="h-px flex-1 bg-blue-600/10" />
            </div>
            <div className="space-y-3">
              {unreimbursedReimbursements.map(renderExpenseCard)}
            </div>
          </div>
        )}

        {/* 2. Khoản tạm ứng lương */}
        {unreimbursedAdvances.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-amber-600 shrink-0" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                Khoản đã tạm ứng lương ({unreimbursedAdvances.length})
              </h4>
              <div className="h-px flex-1 bg-amber-600/10" />
            </div>
            <div className="space-y-3">
              {unreimbursedAdvances.map(renderExpenseCard)}
            </div>
          </div>
        )}

        {/* 3. Khoản đã hoàn ứng/khấu trừ tháng này */}
        {reimbursedInSelectedMonth.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-income shrink-0" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-income">
                  Đã quyết toán tháng {selectedMonth.split('-')[1]} ({reimbursedInSelectedMonth.length})
                </h4>
              </div>
              <span className="text-[10px] font-black text-income">
                {formatCurrency(totalReimbursedInMonth)}
              </span>
            </div>
            <div className="space-y-3">
              {reimbursedInSelectedMonth.map(renderExpenseCard)}
            </div>
          </div>
        )}

        {expenses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-kraft-accent/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-kraft-accent/10 opacity-40">
              <DollarSign size={20} className="text-kraft-accent" />
            </div>
            <p className="text-sub-label text-xs opacity-50 italic">Chưa có khoản chi phí nào</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-5 border-t border-hairline-soft bg-black/[0.01] flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-sub-label">
        <span>Tổng chi phí đã ghi nhận</span>
        <span className="text-xs font-black text-kraft-ink">
          {formatCurrency(totalReimbursementsToReceive + totalAdvancesToDeduct + totalReimbursedInMonth)}
        </span>
      </div>
    </motion.div>
  );
};
