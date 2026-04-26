import React from 'react';
import { Skeleton } from '../../../../components/Skeleton';
import { cn } from '../../../../utils/cn';

export const CashflowSkeleton: React.FC = () => {
  return (
    <div className="space-y-10 md:space-y-14 py-6 md:py-10 px-6 md:px-12 max-w-[1700px] mx-auto pb-24 h-full overflow-y-auto scrollbar-hidden animate-in fade-in duration-700">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10">
        <div className="text-center lg:text-left">
          <div className="flex items-center gap-6 justify-center lg:justify-start">
            <Skeleton variant="rectangle" width={64} height={64} className="rounded-[2rem]" />
            <Skeleton variant="text" width={300} height={60} />
          </div>
          <div className="flex items-center gap-3 justify-center lg:justify-start mt-4">
            <Skeleton variant="circle" width={8} height={8} />
            <Skeleton variant="text" width={400} height={12} />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <Skeleton variant="rectangle" width={240} height={64} className="rounded-[1.5rem]" />
          <div className="flex gap-4 w-full sm:w-auto">
            <Skeleton variant="rectangle" width={140} height={64} className="rounded-[1.5rem]" />
            <Skeleton variant="rectangle" width={160} height={64} className="rounded-[1.5rem]" />
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/40 backdrop-blur-md p-10 rounded-[2rem] border border-white/60 flex flex-col items-center">
            <Skeleton variant="circle" width={80} height={80} className="rounded-[2.5rem] mb-8" />
            <Skeleton variant="text" width="40%" height={10} className="mb-4" />
            <Skeleton variant="text" width="60%" height={32} />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
