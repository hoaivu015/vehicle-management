import React, { useState } from 'react';
import { DollarSign, Plus, Car, Settings, CheckCircle, Clock, CheckSquare, Calendar } from 'lucide-react';
import { EmptyState } from '@/src/shared/design-system/DataDisplay';
import { cn } from '@/src/shared/utils/cn';
import { formatCurrency } from '@/src/shared/utils/currency';
import { UserRole } from '../../../../../shared/domain/constants';
import { StaffExpense } from '../../../../../shared/domain/types';
import { motion } from 'motion/react';

interface ExpenseTableProps {
  expenses: StaffExpense[];
  memberId: string;
  userRole?: string;
  onAddClick: () => void;
  onToggleReimbursement: (staffId: string, expenseId: string) => Promise<void>;
  onUpdateExpense: (staffId: string, expenseId: string, data: StaffExpense) => Promise<void>;
  onReimburseMultiple: (staffId: string, expenseIds: string[]) => Promise<void>;
  filterMonth: string;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ 
  expenses, 
  memberId, 
  userRole, 
  onAddClick, 
  onToggleReimbursement,
  onUpdateExpense,
  onReimburseMultiple,
  filterMonth: initialFilterMonth
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterMonth, setFilterMonth] = useState(initialFilterMonth);
  
  React.useEffect(() => {
    setFilterMonth(initialFilterMonth);
  }, [initialFilterMonth]);
  
  const unreimbursed = expenses.filter(e => !e.is_reimbursed).sort((a, b) => b.date.localeCompare(a.date));
  
  // Only show reimbursed expenses for the SELECTED month
  const reimbursedInSelectedMonth = expenses.filter(e => e.is_reimbursed && e.date.startsWith(filterMonth))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalUnreimbursedAmount = unreimbursed.reduce((sum, e) => sum + e.amount, 0);
  const totalReimbursedAmount = reimbursedInSelectedMonth.reduce((sum, e) => sum + e.amount, 0);


  const handleReimburseSelected = async () => {
    if (selectedIds.length === 0) return;
    await onReimburseMultiple(memberId, selectedIds);
    setSelectedIds([]);
  };

  const selectedTotalAmount = expenses
    .filter(e => selectedIds.includes(e.id))
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingExpenseIds = expenses.filter(e => !e.is_reimbursed).map(e => e.id);

  const togglePayAllPending = async () => {
    if (pendingExpenseIds.length === 0) return;
    await onReimburseMultiple(memberId, pendingExpenseIds);
  };

  const canManageAll = userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT;

  const renderExpenseRow = (expense: StaffExpense) => (
    <motion.tr 
      key={expense.id} 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 25 }}
      style={{ willChange: 'transform, opacity' }}
      onClick={() => canManageAll && onUpdateExpense(memberId, expense.id, expense)}
      className={cn(
        "group transition-all cursor-pointer border-l-4 border-l-transparent scroll-reveal-item",
        canManageAll ? "hover:bg-white/60 hover:border-l-brand" : "opacity-60 cursor-default"
      )}
    >
      <td className="py-3 md:py-3.5 px-6 w-[45%]">
        <span className="text-[12px] font-black uppercase tracking-widest text-kraft-ink">{expense.note}</span>
        <p className="text-[10px] font-bold text-sub-label opacity-30 mt-0.5 tracking-widest">#{expense.date}</p>
      </td>
      <td className="py-3 md:py-3.5 px-6 w-[35%]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            {expense.type === 'vehicle' ? <Car size={14} className="text-warning" /> : <Settings size={14} className="text-brand" />}
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              expense.type === 'vehicle' ? "text-warning" : "text-brand"
            )}>
              {expense.type === 'vehicle' ? 'Chi phí Xe' : 'Vận hành'}
            </span>
          </div>
          {expense.type === 'vehicle' && expense.vehicle_code && (
            <span className="text-[9px] font-black text-warning bg-warning/5 px-2 py-0.5 rounded-md w-fit border border-warning/10 shadow-sm">
              #{expense.vehicle_code}
            </span>
          )}
          {expense.type === 'operating' && expense.category && (
            <span className="text-[9px] font-black text-sub-label opacity-40 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
              {expense.category}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 md:py-3.5 px-6 text-right w-[20%]">
        <div className="flex items-center justify-end gap-3">
          <span className={cn(
            "text-[14px] font-black tracking-tighter tabular-nums transition-all duration-300",
            expense.is_reimbursed 
              ? "text-kraft-ink/30 line-through" 
              : "text-expense animate-[pulse_3s_ease-in-out_infinite]"
          )}>
            {formatCurrency(expense.amount)}
          </span>
          {canManageAll && (
            <motion.button
              whileHover={{ scale: 1.1, y: -0.5 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleReimbursement(memberId, expense.id);
              }}
              className={cn(
                "w-7 h-7 rounded-full border flex items-center justify-center transition-all shadow-sm shrink-0 active-press",
                expense.is_reimbursed 
                  ? "bg-income/5 border-income/10 text-income/60 hover:text-income hover:bg-income/10" 
                  : "bg-warning/10 border-warning/20 text-warning hover:bg-warning/20 animate-[pulse_2s_ease-in-out_infinite]"
              )}
              title={expense.is_reimbursed ? "Đổi thành Chờ hoàn tiền" : "Đổi thành Đã chi lại"}
            >
              {expense.is_reimbursed ? <CheckCircle size={13} /> : <Clock size={13} />}
            </motion.button>
          )}
        </div>
      </td>
    </motion.tr>
  );

  return (
    <div className="space-y-g4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-2 px-2">
         <div className="flex flex-col space-y-3 w-full lg:w-auto">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/30 pl-1">Lịch sử tạm ứng chi phí</h4>
            <div className="flex flex-wrap items-center gap-3">
               <div className={cn(
                 "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all",
                 totalUnreimbursedAmount > 0 
                   ? "bg-warning/10 border-warning/20 text-warning animate-[pulse_3s_ease-in-out_infinite]" 
                   : "bg-slate-100/50 border-hairline text-sub-label/40"
               )}>
                  <Clock size={12} className={totalUnreimbursedAmount > 0 ? "text-warning" : "text-sub-label/30"} />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Chờ hoàn:</span>
                  <span className="text-xs font-black tracking-tighter tabular-nums">{formatCurrency(totalUnreimbursedAmount)}</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-income/5 border border-income/10 rounded-full text-income shadow-sm">
                  <CheckCircle size={12} className="text-income" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Đã hoàn ({filterMonth.split('-')[1]}/{filterMonth.split('-')[0]}):</span>
                  <span className="text-xs font-black tracking-tighter tabular-nums">{formatCurrency(totalReimbursedAmount)}</span>
               </div>
            </div>
         </div>
         
         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative group flex-1 lg:flex-none">
               <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-sub-label/40 group-hover:text-kraft-ink/60 transition-colors z-20">
                 <Calendar size={14} />
               </div>
               <input
                 type="month"
                 value={filterMonth}
                 onChange={(e) => setFilterMonth(e.target.value)}
                 className="liquid-datepicker-dense !h-11 !pl-10 !pr-4 !rounded-full lg:!min-w-[160px] !text-[10px] !font-black !uppercase !tracking-widest"
               />
            </div>

            {canManageAll && (
              <motion.button 
                whileHover={{ scale: 1.02, y: -0.5 }}
                whileTap={{ scale: 0.96 }}
                onClick={onAddClick}
                className="bg-kraft-accent hover:bg-kraft-accent/90 text-white font-black px-6 h-11 rounded-full active-press tracking-widest text-[10px] uppercase flex items-center justify-center gap-2 flex-1 lg:flex-none shadow-md shadow-kraft-accent/10 hover:shadow-lg transition-all duration-300"
              >
                <Plus size={12} strokeWidth={3} />
                <span>Ghi khoản chi</span>
              </motion.button>
            )}

            {selectedIds.length > 0 && canManageAll && (
              <motion.button 
                whileHover={{ scale: 1.02, y: -0.5 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleReimburseSelected}
                className="w-full lg:w-auto bg-income text-white px-6 h-11 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 animate-in zoom-in duration-300 shadow-md shadow-income/20 active-press"
              >
                <CheckCircle size={12} />
                Thanh toán: {formatCurrency(selectedTotalAmount)}
              </motion.button>
            )}
         </div>
      </div>

      {/* Mobile Grid View */}
      <div className="grid grid-cols-1 gap-g4 lg:hidden pb-10 render-boundary-isolated">
        {unreimbursed.length === 0 && reimbursedInSelectedMonth.length === 0 && (
          <div className="bg-white/60 rounded-t2 border border-white/60 p-5 shadow-sm">
            <EmptyState 
              icon={DollarSign} 
              title="Chưa có khoản tạm ứng" 
              description="Hiện tại chưa có dữ liệu chi phí tạm ứng trong bộ lọc tháng này."
              className="py-12 opacity-60"
            />
            <p className="text-[10px] italic text-sub-label/60 text-center -mt-6">
              Hệ thống tự động đồng bộ và lưu trữ lịch sử tạm ứng lương và hoàn trả chi phí.
            </p>
          </div>
        )}

        {unreimbursed.length > 0 && (
          <div className="space-y-3">
             <p className="text-[9px] font-black text-warning uppercase tracking-widest ml-2 opacity-60">Chờ hoàn tiền ({unreimbursed.length})</p>
             {unreimbursed.map(expense => (
               <div key={expense.id} onClick={() => onUpdateExpense(memberId, expense.id, expense)} className="p-4 glass-purity-surface rounded-t2 border border-white/60 space-y-3 relative border-l-4 border-l-warning shadow-kraft-deep active-press transition-all duration-200 scroll-reveal-item">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                       <h5 className="text-[13px] font-black uppercase text-kraft-ink leading-tight tracking-tight">{expense.note}</h5>
                       <p className="text-[9px] font-black text-sub-label opacity-30 mt-0.5 tracking-widest">{expense.date}</p>
                    </div>
                    <p className="text-[13px] font-black text-expense tracking-tighter tabular-nums">{formatCurrency(expense.amount)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-hairline-soft">
                    <div className="flex flex-wrap items-center gap-1.5">
                       {expense.type === 'vehicle' ? <Car size={12} className="text-warning" /> : <Settings size={12} className="text-brand" />}
                       <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          expense.type === 'vehicle' ? "text-warning" : "text-brand"
                       )}>
                          {expense.type === 'vehicle' ? `Xe #${expense.vehicle_code}` : expense.category || 'Vận hành'}
                       </span>
                    </div>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); onToggleReimbursement(memberId, expense.id); }}
                      disabled={!canManageAll}
                      className="px-3 py-1.5 rounded-full bg-warning/10 text-warning border border-warning/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm active-press"
                    >
                      <Clock size={11} className="animate-pulse" />
                      <span>Hoàn tiền</span>
                    </motion.button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {reimbursedInSelectedMonth.length > 0 && (
          <div className="space-y-3 pt-4">
             <p className="text-[9px] font-black text-income uppercase tracking-widest ml-2 opacity-60">Đã chi {filterMonth}</p>
             {reimbursedInSelectedMonth.map(expense => (
               <div 
                 key={expense.id} 
                 onClick={() => canManageAll && onUpdateExpense(memberId, expense.id, expense)}
                 className={cn(
                   "p-4 glass-purity-surface rounded-t2 border border-white/60 space-y-3 opacity-70 border-l-4 border-l-income shadow-sm scroll-reveal-item",
                   canManageAll && "cursor-pointer active:scale-[0.98] hover:bg-white/60 transition-all active-press"
                 )}
               >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                       <h5 className="text-[12px] font-black text-kraft-ink opacity-60 uppercase tracking-tight leading-tight">{expense.note}</h5>
                       <p className="text-[9px] font-black text-sub-label opacity-20 mt-0.5 tracking-widest">{expense.date}</p>
                    </div>
                    <p className="text-xs font-black text-sub-label opacity-30 line-through tracking-tighter tabular-nums">{formatCurrency(expense.amount)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-income flex items-center gap-1.5 tracking-widest">
                       <CheckCircle size={11} />
                       Đã thanh toán
                    </span>
                    <span className="text-[9px] font-black text-sub-label opacity-20 tracking-widest">#{expense.type === 'vehicle' ? expense.vehicle_code : 'VH'}</span>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white/60 rounded-t2 border border-white/60 shadow-kraft-deep overflow-hidden overflow-x-auto render-boundary-isolated">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-surface-soft/50 border-b border-hairline-soft">
            <tr>
              <th className="py-3.5 px-6 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-30 w-[45%]">Nội dung / Ngày</th>
              <th className="py-3.5 px-6 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-30 w-[35%]">Phân loại / Mã xe</th>
              <th className="py-3.5 px-6 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-30 text-right w-[20%]">
                <div className="flex items-center justify-end gap-3">
                  <div className="flex flex-col items-end">
                    <span>Số tiền</span>
                    <span className="text-[9px] text-warning font-black tracking-widest">Chờ chi: {formatCurrency(totalUnreimbursedAmount)}</span>
                  </div>
                  {canManageAll && (
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePayAllPending();
                      }}
                      className={cn(
                        "p-2 rounded-lg border transition-all shadow-sm shrink-0",
                        pendingExpenseIds.length > 0 ? "bg-warning text-white border-warning shadow-warning/20" : "bg-white border-hairline-soft text-sub-label opacity-20"
                      )}
                      title="Thanh toán toàn bộ"
                    >
                      <CheckSquare size={14} />
                    </motion.button>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {unreimbursed.length > 0 && (
              <>
                <tr className="bg-warning/5">
                  <td colSpan={3} className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-warning" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-warning">Chờ hoàn tiền</span>
                    </div>
                  </td>
                </tr>
                {unreimbursed.map(renderExpenseRow)}
              </>
            )}

            {reimbursedInSelectedMonth.length > 0 && (
              <>
                <tr className="bg-income/5">
                  <td colSpan={3} className="py-3 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={12} className="text-income" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-income">Đã chi tháng {filterMonth.split('-')[1]}/{filterMonth.split('-')[0]}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-sub-label opacity-40">
                        Tổng tháng: <span className="text-income tabular-nums">{formatCurrency(totalReimbursedAmount)}</span>
                      </span>
                    </div>
                  </td>
                </tr>
                {reimbursedInSelectedMonth.map(renderExpenseRow)}
              </>
            )}

            {unreimbursed.length === 0 && reimbursedInSelectedMonth.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <EmptyState 
                    icon={DollarSign} 
                    title="Chưa có khoản tạm ứng" 
                    description="Hiện tại chưa có dữ liệu chi phí tạm ứng trong bộ lọc tháng này."
                    className="py-12 opacity-60"
                  />
                  <p className="text-[10px] italic text-sub-label/60 text-center pb-8 -mt-6">
                    Hệ thống tự động đồng bộ và lưu trữ lịch sử tạm ứng lương và hoàn trả chi phí.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
