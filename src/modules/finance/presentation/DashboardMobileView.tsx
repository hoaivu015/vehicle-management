import React, { Suspense, useState } from 'react';
import {
  TrendingUp,
  Wallet,
  CheckCircle2,
  Car,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '@/src/shared/utils/currency';
import { FinancePresenter } from './FinancePresenter';
import { useDashboardState, DashboardState } from './useDashboardState';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';
import { cn } from '@/src/shared/utils/cn';
import { Skeleton } from '@/src/shared/design-system/Skeleton';
import { AnimatedNumber } from '@/src/shared/design-system/AnimatedNumber';
import { MetricDrillDownModal, DrillDownType } from './components/MetricDrillDownModal';
import { haptics } from '@/src/shared/utils/haptics';

const ReceivableDebtsList = React.lazy(() =>
  import('./components/ReceivableDebtsList').then(module => ({
    default: module.ReceivableDebtsList
  }))
);

const PayableDebtsList = React.lazy(() =>
  import('./components/PayableDebtsList').then(module => ({
    default: module.PayableDebtsList
  }))
);

const DashboardMobileSkeleton = () => (
  <NativePage className="bg-slate-50 px-4 py-6 space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton glassmorphism variant="text" width={100} height={10} className="opacity-20" />
        <Skeleton glassmorphism variant="text" width={80} height={28} className="opacity-30" />
      </div>
    </div>
    {/* Month picker skeleton */}
    <Skeleton glassmorphism variant="rectangle" width={160} height={48} className="rounded-full opacity-20" />
    
    {/* Profit card skeleton - Premium Biological design */}
    <div className="expressive-shimmer-card p-8 min-h-[160px] flex flex-col justify-between bg-kraft-accent/15">
      <div className="space-y-2">
        <Skeleton glassmorphism variant="text" width="40%" height={12} className="opacity-40" />
        <Skeleton glassmorphism variant="text" width="70%" height={36} className="opacity-50" />
      </div>
      <Skeleton glassmorphism variant="rectangle" width={120} height={24} className="rounded-full opacity-35" />
    </div>

    {/* Stats grid skeleton */}
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-[2rem] border border-black/5 space-y-3">
          <Skeleton glassmorphism variant="rectangle" width={40} height={40} className="rounded-xl opacity-20" />
          <Skeleton glassmorphism variant="text" width="60%" height={10} className="opacity-20" />
          <Skeleton glassmorphism variant="text" width="80%" height={18} className="opacity-30" />
        </div>
      ))}
    </div>
    {/* Debt list skeletons */}
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-[2rem] border border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton glassmorphism variant="rectangle" width={40} height={40} className="rounded-xl opacity-20" />
            <div className="space-y-1.5">
              <Skeleton glassmorphism variant="text" width={100} height={14} className="opacity-20" />
              <Skeleton glassmorphism variant="text" width="60%" height={10} className="opacity-20" />
            </div>
          </div>
          <Skeleton glassmorphism variant="text" width={70} height={16} className="opacity-35" />
        </div>
      ))}
    </div>
  </NativePage>
);

interface DashboardMobileViewProps {
  presenter: FinancePresenter;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
  state?: DashboardState;
}

/**
 * 🍎 iPhone Native Dashboard View.
 * Implements "The Kraft Philosophy": Integrity, Deference, Vibrancy.
 */
export const DashboardMobileView: React.FC<DashboardMobileViewProps> = ({
  presenter,
  onNavigate,
  state: propState
}) => {
  const internalState = useDashboardState(presenter);
  const state = propState || internalState;
  const {
    loading,
    overview,
    filterMonth,
    handleMonthChange,
    receivableDebts,
    totalReceivables,
    payableDebts,
    totalPayables,
    vehicles
  } = state;

  const [drillDownType, setDrillDownType] = useState<DrillDownType>(null);

  const openDrillDown = (type: DrillDownType) => {
    haptics.light();
    setDrillDownType(type);
  };

  const isInitialLoading = loading && !overview;

  if (isInitialLoading) return <DashboardMobileSkeleton />;

  return (
    <NativePage className="bg-slate-50 pb-28">
      <NativeHeader>
        <div className="flex items-center gap-2">
          <SecondaryLabel>Hệ thống quản trị</SecondaryLabel>
          <span className="bg-red-500 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full animate-pulse">
            NATIVE
          </span>
        </div>
        <LargeTitle>Báo cáo</LargeTitle>

        {/* Month Selector - Native Style */}
        <div className="mt-4 relative inline-flex items-center gap-3 px-6 h-12 rounded-full border border-white/40 bg-white/70 backdrop-blur-md shadow-neural-t2 active:scale-95 transition-transform w-fit overflow-hidden">
          <Calendar size={16} className="text-kraft-accent shrink-0" />
          <span className="font-black uppercase text-[11px] tracking-widest text-kraft-ink pointer-events-none">
            {filterMonth ? `THÁNG ${filterMonth.split('-')[1]}/${filterMonth.split('-')[0]}` : 'CHỌN THÁNG'}
          </span>
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </NativeHeader>

      <div className="relative">
        <div className="transition-all duration-500">
          <div className="space-y-4">
            {/* Primary Profit Card - The "Wow" Component */}
            <div 
              onClick={() => openDrillDown('gross_profit')}
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-kraft-accent via-indigo-600 to-indigo-800 p-8 text-white shadow-2xl shadow-kraft-accent/30 expressive-reveal-card border border-white/20 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/15 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full -ml-12 -mb-12 blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <SecondaryLabel className="text-white/70">Lợi nhuận ròng cuối</SecondaryLabel>
                <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                  Chạm để xem xe bán
                </span>
              </div>

              <div className="text-4xl font-black mt-2 tracking-tighter">
                <AnimatedNumber value={overview?.finalNetProfit || 0} isCurrency={true} />
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs font-bold bg-white/10 w-fit px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                <TrendingUp size={14} className="text-emerald-300" />
                <span>Lãi gộp: {formatCurrency(overview?.grossProfit || 0)}</span>
              </div>
            </div>

            {/* Stats Grid - 2 Columns Mobile */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                label="Tiền mặt"
                value={formatCurrency(overview?.availableCash || 0)}
                numericValue={overview?.availableCash || 0}
                icon={Wallet}
                color="emerald"
              />
              <StatCard 
                label="Xe đã bán"
                value={`${overview?.soldCount || 0} xe`}
                icon={CheckCircle2}
                color="blue"
                onClick={() => openDrillDown('sold_vehicles')}
              />
              <StatCard 
                label="Tồn kho"
                value={`${overview?.inventoryCount || 0} xe`}
                icon={Car}
                color="orange"
                onClick={() => openDrillDown('inventory_vehicles')}
              />
              <StatCard 
                label="Tồn lâu"
                value={`${overview?.agingCount || 0} xe`}
                icon={AlertCircle}
                color="red"
                isWarning={(overview?.agingCount || 0) > 0}
                onClick={() => openDrillDown('aging_vehicles')}
              />
            </div>

            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/80 shadow-xs">
              <div className="text-center p-2 border-r border-hairline-soft">
                <span className="text-[9px] font-black uppercase tracking-wider text-sub-label block">Tồn kho bình quân (DSI)</span>
                <span className="text-base font-black text-kraft-ink mt-0.5 block">{overview?.averageDSI || 0} ngày</span>
              </div>
              <div className="text-center p-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-sub-label block">Tỷ suất lãi gộp</span>
                <span className="text-base font-black text-emerald-600 mt-0.5 block">{overview?.profitMarginPercent || 0}%</span>
              </div>
            </div>

            {/* Báo cáo Công nợ - Tách gói nạp động bằng Suspense */}
            <div className="pt-4 space-y-6">
              <Suspense fallback={
                <div className="bg-white p-5 rounded-[2rem] border border-black/5 flex items-center justify-between min-h-[96px] animate-pulse">
                  <div className="flex items-center gap-3">
                    <Skeleton glassmorphism variant="rectangle" width={40} height={40} className="rounded-xl opacity-20" />
                    <div className="space-y-1.5">
                      <Skeleton glassmorphism variant="text" width={100} height={14} className="opacity-20" />
                      <Skeleton glassmorphism variant="text" width={60} height={10} className="opacity-20" />
                    </div>
                  </div>
                </div>
              }>
                <ReceivableDebtsList 
                  debts={receivableDebts} 
                  total={totalReceivables} 
                  isCompact={true} 
                  onVehicleClick={(vehicleId) => {
                    const v = vehicles.find(x => x.id === vehicleId);
                    if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
                  }}
                />
              </Suspense>

              <Suspense fallback={
                <div className="bg-white p-5 rounded-[2rem] border border-black/5 flex items-center justify-between min-h-[96px] animate-pulse">
                  <div className="flex items-center gap-3">
                    <Skeleton glassmorphism variant="rectangle" width={40} height={40} className="rounded-xl opacity-20" />
                    <div className="space-y-1.5">
                      <Skeleton glassmorphism variant="text" width={100} height={14} className="opacity-20" />
                      <Skeleton glassmorphism variant="text" width={60} height={10} className="opacity-20" />
                    </div>
                  </div>
                </div>
              }>
                <PayableDebtsList 
                  debts={payableDebts} 
                  total={totalPayables} 
                  isCompact={true} 
                  onVehicleClick={(vehicleId) => {
                    const v = vehicles.find(x => x.id === vehicleId);
                    if (v) onNavigate('inventory', v.code, 'ALL', 'view_vehicle');
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Drilldown Modal on Mobile */}
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
    </NativePage>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  numericValue?: number;
  isCurrency?: boolean;
  icon: React.ElementType;
  color?: string;
  isWarning?: boolean;
  onClick?: () => void;
}

const StatCard = ({ label, value, numericValue, isCurrency = true, icon: Icon, color = 'blue', isWarning, onClick }: StatCardProps) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col gap-3 p-5 rounded-[2rem] border transition-all active:scale-95 text-left backdrop-blur-md cursor-pointer",
      "bg-white/80 border-white/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:bg-white",
      isWarning && "bg-red-50/60 border-red-100/80"
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
      color === 'emerald' && "bg-emerald-100 text-emerald-600",
      color === 'blue' && "bg-blue-100 text-blue-600",
      color === 'orange' && "bg-orange-100 text-orange-600",
      color === 'red' && "bg-red-100 text-red-600",
    )}>
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <div className="text-[10px] font-black uppercase tracking-wider text-kraft-ink/40 leading-none mb-1">
        {label}
      </div>
      <div className={cn(
        "text-lg font-black tracking-tight text-kraft-ink",
        isWarning && "text-red-600"
      )}>
        {numericValue !== undefined ? (
          <AnimatedNumber value={numericValue} isCurrency={isCurrency} />
        ) : (
          value
        )}
      </div>
    </div>
  </button>
);
