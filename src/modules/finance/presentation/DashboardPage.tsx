import React, { useState, useEffect, useMemo } from 'react';
import {
  CircleDollarSign,
  Car,
  Wallet,
  TrendingUp,
  Calendar,
  Download,
  AlertCircle,
  Clock,
  ShoppingBag,
  Coins,
  CheckCircle2,
  Edit3,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../../../utils/currency';
import { cn } from '../../../utils/cn';
import { exportToExcel } from '../../../utils/export';
import { FinancePresenter, FinanceView } from './FinancePresenter';
import { FinancialOverviewData } from '../application/GetFinancialOverview';
import { MonthlyFinanceData } from '../application/GetMonthlyFinance';
import { Vehicle } from '../../../shared/domain/types';
import { VehicleStatus } from '../../../shared/domain/constants';

// New Components
import { DashboardStatGrid } from '../../dashboard/presentation/components/DashboardStatGrid';
import { WeeklyCashflowChart } from '../../dashboard/presentation/components/WeeklyCashflowChart';
import { InventoryPieChart } from '../../dashboard/presentation/components/InventoryPieChart';
import { DashboardSkeleton } from '../../dashboard/presentation/DashboardSkeleton';
import { NetProfitComparisonReport } from './components/NetProfitComparisonReport';

interface DashboardPageProps {
  presenter: FinancePresenter;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  presenter,
  onNavigate
}) => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<FinancialOverviewData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinanceData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const view: FinanceView = useMemo(() => ({
    setLoading,
    setMonthlyFinance: setMonthlyData,
    setFinancialOverview: setOverview,
    setTotalCapital: () => { },
    setVehicles: setVehicles,
    setStaff: setStaff,
    showError: (msg) => console.error(msg)
  }), []);

  useEffect(() => {
    presenter.attachView(view);
    presenter.loadFinanceData();
    presenter.subscribeToChanges();

    return () => {
      presenter.detachView();
    };
  }, [presenter, view]);

  // --- Weekly Chart Data ---
  const weeklyChartData = overview?.weeklyCashflow || [
    { name: 'Tuần 1', thu: 0, chi: 0 },
    { name: 'Tuần 2', thu: 0, chi: 0 },
    { name: 'Tuần 3', thu: 0, chi: 0 },
    { name: 'Tuần 4', thu: 0, chi: 0 }
  ];

  // Mapping Stats for Grid (8 Cards)
  const stats = useMemo(() => [
    { label: 'Lợi nhuận gộp (Showroom)', value: formatCurrency(overview?.grossProfit || 0), icon: CircleDollarSign, subValue: 'Phần thực hưởng của Showroom' },
    { label: 'Lợi nhuận ròng', value: formatCurrency(overview?.netProfit || 0), icon: TrendingUp, subValue: 'Sau khi chia sẻ góp vốn & trừ CP', isNegative: (overview?.netProfit || 0) < 0 },
    { label: 'Lợi ròng cuối', value: formatCurrency(overview?.finalNetProfit || 0), icon: Coins, subValue: 'Sau khi quyết toán lương & thưởng', isNegative: (overview?.finalNetProfit || 0) < 0 },
    { label: 'Tiền mặt khả dụng', value: formatCurrency(overview?.availableCash || 0), icon: Wallet, subValue: 'Số dư thực tế tại quỹ' },
    { label: 'Xe đã bán', value: `${overview?.soldCount || 0} xe`, icon: CheckCircle2, subValue: `Kế hoạch tháng: 25 xe` },
    { label: 'Xe nhập mới', value: `${overview?.boughtCount || 0} xe`, icon: ShoppingBag, subValue: 'Tốc độ nhập hàng' },
    { label: 'Tồn kho hiện tại', value: `${overview?.inventoryCount || 0} xe`, icon: Car, subValue: `Vốn tự có: ${formatCurrency(overview?.inventoryValue || 0)}` },
    {
      label: 'Tồn kho lâu (>25đ)',
      value: `${overview?.agingCount || 0} xe`,
      icon: AlertCircle,
      subValue: 'Cần xử lý giá ngay',
      isWarning: (overview?.agingCount || 0) > 0,
      actionIcon: Edit3,
      onActionClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigate('inventory', '', 'AGING_25', 'adjust_price');
      }
    },
  ], [overview, onNavigate]);

  if (loading && !overview) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 md:space-y-12 py-4 md:py-12 px-4 md:px-12 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 h-full overflow-y-auto scrollbar-hidden pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-black/5 pb-8 md:pb-10">
        <div>
          <h1 className="text-[clamp(2rem,8vw,4rem)] md:text-5xl lg:text-6xl font-black tracking-tighter text-kraft-ink flex items-center gap-3 md:gap-4 leading-none">
            BÁO CÁO
            <span className="text-[9px] md:text-xs font-black px-2 md:px-3 py-1 bg-kraft-accent text-white rounded-lg tracking-widest leading-none">TỔNG LỰC</span>
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-kraft-ink/30 mt-3">Trung tâm điều hành kinh doanh & tài chính</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative group min-w-[220px] md:w-60">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Calendar size={16} className="text-kraft-accent/60 group-hover:text-kraft-accent transition-colors" />
            </div>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                const val = e.target.value;
                setFilterMonth(val);
                presenter.setMonth(val);
              }}
              className="pl-12 pr-6 h-14 w-full liquid-glass-core rounded-2xl text-[11px] font-black uppercase tracking-widest text-kraft-ink focus:border-kraft-accent/40 focus:ring-4 focus:ring-kraft-accent/5 transition-all outline-none"
            />
          </div>

          <button
            onClick={() => exportToExcel({ 'Dashboard': stats }, `Bao_cao_${filterMonth}`)}
            className="h-14 px-8 bg-black text-white rounded-2xl flex items-center gap-3 hover:bg-neutral-800 transition-all active:scale-95 shadow-xl shadow-black/10 group"
          >
            <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Snapshot Layer (L1) */}
      <div className="glass-l1 rounded-[2.5rem] p-2 md:p-3">
        <DashboardStatGrid stats={stats} />
      </div>

      {/* NEW: Final Net Profit Comparison Report */}
      {overview && (
        <NetProfitComparisonReport 
          currentProfit={overview.finalNetProfit}
          comparisons={overview.profitComparisons}
          filterMonth={filterMonth}
        />
      )}

      {/* Hero Section - Primary Zone (L2) */}
      <div className="glass-l2-hero p-6 md:p-12 rounded-[3rem] md:rounded-[4rem]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 md:mb-12">
          <div>
            <h3 className="text-xl md:text-2xl font-black tracking-tighter text-kraft-ink uppercase">PHÂN TÍCH DÒNG TIỀN THEO TUẦN</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-kraft-ink/30 mt-2">Dòng tiền thu và chi trọng yếu tháng {filterMonth.split('-')[1]}</p>
          </div>
          <div className="flex gap-6 px-6 py-3 bg-black/5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-sm shadow-emerald-500/20" />
              <span className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/60">Tiền thu</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#eb5e28] shadow-sm shadow-orange-500/20" />
              <span className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/60">Tiền chi</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] md:h-[500px]">
          <WeeklyCashflowChart data={weeklyChartData} />
        </div>
      </div>

      {/* Secondary Zone - Operations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Inventory Breakdown Pie Chart */}
        <div className="glass-l1 p-8 md:p-12 rounded-[3rem] flex flex-col items-center">
          <h3 className="text-lg md:text-xl font-black tracking-tighter text-kraft-ink mb-10 text-center uppercase">Trạng thái kho hàng</h3>
          <div className="w-full flex justify-center">
            <InventoryPieChart cars={vehicles} />
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6 mt-12 w-full">
            <div className="p-5 md:p-6 rounded-3xl bg-white/40 border border-white/60 text-center">
              <p className="text-[9px] font-bold text-kraft-ink/40 uppercase mb-2 tracking-widest">Tỉ lệ xoay vòng</p>
              <p className="text-xl md:text-2xl font-black text-kraft-ink">2.4x</p>
            </div>
            <div className="p-5 md:p-6 rounded-3xl bg-white/40 border border-white/60 text-center">
              <p className="text-[9px] font-bold text-kraft-ink/40 uppercase mb-2 tracking-widest">Thanh khoản</p>
              <p className="text-xl md:text-2xl font-black text-emerald-600">Ổn định</p>
            </div>
          </div>
        </div>

        {/* Goal Progress Card */}
        <div className="p-12 rounded-[3.5rem] bg-kraft-ink text-white shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
            <ArrowUpRight size={120} />
          </div>
          <h3 className="text-[11px] font-black tracking-[0.4em] opacity-40 mb-10 uppercase">Mục tiêu kinh doanh tháng {filterMonth.split('-')[1]}</h3>
          <div className="flex items-end justify-between mb-6">
            <div className="text-6xl font-black tracking-tighter">{overview?.soldCount || 0} / 25</div>
            <div className="text-2xl font-black opacity-40">{Math.round(((overview?.soldCount || 0) / 25) * 100)}%</div>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((overview?.soldCount || 0) / 25) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-kraft-accent shadow-[0_0_20px_rgba(99,102,241,0.5)]"
            />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest mt-8 opacity-40 leading-relaxed">
            {(overview?.soldCount || 0) >= 25 ? 'Chúc mừng! Bạn đã vượt mục tiêu bán hàng tháng này.' : `Cần tối ưu thêm ${25 - (overview?.soldCount || 0)} xe để đạt chỉ tiêu tháng.`}
          </p>
        </div>
      </div>

      {/* Tertiary Zone - Logs & System (Auxiliary) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="glass-l3-aux p-10 rounded-[4rem]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-black tracking-widest text-kraft-ink/60 uppercase">Hoạt động gần đây</h3>
            <button className="text-[9px] font-black uppercase text-kraft-accent hover:underline flex items-center gap-1 group opacity-60">
              Chi tiết <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="space-y-8">
            {(overview?.recentActivities || []).slice(0, 4).map((item, i) => (
              <div key={i} className="flex gap-6 group items-center">
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
                <p className="text-[8px] font-bold uppercase tracking-widest text-kraft-ink/30 shrink-0">{item.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Alerts / Message Center */}
        <div className="glass-l3-aux p-10 rounded-[4rem] flex flex-col justify-center items-center text-center">
          <AlertCircle size={40} className="text-kraft-accent mb-6 opacity-20" />
          <h3 className="text-sm font-black tracking-widest text-kraft-ink/60 uppercase mb-3 text-center">Trình quản lý hệ thống</h3>
          <p className="text-[10px] font-bold text-kraft-ink/30 uppercase tracking-[0.2em] max-w-[300px] leading-relaxed mx-auto">
            Hệ thống thông minh ghi nhận 38 luồng dữ liệu ổn định. Không có cảnh báo tồn kho lâu chưa xử lý.
          </p>
          <div className="mt-8 flex gap-3">
            <div className="px-5 py-2 bg-white/40 rounded-full border border-white/60 text-[8px] font-black uppercase tracking-widest text-kraft-ink/40">
              DB: ONLINE
            </div>
            <div className="px-5 py-2 bg-white/40 rounded-full border border-white/60 text-[8px] font-black uppercase tracking-widest text-kraft-ink/40">
              AI: ACTIVE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

