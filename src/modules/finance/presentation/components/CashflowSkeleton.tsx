import React from 'react';
import { Skeleton } from '../../../../components/Skeleton';
import { cn } from '../../../../utils/cn';

export const CashflowSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 py-6 px-8 max-w-full mx-auto pb-12 overflow-y-auto h-full scrollbar-hidden animate-in fade-in duration-700">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="space-y-3">
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={12} />
        </div>
        
        <div className="flex gap-4">
          <Skeleton variant="rectangle" width={140} height={48} className="rounded-xl" />
          <div className="flex gap-2">
            <Skeleton variant="rectangle" width={100} height={48} className="rounded-xl" />
            <Skeleton variant="rectangle" width={120} height={48} className="rounded-xl" />
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/60 flex flex-col items-center">
            <Skeleton variant="circle" width={56} height={56} className="rounded-2xl mb-6" />
            <Skeleton variant="text" width="40%" height={10} className="mb-2" />
            <Skeleton variant="text" width="60%" height={24} />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton variant="circle" width={32} height={32} />
              <Skeleton variant="text" width="30%" height={20} />
            </div>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center pb-6 border-b border-black/5 last:border-0 last:pb-0">
                  <div className="space-y-2 flex-1">
                    <Skeleton variant="text" width="40%" height={16} />
                    <Skeleton variant="text" width="20%" height={10} />
                  </div>
                  <div className="w-1/4">
                    <Skeleton variant="text" width="60%" height={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Breakdown Skeleton */}
        <div className="space-y-10">
          <div className="bg-kraft-ink p-10 rounded-[3rem] space-y-8">
            <Skeleton variant="text" width="50%" height={20} className="bg-white/10" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton variant="text" width="30%" height={10} className="bg-white/10" />
                  <Skeleton variant="text" width="20%" height={10} className="bg-white/10" />
                </div>
                <Skeleton variant="rectangle" width="100%" height={8} className="rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
