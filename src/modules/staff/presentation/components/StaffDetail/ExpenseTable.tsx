import React, { useState } from 'react';
import { DollarSign, Plus, Car, Settings, CheckCircle, Clock, Trash2, Edit2, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { formatCurrency } from '@/src/utils/currency';
import { UserRole } from '@/src/shared/domain/constants';
import { StaffExpense } from '@/src/shared/domain/types';

interface ExpenseTableProps {
  expenses: StaffExpense[];
  memberId: string;
  userRole?: string;
  onAddClick: () => void;
  onToggleReimbursement: (staffId: string, expenseId: string) => Promise<void>;
  onDeleteExpense: (staffId: string, expenseId: string) => Promise<void>;
  onUpdateExpense: (staffId: string, expenseId: string, data: any) => Promise<void>;
  onReimburseMultiple: (staffId: string, expenseIds: string[]) => Promise<void>;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ 
  expenses, 
  memberId, 
  userRole, 
  onAddClick, 
  onToggleReimbursement,
  onDeleteExpense,
  onUpdateExpense,
  onReimburseMultiple
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isAllSelected = expenses.length > 0 && selectedIds.length === expenses.length;
  
  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(expenses.map(e => e.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleReimburseSelected = async () => {
    if (selectedIds.length === 0) return;
    await onReimburseMultiple(memberId, selectedIds);
    setSelectedIds([]);
  };

  const selectedTotalAmount = expenses
    .filter(e => selectedIds.includes(e.id))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalUnreimbursedAmount = expenses
    .filter(e => !e.is_reimbursed)
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingExpenseIds = expenses.filter(e => !e.is_reimbursed).map(e => e.id);
  const isAllPendingSelected = pendingExpenseIds.length > 0 && pendingExpenseIds.every(id => selectedIds.includes(id));

  const togglePayAllPending = async () => {
    if (pendingExpenseIds.length === 0) return;
    await onReimburseMultiple(memberId, pendingExpenseIds);
  };

  const canManageAll = userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 px-2">
         <div className="flex items-center gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">Lịch sử tạm ứng chi phí</h4>
            {selectedIds.length > 0 && canManageAll && (
              <button 
                onClick={handleReimburseSelected}
                className="bg-emerald-500 text-white px-5 h-10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 animate-in zoom-in duration-300 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle size={12} />
                Thanh toán: {formatCurrency(selectedTotalAmount)} ({selectedIds.length} khoản)
              </button>
            )}
         </div>
         <button 
           onClick={onAddClick}
           className="liquid-button-primary h-10 px-6 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
         >
           <Plus size={14} strokeWidth={3} />
           Ghi khoản chi
         </button>
      </div>

      <div className="bg-white/60 rounded-[2.5rem] border border-white/60 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-black/[0.02] border-b border-black/5">
            <tr>
              <th className="py-6 px-4 text-sub-label !opacity-30">Nội dung / Ngày</th>
              <th className="py-6 px-4 text-sub-label !opacity-30">Phân loại / Mã xe</th>
              <th className="py-6 px-4 text-sub-label !opacity-30 text-right">
                <div className="flex items-center justify-end gap-3">
                  <div className="flex flex-col items-end">
                    <span>Số tiền</span>
                    <span className="text-[8px] text-amber-600 font-black">Chưa chi: {formatCurrency(totalUnreimbursedAmount)}</span>
                  </div>
                  {canManageAll && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePayAllPending();
                      }}
                      className={cn(
                        "p-2 rounded-lg border transition-all",
                        pendingExpenseIds.length > 0 ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" : "bg-white border-black/10 text-black/20"
                      )}
                      title="Thanh toán toàn bộ"
                    >
                      <CheckSquare size={14} />
                    </button>
                  )}
                </div>
              </th>
              <th className="py-6 px-4 text-sub-label !opacity-30 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {expenses.sort((a, b) => b.date.localeCompare(a.date)).map(expense => (
              <tr 
                key={expense.id} 
                onClick={() => !expense.is_reimbursed && onUpdateExpense(memberId, expense.id, expense)}
                className={cn(
                  "group transition-all cursor-pointer border-l-4 border-l-transparent",
                  !expense.is_reimbursed ? "hover:bg-white/60 hover:border-l-kraft-accent" : "opacity-60 cursor-default"
                )}
              >
                <td className="py-8 px-4">
                  <span className="text-[12px] font-black uppercase tracking-widest text-kraft-ink">{expense.note}</span>
                  <p className="text-[9px] font-bold text-kraft-ink/20 uppercase mt-1">{expense.date}</p>
                </td>
                <td className="py-8 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {expense.type === 'vehicle' ? <Car size={14} className="text-amber-500" /> : <Settings size={14} className="text-indigo-500" />}
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        expense.type === 'vehicle' ? "text-amber-600" : "text-indigo-600"
                      )}>
                        {expense.type === 'vehicle' ? 'Chi phí Xe' : 'Vận hành'}
                      </span>
                    </div>
                    {expense.type === 'vehicle' && expense.vehicle_code && (
                      <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md w-fit border border-amber-100/50">
                        #{expense.vehicle_code}
                      </span>
                    )}
                    {expense.type === 'operating' && expense.category && (
                      <span className="text-[11px] font-bold text-kraft-ink/40 uppercase tracking-tighter">
                        {expense.category}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-8 px-4 text-[14px] font-black text-right tracking-tighter text-red-500">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="py-8 px-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleReimbursement(memberId, expense.id);
                    }}
                    disabled={!canManageAll}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all mx-auto",
                      expense.is_reimbursed 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                        : "bg-amber-500/5 border-amber-500/20 text-amber-600 hover:bg-amber-500/10",
                      !canManageAll && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {expense.is_reimbursed ? <CheckCircle size={14} /> : <Clock size={14} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {expense.is_reimbursed ? 'Đã chi lại' : 'Chờ hoàn tiền'}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={4} className="py-32 text-center opacity-10">
                  <DollarSign size={64} className="mx-auto mb-6" strokeWidth={1} />
                  <p className="text-[12px] font-black uppercase tracking-[0.4em]">No Advances Found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

