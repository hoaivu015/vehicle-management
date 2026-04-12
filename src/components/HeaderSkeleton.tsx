import React from 'react';
import { Skeleton } from './Skeleton';

export const HeaderSkeleton = () => {
  return (
    <>
      <header className="hidden xl:flex flex-col xl:flex-row xl:items-end justify-between px-4 md:px-8 gap-4 xl:gap-0 relative pt-2 md:pt-4 pb-0">
        <div className="flex flex-col xl:flex-row xl:items-end gap-4 xl:gap-8 w-full xl:w-auto pb-0">
          <div className="flex items-center justify-between xl:justify-start gap-3 relative min-h-[48px] md:min-h-[56px]">
            <div className="flex items-center gap-2 md:gap-3">
              <Skeleton variant="rectangle" width={40} height={40} className="rounded-xl" />
              <Skeleton variant="text" width={80} height={20} />
            </div>
          </div>
  
          {/* Desktop Navigation Skeleton */}
          <nav className="hidden xl:flex items-end gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-2 opacity-50">
                <Skeleton variant="circle" width={16} height={16} />
                <Skeleton variant="text" width={60} height={14} />
              </div>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center justify-between xl:justify-end gap-4 md:gap-6 w-full xl:w-auto">
          <div className="flex items-center gap-3 md:gap-4 pr-4 md:pr-6 border-r border-kraft-accent/10">
            <div className="text-right hidden sm:block space-y-1">
              <Skeleton variant="text" width={80} height={10} />
              <Skeleton variant="text" width={60} height={10} className="ml-auto" />
            </div>
            <Skeleton variant="circle" width={40} height={40} className="rounded-xl" />
          </div>
  
          <div className="flex items-center gap-2 md:gap-3">
            <Skeleton variant="rectangle" width={44} height={44} className="rounded-xl" />
            <Skeleton variant="rectangle" width={44} height={44} className="rounded-xl" />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Skeleton */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-2xl border-t border-white/40 z-[100] px-4 py-2 pb-safe flex justify-around items-center">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-2">
            <Skeleton variant="circle" width={20} height={20} />
            <Skeleton variant="text" width={30} height={8} />
          </div>
        ))}
      </nav>
    </>
  );
};
