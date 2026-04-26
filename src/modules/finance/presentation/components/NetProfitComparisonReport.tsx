import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  History, 
  Layers,
  CircleDollarSign,
  Minus
} from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';
import { cn } from '../../../../utils/cn';
import { ProfitComparison } from '../../application/GetFinancialOverview';

interface NetProfitComparisonReportProps {
  currentProfit: number;
  comparisons: {
    prevMonth: ProfitComparison;
    prevQuarter: ProfitComparison;
    prevYear: ProfitComparison;
  };
  filterMonth: string;
}

export const NetProfitComparisonReport: React.FC<NetProfitComparisonReportProps> = ({
  currentProfit,
  comparisons,
  filterMonth
}) => {
  const currentMonthLabel = filterMonth.split('-')[1];
  const currentYearLabel = filterMonth.split('-')[0];

  const renderComparisonItem = (label: string, data: ProfitComparison, icon: any) => {
    const Icon = icon;
    const isNeutral = Math.abs(data.change) < 0.01;

    return (
      <div className="relative group p-6 rounded-[2.5rem] bg-white/40 border border-white/60 hover:bg-white/60 transition-all duration-500 overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-kraft-accent/5 rounded-full blur-2xl group-hover:bg-kraft-accent/10 transition-all" />
        
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-kraft-ink/60 group-hover:text-kraft-accent transition-colors">
            <Icon size={18} />
          </div>
          <div className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase",
            isNeutral ? "bg-black/5 text-kraft-ink/40" : 
            data.isIncrease ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
          )}>
            {isNeutral ? <Minus size={12} /> : data.isIncrease ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {data.change.toFixed(1)}%
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-kraft-ink/30">{label}</p>
          <p className={cn(
            "text-xl font-black tracking-tighter",
            data.value < 0 ? "text-red-600" : "text-kraft-ink"
          )}>
            {formatCurrency(data.value)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative bg-white/60 backdrop-blur-3xl rounded-[4rem] p-10 md:p-14 border border-white/80 shadow-kraft-deep overflow-hidden"
    >
      {/* Accent Glow Background */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-kraft-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row gap-12 items-stretch">
        {/* Main Current Profit Section */}
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-sm font-black tracking-[0.3em] text-kraft-accent uppercase mb-2">Báo cáo hiệu quả kinh doanh</h2>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-kraft-ink flex items-baseline gap-3">
              THÁNG {currentMonthLabel} <span className="text-xl opacity-30">/ {currentYearLabel}</span>
            </h2>
          </div>

          <div className="p-8 md:p-12 rounded-[3rem] bg-white shadow-card-industrial border border-white/80 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <CircleDollarSign size={120} />
             </div>
             
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-kraft-ink/30 mb-4">Lợi nhuận ròng cuối cùng (Net Profit)</p>
             <h3 className={cn(
               "text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6",
               currentProfit < 0 ? "text-red-600" : "text-liquid-gradient"
             )}>
               {formatCurrency(currentProfit)}
             </h3>
             
             <div className="flex flex-wrap gap-4 pt-4 border-t border-black/5">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/5">
                  <Target size={14} className="text-kraft-accent" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/60">Đã chốt sổ lương & thưởng</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/5">
                  <Layers size={14} className="text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/60">Dòng tiền thực thu</span>
                </div>
             </div>
          </div>
        </div>

        {/* Comparisons Grid */}
        <div className="w-full xl:w-[450px] flex flex-col justify-center gap-6">
          <div className="flex items-center gap-3 mb-2">
            <History size={18} className="text-kraft-ink/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/20">So sánh đối soát</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-6">
            {renderComparisonItem('Tháng trước đó', comparisons.prevMonth, Calendar)}
            {renderComparisonItem('Quý trước (3 tháng)', comparisons.prevQuarter, Layers)}
            {renderComparisonItem('Cùng kỳ năm trước', comparisons.prevYear, History)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
