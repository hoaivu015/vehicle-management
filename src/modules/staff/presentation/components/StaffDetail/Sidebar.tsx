import React from 'react';
import { User, Target, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { UserRole, USER_ROLE_LABELS } from '@/src/shared/domain/constants';
import { formatCurrency } from '@/src/shared/utils/currency';
import { DESIGN_TOKENS } from '@/src/shared/design-system/tokens';
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
    <div className={cn(
      DESIGN_TOKENS.layout.sidebar_width,
      "p-6 border-b lg:border-b-0 lg:border-r border-black/5 flex flex-col gap-5 bg-gradient-to-b from-white/20 to-transparent overflow-y-auto custom-scrollbar shrink-0 h-full"
    )}>
      {/* Identity Section */}
      <div className="flex flex-row lg:flex-col gap-4 items-center lg:items-stretch">
        <div className="w-16 h-16 md:w-24 md:h-24 lg:w-full lg:aspect-square rounded-[2rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-white/40 shadow-xl relative overflow-hidden group shrink-0">
          <User size={40} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-tr from-kraft-accent/20 to-transparent opacity-50" />
          <div className="absolute top-1 left-1 lg:top-3 lg:left-3 z-10">
            <div className="glass-badge-dark !opacity-100 !text-white !px-2 !py-0.5 text-[9px] font-black uppercase tracking-widest">
              #{member.code}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg",
              member.status === 'ACTIVE' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
            )}>
              {member.status === 'ACTIVE' ? 'Đang làm việc' : 'Nghỉ việc'}
            </span>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-kraft-accent/20",
              isAdmin ? "bg-red-600" : "bg-kraft-accent"
            )}>
              {USER_ROLE_LABELS[member.role as UserRole] || member.role}
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-kraft-ink uppercase tracking-tighter line-clamp-2 leading-tight mb-1">
            {member.name}
          </h2>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-30 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-kraft-accent/40 rounded-full" />
              {member.department || 'Kinh doanh'}
            </p>
            <p className="text-[9px] font-bold text-kraft-ink/40 truncate">{member.email}</p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="flex-1 flex flex-col gap-4">
          {/* KPI Section - More compact */}
          <div className="p-4 bg-white rounded-[1.5rem] border border-black/5 shadow-sm space-y-3 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex justify-between items-center relative z-10">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Target size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Chỉ tiêu {filterMonth}</p>
                  <p className="text-sm font-black text-kraft-ink">{member.salaryDetails.soldCount} / {member.target} xe</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black tracking-tighter text-kraft-ink leading-none mb-1">{completionRate}%</p>
                <p className={cn("text-[9px] font-black uppercase tracking-widest", completionRate >= 100 ? "text-emerald-500" : "text-orange-500")}>
                  {kpiMultiplierLabel}
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden p-[1px] border border-black/5 relative z-10">
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

          {/* Financial Snapshot - High Density Grid */}
          <div className="flex flex-col gap-3">
            {/* Hero: Thực lĩnh */}
            <div className="p-5 bg-kraft-ink rounded-[1.5rem] shadow-xl flex items-center justify-between group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              <div className="space-y-0.5 relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Thực lĩnh</p>
                <p className="text-2xl font-black text-white tracking-tighter leading-none">{formatCurrency(salaryDetails.netSalary)}</p>
                {salaryDetails.totalReimbursements > 0 && (
                  <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mt-1">
                    +{formatCurrency(salaryDetails.totalReimbursements)} hoàn ứng
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/40 relative z-10 shrink-0">
                <DollarSign size={24} strokeWidth={2.5} />
              </div>
            </div>

            {/* Grid for other stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white rounded-[1.5rem] border border-black/5 shadow-sm flex flex-col justify-between group h-24 relative overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/20 mb-1">
                  <PieChart size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30 truncate">Lương CB</p>
                  <p className="text-lg font-black text-kraft-ink tracking-tighter truncate">{formatCurrency(salaryDetails.base)}</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-[1.5rem] border border-black/5 shadow-sm flex flex-col justify-between group h-24 relative overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-kraft-accent/10 flex items-center justify-center text-kraft-accent mb-1">
                  <TrendingUp size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30 truncate">Hoa hồng</p>
                  <p className="text-lg font-black text-kraft-accent tracking-tighter truncate">{formatCurrency(salaryDetails.totalCommission)}</p>
                </div>
              </div>

              <div className="col-span-2 p-4 bg-red-500/[0.03] rounded-[1.5rem] border border-red-500/10 shadow-sm flex items-center justify-between group relative overflow-hidden">
                <div className="space-y-0 relative z-10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-500/40">Nợ tạm ứng</p>
                  <p className="text-xl font-black text-red-500 tracking-tighter leading-none">{formatCurrency(totalUnreimbursed)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500/40 relative z-10 shrink-0">
                  <DollarSign size={20} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
