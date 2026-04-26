import React from 'react';
import { PieChart, DollarSign, TrendingUp, Zap, Target, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { SalaryItem } from './PersonalShared';
import { formatCurrency } from '@/src/utils/currency';

interface SalaryBreakdownCardProps {
  salaryDetails: any;
  selectedMonth: string;
}

export const SalaryBreakdownCard: React.FC<SalaryBreakdownCardProps> = ({
  salaryDetails,
  selectedMonth
}) => {
  const monthNum = selectedMonth.split('-')[1];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="liquid-card border-white/60 !p-0 shadow-[var(--shadow-kraft-deep)] overflow-hidden rounded-t1"
    >
      <div className="p-8 border-b border-black/5 bg-emerald-500/5 flex items-center justify-between">
        <h3 className="text-xl font-black uppercase flex items-center gap-4 text-emerald-600 font-heading tracking-tighter">
          <div className="p-3 rounded-t3 bg-emerald-500/10">
            <PieChart size={24} strokeWidth={2.5} />
          </div>
          Bảng kê lương chi tiết
        </h3>
        <span className="text-sub-label !opacity-40">Tháng {monthNum}</span>
      </div>
      
      <div className="p-10 space-y-8">
        <div className="space-y-6">
          <SalaryItem 
            label="Lương cơ bản" 
            value={formatCurrency(salaryDetails.base)} 
            icon={DollarSign}
          />
          <SalaryItem 
            label="Hoa hồng bán xe" 
            value={formatCurrency(salaryDetails.salesCommission)} 
            icon={TrendingUp}
            detail={salaryDetails.kpiBonusMultiplier < 1 ? `(Hệ số KPI: ${salaryDetails.kpiBonusMultiplier})` : '(Hệ số KPI: 1.0)'}
          />
          <SalaryItem 
            label="Hoa hồng nhập xe" 
            value={formatCurrency(salaryDetails.buyingCommission)} 
            icon={Zap}
          />
          <SalaryItem 
            label="Chia sẻ lợi nhuận góp vốn" 
            value={formatCurrency(salaryDetails.coinvestProfitShare)} 
            icon={Target}
          />
        </div>
        
        <div className="pt-8 border-t-2 border-dashed border-black/5 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sub-label mb-1">Tổng thu nhập thực nhận</p>
              <p className="text-4xl font-black text-kraft-ink tracking-tighter">
                {formatCurrency(salaryDetails.totalSalary)}
              </p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
