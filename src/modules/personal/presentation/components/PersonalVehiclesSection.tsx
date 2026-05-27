import React from 'react';
import { DollarSign } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { STAFF } from '@/src/constants';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { motion } from 'motion/react';

interface PersonalVehiclesSectionProps {
  soldCars: Vehicle[];
  boughtCars: Vehicle[];
  coinvestedCars: Vehicle[];
  selectedMonth: string;
  user: Staff;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const PersonalVehiclesSection: React.FC<PersonalVehiclesSectionProps> = ({
  soldCars,
  boughtCars,
  coinvestedCars,
  selectedMonth,
  user,
  onSelectVehicle
}) => {
  const monthNum = selectedMonth.split('-')[1];

  // Merge all transaction types into a single list
  const unifiedItems = [
    ...soldCars.map(car => ({
      ...car,
      type: 'sale',
      label: 'Bán xe',
      date: car.sale_date,
      amount: car.sale_price,
      commission: car.commission ?? (user.commission_per_car || 0),
      color: 'emerald'
    })),
    ...boughtCars.reduce((acc: any[], car) => {
      // 1. Nhập xe (chỉ hiển thị nếu buying_commission > 0 hoặc không phải là xe nợ thưởng từ tháng trước)
      if ((car.buying_commission ?? 0) > 0 || (car.buying_commission === undefined && !car.buying_bonus_paid)) {
        acc.push({
          ...car,
          type: 'buy',
          label: 'Nhập xe',
          date: car.purchase_date,
          amount: car.purchase_price,
          commission: car.buying_commission ?? STAFF.DEFAULT_BUYING_COMMISSION,
          color: 'amber'
        });
      }
      // 2. Thưởng nhập xe (hiển thị nếu buying_bonus > 0)
      if (car.buying_bonus && car.buying_bonus > 0) {
        acc.push({
          ...car,
          type: 'buy_bonus',
          label: 'Thưởng nhập',
          date: car.purchase_date,
          amount: car.purchase_price,
          commission: car.buying_bonus,
          color: 'orange'
        });
      }
      return acc;
    }, []),
    ...coinvestedCars.map(car => {
      const financials = calculateVehicleFinancials(car as any);
      const isSoldInSelectedMonth = car.status === VehicleStatus.SOLD && car.sale_date?.startsWith(selectedMonth);
      return {
        ...car,
        type: 'coinvest',
        label: 'Góp vốn',
        date: car.purchase_date, // or use some investment date if available
        amount: financials.coinvestAmount,
        commission: isSoldInSelectedMonth ? financials.partnerProfitShare : 0,
        color: 'indigo',
        statusLabel: car.status === VehicleStatus.SOLD ? 'Hoàn tất đầu tư' : 'Đang vận hành',
        isSoldInSelectedMonth
      };
    })
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 90, damping: 22, delay: 0.45 }}
      style={{ willChange: 'transform, opacity' }}
      className="space-y-8"
    >
      <h3 className="text-2xl font-black text-kraft-ink uppercase tracking-tight flex items-center gap-4 font-heading">
        <div className="p-3 rounded-t3 bg-kraft-accent/10 text-kraft-accent">
          <DollarSign size={24} strokeWidth={2.5} />
        </div>
        Bảng kê chi tiết giao dịch tháng {monthNum}
      </h3>

      <div className="liquid-card border-white/60 !p-0 overflow-hidden shadow-[var(--shadow-kraft-deep)] rounded-t1">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-kraft-accent/5">
                <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Mã xe</th>
                <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Thông tin xe</th>
                <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Loại hình</th>
                <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Ngày ghi nhận</th>
                <th className="py-6 px-8 text-sub-label text-kraft-accent/60 text-right">Giá trị</th>
                <th className="py-6 px-8 text-sub-label text-kraft-accent/60 text-right">Hoa hồng / LN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {unifiedItems.map((item: any, index: number) => (
                <motion.tr 
                  key={`${item.type}-${item.id}`} 
                  initial={{ opacity: 0, y: 12, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.55 + index * 0.04 }}
                  style={{ willChange: 'transform, opacity' }}
                  className="group hover:bg-kraft-accent/5 active:scale-[0.99] ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-500 cursor-pointer native-interactive active-press"
                  onClick={() => onSelectVehicle(item)}
                >
                  <td className="py-6 px-8">
                    <span className="font-black text-sm text-kraft-accent tracking-widest bg-kraft-accent/5 px-3 py-1.5 rounded-full border border-kraft-accent/10">{item.code}</span>
                  </td>
                  <td className="py-6 px-8">
                    <p className="font-black text-base text-kraft-ink tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mt-1">
                      {item.year} • {(item.odo || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} km
                    </p>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border shadow-sm",
                        item.color === 'emerald' ? "bg-income/10 text-income border-income/20" :
                        item.color === 'amber' ? "bg-warning/10 text-warning border-warning/20" :
                        item.color === 'orange' ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                        "bg-kraft-accent/10 text-kraft-accent border-kraft-accent/20"
                      )}>
                        {item.label}
                      </span>
                      {item.type === 'coinvest' && (
                        <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">
                          {item.statusLabel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-8 text-xs font-black opacity-40 uppercase tracking-widest">
                    {formatDate(item.date)}
                  </td>
                  <td className="py-6 px-8 text-right font-black text-base text-kraft-ink tracking-tighter">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-6 px-8 text-right font-black text-base text-income tracking-tighter">
                    {item.commission > 0 ? `+${formatCurrency(item.commission)}` : '-'}
                  </td>
                </motion.tr>
              ))}
              {unifiedItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <p className="text-sub-label !opacity-30 italic">Chưa có giao dịch phát sinh trong tháng</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
