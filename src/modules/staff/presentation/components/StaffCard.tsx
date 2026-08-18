import React from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, TrendingUp, Target, User, ChevronRight, Check } from 'lucide-react';
import { StaffWithSalary } from '@/src/modules/staff/application/GetStaffList';
import { formatCurrency } from '@/src/shared/utils/currency';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { cn } from '@/src/shared/utils/cn';

import { BaseCard as CardShell, CardContentSection } from '@/src/shared/design-system/BaseCard';
import { haptics } from '@/src/shared/utils/haptics';

interface StaffCardProps {
  member: StaffWithSalary;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetail: (staff: StaffWithSalary) => void;
  onTogglePayment?: () => void;
  isSubmitting?: boolean;
}

export const StaffCard = React.memo<StaffCardProps>(({
  member,
  onEdit,
  onDelete,
  onViewDetail,
  onTogglePayment,
  isSubmitting = false
}) => {
  const completionRate = Math.round(member.salaryDetails.completionRate);
  const isHighPerformer = completionRate >= 100;
  const isAdmin = PermissionService.isAdmin(member.role);

  return (
    <>
      {/* ── MOBILE LAYOUT: Thẻ ngang Executive (Horizontal Row) chuẩn iPhone Native ── */}
      <div
        className="md:hidden group bg-white/60 hover:bg-white/75 backdrop-blur-xl rounded-[20px] border border-white/50 shadow-[inset_1px_1px_0_rgba(255,255,255,0.4)] p-3.5 flex flex-col gap-2.5 cursor-pointer active:scale-[0.98] ease-[cubic-bezier(0.34,1.56,0.64,1)] transition-all duration-300 native-interactive"
        onClick={() => {
          haptics.light();
          onViewDetail(member);
        }}
      >
        {/* Top row: Avatar + Identity + Actions/Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar with top performer badge */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-kraft-accent to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm border border-white/20">
                {member.name.charAt(0)}
              </div>
              {isHighPerformer && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-income text-white rounded-full flex items-center justify-center shadow-sm border border-white">
                  <TrendingUp size={9} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Code & Name */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded text-[9px] font-black uppercase tracking-wider text-kraft-ink/60 whitespace-nowrap">
                  #{member.code}
                </span>
                <span className="text-[10px] font-bold text-kraft-ink/40 uppercase tracking-tight truncate">
                  {member.department || (isAdmin ? 'Quản trị' : 'Kinh doanh')}
                </span>
              </div>
              <h3 className="text-sm font-black text-kraft-ink leading-tight truncate tracking-tight">
                {member.name}
              </h3>
            </div>
          </div>

          {/* Payment / Check Action Button (Fitts's Law >= 40px) */}
          {!isAdmin && onTogglePayment && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (member.salaryDetails.isPaid) haptics.light();
                else haptics.success();
                onTogglePayment();
              }}
              disabled={isSubmitting}
              className={cn(
                "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border native-interactive",
                member.salaryDetails.isPaid
                  ? "bg-income text-white border-income/30 shadow-income/20"
                  : "bg-black/[0.03] border-hairline-soft text-kraft-ink/20 hover:text-kraft-ink/60"
              )}
              title={member.salaryDetails.isPaid ? "Đã chi lương" : "Chưa chi lương"}
            >
              <Check size={18} strokeWidth={3.5} />
            </motion.button>
          )}
        </div>

        {/* Bottom row: KPI Progress (left) + Net Salary (right) */}
        {!isAdmin ? (
          <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between gap-3">
            {/* KPI Progress Bar */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                <span className="text-kraft-ink/40 uppercase tracking-wider flex items-center gap-1">
                  <Target size={10} className="text-kraft-accent shrink-0" />
                  {member.salaryDetails.soldCount}/{member.target} xe
                </span>
                <span className={cn(
                  "font-black tracking-tight",
                  isHighPerformer ? "text-income" : "text-kraft-accent"
                )}>
                  {completionRate}%
                </span>
              </div>
              <div className="h-1.5 bg-black/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(completionRate, 100)}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className={cn(
                    "h-full rounded-full",
                    isHighPerformer ? "bg-income" : "bg-kraft-accent"
                  )}
                />
              </div>
            </div>

            {/* Net Salary (Thực lĩnh) */}
            <div className="text-right shrink-0 pl-3 border-l border-black/[0.04]">
              <span className="text-[9px] font-bold text-kraft-ink/40 uppercase tracking-wider block leading-none mb-0.5">
                Thực lĩnh
              </span>
              <span className={cn(
                "text-sm font-black tracking-tight whitespace-nowrap",
                member.salaryDetails.isPaid ? "text-income" : "text-kraft-ink"
              )}>
                {formatCurrency(member.salaryDetails.netSalary)}
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-kraft-ink/40">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
              <User size={12} />
              <span>Tài khoản Quản trị hệ thống</span>
            </div>
            <ChevronRight size={14} className="text-kraft-accent opacity-60" />
          </div>
        )}
      </div>

      {/* ── DESKTOP LAYOUT: BaseCard dọc truyền thống ── */}
      <CardShell
        onClick={() => {
          haptics.light();
          onViewDetail(member);
        }}
        className="hidden md:flex h-full"
        minHeight="md:min-h-[380px] min-h-0"
      >
        <CardContentSection padding="p-3 md:p-5" className="h-full flex flex-col">
        {/* 1. Identity Header */}
        <div className="flex items-center gap-3 md:gap-5 mb-2 md:mb-4 relative z-10">
          <div className="relative shrink-0">
            <div className="w-touch h-touch md:w-14 md:h-14 rounded-xl md:rounded-t2 bg-kraft-accent text-white flex items-center justify-center font-black text-lg md:text-xl shadow-kraft border border-white/20">
              {member.name.charAt(0)}
            </div>
            {isHighPerformer && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 md:w-7 md:h-7 bg-income text-white rounded-md md:rounded-t2 flex items-center justify-center shadow-kraft border-2 border-white">
                <TrendingUp size={10} className="md:w-4 md:h-4" strokeWidth={3} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 md:gap-3 mb-1">
              <span className="px-1.5 py-0.5 bg-kraft-folder rounded md:rounded-lg text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 border border-hairline-soft">
                #{member.code}
              </span>
            </div>
            <h3 className="text-xs md:text-lg font-black text-kraft-ink uppercase leading-tight line-clamp-2 min-h-[2.5em] [text-wrap:balance]">
              {member.name}
            </h3>
          </div>
        </div>

        {/* 2. Performance Metrics */}
        {!isAdmin && (
          <div className="space-y-2 md:space-y-4 mb-3 md:mb-5 relative z-10">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/20">Hoàn thành</p>
                <div className="flex items-center gap-1.5 md:gap-3">
                  <Target size={12} className="text-kraft-accent md:w-4 md:h-4" strokeWidth={3} />
                  <span className="text-sm md:text-xl font-black text-kraft-ink tracking-tighter whitespace-nowrap">{completionRate}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] md:text-base font-black text-kraft-ink uppercase tracking-widest whitespace-nowrap">
                  <span className="text-kraft-accent">{member.salaryDetails.soldCount}</span><span className="text-[10px] md:text-xs opacity-40">/{member.target} xe</span>
                </p>
              </div>
            </div>

            <div className="h-2 md:h-4 bg-kraft-folder rounded-full overflow-hidden border border-hairline-soft">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(completionRate, 100)}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={cn(
                  "h-full rounded-full shadow-kraft relative overflow-hidden",
                  isHighPerformer ? "bg-income" : "bg-kraft-accent"
                )}
              />
            </div>
          </div>
        )}

        {/* 3. Financial Summary */}
        {!isAdmin ? (
          <div className="mt-auto bg-kraft-accent/[0.02] rounded-xl md:rounded-t2 p-3 md:p-6 border border-hairline-soft space-y-3 md:space-y-6">
            <div className="flex justify-between items-center pb-2 md:pb-6 border-b border-hairline-soft">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-income/60 mb-0.5">Thực lĩnh</p>
                <p className={cn(
                  "text-sm md:text-4xl font-black tracking-tighter truncate whitespace-nowrap",
                  member.salaryDetails.isPaid ? "text-income" : "text-kraft-ink"
                )}>
                  {formatCurrency(member.salaryDetails.netSalary)}
                </p>
              </div>
              {onTogglePayment && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e: React.MouseEvent) => { 
                    e.stopPropagation(); 
                    if (member.salaryDetails.isPaid) {
                      haptics.light();
                    } else {
                      haptics.success();
                    }
                    onTogglePayment(); 
                  }}
                  disabled={isSubmitting}
                  className={cn(
                    "w-touch h-touch md:w-16 md:h-16 rounded-xl md:rounded-t2 flex items-center justify-center transition-all shadow-kraft border-2 shrink-0 native-interactive",
                    member.salaryDetails.isPaid 
                      ? "bg-income text-white border-white/20" 
                      : "bg-kraft-bg border-hairline-soft text-kraft-ink/10"
                  )}
                >
                  <Check size={18} className="md:w-7 md:h-7" strokeWidth={4} />
                </motion.button>
              )}
            </div>

            <div className="hidden md:block space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-kraft-ink/30 uppercase">Lương cứng</span>
                    <span className="text-[11px] font-black text-kraft-ink/60 whitespace-nowrap">{formatCurrency(member.base_salary || 0)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-[10px] font-bold text-kraft-accent/40 uppercase">Hoa hồng</span>
                    <span className="text-[11px] font-black text-kraft-accent whitespace-nowrap">
                      +{formatCurrency(member.salaryDetails.totalSalary - (member.base_salary || 0))}
                    </span>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="mt-auto bg-black/[0.02] rounded-xl p-6 md:p-12 border border-dashed border-black/10 flex flex-col items-center justify-center opacity-40">
            <User size={20} className="mb-2 md:mb-4 text-kraft-ink/20 md:w-8 md:h-8" />
            <p className="text-[10px] md:text-[10px] font-black uppercase tracking-widest text-center">Admin</p>
          </div>
        )}

        {/* 4. Footer Actions (Desktop Only) */}
        <div className="hidden md:flex items-center justify-between pt-6 mt-4 border-t border-hairline-soft relative z-10">
          <div className="flex gap-4">
            {onEdit && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting} 
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(); }} 
                className="w-14 h-14 rounded-t2 bg-white shadow-sm border border-hairline-soft flex items-center justify-center text-sub-label hover:text-kraft-accent transition-all"
              >
                <Edit2 size={18} />
              </motion.button>
            )}
            {onDelete && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting} 
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(); }} 
                className="w-14 h-14 rounded-t2 bg-white shadow-sm border border-hairline-soft flex items-center justify-center text-sub-label hover:text-expense transition-all"
              >
                <Trash2 size={18} />
              </motion.button>
            )}
          </div>
          <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-kraft-accent hover:gap-5 transition-all">
            Chi tiết <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
        </CardContentSection>
      </CardShell>
    </>
  );
});

StaffCard.displayName = 'StaffCard';
