import React from 'react';
import { AlertCircle, ChevronRight, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { motion } from 'motion/react';

export interface Activity {
  type: 'purchase' | 'sale' | 'alert';
  user: string;
  action: string;
  target: string;
  date: string;
}

interface DashboardActivityLogsProps {
  activities: Activity[];
}

export const DashboardActivityLogs: React.FC<DashboardActivityLogsProps> = ({ activities }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 render-boundary-isolated">
      <motion.div 
        initial={{ opacity: 0, y: 30, x: 15, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
        transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.2 }}
        className="glass-l3-aux p-10 rounded-[4rem]"
      >
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-sm font-black tracking-widest text-kraft-ink/60 uppercase">Hoạt động gần đây</h3>
          <button className="text-liquid-label text-kraft-accent hover:underline flex items-center gap-1 group opacity-60">
            Chi tiết <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="space-y-8">
          {activities.slice(0, 4).map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex gap-6 group items-center scroll-reveal-item"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-sm shrink-0",
                item.type === 'purchase' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  item.type === 'sale' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-red-50 text-red-600 border-red-100"
              )}>
                {item.type === 'purchase' ? <ShoppingBag size={16} /> :
                  item.type === 'sale' ? <ArrowUpRight size={16} /> : <AlertCircle size={16} />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-kraft-ink/70 leading-snug">
                  <span className="font-black text-kraft-ink uppercase mr-1">{item.user}</span> {item.action} <span className="font-black">{item.target}</span>
                </p>
              </div>
              <p className="text-liquid-label shrink-0">{item.date}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30, x: -15, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
        transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.25 }}
        className="glass-l3-aux p-10 rounded-[4rem] flex flex-col justify-center items-center text-center"
      >
        <AlertCircle size={40} className="text-kraft-accent mb-6 opacity-20" />
        <h3 className="text-sm font-black tracking-widest text-kraft-ink/60 uppercase mb-3 text-center">Trình quản lý hệ thống</h3>
        <p className="text-[10px] font-bold text-kraft-ink/30 uppercase tracking-[0.2em] max-w-[300px] leading-relaxed mx-auto">
          Hệ thống thông minh ghi nhận 38 luồng dữ liệu ổn định. Không có cảnh báo tồn kho lâu chưa xử lý.
        </p>
        <div className="mt-8 flex gap-3">
          <div className="px-5 py-2 glass-purity-surface !bg-white/40 rounded-full text-liquid-label">
            DB: ONLINE
          </div>
          <div className="px-5 py-2 glass-purity-surface !bg-white/40 rounded-full text-liquid-label">
            AI: ACTIVE
          </div>
        </div>
      </motion.div>
    </div>
  );
};
