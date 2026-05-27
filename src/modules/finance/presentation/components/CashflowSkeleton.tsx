import React from 'react';
import { Skeleton } from '@/src/shared/design-system/Skeleton';
import { BaseCard as CardShell, CardContentSection } from '@/src/shared/design-system/BaseCard';

export const CashflowSkeleton: React.FC = () => {
  return (
    <div className="space-y-10 md:space-y-14 py-6 md:py-10 px-6 md:px-12 max-w-[1700px] mx-auto pb-24 h-full overflow-y-auto scrollbar-hidden">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10">
        <div className="text-center lg:text-left">
          <div className="flex items-center gap-6 justify-center lg:justify-start">
            <Skeleton variant="rectangle" width={64} height={64} className="rounded-[2rem] bg-kraft-accent/5" />
            <Skeleton variant="text" width={220} height={60} />
          </div>
          <div className="flex items-center gap-3 justify-center lg:justify-start mt-4">
            <Skeleton variant="circle" width={8} height={8} className="bg-kraft-accent/20" />
            <Skeleton variant="text" width={300} height={12} className="opacity-20" />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <Skeleton variant="rectangle" width={240} height={56} className="rounded-2xl opacity-10" />
          <div className="flex gap-4 w-full sm:w-auto">
            <Skeleton variant="rectangle" width={140} height={56} className="rounded-2xl opacity-10" />
            <Skeleton variant="rectangle" width={160} height={56} className="rounded-2xl" />
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <CardShell key={i} minHeight="min-h-[320px]">
            <CardContentSection padding="p-10" className="flex flex-col items-center text-center">
              <Skeleton variant="circle" width={80} height={80} className="rounded-[2.5rem] mb-8 bg-black/5" />
              <Skeleton variant="text" width="40%" height={10} className="mb-4 opacity-20" />
              <Skeleton variant="text" width="60%" height={32} />
              <div className="mt-8 w-12 h-1 bg-black/5 rounded-full" />
            </CardContentSection>
          </CardShell>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton variant="rectangle" width={48} height={48} className="rounded-2xl bg-black/5" />
                <Skeleton variant="text" width={180} height={24} />
              </div>
              <Skeleton variant="text" width={80} height={12} className="opacity-20" />
            </div>
            <div className="overflow-hidden">
               <div className="bg-black/[0.02] py-4 px-8 grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} variant="text" width="60%" height={10} className="opacity-10" />)}
               </div>
               <div className="divide-y divide-black/5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="py-6 px-8 grid grid-cols-4 gap-4 items-center">
                    <div className="space-y-1">
                      <Skeleton variant="text" width="80%" height={16} />
                      <Skeleton variant="text" width="40%" height={10} className="opacity-10" />
                    </div>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="50%" height={12} className="opacity-20" />
                    <div className="flex justify-end gap-2">
                       <Skeleton variant="rectangle" width={32} height={32} className="rounded-lg opacity-5" />
                       <Skeleton variant="rectangle" width={32} height={32} className="rounded-lg opacity-5" />
                    </div>
                  </div>
                ))}
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Breakdown Skeleton */}
        <div className="h-fit">
          <div className="bg-kraft-ink p-10 rounded-[3rem] space-y-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-2">
               <Skeleton variant="rectangle" width={48} height={48} className="rounded-2xl bg-white/10" />
               <Skeleton variant="text" width={120} height={20} className="bg-white/20" />
            </div>
            <div className="space-y-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton variant="text" width="30%" height={10} className="bg-white/10" />
                    <Skeleton variant="text" width="20%" height={10} className="bg-white/10" />
                  </div>
                  <Skeleton variant="rectangle" width="100%" height={10} className="rounded-full bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
