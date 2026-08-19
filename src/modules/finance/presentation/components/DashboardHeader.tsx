import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { exportToExcel } from '@/src/shared/utils/export';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { PillButton } from '@/src/shared/design-system/Buttons';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS } from '@/src/shared/domain/constants';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { haptics } from '@/src/shared/utils/haptics';

export interface DashboardStat {
  label: string;
  value: string;
  numericValue?: number;
  isCurrency?: boolean;
  icon: React.ElementType;
  subValue: string;
  tooltip?: string;
  isNegative?: boolean;
  isWarning?: boolean;
  actionIcon?: React.ElementType;
  onActionClick?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

interface DashboardHeaderProps {
  filterMonth: string;
  onMonthChange: (month: string) => void;
  stats: DashboardStat[];
  vehicles?: Vehicle[];
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  filterMonth,
  onMonthChange,
  stats,
  vehicles = []
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  
  const getPreviousMonthStr = () => {
    const [year, month] = filterMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleExportFullExecutiveReport = () => {
    haptics.light();
    
    // Sheet 1: Dashboard Stats Overview
    const overviewSheet = stats.map(s => ({
      'Chỉ Số Báo Cáo': s.label,
      'Giá Trị': s.value,
      'Mô Tả / Ghi Chú': s.subValue
    }));

    // Sheet 2: Sold Vehicles in Month
    const soldVehicles = vehicles
      .filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(filterMonth))
      .map(v => {
        const fin = calculateVehicleFinancials(v);
        return {
          'Mã Xe': v.code,
          'Tên Xe': v.name,
          'Biển Số': v.license_plate || '',
          'Ngày Bán': v.sale_date || '',
          'Người Bán': v.seller || '',
          'Khách Mua': v.buyer_name || '',
          'Giá Mua': fin.purchasePrice,
          'Chi Phí Spa': fin.totalCost,
          'Giá Bán': fin.salePrice,
          'Hoa Hồng Bán': fin.sellingCommission,
          'Lợi Nhuận Gộp': fin.grossProfit,
          'Showroom Hưởng': fin.showroomProfitShare
        };
      });

    // Sheet 3: Current Inventory
    const inventoryVehicles = vehicles
      .filter(v => v.status !== VehicleStatus.SOLD)
      .map(v => {
        const fin = calculateVehicleFinancials(v);
        return {
          'Mã Xe': v.code,
          'Tên Xe': v.name,
          'Biển Số': v.license_plate || '',
          'Trạng Thái': VEHICLE_STATUS_LABELS[v.status as VehicleStatus] || v.status,
          'Ngày Nhập': v.purchase_date || '',
          'Giá Mua': fin.purchasePrice,
          'Chi Phí Spa Đã Chi': fin.totalCost,
          'Tổng Vốn Đọng': fin.totalInvestment,
          'Đã Trả Chủ Cũ': v.purchase_paid_amount || 0,
          'Còn Nợ Mua': Math.max(0, fin.purchasePrice - (v.purchase_paid_amount || 0))
        };
      });

    // Export multi-sheet Excel
    exportToExcel({
      '1_Tong_Quan': overviewSheet,
      '2_Xe_Da_Ban': soldVehicles.length > 0 ? soldVehicles : [{ 'Thông báo': 'Chưa có xe bán trong tháng' }],
      '3_Xe_Ton_Kho': inventoryVehicles.length > 0 ? inventoryVehicles : [{ 'Thông báo': 'Kho trống' }]
    }, `Bao_Cao_Dieu_Hanh_${filterMonth}`);
  };

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 md:gap-8 border-b border-black/5 pb-8 md:pb-10 pt-4 md:pt-0">
      <div className="w-full">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-kraft-ink flex items-center flex-wrap gap-2 md:gap-4 leading-tight md:leading-none">
          BÁO CÁO
          <span className="text-[10px] font-black uppercase tracking-widest text-white px-3.5 py-1.5 bg-kraft-accent rounded-full leading-none shrink-0 shadow-sm">
            EXECUTIVE SSoT
          </span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/40 mt-3 md:mt-3 leading-relaxed">
          Trung tâm điều hành kinh doanh & hạch toán tài chính showroom ô tô
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        {/* Quick Month Preset Pills */}
        <div className="flex items-center gap-1.5 bg-black/[0.04] p-1 rounded-full border border-black/[0.06] overflow-x-auto">
          <button
            onClick={() => {
              haptics.light();
              onMonthChange(currentMonthStr);
            }}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              filterMonth === currentMonthStr
                ? 'bg-white text-kraft-ink shadow-sm'
                : 'text-sub-label hover:text-kraft-ink'
            }`}
          >
            Tháng này
          </button>

          <button
            onClick={() => {
              haptics.light();
              onMonthChange(getPreviousMonthStr());
            }}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              filterMonth === getPreviousMonthStr()
                ? 'bg-white text-kraft-ink shadow-sm'
                : 'text-sub-label hover:text-kraft-ink'
            }`}
          >
            Tháng trước
          </button>
        </div>

        {/* Month Selector Input */}
        <div className="min-w-[180px] sm:w-52">
          <BaseInput
            type="month"
            value={filterMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            icon={Calendar}
          />
        </div>

        {/* Multi-Sheet Export Button */}
        <PillButton
          onClick={handleExportFullExecutiveReport}
          variant="primary"
          icon={Download}
          className="cursor-pointer h-12 shadow-sm text-xs font-black"
        >
          Xuất Báo Cáo Đa Sheet
        </PillButton>
      </div>
    </div>
  );
};
