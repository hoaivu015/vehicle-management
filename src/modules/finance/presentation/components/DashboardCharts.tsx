import React, { Suspense } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Vehicle } from '@/src/shared/domain/types';
import { Skeleton } from '@/src/shared/design-system/Skeleton';
import { FinancialOverviewData } from '@/src/modules/finance/application/GetFinancialOverview';

// Lazy load heavy chart modules
const InventoryPieChart = React.lazy(() =>
  import('@/src/shared/design-system/components/dashboard/InventoryPieChart').then(module => ({
    default: module.InventoryPieChart
  }))
);

const RevenueProfitTrendChart = React.lazy(() =>
  import('./RevenueProfitTrendChart').then(module => ({
    default: module.RevenueProfitTrendChart
  }))
);

const ExpenseBreakdownChart = React.lazy(() =>
  import('./ExpenseBreakdownChart').then(module => ({
    default: module.ExpenseBreakdownChart
  }))
);

const SalesPerformanceLeaderboard = React.lazy(() =>
  import('./SalesPerformanceLeaderboard').then(module => ({
    default: module.SalesPerformanceLeaderboard
  }))
);

interface DashboardChartsProps {
  filterMonth: string;
  vehicles: Vehicle[];
  soldCount: number;
  target: number;
  overview?: FinancialOverviewData | null;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  filterMonth,
  vehicles,
  soldCount,
  target,
  overview
}) => {
  const monthNum = filterMonth ? filterMonth.split('-')[1] : '';

  return (
    <div className="space-y-6 md:space-y-12 render-boundary-isolated">
      {/* 1. 12-Month Revenue & Profit Trend (Full Width Bento Hero) */}
      {overview?.monthlyTrend12M && overview.monthlyTrend12M.length > 0 && (
        <Suspense fallback={
          <div className="glass-l1 p-8 rounded-[2.5rem] min-h-[380px] flex items-center justify-center">
            <Skeleton glassmorphism variant="rectangle" width="100%" height={320} className="rounded-3xl opacity-20" />
          </div>
        }>
          <RevenueProfitTrendChart 
            data={overview.monthlyTrend12M} 
            selectedMonth={filterMonth} 
          />
        </Suspense>
      )}

      {/* 2. Grid 2 cột: Expense Structure & Sales Leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-12">
        {overview?.expenseBreakdown && (
          <Suspense fallback={
            <div className="glass-l1 p-8 rounded-[2.5rem] min-h-[360px] flex items-center justify-center">
              <Skeleton glassmorphism variant="rectangle" width="100%" height={300} className="rounded-3xl opacity-20" />
            </div>
          }>
            <ExpenseBreakdownChart 
              data={overview.expenseBreakdown} 
              filterMonth={filterMonth} 
            />
          </Suspense>
        )}

        {overview?.salesLeaderboard && (
          <Suspense fallback={
            <div className="glass-l1 p-8 rounded-[2.5rem] min-h-[360px] flex items-center justify-center">
              <Skeleton glassmorphism variant="rectangle" width="100%" height={300} className="rounded-3xl opacity-20" />
            </div>
          }>
            <SalesPerformanceLeaderboard 
              leaderboard={overview.salesLeaderboard} 
              filterMonth={filterMonth} 
            />
          </Suspense>
        )}
      </div>

      {/* 3. Grid 2 cột: Inventory Status & Monthly Target */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20, x: 10 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.15 }}
          className="glass-l1 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-between"
        >
          <h3 className="text-base md:text-xl font-black tracking-tight text-kraft-ink mb-6 text-center uppercase">
            Trạng Thái Kho Hàng Hiện Tại
          </h3>
          <div className="w-full flex justify-center min-h-[280px] items-center">
            <Suspense fallback={<Skeleton glassmorphism variant="circle" width={180} height={180} />}>
              <InventoryPieChart cars={vehicles} />
            </Suspense>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-6 mt-6 w-full">
            <div className="p-4 md:p-6 rounded-3xl glass-purity-surface text-center">
              <p className="text-[10px] md:text-xs text-sub-label mb-1 md:mb-2 uppercase font-black tracking-wider">Tồn kho bình quân (DSI)</p>
              <p className="text-lg md:text-2xl font-black text-kraft-ink">
                {overview?.averageDSI || 0} <span className="text-xs text-sub-label font-bold">ngày</span>
              </p>
            </div>
            <div className="p-4 md:p-6 rounded-3xl glass-purity-surface text-center">
              <p className="text-[10px] md:text-xs text-sub-label mb-1 md:mb-2 uppercase font-black tracking-wider">Tỷ suất lãi gộp (Margin)</p>
              <p className="text-lg md:text-2xl font-black text-emerald-600">
                {overview?.profitMarginPercent || 0}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30, x: -15 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.2 }}
          className="p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-white border border-hairline-soft text-kraft-ink shadow-kraft-deep overflow-hidden relative group flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 md:p-12 text-kraft-accent opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
            <ArrowUpRight size={80} />
          </div>

          <div>
            <h3 className="text-[10px] md:text-[11px] font-black tracking-[0.4em] text-sub-label mb-6 md:mb-8 uppercase">
              Mục Tiêu Kinh Doanh Tháng {monthNum}
            </h3>
            <div className="flex items-end justify-between mb-4">
              <div className="text-4xl md:text-6xl font-black tracking-tighter text-kraft-ink">
                {soldCount} / {target}
              </div>
              <div className="text-xl md:text-2xl font-black text-kraft-accent">
                {Math.round((soldCount / target) * 100)}%
              </div>
            </div>
            <div className="w-full h-3.5 bg-surface-soft border border-hairline-soft rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((soldCount / target) * 100, 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-kraft-accent rounded-full shadow-md shadow-kraft-accent/25"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-hairline-soft">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sub-label leading-relaxed">
              {soldCount >= target 
                ? '🏆 Chúc mừng! Showroom đã vượt mục tiêu bán hàng trong tháng.' 
                : `⚡ Cần xuất thêm ${target - soldCount} xe để hoàn thành chỉ tiêu tháng.`}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
