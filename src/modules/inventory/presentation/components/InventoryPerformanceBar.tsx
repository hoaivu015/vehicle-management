import React from 'react';
import { Package, DollarSign, AlertCircle } from 'lucide-react';
import { Vehicle } from '@/src/shared/domain/types';
import { formatCurrency } from '@/src/shared/utils/currency';
import { MetricCard } from '@/src/shared/design-system/DataDisplay';

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
        <MetricCard
          key={i}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          isWarning={stat.isWarning}
        />
      ))}
    </div>
  );
};
