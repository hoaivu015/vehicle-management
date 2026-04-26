import React from 'react';
import { motion } from 'motion/react';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_CONFIG } from '@/src/shared/domain/constants';
import { cn } from '@/src/utils/cn';
import { formatDate } from './VehicleDetailModalShared';

interface HistoryTabProps {
   vehicle: Vehicle;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ vehicle }) => {
   return (
      <motion.div
         key="hist"
         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
         className="space-y-8"
      >
         <div className="relative pl-4 sm:pl-8 space-y-6 sm:space-y-12 pb-10">
            <div className="absolute left-1 sm:left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-kraft-accent via-kraft-accent/20 to-transparent" />
            {(vehicle.history || []).map((h, idx) => (
               <div key={idx} className="relative">
                  <div className="absolute -left-[27px] sm:-left-[25px] top-1.5 w-3 h-3 rounded-full bg-white border-4 border-kraft-accent shadow-lg" />
                  <div className="flex flex-col gap-2 sm:gap-3">
                     <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-sub-label !text-kraft-accent !opacity-100">{formatDate(h.date)}</span>
                        <span className={cn(
                           "px-2 sm:px-3 py-0.5 sm:py-1 text-[7px] sm:text-[8px] font-black uppercase tracking-widest rounded-lg text-white",
                           VEHICLE_STATUS_CONFIG[h.status as VehicleStatus]?.badgeClass || "bg-kraft-ink"
                        )}>
                           {VEHICLE_STATUS_LABELS[h.status as VehicleStatus] || h.status}
                        </span>
                     </div>
                     <div className="p-4 sm:p-6 bg-white/40 rounded-[1.2rem] sm:rounded-[1.5rem] border border-white/60 shadow-sm">
                        <p className="text-xs sm:text-sm font-black text-kraft-ink mb-1">{h.user}</p>
                        <p className="text-xs sm:text-sm text-kraft-ink/60">{h.note}</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </motion.div>
   );
};
