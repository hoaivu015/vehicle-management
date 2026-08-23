import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
   Clock, User, ArrowDownLeft, ArrowUpRight, 
   HandCoins, TrendingUp
} from 'lucide-react';
import { Vehicle } from '@/src/shared/domain/types';
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_CONFIG } from '@/src/shared/domain/constants';
import { cn } from '@/src/shared/utils/cn';
import { formatDate } from './VehicleDetailModalShared';
import { formatCurrency } from '@/src/shared/utils/currency';
import { 
   VehicleTimelineService, 
   TimelineCategory 
} from '@/src/modules/inventory/domain/services/VehicleTimelineService';

interface HistoryTabProps {
   vehicle: Vehicle;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ vehicle }) => {
   const [activeCategory, setActiveCategory] = useState<TimelineCategory>('all');

   // 1. Tổng hợp Dòng thời gian toàn diện (Unified Timeline)
   const allEvents = useMemo(() => {
      return VehicleTimelineService.buildUnifiedTimeline(vehicle);
   }, [vehicle]);

   // 2. Tính toán tóm tắt tài chính (Tổng thu, Tổng chi, Chênh lệch)
   const summary = useMemo(() => {
      return VehicleTimelineService.calculateFinancialSummary(vehicle, allEvents);
   }, [vehicle, allEvents]);

   // 3. Lọc theo danh mục được chọn
   const filteredEvents = useMemo(() => {
      return VehicleTimelineService.filterEvents(allEvents, activeCategory);
   }, [allEvents, activeCategory]);

   // Đếm số lượng sự kiện theo từng loại
   const counts = useMemo(() => {
      return {
         all: allEvents.length,
         income: allEvents.filter(e => e.category === 'income').length,
         expense: allEvents.filter(e => e.category === 'expense').length,
         status: allEvents.filter(e => e.category === 'status').length
      };
   }, [allEvents]);

   return (
      <motion.div
         key="hist"
         initial={{ opacity: 0, x: 20 }} 
         animate={{ opacity: 1, x: 0 }} 
         exit={{ opacity: 0, x: -20 }}
         className="space-y-4 pb-20"
      >
         {/* ── 1. FINANCIAL SUMMARY BAR (TÓM TẮT DÒNG TIỀN ĐẦU XE) ── */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Tổng Thu */}
            <div className="p-3.5 bg-income/[0.04] rounded-2xl border border-income/15 flex items-center justify-between shadow-2xs">
               <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-income">
                     <ArrowDownLeft size={13} strokeWidth={2.5} />
                     <span className="text-[10px] font-black uppercase tracking-wider">Tổng Thu</span>
                  </div>
                  <p className="text-base font-black font-mono text-income truncate">
                     {formatCurrency(summary.totalIncome)}
                  </p>
               </div>
               <span className="text-[10px] font-bold text-income/70 bg-income/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {counts.income} giao dịch
               </span>
            </div>

            {/* Tổng Chi */}
            <div className="p-3.5 bg-expense/[0.04] rounded-2xl border border-expense/15 flex items-center justify-between shadow-2xs">
               <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-expense">
                     <ArrowUpRight size={13} strokeWidth={2.5} />
                     <span className="text-[10px] font-black uppercase tracking-wider">Tổng Chi</span>
                  </div>
                  <p className="text-base font-black font-mono text-expense truncate">
                     {formatCurrency(summary.totalExpense)}
                  </p>
               </div>
               <span className="text-[10px] font-bold text-expense/70 bg-expense/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {counts.expense} mục chi
               </span>
            </div>

            {/* Dòng tiền ròng / Chênh lệch */}
            <div className={cn(
               "p-3.5 rounded-2xl border flex items-center justify-between shadow-2xs",
               summary.netCashFlow >= 0 
                  ? "bg-white border-hairline-soft" 
                  : "bg-expense/10 border-expense/20"
            )}>
               <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-sub-label">
                     <TrendingUp size={13} strokeWidth={2.5} />
                     <span className="text-[10px] font-black uppercase tracking-wider">Dòng Tiền Ròng</span>
                  </div>
                  <p className={cn(
                     "text-base font-black font-mono truncate",
                     summary.netCashFlow >= 0 ? "text-kraft-ink" : "text-expense"
                  )}>
                     {summary.netCashFlow > 0 ? `+${formatCurrency(summary.netCashFlow)}` : formatCurrency(summary.netCashFlow)}
                  </p>
               </div>
               <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                  summary.netCashFlow >= 0 ? "bg-surface-soft text-kraft-ink/70" : "bg-expense/20 text-expense"
               )}>
                  SSoT
               </span>
            </div>
         </div>

         {/* ── 2. CARD TIMELINE CHÍNH ── */}
         <div className="bg-white rounded-2xl md:rounded-[22px] p-4 sm:p-6 border border-hairline-soft shadow-2xs space-y-4">
            {/* Header + Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline-soft">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
                     <Clock size={16} />
                  </div>
                  <div>
                     <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-kraft-ink">
                        Dòng Thời Gian Toàn Diện
                     </h3>
                     <p className="text-[10px] text-sub-label font-bold">
                        Nhật ký biến động trạng thái & dòng tiền thu chi của xe
                     </p>
                  </div>
               </div>

               {/* Filter Pills */}
               <div className="flex items-center gap-1 bg-surface-soft/80 p-1 rounded-full border border-hairline-soft overflow-x-auto custom-scrollbar">
                  <button
                     type="button"
                     onClick={() => setActiveCategory('all')}
                     className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                        activeCategory === 'all'
                           ? "bg-white text-kraft-ink shadow-2xs border border-hairline-soft"
                           : "text-sub-label hover:text-kraft-ink"
                     )}
                  >
                     Tất cả ({counts.all})
                  </button>

                  <button
                     type="button"
                     onClick={() => setActiveCategory('income')}
                     className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1",
                        activeCategory === 'income'
                           ? "bg-income text-white shadow-2xs"
                           : "text-income hover:bg-income/10"
                     )}
                  >
                     <span className="w-1.5 h-1.5 rounded-full bg-current" />
                     <span>Thu ({counts.income})</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setActiveCategory('expense')}
                     className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1",
                        activeCategory === 'expense'
                           ? "bg-expense text-white shadow-2xs"
                           : "text-expense hover:bg-expense/10"
                     )}
                  >
                     <span className="w-1.5 h-1.5 rounded-full bg-current" />
                     <span>Chi ({counts.expense})</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setActiveCategory('status')}
                     className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                        activeCategory === 'status'
                           ? "bg-kraft-ink text-white shadow-2xs"
                           : "text-sub-label hover:text-kraft-ink"
                     )}
                  >
                     Trạng thái ({counts.status})
                  </button>
               </div>
            </div>

            {/* ── 3. TIMELINE STEM & NODES ── */}
            <div className="relative pl-6 sm:pl-8 space-y-4 sm:space-y-6 pb-2 pt-2">
               {/* Timeline vertical stem line */}
               <div className="absolute left-2.5 sm:left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-kraft-accent via-kraft-accent/20 to-transparent opacity-40" />
               
               <AnimatePresence mode="popLayout">
                  {filteredEvents.map((event, idx) => {
                     const isLatest = idx === filteredEvents.length - 1;
                     const isIncome = event.category === 'income';
                     const isExpense = event.category === 'expense';
                     const isStatus = event.category === 'status';

                     // Node dot styling
                     const nodeDotBorder = isIncome 
                        ? "border-income" 
                        : isExpense 
                        ? "border-expense" 
                        : "border-kraft-accent";

                     const nodeDotBg = isIncome 
                        ? "bg-income" 
                        : isExpense 
                        ? "bg-expense" 
                        : "bg-kraft-accent";

                     const nodeRing = isIncome 
                        ? "ring-income/20" 
                        : isExpense 
                        ? "ring-expense/20" 
                        : "ring-kraft-accent/15";

                     return (
                        <motion.div 
                           key={event.id} 
                           initial={{ opacity: 0, x: -8 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -8 }}
                           transition={{ delay: idx * 0.02 }}
                           className="relative"
                        >
                           {/* Timeline node dot */}
                           <div className={cn(
                              "absolute -left-[20.5px] sm:-left-[24.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all z-10",
                              nodeDotBorder,
                              isLatest && cn("shadow-xs ring-4", nodeRing)
                           )}>
                              {isLatest && <span className={cn("block w-1.5 h-1.5 rounded-full m-auto mt-[2px]", nodeDotBg)} />}
                           </div>
                           
                           {/* Event Card Container */}
                           <div className={cn(
                              "flex flex-col gap-2 p-3 sm:p-3.5 rounded-xl border transition-all shadow-2xs",
                              isIncome && "bg-income/[0.02] border-income/15 hover:bg-income/[0.04]",
                              isExpense && "bg-expense/[0.02] border-expense/15 hover:bg-expense/[0.04]",
                              isStatus && "bg-surface-soft/60 border-hairline-soft hover:bg-surface-soft"
                           )}>
                              {/* Row 1: Date & Type Badge & Amount & User */}
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                 {/* Date Badge */}
                                 <span className="text-[10px] font-mono font-black text-kraft-accent bg-kraft-accent/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                    {formatDate(event.date)}
                                 </span>

                                 {/* Event Badge */}
                                 {event.status ? (
                                    <span className={cn(
                                       "px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full text-white shadow-2xs leading-none whitespace-nowrap",
                                       VEHICLE_STATUS_CONFIG[event.status]?.badgeClass || "bg-kraft-ink"
                                    )}>
                                       {VEHICLE_STATUS_LABELS[event.status] || event.status}
                                    </span>
                                 ) : (
                                    <span className={cn(
                                       "px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full text-white shadow-2xs leading-none whitespace-nowrap",
                                       event.type === 'EXPENSE_PURCHASE' ? "bg-amber-600" :
                                       event.type === 'EXPENSE_COST' ? "bg-purple-600" :
                                       event.type === 'REFUND' ? "bg-expense" : "bg-income"
                                    )}>
                                       {event.type === 'EXPENSE_PURCHASE' ? 'Chi mua xe' :
                                        event.type === 'EXPENSE_COST' ? 'Chi phí Spa' :
                                        event.type === 'REFUND' ? 'Hoàn tiền cọc' : 'Thu tiền'}
                                    </span>
                                 )}

                                 {/* Amount Pill */}
                                 {event.amount !== undefined && (
                                    <span className={cn(
                                       "text-xs font-black font-mono px-2 py-0.5 rounded-full whitespace-nowrap",
                                       isIncome && "text-income bg-income/10 border border-income/20",
                                       isExpense && "text-expense bg-expense/10 border border-expense/20",
                                       isStatus && "text-kraft-ink bg-surface-soft"
                                    )}>
                                       {isIncome ? `+${formatCurrency(event.amount)}` : `-${formatCurrency(event.amount)}`}
                                    </span>
                                 )}

                                 {/* User or Receiver */}
                                 {(event.user || event.receiver) && (
                                    <span className="text-[10px] font-bold text-kraft-ink/60 ml-auto flex items-center gap-1 shrink-0 truncate max-w-[170px]">
                                       {event.receiver ? (
                                          <>
                                             <HandCoins size={11} className="text-sub-label shrink-0" />
                                             <span>Nhận: {event.receiver}</span>
                                          </>
                                       ) : (
                                          <>
                                             <User size={11} className="text-kraft-accent shrink-0" />
                                             <span>{event.user}</span>
                                          </>
                                       )}
                                    </span>
                                 )}
                              </div>
                              
                              {/* Row 2: Note / Description */}
                              {event.note && (
                                 <div className="pt-1.5 border-t border-hairline-soft/60">
                                    <p className="text-xs text-kraft-ink/80 leading-relaxed italic">
                                       &ldquo;{event.note}&rdquo;
                                    </p>
                                 </div>
                              )}
                           </div>
                        </motion.div>
                     );
                  })}
               </AnimatePresence>
               
               {/* Empty State */}
               {filteredEvents.length === 0 && (
                  <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 border border-dashed border-hairline-soft rounded-xl bg-surface-soft/30">
                     <Clock size={20} className="text-sub-label opacity-40" />
                     <p className="text-xs font-bold text-sub-label">
                        {activeCategory === 'all' 
                           ? 'Chưa có lịch sử biến động cho xe này' 
                           : `Không có sự kiện nào thuộc mục "${activeCategory === 'income' ? 'Thu tiền' : activeCategory === 'expense' ? 'Chi tiền' : 'Trạng thái'}"`
                        }
                     </p>
                  </div>
               )}
            </div>
         </div>
      </motion.div>
   );
};
