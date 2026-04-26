import React from 'react';
import { User, Target, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/utils/cn';
import { UserRole, USER_ROLE_LABELS } from '@/src/shared/domain/constants';
import { formatCurrency } from '@/src/utils/currency';
import { StaffWithSalary } from '../../../application/GetStaffList';

interface SidebarProps {
  member: StaffWithSalary;
  filterMonth: string;
  isAdmin: boolean;
  totalUnreimbursed: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ member, filterMonth, isAdmin, totalUnreimbursed }) => {
  const { salaryDetails } = member;
  const completionRate = Math.round(salaryDetails.completionRate);
  const kpiMultiplierLabel = salaryDetails.completionRate >= 100 ? 'Hệ số: x1.0' : `Hệ số: x${salaryDetails.kpiBonusMultiplier}`;

  return (
    <div className="lg:w-[380px] p-4 sm:p-8 border-r border-black/5 flex flex-col gap-6 sm:gap-8 bg-gradient-to-b from-white/20 to-transparent overflow-y-auto custom-scrollbar shrink-0">
      {/* Identity Section */}
      <div className="flex flex-row lg:flex-col gap-4 sm:gap-6 items-center lg:items-stretch">
        <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-full lg:aspect-square rounded-t2 bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-white/40 shadow-2xl relative overflow-hidden group shrink-0">
          <User size={56} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-tr from-kraft-accent/20 to-transparent opacity-50" />
          <div className="absolute top-2 left-2 lg:top-4 lg:left-4 z-10">
            <div className="glass-badge-dark !opacity-100 !text-white !px-3 !py-1 !text-[9px]">
              #{member.code}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2 lg:space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={cn(
              "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg",
              member.status === 'ACTIVE' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
            )}>
              {member.status === 'ACTIVE' ? 'Đang làm việc' : 'Nghỉ việc'}
            </span>
            <span className={cn(
              "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-kraft-accent/20",
              isAdmin ? "bg-red-600" : "bg-kraft-accent"
            )}>
              {USER_ROLE_LABELS[member.role as UserRole] || member.role}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-kraft-ink uppercase leading-tight py-1 line-clamp-2">
            {member.name}
          </h2>
          <div className="space-y-1">
            <p className="text-sub-label opacity-30 flex items-center gap-2">
              <span className="w-1 h-3 bg-kraft-accent/40 rounded-full" />
              {member.department || 'Phòng kinh doanh'}
            </p>
            <p className="text-[10px] font-bold text-kraft-ink/40 truncate">{member.email}</p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="flex-1 flex flex-col gap-4 sm:gap-6">
          {/* KPI Section */}
          <div className="p-4 sm:p-6 bg-white/60 rounded-t2 border border-white shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-sub-label text-kraft-ink/40">Chỉ tiêu {filterMonth}</p>
                  <p className="text-sm font-black text-kraft-ink">{member.salaryDetails.soldCount} / {member.target} xe</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black tracking-tighter text-kraft-ink">{completionRate}%</p>
                <p className={cn("text-[8px] font-black uppercase tracking-widest", completionRate >= 100 ? "text-emerald-500" : "text-orange-500")}>
                  {kpiMultiplierLabel}
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden p-[1.5px] border border-black/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(completionRate, 100)}%` }}
                className={cn(
                  "h-full rounded-full",
                  completionRate >= 100 ? "bg-emerald-500" : "bg-kraft-accent"
                )}
              />
            </div>
          </div>

          {/* Financial Snapshot */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="p-4 bg-white/40 rounded-t2 border border-white/60 shadow-sm flex items-center justify-between group">
              <div className="space-y-1">
                <p className="text-sub-label opacity-40">Lương cơ bản</p>
                <p className="text-2xl font-black text-kraft-ink tracking-tighter">{formatCurrency(salaryDetails.base)}</p>
              </div>
              <div className="w-10 h-10 rounded-t3 bg-kraft-ink/5 flex items-center justify-center text-kraft-ink/20">
                <PieChart size={18} />
              </div>
            </div>

            <div className="p-4 bg-kraft-accent/[0.03] rounded-t2 border border-kraft-accent/10 shadow-sm flex items-center justify-between group">
              <div className="space-y-1">
                <p className="text-sub-label !text-kraft-accent/40">Tổng hoa hồng</p>
                <p className="text-2xl font-black text-kraft-accent tracking-tighter">{formatCurrency(salaryDetails.totalCommission)}</p>
              </div>
              <div className="w-10 h-10 rounded-t3 bg-kraft-accent/10 flex items-center justify-center text-kraft-accent/40">
                <TrendingUp size={18} />
              </div>
            </div>

            <div className="p-4 bg-red-500/[0.03] rounded-t2 border border-red-500/10 shadow-sm flex items-center justify-between group">
              <div className="space-y-1">
                <p className="text-sub-label !text-red-500/40">Tạm ứng chưa hoàn</p>
                <p className="text-2xl font-black text-red-500 tracking-tighter">{formatCurrency(totalUnreimbursed)}</p>
              </div>
              <div className="w-10 h-10 rounded-t3 bg-red-500/10 flex items-center justify-center text-red-500/40">
                <DollarSign size={18} />
              </div>
            </div>

            <div className="p-5 bg-kraft-ink rounded-t2 shadow-2xl shadow-kraft-ink/20 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
              <div className="space-y-1 relative z-10">
                <p className="text-sub-label !text-white/40">Dự kiến thực nhận</p>
                <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(salaryDetails.totalSalary)}</p>
              </div>
              <div className="w-12 h-12 rounded-t3 bg-white/10 flex items-center justify-center text-white/40 relative z-10">
                <DollarSign size={20} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
