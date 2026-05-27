import React, { Suspense } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Vehicle } from '@/src/shared/domain/types';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

// Nạp động biểu đồ sử dụng React.lazy để tách nhỏ recharts khỏi main bundle
const InventoryPieChart = React.lazy(() =>
  import('@/src/shared/design-system/components/dashboard/InventoryPieChart').then(module => ({
    default: module.InventoryPieChart
  }))
);

interface DashboardChartsProps {
  filterMonth: string;
  vehicles: Vehicle[];
  soldCount: number;
  target: number;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  filterMonth,
  vehicles,
  soldCount,
  target
}) => {
  const monthNum = filterMonth.split('-')[1];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-12 render-boundary-isolated">
      <motion.div 
        initial={{ opacity: 0, y: 30, x: 15, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
        transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.15 }}
        className="glass-l1 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center"
      >
        <h3 className="text-lg md:text-xl font-black tracking-tighter text-kraft-ink mb-6 md:mb-10 text-center uppercase">Trạng thái kho hàng</h3>
        <div className="w-full flex justify-center min-h-[300px] items-center">
          <Suspense fallback={<Skeleton glassmorphism variant="circle" width={200} height={200} />}>
            <InventoryPieChart cars={vehicles} />
          </Suspense>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-6 mt-8 md:mt-12 w-full">
          <div className="p-4 md:p-6 rounded-3xl glass-purity-surface text-center">
            <p className="text-[10px] md:text-xs text-liquid-label mb-1 md:mb-2 uppercase">Tỉ lệ xoay vòng</p>
            <p className="text-lg md:text-2xl font-black text-kraft-ink">2.4x</p>
          </div>
          <div className="p-4 md:p-6 rounded-3xl glass-purity-surface text-center">
            <p className="text-[10px] md:text-xs text-liquid-label mb-1 md:mb-2 uppercase">Thanh khoản</p>
            <p className="text-lg md:text-2xl font-black text-emerald-600">Ổn định</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30, x: -15, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
        transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.2 }}
        className="p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] bg-kraft-ink text-white shadow-2xl overflow-hidden relative group"
      >
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
          <ArrowUpRight size={80} />
        </div>
        <h3 className="text-[10px] md:text-[11px] font-black tracking-[0.4em] opacity-40 mb-8 md:mb-10 uppercase">Mục tiêu kinh doanh tháng {monthNum}</h3>
        <div className="flex items-end justify-between mb-6">
          <div className="text-4xl md:text-6xl font-black tracking-tighter">{soldCount} / {target}</div>
          <div className="text-xl md:text-2xl font-black opacity-40">{Math.round((soldCount / target) * 100)}%</div>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((soldCount / target) * 100, 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-kraft-accent shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest mt-8 opacity-40 leading-relaxed">
          {soldCount >= target ? 'Chúc mừng! Bạn đã vượt mục tiêu bán hàng tháng này.' : `Cần tối ưu thêm ${target - soldCount} xe để đạt chỉ tiêu tháng.`}
        </p>
      </motion.div>
    </div>
  );
};
