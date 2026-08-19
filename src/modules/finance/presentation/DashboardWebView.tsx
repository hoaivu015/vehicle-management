import React, { useMemo, useState } from 'react';
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
import { MetricDrillDownModal, DrillDownType } from './components/MetricDrillDownModal';
import { DashboardStatGrid } from '@/src/shared/design-system/components/dashboard/DashboardStatGrid';
import { useDashboardState, DashboardState } from './useDashboardState';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { DashboardSkeleton } from '@/src/shared/design-system/components/dashboard/DashboardSkeleton';
import { haptics } from '@/src/shared/utils/haptics';

const MONTHLY_SALES_TARGET = 25;

interface DashboardWebViewProps {
  presenter: FinancePresenter;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
  state?: DashboardState;
}

/**
 * Optimized for Desktop/Large Screens.
 * Uses wide layouts, Bento Grid and interactive drilldowns.
 */
export const DashboardWebView: React.FC<DashboardWebViewProps> = ({
  presenter,
  onNavigate,
  state: propState
}) => {
  const internalState = useDashboardState(presenter);
  const state = propState || internalState;
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
  } = state;

  const [drillDownType, setDrillDownType] = useState<DrillDownType>(null);

  const openDrillDown = (type: DrillDownType) => {
    haptics.light();
    setDrillDownType(type);
  };

  const stats: DashboardStat[] = useMemo(() => [
    {
      label: 'Lợi nhuận gộp (Showroom)',
      value: formatCurrency(overview?.grossProfit || 0),
      numericValue: overview?.grossProfit || 0,
      icon: CircleDollarSign,
      subValue: 'Bấm xem chi tiết xe bán',
      tooltip: formatCurrency(overview?.grossProfit || 0, { showFull: true }),
      onClick: () => openDrillDown('gross_profit')
    },
    {
      label: 'Lợi nhuận ròng',
      value: formatCurrency(overview?.netProfit || 0),
      numericValue: overview?.netProfit || 0,
      icon: TrendingUp,
      subValue: 'Sau chia vốn & trừ CP vận hành',
      isNegative: (overview?.netProfit || 0) < 0,
      tooltip: formatCurrency(overview?.netProfit || 0, { showFull: true })
    },
    {
      label: 'Lợi ròng cuối',
      value: formatCurrency(overview?.finalNetProfit || 0),
      numericValue: overview?.finalNetProfit || 0,
      icon: Coins,
      subValue: 'Sau khi quyết toán lương & thưởng',
      isNegative: (overview?.finalNetProfit || 0) < 0,
      tooltip: formatCurrency(overview?.finalNetProfit || 0, { showFull: true })
    },
    {
      label: 'Tiền mặt khả dụng',
      value: formatCurrency(overview?.availableCash || 0),
      numericValue: overview?.availableCash || 0,
      icon: Wallet,
      subValue: 'Số dư thực tế tại quỹ',
      tooltip: formatCurrency(overview?.availableCash || 0, { showFull: true })
    },
    { 
      label: 'Xe đã bán', 
      value: `${overview?.soldCount || 0} xe`, 
      icon: CheckCircle2, 
      subValue: `Bấm xem danh sách xe bán`,
      onClick: () => openDrillDown('sold_vehicles')
    },
    { 
      label: 'Xe nhập mới', 
      value: `${overview?.boughtCount || 0} xe`, 
      icon: ShoppingBag, 
      subValue: 'Tốc độ nhập hàng' 
    },
    {
      label: 'Tồn kho hiện tại',
      value: `${overview?.inventoryCount || 0} xe`,
      icon: Car,
      subValue: `Vốn tự có: ${formatCurrency(overview?.inventoryValue || 0)}`,
      tooltip: `Tổng vốn tồn kho: ${formatCurrency(overview?.inventoryValue || 0, { showFull: true })}`,
      onClick: () => openDrillDown('inventory_vehicles')
    },
    {
      label: `Tồn kho lâu (>${INVENTORY_CONSTANTS.AGING_THRESHOLD_DAYS} ngày)`,
      value: `${overview?.agingCount || 0} xe`,
      icon: AlertCircle,
      subValue: 'Bấm xem xe cần xử lý giá',
      isWarning: (overview?.agingCount || 0) > 0,
      actionIcon: Edit3,
      onClick: () => openDrillDown('aging_vehicles'),
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
        vehicles={vehicles}
      />

      <div className="relative">
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] space-y-6 md:space-y-12", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
          {/* Stat Cards Bento Grid */}
          <div className="glass-l1 rounded-[2.5rem] p-2 md:p-3">
            <DashboardStatGrid stats={stats} />
          </div>

          {/* Grid 2 cột Báo cáo Công nợ chuẩn Design System */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-12">
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

          {/* Advanced Visual Analytics Charts */}
          <DashboardCharts
            filterMonth={filterMonth}
            vehicles={vehicles}
            soldCount={overview?.soldCount || 0}
            target={MONTHLY_SALES_TARGET}
            overview={overview}
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

      {/* Drill-down Modal */}
      <MetricDrillDownModal
        type={drillDownType}
        isOpen={!!drillDownType}
        onClose={() => setDrillDownType(null)}
        vehicles={vehicles}
        filterMonth={filterMonth}
        onSelectVehicle={(code) => {
          onNavigate('inventory', code, 'ALL', 'view_vehicle');
        }}
      />
    </div>
  );
};
