import React from 'react';
import { Clock, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { formatDate } from '@/src/shared/utils/date';
import { formatCurrency } from '@/src/shared/utils/currency';

interface Activity {
  type: 'sale' | 'purchase';
  carName: string;
  date: string;
  amount: number;
}

interface RecentActivityCardProps {
  activities: Activity[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
      className="liquid-card border-white/60 !p-0 shadow-[var(--shadow-kraft-deep)] overflow-hidden rounded-t1"
    >
      <div className="p-8 border-b border-black/5 bg-indigo-500/5 flex items-center justify-between">
        <h3 className="text-xl font-black uppercase flex items-center gap-4 text-indigo-600 font-heading tracking-tighter">
          <div className="p-3 rounded-t3 bg-indigo-500/10">
            <Clock size={24} strokeWidth={2.5} />
          </div>
          Hoạt động gần đây
        </h3>
        <button className="text-sub-label !text-indigo-600 hover:opacity-60 transition-opacity">Xem tất cả</button>
      </div>
      
      <div className="p-8 space-y-5 max-h-[600px] overflow-y-auto custom-scrollbar">
        {activities.slice(0, 10).map((activity, i) => (
          <div key={i} className="flex items-center justify-between p-5 rounded-t2 bg-white/40 border border-white/60 hover:border-kraft-accent/20 transition-all duration-300 group shadow-sm hover:shadow-md cursor-pointer">
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-12 h-12 rounded-t3 shadow-sm flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110",
                activity.type === 'sale' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              )}>
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="font-black text-sm text-kraft-ink tracking-tight group-hover:text-kraft-accent transition-colors">{activity.carName}</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-40 flex items-center gap-2">
                  <span className={cn("inline-block w-1.5 h-1.5 rounded-full", activity.type === 'sale' ? "bg-emerald-500" : "bg-amber-500")} />
                  {activity.type === 'sale' ? 'Chốt bán' : 'Nhập kho'} • {formatDate(activity.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-black text-base text-kraft-ink tracking-tight">
                  +{formatCurrency(activity.amount)}
                </p>
                <p className="text-sub-label !opacity-30">Hoa hồng</p>
              </div>
              <ChevronRight size={16} className="text-kraft-ink/20 group-hover:text-kraft-accent transition-colors translate-x-0 group-hover:translate-x-1" />
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-kraft-accent/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-kraft-accent/10 opacity-30">
              <AlertCircle size={24} className="text-kraft-accent" />
            </div>
            <p className="text-sub-label !opacity-30 italic">Chưa có hoạt động nào</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
