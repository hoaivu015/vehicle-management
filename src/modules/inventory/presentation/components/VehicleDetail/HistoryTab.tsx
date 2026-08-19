import React from 'react';
import { motion } from 'motion/react';
import { Clock, User } from 'lucide-react';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_CONFIG } from '@/src/shared/domain/constants';
import { cn } from '@/src/shared/utils/cn';
import { formatDate } from './VehicleDetailModalShared';

interface HistoryTabProps {
   vehicle: Vehicle;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ vehicle }) => {
   const historyList = vehicle.history || [];

   return (
      <motion.div
         key="hist"
         initial={{ opacity: 0, x: 20 }} 
         animate={{ opacity: 1, x: 0 }} 
         exit={{ opacity: 0, x: -20 }}
         className="space-y-4 pb-20"
      >
         <div className="bg-white rounded-2xl md:rounded-[22px] p-4 sm:p-6 border border-hairline-soft shadow-2xs">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-hairline-soft">
               <div className="w-8 h-8 rounded-xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
                  <Clock size={16} />
               </div>
               <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-kraft-ink">
                     Nhật Ký Trạng Thái & Vận Hành Xe
                  </h3>
                  <p className="text-[10px] text-sub-label font-bold">
                     Toàn bộ lịch sử biến động từ lúc nhập kho đến xuất kho
                  </p>
               </div>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-4 sm:space-y-6 pb-2 pt-2">
               {/* Timeline vertical stem line */}
               <div className="absolute left-2.5 sm:left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-kraft-accent via-kraft-accent/20 to-transparent opacity-40" />
               
               {historyList.map((h, idx) => {
                  const isLatest = idx === historyList.length - 1;
                  return (
                     <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="relative"
                     >
                        {/* Timeline node dot */}
                        <div className={cn(
                           "absolute -left-[20.5px] sm:-left-[24.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all z-10",
                           isLatest 
                              ? "border-kraft-accent shadow-xs ring-4 ring-kraft-accent/15" 
                              : "border-black/20"
                        )}>
                           {isLatest && <span className="block w-1.5 h-1.5 rounded-full bg-kraft-accent m-auto mt-[2px]" />}
                        </div>
                        
                        <div className="flex flex-col gap-2 p-3 sm:p-3.5 bg-surface-soft/60 hover:bg-surface-soft rounded-xl border border-hairline-soft transition-all">
                           {/* Row 1: Date & Status Badge & User */}
                           <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-[10px] font-mono font-black text-kraft-accent bg-kraft-accent/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                 {formatDate(h.date)}
                              </span>
                              <span className={cn(
                                 "px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full text-white shadow-2xs leading-none whitespace-nowrap",
                                 VEHICLE_STATUS_CONFIG[h.status as VehicleStatus]?.badgeClass || "bg-kraft-ink"
                              )}>
                                 {VEHICLE_STATUS_LABELS[h.status as VehicleStatus] || h.status}
                              </span>
                              {h.user && (
                                 <span className="text-[10px] font-bold text-kraft-ink/60 ml-auto flex items-center gap-1 shrink-0 truncate max-w-[150px]">
                                    <User size={11} className="text-kraft-accent shrink-0" />
                                    <span>{h.user}</span>
                                 </span>
                              )}
                           </div>
                           
                           {/* Row 2: Note Box */}
                           {h.note && (
                              <div className="pt-1.5 border-t border-hairline-soft/60">
                                 <p className="text-xs text-kraft-ink/80 leading-relaxed italic">
                                    &ldquo;{h.note}&rdquo;
                                 </p>
                              </div>
                           )}
                        </div>
                     </motion.div>
                  );
               })}
               
               {historyList.length === 0 && (
                  <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 border border-dashed border-hairline-soft rounded-xl bg-surface-soft/30">
                     <Clock size={20} className="text-sub-label opacity-40" />
                     <p className="text-xs font-bold text-sub-label">Chưa có lịch sử biến động cho xe này</p>
                  </div>
               )}
            </div>
         </div>
      </motion.div>
   );
};
