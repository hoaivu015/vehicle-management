import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { Vehicle } from '@/src/shared/domain/types';

interface InventoryPieChartProps {
  cars: Vehicle[];
}

const COLORS = ['#10b981', '#2563eb', '#eb5e28']; // income, brand, brand-accent

export const InventoryPieChart: React.FC<InventoryPieChartProps> = ({ cars }) => {
  const data = React.useMemo(() => {
    // 1. Trong kho (Sẵn sàng bán + Đang Spa)
    const inStock = cars.filter(c => 
      c.status === VehicleStatus.IN_STOCK || 
      c.status === VehicleStatus.SPA
    ).length;

    // 2. Đang cọc (Khách đã chốt, chờ giao/chờ bank)
    const deposit = cars.filter(c => 
      [VehicleStatus.DEPOSIT_SALE, VehicleStatus.BANK_DEPOSIT, VehicleStatus.BANK_CONFIRMED].includes(c.status)
    ).length;

    // 3. Sắp về (Xe công ty đã cọc mua nhưng chưa về kho)
    const incoming = cars.filter(c => c.status === VehicleStatus.DEPOSIT_BUY).length;

    return [
      { name: 'Trong kho', value: inStock },
      { name: 'Đang cọc', value: deposit },
      { name: 'Sắp về', value: incoming }
    ].filter(d => d.value > 0);
  }, [cars]);


  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={8}
            dataKey="value"
            animationDuration={1500}
            stroke="none"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px', 
              border: '1px solid rgba(0,0,0,0.05)', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              padding: '16px 24px',
              fontFamily: 'inherit',
              fontSize: '11px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }} 
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/60 ml-2">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
