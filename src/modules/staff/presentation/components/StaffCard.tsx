import React from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, TrendingUp, Target, User, ChevronRight, Check } from 'lucide-react';
import { StaffWithSalary } from '@/src/modules/staff/application/GetStaffList';
import { formatCurrency } from '@/src/shared/utils/currency';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { cn } from '@/src/shared/utils/cn';

import { BaseCard as CardShell, CardContentSection } from '@/src/shared/design-system/BaseCard';

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
    <CardShell
      onClick={() => onViewDetail(member)}
      className="h-full"
      minHeight="md:min-h-[380px] min-h-[200px]"
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
          <h3 className="text-xs md:text-lg font-black text-kraft-ink uppercase leading-tight line-clamp-2 min-h-[2.5em]">
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
                <span className="text-sm md:text-xl font-black text-kraft-ink tracking-tighter">{completionRate}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] md:text-base font-black text-kraft-ink uppercase tracking-widest">
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
                "text-sm md:text-4xl font-black tracking-tighter truncate",
                member.salaryDetails.isPaid ? "text-income" : "text-kraft-ink"
              )}>
                {formatCurrency(member.salaryDetails.netSalary)}
              </p>
            </div>
            {onTogglePayment && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onTogglePayment(); }}
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
                  <span className="text-[11px] font-black text-kraft-ink/60">{formatCurrency(member.base_salary || 0)}</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[10px] font-bold text-kraft-accent/40 uppercase">Hoa hồng</span>
                  <span className="text-[11px] font-black text-kraft-accent">
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
      
      {/* Mobile Indicator */}
      <div className="flex md:hidden items-center justify-end mt-2 pt-2 border-t border-black/[0.03]">
        <ChevronRight size={14} className="text-kraft-accent opacity-40" />
      </div>
      </CardContentSection>
    </CardShell>
  );
});
