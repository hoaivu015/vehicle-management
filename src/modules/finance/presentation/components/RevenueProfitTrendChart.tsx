import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { MonthlyTrendPoint } from '@/src/modules/finance/application/GetFinancialOverview';
import { formatCurrency } from '@/src/shared/utils/currency';

interface RevenueProfitTrendChartProps {
  data: MonthlyTrendPoint[];
  selectedMonth: string;
}

export const RevenueProfitTrendChart: React.FC<RevenueProfitTrendChartProps> = ({
  data,
  selectedMonth
}) => {
  const formattedData = React.useMemo(() => {
    return (data || []).map(d => ({
      ...d,
      revenueBillion: d.revenue / 1_000_000_000,
      profitMillion: d.finalNetProfit / 1_000_000,
      isSelected: d.month === selectedMonth
    }));
  }, [data, selectedMonth]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.1 }}
      className="glass-l1 p-6 md:p-10 rounded-[2.5rem] border border-white/80 flex flex-col justify-between"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
              <BarChart3 size={18} />
            </div>
            <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-kraft-ink">
              Xu Hướng Doanh Thu & Lợi Nhuận 12 Tháng
            </h3>
          </div>
          <p className="text-[11px] font-bold text-sub-label mt-1">
            Biểu đồ kết hợp Doanh thu bán xe (Cột) và Lợi nhuận ròng cuối cùng (Đường)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-soft border border-hairline-soft text-[10px] font-black uppercase tracking-wider text-kraft-ink">
          <TrendingUp size={13} className="text-emerald-500" />
          <span>Chu kỳ 12 tháng gần nhất</span>
        </div>
      </div>

      <div className="w-full h-[320px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formattedData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <defs>
              <linearGradient id="barRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1877F2" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#1877F2" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 11, fontWeight: 700, fill: '#65676B' }}
              axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 10, fontWeight: 700, fill: '#1877F2' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v === 0 ? '0' : `${v.toFixed(1)} tỷ`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fontWeight: 700, fill: '#31A24C' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v === 0 ? '0' : `${Math.round(v)} tr`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as MonthlyTrendPoint & { isSelected: boolean };
                  return (
                    <div className="bg-kraft-ink/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-kraft-deep border border-white/10 text-xs space-y-2 min-w-[200px]">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 font-black">
                        <span className="text-white/60">Tháng {item.month}</span>
                        <span className="text-kraft-accent">{item.soldCount} xe đã bán</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-white/60">Doanh thu:</span>
                          <span className="font-black text-kraft-accent">{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Lợi nhuận gộp:</span>
                          <span className="font-bold text-white/90">{formatCurrency(item.grossProfit)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-white/10">
                          <span className="text-income font-bold">Lợi nhuận ròng cuối:</span>
                          <span className="font-black text-income">{formatCurrency(item.finalNetProfit)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend 
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px' }}
              formatter={(value) => (
                <span className="text-[11px] font-black uppercase tracking-wider text-kraft-ink/70 mr-4">
                  {value === 'revenueBillion' ? 'Doanh thu' : 'Lợi nhuận ròng'}
                </span>
              )}
            />

            <Bar 
              yAxisId="left"
              dataKey="revenueBillion" 
              name="revenueBillion"
              fill="url(#barRevenueGrad)" 
              radius={[8, 8, 0, 0]} 
              maxBarSize={44}
            />

            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="profitMillion" 
              name="profitMillion"
              stroke="#31A24C" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#31A24C', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#31A24C', stroke: '#fff', strokeWidth: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
