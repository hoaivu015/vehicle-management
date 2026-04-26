import React from 'react';
import { CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { formatCurrency } from '@/src/utils/currency';
import { formatDate } from '@/src/utils/date';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { Vehicle } from '@/src/shared/domain/types';
import { STAFF } from '@/src/constants';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';

interface PersonalVehiclesSectionProps {
  soldCars: Vehicle[];
  boughtCars: Vehicle[];
  coinvestedCars: Vehicle[];
  selectedMonth: string;
  user: any;
}

export const PersonalVehiclesSection: React.FC<PersonalVehiclesSectionProps> = ({
  soldCars,
  boughtCars,
  coinvestedCars,
  selectedMonth,
  user
}) => {
  const monthNum = selectedMonth.split('-')[1];

  return (
    <div className="space-y-12">
      {/* My Sold Cars Section */}
      <section className="space-y-8">
        <h3 className="text-2xl font-black text-kraft-ink uppercase tracking-tight flex items-center gap-4 font-heading">
          <div className="p-3 rounded-t3 bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={24} strokeWidth={2.5} />
          </div>
          Xe đã bán tháng {monthNum}
        </h3>
        <div className="liquid-card border-white/60 !p-0 overflow-hidden shadow-[var(--shadow-kraft-deep)] rounded-t1">
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-kraft-accent/5">
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Mã xe</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Thông tin xe</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Ngày bán</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60 text-right">Giá bán</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60 text-right">Hoa hồng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {soldCars.map((car) => (
                  <tr key={car.id} className="group hover:bg-kraft-accent/5 transition-all duration-300 cursor-default">
                    <td className="py-6 px-8">
                      <span className="font-black text-sm text-kraft-accent tracking-widest bg-kraft-accent/5 px-3 py-1.5 rounded-lg border border-kraft-accent/10">{car.code}</span>
                    </td>
                    <td className="py-6 px-8">
                      <p className="font-black text-base text-kraft-ink tracking-tight">{car.name}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-1">
                        {car.year} • {(car.odo || 0).toLocaleString()} km
                      </p>
                    </td>
                    <td className="py-6 px-8 text-xs font-black opacity-40 uppercase tracking-widest">
                      {formatDate(car.sale_date)}
                    </td>
                    <td className="py-6 px-8 text-right font-black text-base text-kraft-ink tracking-tighter">
                      {formatCurrency(car.sale_price)}
                    </td>
                    <td className="py-6 px-8 text-right font-black text-base text-emerald-500 tracking-tighter">
                      {formatCurrency(car.commission ?? (user.commission_per_car || 0))}
                    </td>
                  </tr>
                ))}
                {soldCars.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                       <p className="text-sub-label !opacity-30 italic">Bạn chưa chốt xe nào trong tháng này</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* My Bought Cars Section */}
      <section className="space-y-8">
        <h3 className="text-2xl font-black text-kraft-ink uppercase tracking-tight flex items-center gap-4 font-heading">
          <div className="p-3 rounded-t3 bg-amber-500/10 text-amber-500">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          Danh sách xe đã nhập
        </h3>
        <div className="liquid-card border-white/60 !p-0 overflow-hidden shadow-[var(--shadow-kraft-deep)] rounded-t1">
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-kraft-accent/5">
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Mã xe</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Thông tin xe</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Ngày nhập</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60 text-right">Giá nhập</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60 text-right">Hoa hồng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {boughtCars.map((car) => (
                  <tr key={car.id} className="group hover:bg-kraft-accent/5 transition-all duration-300 cursor-default">
                    <td className="py-6 px-8">
                      <span className="font-black text-sm text-kraft-accent tracking-widest bg-kraft-accent/5 px-3 py-1.5 rounded-lg border border-kraft-accent/10">{car.code}</span>
                    </td>
                    <td className="py-6 px-8">
                      <p className="font-black text-base text-kraft-ink tracking-tight">{car.name}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-1">
                        {car.year} • {(car.odo || 0).toLocaleString()} km
                      </p>
                    </td>
                    <td className="py-6 px-8 text-xs font-black opacity-40 uppercase tracking-widest">
                      {formatDate(car.purchase_date)}
                    </td>
                    <td className="py-6 px-8 text-right font-black text-base text-kraft-ink tracking-tighter">
                      {formatCurrency(car.purchase_price)}
                    </td>
                    <td className="py-6 px-8 text-right font-black text-base text-emerald-500 tracking-tighter">
                      {formatCurrency(car.buying_commission ?? STAFF.DEFAULT_BUYING_COMMISSION)}
                    </td>
                  </tr>
                ))}
                {boughtCars.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <p className="text-sub-label !opacity-30 italic">Bạn chưa nhập xe nào trong tháng này</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* My Co-invested Cars Section */}
      <section className="space-y-8">
        <h3 className="text-2xl font-black text-kraft-ink uppercase tracking-tight flex items-center gap-4 font-heading">
          <div className="p-3 rounded-t3 bg-indigo-500/10 text-indigo-500">
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
          Danh mục đầu tư góp vốn
        </h3>
        <div className="liquid-card border-white/60 !p-0 overflow-hidden shadow-[var(--shadow-kraft-deep)] rounded-t1">
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-kraft-accent/5">
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Mã xe</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Tên tài sản</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60">Trạng thái đầu tư</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60 text-right">Vốn đã góp</th>
                  <th className="py-6 px-8 text-sub-label text-kraft-accent/60 text-right">Lợi nhuận chia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {coinvestedCars.map((car) => {
                  // FINANCIAL LOGIC V2.0: Use calculateVehicleFinancials (Single Source of Truth)
                  const financials = calculateVehicleFinancials(car);
                  const isSoldInSelectedMonth = car.status === VehicleStatus.SOLD && car.sale_date?.startsWith(selectedMonth);

                  return (
                    <tr key={car.id} className="group hover:bg-kraft-accent/5 transition-all duration-300 cursor-default">
                      <td className="py-6 px-8">
                        <span className="font-black text-sm text-kraft-accent tracking-widest bg-kraft-accent/5 px-3 py-1.5 rounded-lg border border-kraft-accent/10">{car.code}</span>
                      </td>
                      <td className="py-6 px-8 font-black text-base text-kraft-ink tracking-tight">{car.name}</td>
                      <td className="py-6 px-8">
                        <div className="flex flex-col gap-1.5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest w-fit border shadow-sm",
                            car.status === VehicleStatus.SOLD ? "bg-emerald-600 text-white border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          )}>
                            {car.status === VehicleStatus.SOLD ? 'Hoàn tất đầu tư' : 'Đang vận hành'}
                          </span>
                          {isSoldInSelectedMonth && (
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest px-2 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                              Chốt lợi nhuận tháng này
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right font-black text-base text-kraft-ink tracking-tighter">
                        {formatCurrency(financials.coinvestAmount)}
                      </td>
                      <td className="py-6 px-8 text-right font-black text-base text-emerald-500 tracking-tighter">
                        {isSoldInSelectedMonth ? formatCurrency(financials.partnerProfitShare) : '-'}
                      </td>
                    </tr>
                  );
                })}
                {coinvestedCars.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <p className="text-sub-label !opacity-30 italic">Bạn chưa thực hiện góp vốn nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
