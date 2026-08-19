import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Car, ArrowRight, DollarSign, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Vehicle } from '@/src/shared/domain/types';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { VEHICLE_STATUS_LABELS, VehicleStatus } from '@/src/shared/domain/constants';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { cn } from '@/src/shared/utils/cn';

export type DrillDownType = 'gross_profit' | 'sold_vehicles' | 'inventory_vehicles' | 'aging_vehicles' | 'cash_balance' | null;

interface MetricDrillDownModalProps {
  type: DrillDownType;
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  filterMonth: string;
  onSelectVehicle: (code: string) => void;
}

export const MetricDrillDownModal: React.FC<MetricDrillDownModalProps> = ({
  type,
  isOpen,
  onClose,
  vehicles,
  filterMonth,
  onSelectVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !type) return null;

  // Filter vehicles based on modal drilldown type
  const { title, subtitle, icon: Icon, filteredVehicles, colorClass } = (() => {
    switch (type) {
      case 'gross_profit': {
        const list = vehicles.filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(filterMonth));
        return {
          title: 'Chi Tiết Lợi Nhuận Gộp Theo Xe Bán',
          subtitle: `Danh sách các xe đã bán và đóng góp lợi nhuận trong tháng ${filterMonth}`,
          icon: DollarSign,
          filteredVehicles: list,
          colorClass: 'text-emerald-600 bg-emerald-500/10'
        };
      }
      case 'sold_vehicles': {
        const list = vehicles.filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(filterMonth));
        return {
          title: 'Danh Sách Xe Đã Xuất Bán',
          subtitle: `Tất cả xe hoàn tất hợp đồng bán ra trong tháng ${filterMonth}`,
          icon: CheckCircle2,
          filteredVehicles: list,
          colorClass: 'text-indigo-600 bg-indigo-500/10'
        };
      }
      case 'inventory_vehicles': {
        const list = vehicles.filter(v => v.status !== VehicleStatus.SOLD);
        return {
          title: 'Danh Sách Xe Đang Tồn Kho',
          subtitle: 'Toàn bộ xe đang có mặt tại showroom, đang làm đẹp hoặc đang nhận cọc',
          icon: Car,
          filteredVehicles: list,
          colorClass: 'text-amber-600 bg-amber-500/10'
        };
      }
      case 'aging_vehicles': {
        const list = vehicles.filter(v => {
          if (v.status === VehicleStatus.SOLD || !v.purchase_date) return false;
          const diffDays = Math.floor((new Date().getTime() - new Date(v.purchase_date).getTime()) / (1000 * 60 * 60 * 24));
          return diffDays > 25;
        });
        return {
          title: 'Danh Sách Xe Tồn Kho Lâu (> 25 Ngày)',
          subtitle: 'Các xe cần ưu tiên điều chỉnh giá bán hoặc đẩy mạnh marketing',
          icon: AlertCircle,
          filteredVehicles: list,
          colorClass: 'text-red-600 bg-red-500/10'
        };
      }
      default:
        return {
          title: 'Chi Tiết Số Liệu Báo Cáo',
          subtitle: 'Danh sách đối soát dữ liệu',
          icon: Wallet,
          filteredVehicles: vehicles,
          colorClass: 'text-kraft-ink bg-black/5'
        };
    }
  })();

  const searchedList = filteredVehicles.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.license_plate && v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl border border-white/80 overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-hairline-soft flex items-start justify-between gap-4 bg-surface-soft/40">
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", colorClass)}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-kraft-ink">
                  {title}
                </h3>
                <p className="text-xs font-bold text-sub-label mt-0.5">
                  {subtitle} • <span className="text-kraft-ink font-black">{searchedList.length} xe</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white border border-hairline-soft flex items-center justify-center text-sub-label hover:text-kraft-ink hover:bg-black/5 transition-all shadow-xs cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Box */}
          <div className="px-6 sm:px-8 py-4 border-b border-hairline-soft bg-white">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-4 text-sub-label pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã xe, tên xe, biển số..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-full bg-surface-soft border border-hairline-soft text-xs font-bold text-kraft-ink placeholder:text-sub-label/70 focus:outline-none focus:border-kraft-accent transition-colors"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-3 custom-scrollbar">
            {searchedList.length > 0 ? (
              searchedList.map((v) => {
                const fin = calculateVehicleFinancials(v);
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      onClose();
                      onSelectVehicle(v.code);
                    }}
                    className="p-4 bg-surface-soft/60 hover:bg-surface-soft rounded-2xl border border-hairline-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer group hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-hairline-soft flex items-center justify-center text-kraft-ink shrink-0 font-mono text-xs font-black group-hover:border-kraft-accent transition-colors">
                        {v.code}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-kraft-ink truncate group-hover:text-kraft-accent transition-colors">
                            {v.name}
                          </p>
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-hairline-soft text-sub-label">
                            {VEHICLE_STATUS_LABELS[v.status as VehicleStatus] || v.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-bold text-sub-label mt-0.5">
                          {v.license_plate && <span>BS: {v.license_plate}</span>}
                          {v.purchase_date && <span>• Nhập: {formatDate(v.purchase_date)}</span>}
                          {v.seller && <span>• Bán: {v.seller}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline-soft shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] font-black uppercase tracking-wider text-sub-label block">
                          {type === 'gross_profit' ? 'Lợi nhuận gộp' : type === 'sold_vehicles' ? 'Giá chốt bán' : 'Tổng giá vốn'}
                        </span>
                        <span className={cn(
                          "text-sm sm:text-base font-black tracking-tight",
                          type === 'gross_profit' ? "text-emerald-600" : "text-kraft-ink"
                        )}>
                          {type === 'gross_profit' 
                            ? formatCurrency(fin.grossProfit) 
                            : type === 'sold_vehicles' 
                            ? formatCurrency(v.sale_price || 0)
                            : formatCurrency(fin.totalInvestment)
                          }
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-white border border-hairline-soft flex items-center justify-center text-sub-label group-hover:text-kraft-accent group-hover:border-kraft-accent transition-all">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 border border-dashed border-hairline-soft rounded-2xl bg-surface-soft/30">
                <Car size={32} className="text-sub-label opacity-40" />
                <p className="text-sm font-bold text-kraft-ink">Không tìm thấy dữ liệu xe phù hợp</p>
                <p className="text-xs text-sub-label">Vui lòng thử tìm kiếm với từ khóa khác.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-hairline-soft bg-surface-soft/30 flex items-center justify-between">
            <span className="text-xs font-bold text-sub-label">
              Bấm vào từng dòng xe để xem chi tiết & hạch toán
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-kraft-ink text-white text-xs font-black uppercase tracking-wider hover:bg-black transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
