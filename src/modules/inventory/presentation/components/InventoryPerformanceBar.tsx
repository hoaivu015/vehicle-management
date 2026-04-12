import React from 'react';
import { Package, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { Vehicle } from '../../../../shared/domain/types';
import { formatCurrency } from '../../../../utils/currency';
import { cn } from '../../../../utils/cn';

interface InventoryPerformanceBarProps {
  vehicles: Vehicle[];
}

export const InventoryPerformanceBar: React.FC<InventoryPerformanceBarProps> = ({ vehicles }) => {
  const totalInStock = vehicles.length;
  const totalValue = vehicles.reduce((sum, v) => sum + (v.purchase_price || 0) + (v.total_cost || 0), 0);
  
  const twentyFiveDaysAgo = new Date();
  twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
  
  const agingCount = vehicles.filter(v => {
    if (!v.purchase_date) return false;
    const purchaseDate = new Date(v.purchase_date);
    return purchaseDate <= twentyFiveDaysAgo;
  }).length;

  const stats = [
    { label: 'Tổng xe tồn', value: totalInStock, icon: Package, color: 'text-kraft-accent' },
    { label: 'Vốn tồn kho', value: formatCurrency(totalValue), icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Cảnh báo tồn lâu', value: agingCount, icon: AlertCircle, color: agingCount > 0 ? 'text-red-500' : 'text-kraft-ink/40', isWarning: agingCount > 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-sm flex items-center gap-6 group hover:bg-white/60 transition-all">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110",
            stat.isWarning ? "bg-red-50 border-red-100" : "bg-white border-black/5"
          )}>
            <stat.icon className={stat.color} size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-kraft-ink tracking-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
