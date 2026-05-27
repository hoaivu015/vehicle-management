import React from 'react';
import { Skeleton } from '@/src/shared/design-system/Skeleton';


export const PersonalSkeleton: React.FC = () => {
  return (
    <div className="h-full space-y-10 md:space-y-14 overflow-hidden px-4 md:px-12 py-4 md:py-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      {/* Header Skeleton */}
      <header className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10">
        <div className="text-center lg:text-left">
          <div className="flex items-center gap-6 justify-center lg:justify-start">
             <Skeleton variant="rectangle" width={64} height={64} className="rounded-2xl" />
             <Skeleton variant="text" width={200} height={60} />
          </div>
          <div className="flex items-center gap-3 justify-center lg:justify-start mt-4">
             <Skeleton variant="circle" width={8} height={8} />
             <Skeleton variant="text" width={250} height={12} />
          </div>
        </div>
        <Skeleton variant="rectangle" width={220} height={64} className="rounded-2xl" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white/40 border border-white/60 rounded-[3rem] overflow-hidden shadow-sm">
            <div className="p-10 flex flex-col items-center space-y-6 border-b border-black/5">
              <Skeleton variant="circle" width={128} height={128} className="rounded-[2.5rem]" />
              <div className="space-y-3 w-full flex flex-col items-center">
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={16} />
              </div>
            </div>
            <div className="p-10 space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton variant="text" width="30%" height={10} />
                  <Skeleton variant="text" width="80%" height={14} />
                </div>
              ))}
              <div className="pt-6 space-y-4">
                <Skeleton variant="rectangle" width="100%" height={56} className="rounded-2xl" />
                <Skeleton variant="rectangle" width="100%" height={56} className="rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="lg:col-span-3 space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] border border-white/60 bg-white/40 space-y-4">
                <Skeleton variant="circle" width={48} height={48} className="rounded-xl" />
                <div className="space-y-2">
                  <Skeleton variant="text" width="40%" height={10} />
                  <Skeleton variant="text" width="70%" height={28} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <div className="p-10 rounded-[3rem] border border-white/60 bg-white/40 h-[400px]">
              <Skeleton variant="text" width="40%" height={24} className="mb-8" />
              <div className="space-y-6">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className="space-y-3">
                     <Skeleton variant="text" width="100%" height={12} />
                     <Skeleton variant="rectangle" width="100%" height={8} className="rounded-full" />
                   </div>
                 ))}
              </div>
            </div>
            <div className="p-10 rounded-[3rem] border border-white/60 bg-white/40 h-[400px]">
               <Skeleton variant="text" width="40%" height={24} className="mb-8" />
               <div className="space-y-6">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="flex gap-4">
                     <Skeleton variant="rectangle" width={48} height={48} className="rounded-xl" />
                     <div className="flex-1 space-y-2">
                       <Skeleton variant="text" width="60%" height={16} />
                       <Skeleton variant="text" width="40%" height={12} />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
