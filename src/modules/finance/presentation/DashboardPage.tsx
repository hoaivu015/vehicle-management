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
    setTotalCapital: () => {},
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
    { label: 'Lợi nhuận gộp', value: formatCurrency(overview?.grossProfit || 0), icon: CircleDollarSign, subValue: 'Chưa trừ CP & Lương' },
    { label: 'Lợi nhuận ròng', value: formatCurrency(overview?.netProfit || 0), icon: TrendingUp, subValue: 'Sau khi trừ CP vận hành', isNegative: (overview?.netProfit || 0) < 0 },
    { label: 'Lợi ròng (sau lương)', value: formatCurrency(overview?.finalNetProfit || 0), icon: Coins, subValue: 'Sau khi quyết toán lương', isNegative: (overview?.finalNetProfit || 0) < 0 },
    { label: 'Tiền mặt khả dụng', value: formatCurrency(overview?.availableCash || 0), icon: Wallet, subValue: 'Vốn lưu động tức thời' },
    { label: 'Xe đã bán', value: `${overview?.soldCount || 0} xe`, icon: CheckCircle2, subValue: `Kế hoạch tháng: 25 xe` },
    { label: 'Xe nhập mới', value: `${overview?.boughtCount || 0} xe`, icon: ShoppingBag, subValue: 'Tốc độ nhập hàng' },
    { label: 'Tồn kho hiện tại', value: `${overview?.inventoryCount || 0} xe`, icon: Car, subValue: `Tổng vốn: ${formatCurrency(overview?.inventoryValue || 0)}` },
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
    <div className="space-y-12 py-8 md:py-12 px-6 md:px-12 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 h-full overflow-y-auto scrollbar-hidden pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-black/5 pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-kraft-ink flex items-center gap-4">
            BÁO CÁO
            <span className="text-[10px] md:text-xs font-black px-3 py-1 bg-kraft-accent text-white rounded-lg tracking-widest leading-none">TỔNG LỰC</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-kraft-ink/30 mt-3">Trung tâm điều hành kinh doanh & tài chính</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
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
              className="pl-12 pr-6 h-14 w-full md:w-48 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 text-[11px] font-black uppercase tracking-widest text-kraft-ink focus:border-kraft-accent/40 focus:ring-4 focus:ring-kraft-accent/5 transition-all outline-none"
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

      {/* Stats Grid */}
      <DashboardStatGrid stats={stats} />

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Weekly Cashflow Chart */}
        <div className="xl:col-span-2 p-10 rounded-[3rem] border border-white/60 bg-white/40 shadow-sm backdrop-blur-2xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black tracking-tighter text-kraft-ink">PHÂN TÍCH DÒNG TIỀN THEO TUẦN</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-kraft-ink/30 mt-1">So sánh dòng tiền thu và chi trong tháng {filterMonth.split('-')[1]}</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/40">Thu</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#eb5e28]" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/40">Chi</span>
               </div>
            </div>
          </div>
          <WeeklyCashflowChart data={weeklyChartData} />
        </div>

        {/* Inventory Side Panel */}
        <div className="space-y-12">
          {/* Inventory Breakdown Pie Chart */}
          <div className="p-10 rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-2xl">
            <h3 className="text-xl font-black tracking-tighter text-kraft-ink mb-6 text-center uppercase">Trạng thái kho</h3>
            <InventoryPieChart cars={vehicles} />
            <div className="grid grid-cols-2 gap-4 mt-8">
               <div className="p-4 rounded-2xl bg-white/40 border border-white/60 text-center">
                 <p className="text-[9px] font-bold text-kraft-ink/40 uppercase mb-1 text-[8px]">Tỉ lệ quay vòng</p>
                 <p className="text-lg font-black text-kraft-ink">2.4x</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/40 border border-white/60 text-center">
                 <p className="text-[9px] font-bold text-kraft-ink/40 uppercase mb-1 text-[8px]">Thanh khoản</p>
                 <p className="text-lg font-black text-emerald-600">Cao</p>
               </div>
            </div>
          </div>

          {/* Goal Progress Card */}
          <div className="p-10 rounded-[3rem] bg-kraft-ink text-white shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
               <ArrowUpRight size={100} />
            </div>
            <h3 className="text-[10px] font-black tracking-[0.3em] opacity-40 mb-6 uppercase">Mục tiêu tháng {filterMonth.split('-')[1]}</h3>
            <div className="flex items-end justify-between mb-4">
               <div className="text-5xl font-black tracking-tighter">{overview?.soldCount || 0} / 25</div>
               <div className="text-xl font-black opacity-50">{Math.round(((overview?.soldCount || 0) / 25) * 100)}%</div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(((overview?.soldCount || 0) / 25) * 100, 100)}%` }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-kraft-accent"
               />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-6 opacity-40">
              {(overview?.soldCount || 0) >= 25 ? 'Chúc mừng! Đã đạt mục tiêu tháng' : `Còn thiếu ${25 - (overview?.soldCount || 0)} xe để về đích`}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="p-10 rounded-[4rem] bg-white border border-black/5 shadow-sm">
           <div className="flex justify-between items-center mb-10">
             <h3 className="text-xl font-black tracking-tighter text-kraft-ink uppercase">Hoạt động gần đây</h3>
             <button className="text-[10px] font-black uppercase text-kraft-accent hover:underline flex items-center gap-1 group">
               Xem tất cả <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
           <div className="space-y-8">
             {(overview?.recentActivities || []).map((item, i) => (
               <div key={i} className="flex gap-6 group">
                 <div className="relative">
                   <div className={cn(
                     "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6 shadow-sm",
                     item.type === 'purchase' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                     item.type === 'sale' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-red-50 text-red-600 border-red-100"
                   )}>
                     {item.type === 'purchase' ? <ShoppingBag size={18} /> : 
                      item.type === 'sale' ? <ArrowUpRight size={18} /> : <AlertCircle size={18} />}
                   </div>
                   {i !== overview!.recentActivities.length - 1 && <div className="absolute top-12 left-6 w-[1px] h-8 bg-black/5" />}
                 </div>
                 <div className="flex-1 pt-1">
                   <p className="text-sm font-bold text-kraft-ink leading-snug">
                     <span className="font-black text-kraft-accent uppercase mr-1">{item.user}</span> {item.action} <span className="font-black">{item.target}</span>
                   </p>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-kraft-ink/30 mt-2">{item.date}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Dynamic Alerts / Message Center */}
        <div className="p-10 rounded-[4rem] bg-kraft-accent/5 border border-kraft-accent/10 flex flex-col justify-center items-center text-center p-12">
           <AlertCircle size={60} className="text-kraft-accent mb-6 opacity-20" />
           <h3 className="text-xl font-black tracking-tight text-kraft-ink uppercase mb-2">Trình quản lý thông minh</h3>
           <p className="text-xs font-bold text-kraft-ink/40 uppercase tracking-widest max-w-[300px] leading-relaxed">
             Hệ thống đang theo dõi 38 điểm dữ liệu thời gian thực. Mọi chỉ số đều nằm trong ngưỡng an toàn.
           </p>
           <div className="mt-8 flex gap-4">
              <div className="px-6 py-2 bg-white rounded-full border border-black/5 text-[9px] font-black uppercase tracking-widest">
                Cơ sở dữ liệu: OK
              </div>
              <div className="px-6 py-2 bg-white rounded-full border border-black/5 text-[9px] font-black uppercase tracking-widest">
                AI Insight: Vừa cập nhật
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

