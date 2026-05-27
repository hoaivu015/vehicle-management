import React from 'react';
import { motion } from 'motion/react';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_CONFIG } from '@/src/shared/domain/constants';
import { cn } from '@/src/shared/utils/cn';
import { formatDate } from './VehicleDetailModalShared';

interface HistoryTabProps {
   vehicle: Vehicle;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ vehicle }) => {
   return (
      <motion.div
         key="hist"
         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
         className="space-y-g6"
      >
         <div className="relative pl-6 sm:pl-10 space-y-8 sm:space-y-12 pb-12 pt-4">
            <div className="absolute left-1.5 sm:left-3.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand via-brand/20 to-transparent opacity-30" />
            
            {(vehicle.history || []).map((h, idx) => (
               <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative"
               >
                  <div className="absolute -left-[27.5px] sm:-left-[31.5px] top-1.5 w-4 h-4 rounded-full bg-white border-[3px] border-brand shadow-kraft-deep z-10" />
                  
                  <div className="flex flex-col gap-3 sm:gap-4">
                     <div className="flex items-center gap-3 sm:gap-4">
                        <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/5 px-2 py-1 rounded-full">{formatDate(h.date)}</span>
                        <span className={cn(
                           "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full text-white shadow-sm",
                           VEHICLE_STATUS_CONFIG[h.status as VehicleStatus]?.badgeClass || "bg-kraft-ink"
                        )}>
                           {VEHICLE_STATUS_LABELS[h.status as VehicleStatus] || h.status}
                        </span>
                     </div>
                     
                     <div className="flex-1 space-y-2 glass-surface-soft p-g4 rounded-t1 border border-hairline-soft shadow-sm">
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-surface-soft border border-hairline-soft flex items-center justify-center">
                              <span className="text-[8px] font-black text-sub-label">{h.user?.charAt(0).toUpperCase()}</span>
                           </div>
                           <p className="text-[10px] font-black text-kraft-ink uppercase tracking-widest">{h.user}</p>
                        </div>
                        <p className="text-xs sm:text-sm text-kraft-ink/60 leading-relaxed italic">
                           "{h.note}"
                        </p>
                     </div>
                  </div>
               </motion.div>
            ))}
            
            {(vehicle.history || []).length === 0 && (
               <div className="py-20 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sub-label opacity-20 italic">Chưa có lịch sử hoạt động</p>
               </div>
            )}
         </div>
      </motion.div>
   );
};
