import React from 'react';
import { PieChart, DollarSign, TrendingUp, Zap, Target, ShieldCheck, Clock, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { SalaryItem } from './PersonalShared';
import { formatCurrency } from '@/src/shared/utils/currency';
import { AnimatedNumber } from '@/src/shared/design-system/AnimatedNumber';
import { SalaryDetails } from '@/src/modules/staff/domain/StaffSalaryService';

interface SalaryBreakdownCardProps {
  salaryDetails: SalaryDetails;
  selectedMonth: string;
  totalHeldCapital?: number;
}

export const SalaryBreakdownCard: React.FC<SalaryBreakdownCardProps> = ({
  salaryDetails,
  selectedMonth,
  totalHeldCapital = 0
}) => {
  const monthNum = selectedMonth.split('-')[1];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.25 }}
      style={{ willChange: 'transform, opacity' }}
      className="liquid-card border-hairline-soft !p-0 shadow-kraft-deep overflow-hidden rounded-t2 flex flex-col justify-between h-full"
    >
      <div className="p-5 sm:p-6 border-b border-hairline-soft bg-income/5 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black uppercase flex items-center gap-3 text-income font-heading tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-income/10 flex items-center justify-center shrink-0 border border-income/20">
            <PieChart size={20} strokeWidth={2.5} />
          </div>
          Bảng kê lương & Hoa hồng
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-sub-label bg-black/5 px-3 py-1 rounded-full whitespace-nowrap">
          Tháng {monthNum}
        </span>
      </div>
      
      <div className="p-6 sm:p-8 space-y-6 flex-1">
        <div className="space-y-4">
          <SalaryItem 
            label="Lương cơ bản" 
            value={formatCurrency(salaryDetails.base)} 
            icon={DollarSign}
          />
          <SalaryItem 
            label="Hoa hồng bán xe" 
            value={formatCurrency(salaryDetails.salesCommission)} 
            icon={TrendingUp}
            detail={salaryDetails.kpiBonusMultiplier < 1 ? `(Hệ số KPI: ${salaryDetails.kpiBonusMultiplier}x)` : '(Hệ số KPI: 1.0x)'}
          />
          <SalaryItem 
            label="Hoa hồng nhập xe" 
            value={formatCurrency(salaryDetails.buyingCommission)} 
            icon={Zap}
          />
          {salaryDetails.buyingBonus > 0 && (
            <SalaryItem 
              label="Thưởng nhập xe" 
              value={formatCurrency(salaryDetails.buyingBonus)} 
              icon={Award}
            />
          )}
          <SalaryItem 
            label="Chia sẻ lợi nhuận góp vốn" 
            value={formatCurrency(salaryDetails.coinvestProfitShare)} 
            icon={Target}
            detail={totalHeldCapital > 0 ? `(Vốn đang gửi: ${formatCurrency(totalHeldCapital)})` : undefined}
          />
        </div>

        {(salaryDetails.totalReimbursements > 0 || salaryDetails.totalAdvances > 0) && (
          <div className="pt-4 border-t border-hairline-soft space-y-2">
            {salaryDetails.totalReimbursements > 0 && (
              <div className="flex justify-between items-center text-income">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                  Hoàn ứng chi hộ tháng {monthNum}:
                </span>
                <span className="text-sm font-black tracking-tight whitespace-nowrap">
                  +{formatCurrency(salaryDetails.totalReimbursements)}
                </span>
              </div>
            )}
            {salaryDetails.totalAdvances > 0 && (
              <div className="flex justify-between items-center text-expense">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                  Khấu trừ tạm ứng tháng {monthNum}:
                </span>
                <span className="text-sm font-black tracking-tight whitespace-nowrap">
                  -{formatCurrency(salaryDetails.totalAdvances)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-6 sm:p-8 pt-5 border-t border-hairline-soft bg-black/[0.01]">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-sub-label opacity-60 mb-1">
              Tổng thu nhập thực nhận
            </p>
            <div className={cn(
              "text-2xl sm:text-3xl font-black tracking-tight whitespace-nowrap",
              salaryDetails.isPaid ? "text-income" : "text-kraft-ink"
            )}>
              <AnimatedNumber value={salaryDetails.netSalary} isCurrency={true} />
            </div>
            <p className={cn(
              "text-[9px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5",
              salaryDetails.isPaid ? "text-income" : "text-sub-label opacity-50"
            )}>
              {salaryDetails.isPaid ? (
                <>
                  <ShieldCheck size={12} /> Đã hoàn tất chi lương tháng
                </>
              ) : (
                <>
                  <Clock size={12} /> Bảng kê tạm tính
                </>
              )}
            </p>
          </div>
          <div className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-t2 shadow-kraft-deep flex items-center justify-center text-white shrink-0 transition-colors",
            salaryDetails.isPaid ? "bg-income" : "bg-kraft-ink"
          )}>
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
