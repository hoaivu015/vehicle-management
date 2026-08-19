import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { motion } from 'motion/react';
import { PieChart as PieIcon } from 'lucide-react';
import { ExpenseBreakdownItem } from '@/src/modules/finance/application/GetFinancialOverview';
import { formatCurrency } from '@/src/shared/utils/currency';

interface ExpenseBreakdownChartProps {
  data: ExpenseBreakdownItem[];
  filterMonth: string;
}

export const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({
  data,
  filterMonth
}) => {
  const totalAmount = React.useMemo(() => {
    return (data || []).reduce((sum, item) => sum + item.amount, 0);
  }, [data]);

  const monthLabel = filterMonth ? `Tháng ${filterMonth.split('-')[1]}/${filterMonth.split('-')[0]}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.15 }}
      className="glass-l1 p-6 md:p-10 rounded-[2.5rem] border border-white/80 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <PieIcon size={18} />
            </div>
            <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-kraft-ink">
              Cơ Cấu Chi Phí Showroom
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-sub-label bg-surface-soft px-3 py-1 rounded-full border border-hairline-soft">
            {monthLabel}
          </span>
        </div>
        <p className="text-[11px] font-bold text-sub-label mb-6">
          Phân rã chi phí vận hành, làm đẹp hoàn thiện xe, lương cơ bản và hoa hồng phát sinh
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart with Center Total */}
        <div className="md:col-span-6 relative flex items-center justify-center h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={6}
                dataKey="amount"
                stroke="none"
                animationDuration={1000}
              >
                {data.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as ExpenseBreakdownItem;
                    return (
                      <div className="bg-kraft-ink/95 backdrop-blur-xl text-white p-3.5 rounded-2xl shadow-kraft-deep border border-white/10 text-xs space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{item.name}</p>
                        <p className="text-base font-black text-white">{formatCurrency(item.amount)}</p>
                        <p className="text-[11px] font-bold text-kraft-accent">{item.percent}% tổng chi phí</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Summary Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-sub-label">
              Tổng chi phí
            </span>
            <span className="text-sm md:text-base font-black text-kraft-ink tracking-tight mt-0.5 max-w-[110px] truncate">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="md:col-span-6 space-y-2.5">
          {data.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-surface-soft/60 hover:bg-surface-soft rounded-xl border border-hairline-soft flex items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" 
                  style={{ backgroundColor: item.color }} 
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-kraft-ink truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] font-bold text-sub-label">
                    {item.percent}% cơ cấu
                  </p>
                </div>
              </div>

              <span className="text-xs sm:text-sm font-black text-kraft-ink whitespace-nowrap">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
