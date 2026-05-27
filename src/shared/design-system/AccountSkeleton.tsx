import React from 'react';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

export const AccountSkeleton: React.FC = () => {
  return (
    <div className="space-y-10 md:space-y-14 py-4 md:py-12 px-4 md:px-12 max-w-[1700px] mx-auto h-full animate-in fade-in duration-700">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10">
        <div className="text-center lg:text-left">
          <div className="flex items-center gap-6 justify-center lg:justify-start">
             <Skeleton variant="rectangle" width={64} height={64} className="rounded-[2rem]" />
             <Skeleton variant="text" width={220} height={60} />
          </div>
          <div className="flex items-center gap-3 justify-center lg:justify-start mt-4">
            <Skeleton variant="circle" width={8} height={8} />
            <Skeleton variant="text" width={300} height={12} />
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Skeleton variant="rectangle" width={280} height={56} className="rounded-2xl" />
          <Skeleton variant="rectangle" width={56} height={56} className="rounded-2xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-[3rem] border border-white/60 bg-white/40 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-black/5 bg-black/[0.02]">
           <div className="flex justify-between">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="text" width="15%" height={12} />
              ))}
           </div>
        </div>
        <div className="p-8 space-y-8">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="flex justify-between items-center pb-6 border-b border-black/5 last:border-0 last:pb-0">
                <div className="flex items-center gap-4 w-1/4">
                   <Skeleton variant="circle" width={40} height={40} />
                   <Skeleton variant="text" width="60%" height={16} />
                </div>
                <Skeleton variant="text" width="20%" height={14} />
                <Skeleton variant="text" width="10%" height={14} />
                <Skeleton variant="text" width="15%" height={14} />
                <Skeleton variant="rectangle" width={100} height={40} className="rounded-xl" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
