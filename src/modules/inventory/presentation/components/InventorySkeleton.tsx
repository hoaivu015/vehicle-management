import React from 'react';
import { Skeleton } from '../../../../components/Skeleton';
import { cn } from '../../../../utils/cn';

interface InventorySkeletonProps {
  hideHeader?: boolean;
}

export const InventorySkeleton: React.FC<InventorySkeletonProps> = ({ hideHeader = false }) => {
  return (
    <div className={cn(
      "space-y-12 py-8 md:py-12 px-6 md:px-12 max-w-[1700px] mx-auto animate-in fade-in duration-700",
      hideHeader && "p-0 max-w-none space-y-0"
    )}>
      {!hideHeader && (
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10 shrink-0 border-b border-black/5 pb-10">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-6 justify-center lg:justify-start">
              <Skeleton variant="circle" width={64} height={64} className="rounded-[2.5rem] bg-white/40" />
              <Skeleton variant="text" width={200} height={60} />
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start mt-4">
              <Skeleton variant="circle" width={8} height={8} />
              <Skeleton variant="text" width={250} height={12} />
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <Skeleton variant="rectangle" width={220} height={48} className="rounded-full" />
            <Skeleton variant="circle" width={48} height={48} className="rounded-full" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20 justify-items-center">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="w-full max-w-[380px] h-[415px] bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-xl overflow-hidden flex flex-col"
          >
            {/* Image Area placeholder */}
            <div className="aspect-[16/9] bg-kraft-accent/5 overflow-hidden relative">
               <Skeleton height="100%" className="rounded-none" />
               
               {/* Position Placeholder for Price Badge */}
               <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <div className="px-10 py-3 bg-black/10 backdrop-blur-md border border-white/10 rounded-full w-2/3">
                    <Skeleton variant="text" width="60%" height={12} className="bg-white/10 mx-auto" />
                  </div>
               </div>
            </div>
            
            {/* Content Area placeholder */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <Skeleton variant="text" width="100%" height={24} />
                <div className="flex gap-4">
                  <Skeleton variant="text" width="20%" height={12} />
                  <Skeleton variant="text" width={40} height={12} />
                  <Skeleton variant="text" width={60} height={12} />
                </div>
              </div>
              
              <div className="pt-6 border-t border-black/5 flex justify-between items-end mt-4">
                <div className="space-y-2 flex-1">
                  <Skeleton variant="text" width={40} height={8} />
                  <Skeleton variant="text" width={80} height={16} />
                </div>
                <div className="space-y-2 items-end flex flex-col flex-1 pl-4">
                  <Skeleton variant="text" width={80} height={8} />
                  <Skeleton variant="text" width={100} height={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
