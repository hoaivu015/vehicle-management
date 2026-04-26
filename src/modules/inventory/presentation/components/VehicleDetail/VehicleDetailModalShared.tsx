import React from 'react';
import { cn } from '@/src/utils/cn';
import { formatCurrency } from '@/src/utils/currency';

export const formatDate = (dateStr: string) => {
   if (!dateStr) return '---';
   return new Date(dateStr).toLocaleDateString('vi-VN');
};

// Internal UI Components
export const InfoBox = ({ label, value, icon: Icon, highlight }: any) => (
   <div className={cn(
      "flex items-center justify-between p-6 rounded-t2 border transition-all",
      highlight ? "bg-white border-kraft-accent/20 shadow-sm" : "bg-white/80 border-white/100 hover:bg-white"
   )}>
      <div className="flex items-center gap-4">
         <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center transition-colors", highlight ? "bg-kraft-accent/10 text-kraft-accent" : "bg-kraft-ink/5 text-kraft-ink/30")}>
            <Icon size={20} />
         </div>
         <span className="text-sub-label">{label}</span>
      </div>
      <span className={cn("text-sm font-black tracking-tighter", highlight ? "text-kraft-accent" : "text-kraft-ink")}>{value}</span>
   </div>
);

export const EditRow = ({ label, value, onChange, type = "text", disabled = false }: any) => (
   <div className="space-y-2">
      <label className="text-sub-label ml-2">{label}</label>
      <input
         type={type} value={value || ''}
         onChange={(e) => onChange(e.target.value)}
         disabled={disabled}
         className="w-full h-14 bg-white/60 border border-white/80 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:border-kraft-accent focus:ring-8 focus:ring-kraft-accent/5 outline-none transition-all shadow-inner disabled:opacity-50"
      />
   </div>
);

export const FinancialBox = ({ label, value, color, isEstimated }: any) => {
   const styles = {
      emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
      amber: "bg-amber-500/10 border-amber-500/20 text-amber-600",
      ink: "bg-kraft-ink/10 border-kraft-ink/20 text-kraft-ink",
   } as any;
   return (
      <div className={cn("p-8 rounded-t2 border flex flex-col items-center text-center gap-3 relative overflow-hidden", styles[color])}>
         {isEstimated && (
            <div className="absolute top-0 right-0 p-2">
               <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            </div>
         )}
         <span className="text-sub-label">{label}</span>
         <span className="text-2xl font-black tracking-tighter">{formatCurrency(value)}</span>
      </div>
   );
};
