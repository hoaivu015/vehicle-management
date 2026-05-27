import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/src/shared/utils/currency';

export interface WeeklyData {
  name: string;
  thu: number;
  chi: number;
}

interface WeeklyCashflowChartProps {
  data: WeeklyData[];
}

interface ChartPayload {
  value: number;
  dataKey: string;
  name: string;
  payload: WeeklyData;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: ChartPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-surface backdrop-blur-2xl p-6 border border-white/40 rounded-t2 shadow-kraft-deep">
        <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 mb-4">{label}</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-income shadow-sm" />
            <p className="text-xs font-black text-income uppercase tracking-tight">
              Thu: {formatCurrency(payload[0].value)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-expense shadow-sm" />
            <p className="text-xs font-black text-expense uppercase tracking-tight">
              Chi: {formatCurrency(payload[1].value)}
            </p>
          </div>
          <div className="pt-3 border-t border-hairline-soft mt-3">
             <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/60">
               Dòng tiền thuần: <span className="text-kraft-ink">{formatCurrency(payload[0].value - payload[1].value)}</span>
             </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const WeeklyCashflowChart: React.FC<WeeklyCashflowChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[250px] md:h-[400px] mt-6 md:mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorChi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eb5e28" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#eb5e28" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 900, fill: '#1a1a1a66' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 900, fill: '#1a1a1a66' }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 1 }} />
          <Area 
            type="monotone" 
            dataKey="thu" 
            stroke="#10b981" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorThu)" 
            animationDuration={1500}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
          />
          <Area 
            type="monotone" 
            dataKey="chi" 
            stroke="#eb5e28" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorChi)" 
            animationDuration={1500}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#eb5e28' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
