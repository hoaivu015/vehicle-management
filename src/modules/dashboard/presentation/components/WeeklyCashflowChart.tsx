import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency } from '../../../../utils/currency';

interface WeeklyData {
  name: string;
  thu: number;
  chi: number;
}

interface WeeklyCashflowChartProps {
  data: WeeklyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 border border-white/60 rounded-2xl shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 mb-3">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-black text-emerald-600">
              Thu: {formatCurrency(payload[0].value)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-kraft-accent" />
            <p className="text-sm font-black text-kraft-accent">
              Chi: {formatCurrency(payload[1].value)}
            </p>
          </div>
          <div className="pt-2 border-t border-black/5 mt-2">
             <p className="text-[10px] font-bold uppercase text-kraft-ink/60">
               Dòng tiền thuần: {formatCurrency(payload[0].value - payload[1].value)}
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
    <div className="w-full h-[400px] mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/60 ml-2">{value === 'thu' ? 'Tiền thu' : 'Tiền chi'}</span>}
          />
          <Area 
            type="monotone" 
            dataKey="thu" 
            stroke="#10b981" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorThu)" 
            animationDuration={1500}
          />
          <Area 
            type="monotone" 
            dataKey="chi" 
            stroke="#eb5e28" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorChi)" 
            animationDuration={1500}
            animationDelay={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
