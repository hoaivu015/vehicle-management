import React from 'react';
import { Skeleton } from '../../../../components/Skeleton';
import { cn } from '../../../../utils/cn';

interface StaffSkeletonProps {
  hideHeader?: boolean;
}

export const StaffSkeleton: React.FC<StaffSkeletonProps> = ({ hideHeader = false }) => {
  return (
    <div className={cn(
      "space-y-12 py-8 px-6 md:px-12 max-w-[1700px] mx-auto animate-in fade-in duration-700",
      hideHeader && "p-0 max-w-none space-y-0"
    )}>
      {!hideHeader && (
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10 shrink-0 border-b border-black/5 pb-10">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-6 justify-center lg:justify-start">
               <Skeleton variant="circle" width={64} height={64} className="rounded-2xl bg-white/40" />
               <Skeleton variant="text" width={220} height={60} />
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start mt-4">
              <Skeleton variant="circle" width={8} height={8} />
              <Skeleton variant="text" width={300} height={12} />
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <Skeleton variant="rectangle" width={180} height={50} className="rounded-2xl" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:gap-12 pb-20 justify-items-center">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full max-w-[360px] p-8 rounded-[2.5rem] border border-white/60 bg-white/40 shadow-sm space-y-8">
            <div className="flex items-center gap-5">
              <Skeleton variant="circle" width={64} height={64} className="rounded-[1.25rem]" />
              <div className="space-y-3 flex-1">
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="40%" height={14} />
              </div>
            </div>
            
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                 <Skeleton variant="text" width="30%" height={12} />
                 <Skeleton variant="text" width="20%" height={16} />
               </div>
               <Skeleton variant="rectangle" width="100%" height={12} className="rounded-full" />
            </div>

            <div className="bg-kraft-bg/40 rounded-3xl p-6 space-y-4">
              <Skeleton variant="text" width="60%" height={10} />
              <div className="flex justify-between items-end">
                <Skeleton variant="text" width="50%" height={28} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Skeleton width={48} height={48} className="rounded-2xl" />
                <Skeleton width={48} height={48} className="rounded-2xl" />
              </div>
              <Skeleton width={60} height={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
