import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Medal, UserCheck, Flame } from 'lucide-react';
import { SalesLeaderboardItem } from '@/src/modules/finance/application/GetFinancialOverview';
import { formatCurrency } from '@/src/shared/utils/currency';
import { cn } from '@/src/shared/utils/cn';

interface SalesPerformanceLeaderboardProps {
  leaderboard: SalesLeaderboardItem[];
  filterMonth: string;
}

export const SalesPerformanceLeaderboard: React.FC<SalesPerformanceLeaderboardProps> = ({
  leaderboard,
  filterMonth
}) => {
  const monthLabel = filterMonth ? `Tháng ${filterMonth.split('-')[1]}/${filterMonth.split('-')[0]}` : '';

  const getRankBadge = (rank: number) => {
    if (rank === 0) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center shadow-xs">
          <Trophy size={16} strokeWidth={2.5} />
        </div>
      );
    }
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-400/15 text-slate-600 border border-slate-400/30 flex items-center justify-center shadow-xs">
          <Award size={16} strokeWidth={2.5} />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-700/15 text-amber-800 border border-amber-700/30 flex items-center justify-center shadow-xs">
          <Medal size={16} strokeWidth={2.5} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-sub-label flex items-center justify-center text-xs font-black">
        {rank + 1}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.2 }}
      className="glass-l1 p-6 md:p-10 rounded-[2.5rem] border border-white/80 flex flex-col justify-between"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Flame size={18} />
            </div>
            <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-kraft-ink">
              Bảng Xếp Hạng Đội Ngũ Kinh Doanh
            </h3>
          </div>
          <p className="text-[11px] font-bold text-sub-label mt-1">
            Hiệu suất bán xe, đóng góp lợi nhuận gộp và hoa hồng nhân sự trong {monthLabel}
          </p>
        </div>

        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          {leaderboard.length} Nhân sự ghi nhận
        </span>
      </div>

      {leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((item, idx) => (
            <div
              key={item.staffId}
              className={cn(
                "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                idx === 0 
                  ? "bg-amber-500/5 border-amber-500/25 shadow-xs" 
                  : "bg-surface-soft/60 hover:bg-surface-soft border-hairline-soft"
              )}
            >
              {/* Left: Rank + Info */}
              <div className="flex items-center gap-3 min-w-0">
                {getRankBadge(idx)}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-kraft-ink truncate">
                      {item.staffName}
                    </p>
                    <span className="text-[9px] font-mono font-bold text-sub-label bg-surface-soft px-2 py-0.5 rounded-full border border-hairline-soft">
                      {item.staffCode || 'SALE'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-sub-label mt-0.5">
                    Đã bán: <span className="text-kraft-accent font-black">{item.soldCount} xe</span> • Doanh số: <span className="text-kraft-ink font-bold">{formatCurrency(item.totalRevenue)}</span>
                  </p>
                </div>
              </div>

              {/* Right: Profit & Commission */}
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline-soft">
                <div className="text-left sm:text-right">
                  <span className="text-[9px] font-black uppercase tracking-wider text-sub-label block">
                    Đóng góp lợi nhuận
                  </span>
                  <span className="text-sm sm:text-base font-black text-income tracking-tight">
                    {formatCurrency(item.grossProfitContribution)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-wider text-sub-label block">
                    Hoa hồng & Thưởng
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-kraft-ink">
                    {formatCurrency(item.commission)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 border border-dashed border-hairline-soft rounded-2xl bg-surface-soft/30">
          <UserCheck size={28} className="text-sub-label opacity-40" />
          <p className="text-xs font-bold text-kraft-ink">Chưa có dữ liệu bán xe trong tháng này</p>
          <p className="text-[10px] text-sub-label">Bảng xếp hạng sẽ tự động cập nhật khi có giao dịch bán xe thành công.</p>
        </div>
      )}
    </motion.div>
  );
};
