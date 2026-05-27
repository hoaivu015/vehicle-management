import React, { Suspense } from 'react';
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
import { useDashboardState } from './useDashboardState';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';
import { cn } from '@/src/shared/utils/cn';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

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
  <NativePage className="bg-[#F8F9FA] px-4 py-6 space-y-6">
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
}

/**
 * 🍎 iPhone Native Dashboard View.
 * Implements "The Kraft Philosophy": Integrity, Deference, Vibrancy.
 */
export const DashboardMobileView: React.FC<DashboardMobileViewProps> = ({
  presenter,
  onNavigate
}) => {
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
  } = useDashboardState(presenter);

  const isInitialLoading = loading && !overview;
  const isSubsequentLoading = loading && !!overview;

  if (isInitialLoading) return <DashboardMobileSkeleton />;


  return (
    <NativePage className="bg-[#F8F9FA]">
      <NativeHeader>
        <div className="flex items-center gap-2">
          <SecondaryLabel>Hệ thống quản trị</SecondaryLabel>
          <span className="bg-red-500 text-white text-[8px] px-1 rounded-sm animate-pulse">NATIVE</span>
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
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
          <div className="space-y-4">
            {/* Primary Profit Card - The "Wow" Component */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-kraft-accent to-indigo-700 p-8 text-white shadow-2xl shadow-kraft-accent/30 expressive-reveal-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <SecondaryLabel className="text-white/70">Lợi nhuận ròng</SecondaryLabel>
              <div className="text-4xl font-black mt-2 tracking-tighter">
                {formatCurrency(overview?.netProfit || 0)}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <TrendingUp size={14} />
                <span>+12% so với tháng trước</span>
              </div>
            </div>

            {/* Stats Grid - 2 Columns Mobile */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                label="Tiền mặt"
                value={formatCurrency(overview?.availableCash || 0)}
                icon={Wallet}
                color="emerald"
              />
              <StatCard 
                label="Xe đã bán"
                value={`${overview?.soldCount || 0} xe`}
                icon={CheckCircle2}
                color="blue"
              />
              <StatCard 
                label="Tồn kho"
                value={`${overview?.inventoryCount || 0} xe`}
                icon={Car}
                color="orange"
              />
              <StatCard 
                label="Tồn lâu"
                value={`${overview?.agingCount || 0} xe`}
                icon={AlertCircle}
                color="red"
                isWarning={(overview?.agingCount || 0) > 0}
                onClick={() => onNavigate('inventory', '', 'AGING_25', 'adjust_price')}
              />
            </div>

            {/* Báo cáo Công nợ - Tách gói nạp động bằng Suspense */}
            <div className="pt-6 space-y-6">
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

        {/* LỚP PHỦ KÍNH THỞ (Liquid Flow Glass Overlay) - Chạy 100% bằng GPU CSS animations */}
        {isSubsequentLoading && (
          <div
            className="absolute inset-0 bg-white/5 backdrop-blur-[6px] border border-white/10 rounded-[2.5rem] flex items-center justify-center z-50 pointer-events-none animate-in fade-in duration-300"
            style={{ animation: 'breathe-glow 3s ease-in-out infinite' }}
          >
            <div className="absolute inset-0 -z-10 opacity-30 mix-blend-color-dodge pointer-events-none overflow-hidden rounded-[2.5rem]">
              <div
                className="absolute -inset-10 bg-[radial-gradient(circle_at_30%_30%,#00f2fe_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#4facfe_0%,transparent_50%)] blur-[40px] animate-ambient-flow"
              />
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-kraft-accent shadow-neon-glow" />
          </div>
        )}
      </div>
    </NativePage>
  );
};

const StatCard = ({ label, value, icon: Icon, color, isWarning, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col gap-3 p-5 rounded-[2rem] border transition-all active:scale-95 text-left",
      "bg-white border-black/5 shadow-sm",
      isWarning && "bg-red-50/50 border-red-100"
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center",
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
        {value}
      </div>
    </div>
  </button>
);
