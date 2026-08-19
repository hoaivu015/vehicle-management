import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';

interface SalaryItemProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  detail?: string;
}

export const SalaryItem = ({ label, value, icon: Icon, detail }: SalaryItemProps) => (
  <div className="flex items-center justify-between group/salary py-1">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-kraft-accent border border-hairline-soft group-hover/salary:scale-105 transition-all shrink-0">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-xs font-black text-kraft-ink/80 leading-snug">{label}</p>
        {detail && <p className="text-[10px] font-bold text-income uppercase tracking-widest mt-0.5">{detail}</p>}
      </div>
    </div>
    <p className="font-black text-kraft-ink text-sm sm:text-base tracking-tight whitespace-nowrap pl-2">{value}</p>
  </div>
);

interface InfoItemProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
  <div className="flex items-center gap-4 group/info">
    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-kraft-accent border border-hairline-soft group-hover/info:scale-105 transition-all shrink-0">
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-sub-label opacity-60 leading-none mb-1">{label}</p>
      <p className="font-black text-kraft-ink text-xs sm:text-sm tracking-tight truncate">{value}</p>
    </div>
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'blue' | 'kraft';
  progress?: number;
  delay?: number;
}

export const StatCard = ({ icon: Icon, label, value, color, progress, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="liquid-card p-5 sm:p-6 flex flex-col items-start text-left group hover:scale-[1.01] transition-all duration-300 shadow-kraft-deep border-hairline-soft rounded-t2"
  >
    <div className={cn(
      "w-12 h-12 rounded-xl shadow-sm mb-4 flex items-center justify-center transition-all duration-300 group-hover:rotate-6",
      color === 'emerald' ? "bg-income/10 text-income border border-income/20" :
      color === 'amber' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
      color === 'blue' ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
      "bg-kraft-accent/10 text-kraft-accent border border-kraft-accent/20"
    )}>
      <Icon size={22} strokeWidth={2.5} />
    </div>
    <div className="w-full flex flex-col justify-start">
      <p className="text-[10px] font-black uppercase tracking-widest text-sub-label opacity-60 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-black text-kraft-ink tracking-tight leading-tight">{value}</p>
    </div>
    {progress !== undefined && (
      <div className="w-full mt-4 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-sub-label">
          <span>Tiến độ mục tiêu</span>
          <span className={cn(progress >= 100 ? "text-income" : "text-kraft-ink")}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden p-0.5 border border-black/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: delay + 0.2 }}
            className={cn("h-full rounded-full shadow-sm", progress >= 100 ? "bg-income" : "bg-kraft-accent")}
          />
        </div>
      </div>
    )}
  </motion.div>
);
