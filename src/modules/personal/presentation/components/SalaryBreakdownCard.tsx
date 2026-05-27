import React from 'react';
import { PieChart, DollarSign, TrendingUp, Zap, Target, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { SalaryItem } from './PersonalShared';
import { formatCurrency } from '@/src/shared/utils/currency';

interface SalaryDetails {
  base: number;
  salesCommission: number;
  buyingCommission: number;
  coinvestProfitShare: number;
  totalReimbursements: number;
  netSalary: number;
  kpiBonusMultiplier: number;
  isPaid: boolean;
}

interface SalaryBreakdownCardProps {
  salaryDetails: SalaryDetails;
  selectedMonth: string;
}

export const SalaryBreakdownCard: React.FC<SalaryBreakdownCardProps> = ({
  salaryDetails,
  selectedMonth
}) => {
  const monthNum = selectedMonth.split('-')[1];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, x: -20, rotate: -1, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, x: 0, rotate: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.25 }}
      style={{ willChange: 'transform, opacity' }}
      className="liquid-card border-hairline-soft !p-0 shadow-kraft-deep overflow-hidden rounded-t2 h-full"
    >
      <div className="p-8 border-b border-hairline-soft bg-income/5 flex items-center justify-between">
        <h3 className="text-xl font-black uppercase flex items-center gap-4 text-income font-heading tracking-tighter">
          <div className="w-11 h-11 rounded-xl bg-income/10 flex items-center justify-center">
            <PieChart size={20} strokeWidth={2.5} />
          </div>
          Bảng kê lương chi tiết
        </h3>
        <span className="text-sub-label font-black text-[10px] uppercase tracking-widest opacity-40">Tháng {monthNum}</span>
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

        {salaryDetails.totalReimbursements > 0 && (
          <div className="pt-6 border-t border-hairline-soft">
            <div className="flex justify-between items-center text-kraft-accent">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Chi hộ & Hoàn phí:</span>
              <span className="text-sm font-black tracking-tighter">+{formatCurrency(salaryDetails.totalReimbursements)}</span>
            </div>
          </div>
        )}
        
        <div className="pt-8 border-t-2 border-dashed border-hairline-soft mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sub-label mb-1">Tổng thu nhập thực nhận</p>
              <p className={cn(
                "text-4xl font-black tracking-tighter transition-colors",
                salaryDetails.isPaid ? "text-income" : "text-kraft-ink"
              )}>
                {formatCurrency(salaryDetails.netSalary)}
              </p>
              {salaryDetails.isPaid && (
                <p className="text-[10px] font-black text-income uppercase tracking-widest mt-2 flex items-center gap-2">
                  <ShieldCheck size={12} /> Đã chi lương tháng
                </p>
              )}
            </div>
            <div className={cn(
              "w-16 h-16 rounded-t2 shadow-kraft-deep flex items-center justify-center text-white transition-colors",
              salaryDetails.isPaid ? "bg-income" : "bg-kraft-ink"
            )}>
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
