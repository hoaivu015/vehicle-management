import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Trash2, TrendingUp, Target, User, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(member.id);
  };

  return (
    <div 
      className="group relative highlight-card overflow-hidden w-full h-full"
      onClick={() => onViewDetail(member)}
    >
      {/* Decorative Background Sparkle */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-kraft-accent/5 rounded-full blur-3xl group-hover:bg-kraft-accent/10 transition-colors" />

      {/* Header: Avatar & Identity */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-[1.25rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent font-black text-2xl border border-kraft-accent/10 shadow-inner">
            {member.name.charAt(0)}
          </div>
          {isHighPerformer && (
             <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <TrendingUp size={12} />
             </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-black text-kraft-ink tracking-tight uppercase leading-tight">
            {member.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-kraft-accent bg-kraft-accent/5 px-2 py-0.5 rounded-lg">
              #{member.code}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-kraft-ink/40">
              {USER_ROLE_LABELS[member.role as UserRole] || member.role}
            </span>
          </div>
        </div>
      </div>

      {/* Stats: KPI Progress */}
      {!isAdmin && (
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/30 ml-1">Chỉ số hoàn thành</p>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-kraft-accent/60" />
                <span className="text-lg font-black text-kraft-ink">{completionRate}%</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-kraft-ink/40 uppercase tracking-tight">
              Thực đạt: <span className="text-kraft-ink">{member.salaryDetails.soldCount}</span> / {member.target} xe
            </p>
          </div>
          
          <div className="h-3 bg-black/5 rounded-full overflow-hidden p-0.5 border border-white/40">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(completionRate, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full shadow-sm",
                isHighPerformer ? "bg-emerald-500" : "bg-kraft-accent"
              )}
            />
          </div>
        </div>
      )}

      {/* Financials: Income */}
      {!isAdmin ? (
        <div className="bg-kraft-bg/40 backdrop-blur-md rounded-3xl p-6 border border-white/60 mb-6 group-hover:bg-white/40 transition-colors">
          <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/30 mb-2">Thu nhập dự tính</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-kraft-ink tracking-tighter">
              {formatCurrency(member.salaryDetails.totalSalary)}
            </span>
          </div>
          
          <div className="flex gap-2 mt-4">
            <div className="px-2.5 py-1 bg-white/60 rounded-xl border border-white/60 text-[8px] font-black uppercase text-kraft-ink/60">
              Lương cứng: {formatCurrency(member.base_salary)}
            </div>
            {member.salaryDetails.coinvestProfitShare > 0 && (
              <div className="px-2.5 py-1 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-[8px] font-black uppercase text-indigo-600">
                Lợi nhuận ĐT: +{formatCurrency(member.salaryDetails.coinvestProfitShare)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-black/[0.02] rounded-3xl p-10 border border-dashed border-black/10 mb-6 flex flex-col items-center justify-center opacity-40">
           <User size={24} className="mb-2 text-kraft-ink/20" />
           <p className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/40">Không áp dụng tính lương</p>
        </div>
      )}

      {/* Footer: Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          {onEdit && (
            <button 
              disabled={isSubmitting}
              onClick={(e) => { e.stopPropagation(); onEdit(member); }}
              className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-kraft-ink/40 hover:text-kraft-accent hover:bg-kraft-accent/5 hover:border-kraft-accent/20 transition-all disabled:opacity-50"
            >
              <Edit2 size={18} />
            </button>
          )}
          {onDelete && (
            <button 
              disabled={isSubmitting}
              onClick={(e) => { e.stopPropagation(); onDelete(member.id); }}
              className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-kraft-ink/40 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        
        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-kraft-accent group-hover:translate-x-1 transition-transform">
          Chi tiết <ChevronRight size={14} />
        </button>
      </div>


    </div>
  );
};
