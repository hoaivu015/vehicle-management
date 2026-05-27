import React from 'react';
import { Users, Plus, Calendar } from 'lucide-react';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { PillButton } from '@/src/shared/design-system/Buttons';

interface StaffHeaderProps {
  filterMonth: string;
  setFilterMonth: (month: string) => void;
  setIsAddOpen: (open: boolean) => void;
  hasEditPermission: boolean;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  filterMonth,
  setFilterMonth,
  setIsAddOpen,
  hasEditPermission
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
      <div className="text-left">
        <h2 className="text-[clamp(1.5rem,8vw,3.5rem)] md:text-5xl lg:text-6xl font-black tracking-tighter text-kraft-ink flex items-center gap-3 md:gap-6 leading-none uppercase">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20 shadow-inner shrink-0 scale-90 md:scale-100">
            <Users size={32} className="md:w-9 md:h-9" strokeWidth={2.5} />
          </div>
          Nhân sự
        </h2>
        <p className="text-sub-label !text-kraft-ink/60 mt-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-kraft-accent animate-pulse" />
          Quản lý đội ngũ và hiệu suất kinh doanh
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start lg:justify-end">
        <div className="min-w-[220px] md:w-60">
          <BaseInput
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            icon={Calendar}
          />
        </div>

        {hasEditPermission && (
          <PillButton
            onClick={() => setIsAddOpen(true)}
            variant="primary"
            icon={Plus}
          >
            Thêm nhân sự
          </PillButton>
        )}
      </div>
    </div>
  );
};
