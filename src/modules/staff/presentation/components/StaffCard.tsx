import React from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, TrendingUp, Target, User, ChevronRight } from 'lucide-react';
import { StaffWithSalary } from '@/src/modules/staff/application/GetStaffList';
import { formatCurrency } from '@/src/utils/currency';
import { UserRole, USER_ROLE_LABELS } from '@/src/shared/domain/constants';
import { cn } from '@/src/utils/cn';

interface StaffCardProps {
  member: StaffWithSalary;
  onEdit: (staff: StaffWithSalary) => void;
  onDelete: (id: string) => Promise<void>;
  onViewDetail: (staff: StaffWithSalary) => void;
  isSubmitting?: boolean;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  member,
  onEdit,
  onDelete,
  onViewDetail,
  isSubmitting = false
}) => {
  const completionRate = Math.round(member.salaryDetails.completionRate);
  const isHighPerformer = completionRate >= 100;
  const isAdmin = member.role === UserRole.ADMIN;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -12,
        transition: { duration: 0.5, ease: "easeOut" }
      }}
      className="group relative liquid-glass-core overflow-hidden w-full h-full p-8 flex flex-col bg-white shadow-[var(--shadow-card-industrial)] hover:shadow-[var(--shadow-card-hover)] rounded-t1 transition-all duration-700"
      onClick={() => onViewDetail(member)}
    >
      {/* 1. Decorative Background Sparkle - Liquid standard */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-kraft-accent/5 rounded-full blur-3xl group-hover:bg-kraft-accent/10 transition-colors duration-1000" />

      {/* 2. Identity Header - Clear & Professional */}
      <div className="flex items-center gap-6 mb-8 relative z-10">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-t2 bg-kraft-accent text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-kraft-accent/20 border border-white/20">
            {member.name.charAt(0)}
          </div>
          {isHighPerformer && (
            <div className="absolute -top-3 -right-3 w-9 h-9 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white animate-pulse">
              <TrendingUp size={18} strokeWidth={3} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-black/5 rounded-lg text-sub-label !text-kraft-ink/60">
              #{member.code}
            </span>
            <span className="text-sub-label !text-kraft-accent">
              {USER_ROLE_LABELS[member.role as UserRole] || member.role}
            </span>
          </div>
          <h3 className="text-xl font-black text-kraft-ink uppercase leading-tight line-clamp-2 min-h-[2.5em]">
            {member.name}
          </h3>
        </div>
      </div>

      {/* 3. Performance Metrics - Scientific Structure */}
      {!isAdmin && (
        <div className="space-y-6 mb-10 relative z-10">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <p className="text-sub-label !text-kraft-ink/60 ml-1">Chỉ số hoàn thành</p>
              <div className="flex items-center gap-3">
                <Target size={18} className="text-kraft-accent" strokeWidth={3} />
                <span className="text-2xl font-black text-kraft-ink tracking-tighter">{completionRate}%</span>
              </div>
            </div>
            <p className="text-sub-label !text-kraft-ink/60">
              Thực đạt: <span className="text-kraft-ink">{member.salaryDetails.soldCount}</span> / {member.target} xe
            </p>
          </div>

          <div className="h-4 bg-black/5 rounded-full overflow-hidden p-1 border border-black/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(completionRate, 100)}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className={cn(
                "h-full rounded-full shadow-lg relative overflow-hidden",
                isHighPerformer ? "bg-emerald-500" : "bg-kraft-accent"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
            </motion.div>
          </div>
        </div>
      )}

      {/* 4. Financial Snapshot - Elevated Purity */}
      {!isAdmin ? (
        <div className="mt-auto bg-kraft-bg/40 backdrop-blur-md rounded-t2 p-6 border border-white/80 group-hover:bg-white/60 transition-all duration-500 relative z-10">
          <p className="text-sub-label !text-kraft-ink/60 mb-3">Thu nhập dự tính</p>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-kraft-ink tracking-tighter">
              {formatCurrency(member.salaryDetails.totalSalary)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1.5 bg-white/80 rounded-xl border border-white text-sub-label !text-kraft-ink/60 shadow-sm">
              Lương cứng: {formatCurrency(member.base_salary)}
            </div>
            {member.salaryDetails.coinvestProfitShare > 0 && (
              <div className="px-3 py-1.5 bg-indigo-50/80 rounded-xl border border-indigo-100 text-sub-label !text-indigo-600 shadow-sm">
                Lợi nhuận ĐT: +{formatCurrency(member.salaryDetails.coinvestProfitShare)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-auto bg-black/[0.02] rounded-t2 p-12 border border-dashed border-black/10 flex flex-col items-center justify-center opacity-40 relative z-10">
          <User size={32} className="mb-4 text-kraft-ink/20" />
          <p className="text-sub-label !text-kraft-ink/60">Không áp dụng tính lương</p>
        </div>
      )}

      {/* 5. Footer Actions */}
      <div className="flex items-center justify-between pt-8 mt-6 border-t border-black/5 relative z-10">
        <div className="flex gap-4">
          {onEdit && (
            <button
              disabled={isSubmitting}
              onClick={(e) => { e.stopPropagation(); onEdit(member); }}
              className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-kraft-ink/40 hover:text-kraft-accent hover:bg-kraft-accent/5 hover:border-kraft-accent/20 transition-all disabled:opacity-50"
            >
              <Edit2 size={20} />
            </button>
          )}
          {onDelete && (
            <button
              disabled={isSubmitting}
              onClick={(e) => { e.stopPropagation(); onDelete(member.id); }}
              className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-kraft-ink/40 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all disabled:opacity-50"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-kraft-accent group-hover:translate-x-2 transition-all">
          Báo cáo chi tiết <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );
};
