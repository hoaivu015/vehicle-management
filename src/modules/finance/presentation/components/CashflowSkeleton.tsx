import React from 'react';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

export const CashflowSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 md:space-y-10 py-6 md:py-8 px-6 md:px-12 max-w-[1700px] mx-auto pb-24 h-full overflow-y-auto scrollbar-hidden">
      {/* 1. Header Skeleton - Matching CashflowHeader */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-hairline-soft pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton variant="rectangle" width={56} height={56} className="rounded-2xl bg-kraft-accent/10" />
            <Skeleton variant="text" width={280} height={44} className="rounded-xl opacity-20" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" width={8} height={8} className="bg-kraft-accent/30" />
            <Skeleton variant="text" width={380} height={14} className="opacity-15" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto">
          <Skeleton variant="rectangle" width={200} height={48} className="rounded-2xl opacity-15 w-full sm:w-[200px]" />
          <div className="flex gap-3 w-full sm:w-auto">
            <Skeleton variant="rectangle" width={110} height={48} className="rounded-full opacity-15" />
            <Skeleton variant="rectangle" width={120} height={48} className="rounded-full opacity-25" />
          </div>
        </div>
      </div>

      {/* 2. Cash-Basis Metric Ribbon Skeleton (Zero-CLS 1:1 with CashflowMetricRibbon) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 md:p-6 rounded-[24px] bg-white/70 backdrop-blur-xl border border-hairline-soft flex flex-col justify-between shadow-xs h-[132px]"
          >
            <div className="flex items-center gap-3">
              <Skeleton variant="rectangle" width={44} height={44} className="rounded-2xl opacity-20 bg-surface-soft" />
              <div className="space-y-1.5 flex-1">
                <Skeleton variant="text" width="55%" height={10} className="opacity-20" />
                <Skeleton variant="text" width="75%" height={12} className="opacity-15" />
              </div>
            </div>
            <div className="pt-3 border-t border-hairline-soft">
              <Skeleton variant="text" width="65%" height={26} className="opacity-30" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Workspace Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Smart Entry Dock & Cost Structure (Span 4) */}
        <div className="xl:col-span-4 space-y-8">
          {/* Smart Entry Dock Skeleton */}
          <div className="p-6 md:p-7 rounded-[28px] bg-white/80 backdrop-blur-xl border border-hairline-soft shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline-soft">
              <div className="flex items-center gap-3">
                <Skeleton variant="rectangle" width={36} height={36} className="rounded-xl opacity-20" />
                <Skeleton variant="text" width={140} height={18} className="opacity-25" />
              </div>
              <Skeleton variant="rectangle" width={80} height={28} className="rounded-full opacity-15" />
            </div>
            <div className="space-y-4">
              <Skeleton variant="rectangle" width="100%" height={48} className="rounded-2xl opacity-15" />
              <Skeleton variant="rectangle" width="100%" height={48} className="rounded-2xl opacity-15" />
              <Skeleton variant="rectangle" width="100%" height={48} className="rounded-2xl opacity-15" />
              <Skeleton variant="rectangle" width="100%" height={48} className="rounded-full opacity-30" />
            </div>
          </div>

          {/* Breakdown Card Skeleton - Warm Swiss Card (Replaced old dark box) */}
          <div className="p-6 md:p-7 rounded-[28px] bg-white/80 backdrop-blur-xl border border-hairline-soft shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline-soft">
              <div className="flex items-center gap-3">
                <Skeleton variant="rectangle" width={32} height={32} className="rounded-xl opacity-20" />
                <Skeleton variant="text" width={150} height={16} className="opacity-25" />
              </div>
              <Skeleton variant="text" width={80} height={14} className="opacity-20" />
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton variant="text" width="40%" height={11} className="opacity-20" />
                    <Skeleton variant="text" width="30%" height={11} className="opacity-25" />
                  </div>
                  <Skeleton variant="rectangle" width="100%" height={8} className="rounded-full opacity-15" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Unified Cash Journal Ledger (Span 8) */}
        <div className="xl:col-span-8">
          <div className="p-6 md:p-8 rounded-[28px] bg-white/80 backdrop-blur-xl border border-hairline-soft shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-hairline-soft">
              <div className="flex items-center gap-3">
                <Skeleton variant="rectangle" width={40} height={40} className="rounded-xl opacity-20" />
                <div className="space-y-1.5">
                  <Skeleton variant="text" width={160} height={18} className="opacity-30" />
                  <Skeleton variant="text" width={220} height={11} className="opacity-15" />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Skeleton variant="rectangle" width={180} height={40} className="rounded-xl opacity-15" />
                <Skeleton variant="rectangle" width={90} height={40} className="rounded-xl opacity-15" />
              </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="divide-y divide-hairline-soft">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="py-4.5 px-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton variant="rectangle" width={40} height={40} className="rounded-xl opacity-15 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton variant="text" width="50%" height={15} className="opacity-25" />
                      <Skeleton variant="text" width="30%" height={11} className="opacity-15" />
                    </div>
                  </div>
                  <div className="text-right space-y-1.5 shrink-0">
                    <Skeleton variant="text" width={90} height={16} className="opacity-30 ml-auto" />
                    <Skeleton variant="text" width={60} height={10} className="opacity-15 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Accounts Receivable & Payable Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-6 md:p-7 rounded-[28px] bg-white/80 backdrop-blur-xl border border-hairline-soft shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline-soft">
              <div className="flex items-center gap-3">
                <Skeleton variant="rectangle" width={32} height={32} className="rounded-xl opacity-20" />
                <Skeleton variant="text" width={160} height={16} className="opacity-25" />
              </div>
              <Skeleton variant="text" width={70} height={14} className="opacity-20" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="p-3.5 rounded-2xl bg-surface-soft/60 flex items-center justify-between">
                  <Skeleton variant="text" width="45%" height={14} className="opacity-25" />
                  <Skeleton variant="text" width="25%" height={14} className="opacity-25" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

