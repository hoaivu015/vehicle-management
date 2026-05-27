
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
  <div className="flex items-center justify-between group/salary">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-t3 bg-white shadow-sm flex items-center justify-center text-kraft-accent border border-black/5 group-hover/salary:scale-110 transition-all">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-sub-label mb-0.5">{label}</p>
        {detail && <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{detail}</p>}
      </div>
    </div>
    <p className="font-black text-kraft-ink text-base tracking-tighter">{value}</p>
  </div>
);

interface InfoItemProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
  <div className="flex items-center gap-5 group/info">
    <div className="w-12 h-12 rounded-t3 bg-white shadow-sm flex items-center justify-center text-kraft-accent border border-black/5 group-hover/info:scale-110 group-hover/info:rotate-6 transition-all duration-500">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <p className="text-sub-label mb-0.5">{label}</p>
      <p className="font-black text-kraft-ink text-sm tracking-tight">{value}</p>
    </div>
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'purple' | 'kraft';
  progress?: number;
  delay?: number;
}

export const StatCard = ({ icon: Icon, label, value, color, progress, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="liquid-card p-5 sm:p-10 flex flex-col items-start text-left group hover:scale-[1.02] transition-all duration-500 shadow-[var(--shadow-kraft-deep)] border-white/60"
  >
    <div className={cn(
      "w-12 h-12 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] shadow-lg mb-4 sm:mb-8 flex items-center justify-center transition-all duration-500 group-hover:rotate-12",
      color === 'emerald' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
        color === 'amber' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
          color === 'purple' ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
            "bg-kraft-accent/10 text-kraft-accent border border-kraft-accent/20"
    )}>
      <Icon size={20} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
    </div>
    <div className="w-full min-h-[4rem] sm:min-h-0 flex flex-col justify-start">
      <p className="text-[10px] sm:text-sub-label !opacity-30 mb-1 sm:mb-4">{label}</p>
      <p className="text-base sm:text-2xl font-black text-kraft-ink tracking-tighter leading-tight">{value}</p>
    </div>
    {progress !== undefined && (
      <div className="w-full mt-8 space-y-3">
        <div className="flex justify-between items-center text-sub-label">
          <span>Tiến độ mục tiêu</span>
          <span className={cn(progress >= 100 ? "text-emerald-500" : "text-kraft-ink")}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden p-0.5 border border-black/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: delay + 0.3 }}
            className={cn("h-full rounded-full shadow-lg", progress >= 100 ? "bg-emerald-500" : "bg-kraft-accent")}
          />
        </div>
      </div>
    )}
  </motion.div>
);
