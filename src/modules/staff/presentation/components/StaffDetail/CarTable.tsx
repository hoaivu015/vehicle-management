import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { formatCurrency } from '@/src/utils/currency';

interface CarTableProps {
  activeTab: 'sales' | 'buying' | 'collaboration';
  cars: any[];
}

export const CarTable: React.FC<CarTableProps> = ({ activeTab, cars }) => {
  return (
    <div className="bg-white/60 rounded-[2.5rem] border border-white/60 shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead className="bg-black/[0.02] border-b border-black/5">
          <tr>
            <th className="py-6 px-10 text-sub-label !opacity-30">Phương tiện</th>
            <th className="py-6 px-10 text-sub-label !opacity-30 whitespace-nowrap">Ngày GD</th>
            <th className="py-6 px-10 text-sub-label !opacity-30 text-right whitespace-nowrap">Giá {activeTab === 'buying' ? 'Nhập' : 'Bán'}</th>
            <th className="py-6 px-10 text-sub-label !opacity-30 text-right whitespace-nowrap">{activeTab === 'collaboration' ? 'Lợi nhuận' : 'Thu nhập'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.03]">
          {activeTab === 'sales' && cars.map(car => {
            const financials = calculateVehicleFinancials(car);
            return (
              <tr key={car.id} className="group hover:bg-white/60 transition-colors">
                <td className="py-8 px-10">
                  <span className="text-[12px] font-black uppercase tracking-widest text-kraft-ink group-hover:text-kraft-accent transition-colors">{car.name}</span>
                  <p className="text-[9px] font-bold text-kraft-ink/20 uppercase mt-1">#{car.code}</p>
                </td>
                <td className="py-8 px-10 text-[10px] font-black text-kraft-ink/40 uppercase">{car.sale_date}</td>
                <td className="py-8 px-10 text-[13px] font-black text-right tracking-tighter">{formatCurrency(car.sale_price || 0)}</td>
                <td className="py-8 px-10 text-right">
                  <span className="text-[13px] font-black text-kraft-accent tracking-tighter bg-kraft-accent/5 px-4 py-2 rounded-xl border border-kraft-accent/10">
                    +{formatCurrency(financials.sellingCommission)}
                  </span>
                </td>
              </tr>
            );
          })}
          
          {activeTab === 'buying' && cars.map(car => {
            const financials = calculateVehicleFinancials(car);
            return (
              <tr key={car.id} className="group hover:bg-white/60 transition-colors">
                <td className="py-8 px-10 text-sm font-black uppercase text-kraft-ink">{car.name}</td>
                <td className="py-8 px-10 text-[10px] font-black text-kraft-ink/40 uppercase">{car.purchase_date}</td>
                <td className="py-8 px-10 text-[13px] font-black text-right tracking-tighter">{formatCurrency(car.purchase_price || 0)}</td>
                <td className="py-8 px-10 text-right">
                  <span className="text-[13px] font-black text-blue-600 tracking-tighter bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                    +{formatCurrency(financials.buyingCommission)}
                  </span>
                </td>
              </tr>
            );
          })}

          {activeTab === 'collaboration' && cars.map(car => {
            const financials = calculateVehicleFinancials(car);
            return (
              <tr key={car.id} className="group hover:bg-white/60 transition-colors">
                <td className="py-8 px-10">
                  <span className="text-sm font-black uppercase text-kraft-ink">{car.name}</span>
                  <p className="text-[9px] font-bold text-kraft-ink/20 uppercase mt-1">Góp vốn: {formatCurrency(car.coinvest_amount)}</p>
                </td>
                <td className="py-8 px-10 text-[10px] font-black text-kraft-ink/40 uppercase">{car.sale_date}</td>
                <td className="py-8 px-10 text-[13px] font-black text-right tracking-tighter">{formatCurrency(car.sale_price || 0)}</td>
                <td className="py-8 px-10 text-right">
                  <span className={cn(
                    "text-[13px] font-black tracking-tighter px-4 py-2 rounded-xl border",
                    financials.partnerProfitShare >= 0 
                      ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                      : "text-red-600 bg-red-50 border-red-100"
                  )}>
                    {financials.partnerProfitShare >= 0 ? '+' : ''}{formatCurrency(financials.partnerProfitShare)}
                  </span>
                </td>
              </tr>
            );
          })}

          {cars.length === 0 && (
            <tr>
              <td colSpan={4} className="py-32 text-center opacity-10">
                <ShoppingBag size={64} className="mx-auto mb-6" strokeWidth={1} />
                <p className="text-[12px] font-black uppercase tracking-[0.4em]">Empty Inbox</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
