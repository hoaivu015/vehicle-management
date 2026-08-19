import React from 'react';
import { Skeleton } from '@/src/shared/design-system/Skeleton';
import { PageShell, PageHeaderShell } from '@/src/shared/design-system/PageShell';

export const PersonalSkeleton: React.FC = () => {
  return (
    <PageShell scrollable maxWidth="max-w-[1700px]" animate={false}>
      {/* Header Skeleton */}
      <PageHeaderShell>
        <div className="flex items-center gap-4">
          <Skeleton variant="rectangle" width={56} height={56} className="rounded-2xl" />
          <div className="space-y-2">
            <Skeleton variant="text" width={180} height={36} />
            <Skeleton variant="text" width={220} height={14} />
          </div>
        </div>
        <Skeleton variant="rectangle" width={200} height={48} className="rounded-full" />
      </PageHeaderShell>

      <div className="space-y-8 md:space-y-10">
        {/* Metric Ribbon Skeleton (4 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-hairline-soft bg-white/40 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <Skeleton variant="circle" width={48} height={48} className="rounded-xl" />
                <Skeleton variant="rectangle" width={70} height={20} className="rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="50%" height={12} />
                <Skeleton variant="text" width="80%" height={28} />
              </div>
            </div>
          ))}
        </div>

        {/* Split Grid (12 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          {/* Left Sidebar Skeleton (4 cols) */}
          <div className="xl:col-span-4">
            <div className="bg-white/40 border border-hairline-soft rounded-2xl overflow-hidden shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col items-center space-y-4 pb-6 border-b border-black/5">
                <Skeleton variant="circle" width={96} height={96} className="rounded-2xl" />
                <Skeleton variant="text" width={160} height={24} />
                <div className="flex gap-2">
                  <Skeleton variant="rectangle" width={60} height={20} className="rounded-full" />
                  <Skeleton variant="rectangle" width={50} height={20} className="rounded-full" />
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton variant="text" width="30%" height={10} />
                    <Skeleton variant="text" width="70%" height={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Cards Skeleton (8 cols) */}
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 sm:p-8 rounded-2xl border border-hairline-soft bg-white/40 space-y-6 min-h-[380px]">
              <div className="flex justify-between items-center pb-4 border-b border-black/5">
                <Skeleton variant="text" width={160} height={20} />
                <Skeleton variant="rectangle" width={60} height={20} className="rounded-full" />
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton variant="text" width="40%" height={14} />
                    <Skeleton variant="text" width="30%" height={16} />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl border border-hairline-soft bg-white/40 space-y-6 min-h-[380px]">
              <div className="flex justify-between items-center pb-4 border-b border-black/5">
                <Skeleton variant="text" width={160} height={20} />
                <Skeleton variant="circle" width={36} height={36} className="rounded-xl" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-black/5 bg-white/20 space-y-2">
                    <Skeleton variant="text" width="60%" height={14} />
                    <Skeleton variant="text" width="40%" height={10} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="p-6 rounded-2xl border border-hairline-soft bg-white/40 space-y-4">
          <div className="flex justify-between items-center pb-3">
            <Skeleton variant="text" width={220} height={24} />
            <Skeleton variant="rectangle" width={200} height={36} className="rounded-full" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangle" width="100%" height={48} className="rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
};
