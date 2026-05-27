import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { EmptyState } from '@/src/shared/design-system/DataDisplay';
import { cn } from '@/src/shared/utils/cn';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { formatCurrency } from '@/src/shared/utils/currency';
import { Vehicle } from '@/src/shared/domain/types';

type EarningType = 'sales' | 'buying' | 'collaboration';

interface UnifiedVehicle extends Vehicle {
  _type: EarningType;
}

interface CarTableProps {
  cars: UnifiedVehicle[];
  onUpdateVehicle?: (id: number, data: Partial<Vehicle>) => Promise<void>;
  userRole?: string;
}

export const CarTable: React.FC<CarTableProps> = ({ cars, onUpdateVehicle, userRole }) => {
  const canApprovePayout = userRole === 'ADMIN' || userRole === 'ACCOUNTANT';
  const getBadgeStyle = (type: EarningType) => {
    switch (type) {
      case 'sales': return "bg-income/10 text-income border-income/20";
      case 'buying': return "bg-brand/10 text-brand border-brand/20";
      case 'collaboration': return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    }
  };

  const getLabel = (type: EarningType) => {
    switch (type) {
      case 'sales': return "Bán";
      case 'buying': return "Nhập";
      case 'collaboration': return "Hợp tác";
    }
  };

  return (
    <div className="space-y-g4">
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-g4 md:hidden">
        {cars.map(car => {
          const financials = calculateVehicleFinancials(car);
          const isBuying = car._type === 'buying';
          const price = isBuying ? car.purchase_price : car.sale_price;
          const income = car._type === 'sales' 
            ? financials.sellingCommission 
            : isBuying 
              ? financials.buyingCommission 
              : financials.partnerProfitShare;
          const date = isBuying ? car.purchase_date : car.sale_date;

          return (
            <div key={`${car.id}-${car._type}`} className="p-g4 glass-purity-surface rounded-t2 border border-white/60 shadow-kraft-deep space-y-4">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border", getBadgeStyle(car._type))}>
                      {getLabel(car._type)}
                    </span>
                    <p className="text-[10px] font-bold text-sub-label opacity-40">#{car.code}</p>
                  </div>
                  <h4 className="text-sm font-black uppercase text-kraft-ink truncate tracking-tight">{car.name}</h4>
                </div>
                <span className="px-2 py-1 bg-surface-soft border border-hairline-soft rounded-lg text-[10px] font-black text-sub-label uppercase whitespace-nowrap tracking-widest">
                  {date}
                </span>
              </div>
              
              <div className="flex justify-between items-end pt-3 border-t border-hairline-soft">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sub-label opacity-40">Giá {isBuying ? 'nhập' : 'bán'}</p>
                  <p className="text-sm font-black text-kraft-ink tracking-tighter tabular-nums">{formatCurrency(price || 0)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sub-label opacity-40">Thu nhập</p>
                  <span className={cn(
                    "inline-block text-sm font-black tracking-tighter px-3 py-1 rounded-xl border tabular-nums shadow-sm",
                    income >= 0 ? "text-income bg-income/5 border-income/10" : "text-expense bg-expense/5 border-expense/10"
                  )}>
                    {income >= 0 ? '+' : ''}{formatCurrency(income)}
                  </span>
                </div>
              </div>

              {isBuying && (car.buying_bonus || 0) > 0 && (
                <div className="flex items-center justify-between p-3 bg-warning/5 rounded-2xl border border-warning/10">
                  <span className="text-[10px] font-black text-warning uppercase tracking-widest opacity-80">Thưởng nhập xe</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-warning tabular-nums">+{formatCurrency(car.buying_bonus)}</span>
                    {onUpdateVehicle && !car.buying_bonus_paid && canApprovePayout && (
                      <button 
                        onClick={() => onUpdateVehicle(car.id, { buying_bonus_paid: true })}
                        className="px-4 py-1.5 bg-warning text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-kraft-deep active:scale-95 transition-transform"
                      >
                        Chi
                      </button>
                    )}
                  </div>
                </div>
              )}

              {car._type === 'collaboration' && (
                <div className="flex items-center justify-between p-3 bg-surface-soft rounded-2xl border border-hairline-soft">
                  <span className="text-[10px] font-black text-sub-label uppercase tracking-widest opacity-60">Trạng thái vốn</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2 py-1 rounded-md border tracking-widest shadow-sm",
                    car.partner_capital_repaid ? "text-income bg-income/5 border-income/10" : "text-warning bg-warning/5 border-warning/10"
                  )}>
                    {car.partner_capital_repaid ? 'Đã hoàn' : 'Chờ hoàn'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white/60 rounded-t2 border border-white/60 shadow-kraft-deep overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-surface-soft/50 border-b border-hairline-soft">
            <tr>
              <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-30">Phân loại</th>
              <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-30">Phương tiện</th>
              <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-30 whitespace-nowrap">Ngày GD</th>
              <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-30 text-right whitespace-nowrap">Giá GD</th>
              <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-30 text-right whitespace-nowrap">Thu nhập</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {cars.map(car => {
              const financials = calculateVehicleFinancials(car);
              const isBuying = car._type === 'buying';
              const price = isBuying ? car.purchase_price : car.sale_price;
              const income = car._type === 'sales' 
                ? financials.sellingCommission 
                : isBuying 
                  ? financials.buyingCommission 
                  : financials.partnerProfitShare;
              const date = isBuying ? car.purchase_date : car.sale_date;

              return (
                <tr key={`${car.id}-${car._type}`} className="group hover:bg-white/60 transition-colors">
                  <td className="py-6 px-8">
                    <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm", getBadgeStyle(car._type))}>
                      {getLabel(car._type)}
                    </span>
                  </td>
                  <td className="py-6 px-8">
                    <span className="text-[12px] font-black uppercase tracking-tight text-kraft-ink group-hover:text-brand transition-colors">{car.name}</span>
                    <p className="text-[10px] font-bold text-sub-label opacity-30 mt-0.5">#{car.code}</p>
                  </td>
                  <td className="py-6 px-8 text-[10px] font-black text-sub-label opacity-40 uppercase tracking-widest">{date}</td>
                  <td className="py-6 px-8 text-[13px] font-black text-right tracking-tighter tabular-nums">{formatCurrency(price || 0)}</td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn(
                        "text-[13px] font-black tracking-tighter px-4 py-1.5 rounded-xl border tabular-nums shadow-sm",
                        income >= 0 
                          ? (car._type === 'collaboration' && !car.partner_profit_shared ? "text-warning bg-warning/5 border-warning/10" : "text-income bg-income/5 border-income/10")
                          : "text-expense bg-expense/5 border-expense/10"
                      )}>
                        {income >= 0 ? '+' : ''}{formatCurrency(income)}
                      </span>
                      
                      {/* Sub-actions/Badges */}
                      {isBuying && (car.buying_bonus || 0) > 0 && (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[9px] font-black tracking-tighter px-3 py-1 rounded-lg border shadow-sm tabular-nums",
                            car.buying_bonus_paid ? "text-income bg-income/5 border-income/10" : "text-warning bg-warning/5 border-warning/10"
                          )}>
                            Thưởng: +{formatCurrency(car.buying_bonus)}
                            {onUpdateVehicle && !car.buying_bonus_paid && canApprovePayout && (
                              <button 
                                onClick={() => onUpdateVehicle(car.id, { buying_bonus_paid: true })}
                                className="ml-3 px-2 py-0.5 bg-warning text-white rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-warning/80 transition-colors shadow-sm"
                              >
                                Chi ngay
                              </button>
                            )}
                          </span>
                        </div>
                      )}

                      {car._type === 'collaboration' && !car.partner_profit_shared && income > 0 && onUpdateVehicle && canApprovePayout && (
                        <button 
                          onClick={() => onUpdateVehicle(car.id, { partner_profit_shared: true })}
                          className="px-3 py-1 bg-warning text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-warning/80 transition-all shadow-kraft-deep active:scale-95"
                        >
                          Chi lợi nhuận
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {cars.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState 
                    icon={ShoppingBag} 
                    title="Danh sách trống" 
                    description="Chưa có dữ liệu giao dịch nào."
                    className="py-24 opacity-60"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
