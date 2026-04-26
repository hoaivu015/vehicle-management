import React from 'react';
import { Skeleton } from '../../../components/Skeleton';
import { cn } from '../../../utils/cn';

export const DashboardSkeleton: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  return (
    <div className={cn(
      "space-y-12 py-8 px-4 md:px-12 max-w-[1700px] mx-auto animate-in fade-in duration-700 h-full overflow-hidden",
      hideHeader && "p-0 max-w-none space-y-10"
    )}>
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-black/5 pb-10">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Skeleton variant="text" width={260} height={60} />
                <Skeleton variant="rectangle" width={100} height={24} className="rounded-lg" />
             </div>
             <Skeleton variant="text" width={380} height={12} />
          </div>
          <div className="flex gap-4 items-center w-full md:w-auto">
             <Skeleton variant="rectangle" width={200} height={56} className="rounded-2xl" />
             <Skeleton variant="rectangle" width={160} height={56} className="rounded-2xl" />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/60 bg-white/40 space-y-4 shadow-sm">
            <Skeleton variant="circle" width={56} height={56} className="rounded-2xl" />
            <div className="space-y-2">
              <Skeleton variant="text" width="40%" height={12} />
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="30%" height={12} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 p-10 rounded-[3rem] border border-white/60 bg-white/40 space-y-6 shadow-sm">
           <Skeleton variant="text" width="30%" height={24} />
           <Skeleton variant="rectangle" width="100%" height={300} className="rounded-3xl" />
        </div>
        <div className="p-10 rounded-[3rem] border border-white/60 bg-white/40 space-y-8 shadow-sm flex flex-col justify-center">
            <Skeleton variant="circle" width={200} height={200} className="mx-auto" />
            <div className="space-y-2 text-center">
              <Skeleton variant="text" width="60%" height={12} className="mx-auto" />
              <Skeleton variant="text" width="40%" height={12} className="mx-auto" />
            </div>
        </div>
      </div>

      {/* Lists area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-10 rounded-[4rem] border border-black/5 bg-white space-y-8 shadow-sm">
            <Skeleton variant="text" width="30%" height={24} />
            <div className="space-y-6">
               {[...Array(4)].map((_, j) => (
                 <div key={j} className="flex gap-6 items-center">
                   <Skeleton variant="circle" width={48} height={48} className="rounded-xl" />
                   <div className="flex-1 space-y-2">
                     <Skeleton variant="text" width="80%" height={16} />
                     <Skeleton variant="text" width="40%" height={12} />
                   </div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
