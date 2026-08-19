import React, { useState, useMemo } from 'react';
import { DollarSign, Search, Car, ShoppingBag, Award, Share2 } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { STAFF } from '@/src/constants';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { motion } from 'motion/react';
import { haptics } from '@/src/shared/utils/haptics';

interface PersonalVehiclesSectionProps {
  soldCars: Vehicle[];
  boughtCars: Vehicle[];
  coinvestedCars: Vehicle[];
  selectedMonth: string;
  user: Staff;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export interface PersonalTransactionItem extends Vehicle {
  txType: 'sale' | 'buy' | 'buy_bonus' | 'coinvest';
  label: string;
  txDate?: string;
  txAmount?: number;
  txCommission?: number;
  color: 'emerald' | 'amber' | 'orange' | 'indigo';
  statusLabel?: string;
  isSoldInSelectedMonth?: boolean;
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
  const [filterType, setFilterType] = useState<'ALL' | 'sale' | 'buy' | 'coinvest'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Merge all transaction types into a unified list
  const unifiedItems: PersonalTransactionItem[] = useMemo(() => {
    return [
      ...soldCars.map(car => ({
        ...car,
        txType: 'sale' as const,
        label: 'Bán xe',
        txDate: car.sale_date,
        txAmount: car.sale_price,
        txCommission: car.commission ?? (user.commission_per_car || 0),
        color: 'emerald' as const
      })),
      ...boughtCars.reduce<PersonalTransactionItem[]>((acc, car) => {
        // 1. Nhập xe
        if ((car.buying_commission ?? 0) > 0 || (car.buying_commission === undefined && !car.buying_bonus_paid)) {
          acc.push({
            ...car,
            txType: 'buy' as const,
            label: 'Nhập xe',
            txDate: car.purchase_date,
            txAmount: car.purchase_price,
            txCommission: car.buying_commission ?? STAFF.DEFAULT_BUYING_COMMISSION,
            color: 'amber' as const
          });
        }
        // 2. Thưởng nhập xe
        if (car.buying_bonus && car.buying_bonus > 0) {
          acc.push({
            ...car,
            txType: 'buy_bonus' as const,
            label: 'Thưởng nhập',
            txDate: car.purchase_date,
            txAmount: car.purchase_price,
            txCommission: car.buying_bonus,
            color: 'orange' as const
          });
        }
        return acc;
      }, []),
      ...coinvestedCars.map(car => {
        const financials = calculateVehicleFinancials(car);
        const isSoldInSelectedMonth = car.status === VehicleStatus.SOLD && car.sale_date?.startsWith(selectedMonth);
        return {
          ...car,
          txType: 'coinvest' as const,
          label: 'Góp vốn',
          txDate: car.purchase_date,
          txAmount: financials.coinvestAmount,
          txCommission: isSoldInSelectedMonth ? financials.partnerProfitShare : 0,
          color: 'indigo' as const,
          statusLabel: car.status === VehicleStatus.SOLD ? 'Đã thanh toán' : 'Đang vận hành',
          isSoldInSelectedMonth
        };
      })
    ].sort((a, b) => (b.txDate || '').localeCompare(a.txDate || ''));
  }, [soldCars, boughtCars, coinvestedCars, selectedMonth, user]);

  // Filtered by Tab & Search
  const filteredItems = useMemo(() => {
    return unifiedItems.filter(item => {
      // Tab filter
      if (filterType === 'sale' && item.txType !== 'sale') return false;
      if (filterType === 'buy' && item.txType !== 'buy' && item.txType !== 'buy_bonus') return false;
      if (filterType === 'coinvest' && item.txType !== 'coinvest') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      return true;
    });
  }, [unifiedItems, filterType, searchQuery]);

  const handleRowClick = (item: PersonalTransactionItem) => {
    haptics.light();
    onSelectVehicle(item);
  };

  const tabs = [
    { id: 'ALL', label: 'Tất cả', count: unifiedItems.length },
    { id: 'sale', label: 'Xe đã bán', count: soldCars.length, icon: Car },
    { id: 'buy', label: 'Xe đã nhập', count: boughtCars.length, icon: ShoppingBag },
    { id: 'coinvest', label: 'Góp vốn', count: coinvestedCars.length, icon: Share2 }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 22, delay: 0.45 }}
      style={{ willChange: 'transform, opacity' }}
      className="space-y-6"
    >
      {/* Header & Filter Ribbon */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-kraft-ink uppercase tracking-tight flex items-center gap-3 font-heading">
            <div className="w-10 h-10 rounded-xl bg-kraft-accent/10 text-kraft-accent flex items-center justify-center border border-kraft-accent/20 shrink-0">
              <DollarSign size={20} strokeWidth={2.5} />
            </div>
            Bảng kê chi tiết giao dịch tháng {monthNum}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sub-label opacity-60 mt-1">
            Tổng cộng {filteredItems.length} giao dịch phát sinh
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sub-label opacity-40" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white/70 backdrop-blur-md border border-hairline-soft rounded-full text-xs font-black text-kraft-ink placeholder:text-sub-label/30 outline-none focus:border-kraft-accent focus:ring-2 focus:ring-kraft-accent/10 transition-all"
          />
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {tabs.map((tab) => {
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                haptics.light();
                setFilterType(tab.id as 'ALL' | 'sale' | 'buy' | 'coinvest');
              }}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2 border shadow-sm",
                isActive
                  ? "bg-kraft-accent text-white border-kraft-accent shadow-md shadow-kraft-accent/25"
                  : "bg-white/70 text-sub-label border-hairline-soft hover:border-kraft-accent/30 hover:text-kraft-ink"
              )}
            >
              {tab.icon && <tab.icon size={12} />}
              {tab.label}
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px]",
                isActive ? "bg-white/20 text-white" : "bg-black/5 text-sub-label"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Transaction Table */}
      <div className="liquid-card border-hairline-soft !p-0 overflow-hidden shadow-kraft-deep rounded-t2 bg-white/80 backdrop-blur-md">
        <div className="overflow-x-auto min-h-[320px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-kraft-accent/5 border-b border-hairline-soft">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-70">Mã xe</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-70">Thông tin xe</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-70">Loại hình</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-70">Ngày ghi nhận</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-70 text-right">Giá trị</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-sub-label opacity-70 text-right">Hoa hồng / Lợi nhuận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {filteredItems.map((item, index: number) => (
                <motion.tr 
                  key={`${item.txType}-${item.id}-${index}`} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18, delay: index * 0.03 }}
                  className="group hover:bg-kraft-accent/5 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="font-black text-xs text-kraft-accent tracking-widest bg-kraft-accent/10 px-3 py-1 rounded-full border border-kraft-accent/20">
                      {item.code}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-black text-sm text-kraft-ink tracking-tight group-hover:text-kraft-accent transition-colors">
                      {item.name}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-sub-label opacity-50 mt-0.5">
                      {item.year || '---'} • {(item.odo || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} km
                    </p>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border shadow-sm flex items-center gap-1",
                        item.color === 'emerald' ? "bg-income/10 text-income border-income/20" :
                        item.color === 'amber' ? "bg-amber-50 text-amber-600 border-amber-200" :
                        item.color === 'orange' ? "bg-orange-50 text-orange-600 border-orange-200" :
                        "bg-indigo-50 text-indigo-600 border-indigo-200"
                      )}>
                        {item.txType === 'sale' && <Car size={10} />}
                        {item.txType === 'buy' && <ShoppingBag size={10} />}
                        {item.txType === 'buy_bonus' && <Award size={10} />}
                        {item.txType === 'coinvest' && <Share2 size={10} />}
                        {item.label}
                      </span>
                      {item.txType === 'coinvest' && (
                        <span className="text-[9px] font-bold text-sub-label opacity-50 uppercase tracking-widest">
                          {item.statusLabel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs font-bold text-sub-label opacity-70 uppercase tracking-widest whitespace-nowrap">
                    {formatDate(item.txDate)}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-sm text-kraft-ink tracking-tight whitespace-nowrap">
                    {formatCurrency(item.txAmount)}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-sm text-income tracking-tight whitespace-nowrap">
                    {(item.txCommission || 0) > 0 ? `+${formatCurrency(item.txCommission || 0)}` : '-'}
                  </td>
                </motion.tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-kraft-accent/5 flex items-center justify-center mx-auto mb-3 opacity-40">
                      <Car size={20} className="text-kraft-accent" />
                    </div>
                    <p className="text-sub-label text-xs opacity-50 italic">Không tìm thấy giao dịch phát sinh nào trong tháng</p>
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
