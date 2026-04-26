import React from 'react';
import { DollarSign, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import { StatCard } from './PersonalShared';
import { formatCurrency } from '@/src/utils/currency';

interface PersonalStatsGridProps {
  totalSalary: number;
  totalCommission: number;
  coinvestProfitShare: number;
  soldCarsCount: number;
  target: number;
  completionRate: number;
  selectedMonth: string;
}

export const PersonalStatsGrid: React.FC<PersonalStatsGridProps> = ({
  totalSalary,
  totalCommission,
  coinvestProfitShare,
  soldCarsCount,
  target,
  completionRate,
  selectedMonth
}) => {
  const monthNum = selectedMonth.split('-')[1];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
      <StatCard 
        delay={0.2}
        icon={DollarSign} 
        label={`Thu nhập tháng ${monthNum}`} 
        value={formatCurrency(totalSalary)} 
        color="emerald" 
      />
      <StatCard 
        delay={0.3}
        icon={Award} 
        label={`Hoa hồng tích lũy`} 
        value={formatCurrency(totalCommission)} 
        color="amber" 
      />
      <StatCard 
        delay={0.4}
        icon={TrendingUp} 
        label={`Tài sản góp vốn`} 
        value={formatCurrency(coinvestProfitShare)} 
        color="purple" 
      />
      <StatCard 
        delay={0.5}
        icon={CheckCircle2} 
        label={`Xe đã chốt`} 
        value={`${soldCarsCount} / ${target || 0} xe`} 
        color="indigo" 
        progress={completionRate}
      />
    </div>
  );
};
