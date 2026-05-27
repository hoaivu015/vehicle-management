import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { exportToExcel } from '@/src/shared/utils/export';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { PillButton } from '@/src/shared/design-system/Buttons';

export interface DashboardStat {
  label: string;
  value: string;
  icon: React.ElementType;
  subValue: string;
  tooltip?: string;
  isNegative?: boolean;
  isWarning?: boolean;
  actionIcon?: React.ElementType;
  onActionClick?: (e: React.MouseEvent) => void;
}

interface DashboardHeaderProps {
  filterMonth: string;
  onMonthChange: (month: string) => void;
  stats: DashboardStat[];
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  filterMonth,
  onMonthChange,
  stats
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-black/5 pb-8 md:pb-10 pt-4 md:pt-0">
      <div className="w-full">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-kraft-ink flex items-center flex-wrap gap-2 md:gap-4 leading-tight md:leading-none">
          BÁO CÁO
          <span className="text-[10px] font-black uppercase tracking-widest text-white px-2.5 py-1 bg-kraft-accent rounded-lg leading-none shrink-0">TỔNG LỰC</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/40 mt-3 md:mt-3 leading-relaxed">
          Trung tâm điều hành kinh doanh & tài chính
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <div className="min-w-[220px] md:w-60">
          <BaseInput
            type="month"
            value={filterMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            icon={Calendar}
          />
        </div>

        <PillButton
          onClick={() => exportToExcel({ 'Dashboard': stats }, `Bao_cao_${filterMonth}`)}
          variant="primary"
          icon={Download}
        >
          Xuất Báo Cáo
        </PillButton>
      </div>
    </div>
  );
};
