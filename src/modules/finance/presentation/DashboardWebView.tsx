import React, { useMemo } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  Wallet,
  CheckCircle2,
  ShoppingBag,
  Car,
  AlertCircle,
  Coins,
  Edit3,
} from 'lucide-react';
import { formatCurrency } from '@/src/shared/utils/currency';
import { INVENTORY_CONSTANTS } from '@/src/shared/domain/constants';
import { FinancePresenter } from './FinancePresenter';
import { NetProfitComparisonReport } from './components/NetProfitComparisonReport';
import { ReceivableDebtsList } from './components/ReceivableDebtsList';
import { PayableDebtsList } from './components/PayableDebtsList';
import { DashboardHeader, DashboardStat } from './components/DashboardHeader';
import { DashboardCharts } from './components/DashboardCharts';
import { DashboardActivityLogs } from './components/DashboardActivityLogs';
import { DashboardStatGrid } from '@/src/shared/design-system/components/dashboard/DashboardStatGrid';
import { useDashboardState } from './useDashboardState';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { DashboardSkeleton } from '@/src/modules/dashboard/presentation/DashboardSkeleton';

const MONTHLY_SALES_TARGET = 25;

interface DashboardWebViewProps {
  presenter: FinancePresenter;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
}

/**
 * Optimized for Desktop/Large Screens.
 * Uses wide layouts and multi-column grids.
 */
export const DashboardWebView: React.FC<DashboardWebViewProps> = ({
  presenter,
  onNavigate
}) => {
  const {
    loading,
    overview,
    vehicles,
    filterMonth,
    handleMonthChange,
    receivableDebts,
    totalReceivables,
    payableDebts,
    totalPayables
  } = useDashboardState(presenter);

  const stats: DashboardStat[] = useMemo(() => [
    {
      label: 'Lợi nhuận gộp (Showroom)',
      value: formatCurrency(overview?.grossProfit || 0),
      icon: CircleDollarSign,
      subValue: 'Phần thực hưởng của Showroom',
      tooltip: formatCurrency(overview?.grossProfit || 0, { showFull: true })
    },
    {
      label: 'Lợi nhuận ròng',
      value: formatCurrency(overview?.netProfit || 0),
      icon: TrendingUp,
      subValue: 'Sau khi chia sẻ góp vốn & trừ CP',
      isNegative: (overview?.netProfit || 0) < 0,
      tooltip: formatCurrency(overview?.netProfit || 0, { showFull: true })
    },
    {
      label: 'Lợi ròng cuối',
      value: formatCurrency(overview?.finalNetProfit || 0),
      icon: Coins,
      subValue: 'Sau khi quyết toán lương & thưởng',
      isNegative: (overview?.finalNetProfit || 0) < 0,
      tooltip: formatCurrency(overview?.finalNetProfit || 0, { showFull: true })
    },
    {
      label: 'Tiền mặt khả dụng',
      value: formatCurrency(overview?.availableCash || 0),
      icon: Wallet,
      subValue: 'Số dư thực tế tại quỹ',
      tooltip: formatCurrency(overview?.availableCash || 0, { showFull: true })
    },
    { label: 'Xe đã bán', value: `${overview?.soldCount || 0} xe`, icon: CheckCircle2, subValue: `Kế hoạch tháng: ${MONTHLY_SALES_TARGET} xe` },
    { label: 'Xe nhập mới', value: `${overview?.boughtCount || 0} xe`, icon: ShoppingBag, subValue: 'Tốc độ nhập hàng' },
    {
      label: 'Tồn kho hiện tại',
      value: `${overview?.inventoryCount || 0} xe`,
      icon: Car,
      subValue: `Vốn tự có: ${formatCurrency(overview?.inventoryValue || 0)}`,
      tooltip: `Tổng vốn tồn kho: ${formatCurrency(overview?.inventoryValue || 0, { showFull: true })}`
    },
    {
      label: `Tồn kho lâu (>${INVENTORY_CONSTANTS.AGING_THRESHOLD_DAYS} ngày)`,
      value: `${overview?.agingCount || 0} xe`,
      icon: AlertCircle,
      subValue: 'Cần xử lý giá ngay',
      isWarning: (overview?.agingCount || 0) > 0,
      actionIcon: Edit3,
      onClick: () => onNavigate('inventory', '', 'AGING_25', 'adjust_price'),
      onActionClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigate('inventory', '', 'AGING_25', 'adjust_price');
      }
    },
  ], [overview, onNavigate]);

  const isInitialLoading = loading && !overview;
  const isSubsequentLoading = loading && !!overview;

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }


  return (
    <div className="space-y-6 md:space-y-12 pt-8 pb-4 md:py-12 px-6 md:px-12 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 h-full overflow-y-auto scrollbar-hidden pb-24 md:pb-12">
      <DashboardHeader
        filterMonth={filterMonth}
        onMonthChange={handleMonthChange}
        stats={stats}
      />

      <div className="relative">
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] space-y-6 md:space-y-12", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
          <div className="glass-l1 rounded-[2.5rem] p-2 md:p-3">
            <DashboardStatGrid stats={stats} />
          </div>

          {/* Grid 2 cột Báo cáo Công nợ chuẩn Design System */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <ReceivableDebtsList
              debts={receivableDebts}
              total={totalReceivables}
              onVehicleClick={(vehicleId) => {
                const v = vehicles.find(x => x.id === vehicleId);
                if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
              }}
            />
            <PayableDebtsList
              debts={payableDebts}
              total={totalPayables}
              onVehicleClick={(vehicleId) => {
                const v = vehicles.find(x => x.id === vehicleId);
                if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
              }}
            />
          </div>

          {overview && (
            <NetProfitComparisonReport
              currentProfit={overview.finalNetProfit}
              comparisons={overview.profitComparisons}
              filterMonth={filterMonth}
            />
          )}

          <DashboardCharts
            filterMonth={filterMonth}
            vehicles={vehicles}
            soldCount={overview?.soldCount || 0}
            target={MONTHLY_SALES_TARGET}
          />

          <DashboardActivityLogs
            activities={overview?.recentActivities || []}
          />
        </div>

        {/* LỚP PHỦ KÍNH THỞ (Liquid Flow Glass Overlay) */}
        {isSubsequentLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/5 backdrop-blur-[6px] border border-white/10 rounded-[2.5rem] flex items-center justify-center z-50 pointer-events-none"
            style={{
              animation: 'breathe-glow 3s ease-in-out infinite'
            }}
          >
            {/* Volumetric Mesh Gradient */}
            <div className="absolute inset-0 -z-10 opacity-30 mix-blend-color-dodge pointer-events-none overflow-hidden rounded-[2.5rem]">
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-10 bg-[radial-gradient(circle_at_30%_30%,#00f2fe_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#4facfe_0%,transparent_50%)] blur-[40px]"
              />
            </div>
            
            <div className="w-2.5 h-2.5 rounded-full bg-kraft-accent shadow-neon-glow" />
          </motion.div>
        )}
      </div>
    </div>
  );
};
