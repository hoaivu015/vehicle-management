import React from 'react';
import { Skeleton } from '../../../../shared/design-system/Skeleton';
import { BaseCard as CardShell, CardContentSection } from '@/src/shared/design-system/BaseCard';
import { PageShell, PageHeaderShell } from '@/src/shared/design-system/PageShell';

interface StaffSkeletonProps {
  hideHeader?: boolean;
}

export const StaffSkeleton: React.FC<StaffSkeletonProps> = ({ hideHeader = false }) => {
  const gridContent = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:gap-12 pb-20 justify-items-center">
      {[...Array(6)].map((_, i) => (
        <CardShell key={i} minHeight="md:min-h-[490px] min-h-[220px]">
          <CardContentSection padding="p-3 md:p-6" className="h-full flex flex-col">
            <div className="flex items-center gap-3 md:gap-6 mb-3 md:mb-6">
              <Skeleton variant="circle" width={40} height={40} className="md:w-16 md:h-16 rounded-xl md:rounded-t2" />
              <div className="space-y-1 md:space-y-3 flex-1">
                <div className="flex items-center gap-1.5 md:gap-3">
                   <Skeleton variant="text" width={40} height={12} className="md:w-12 md:h-4 rounded md:rounded-lg opacity-10" />
                </div>
                <Skeleton variant="text" width="80%" height={16} className="md:h-8 rounded-lg" />
              </div>
            </div>
            
            <div className="space-y-3 md:space-y-6 mb-4 md:mb-8">
               <div className="flex justify-between items-end">
                 <div className="space-y-1">
                   <Skeleton variant="text" width={20} height={8} className="opacity-10" />
                   <Skeleton variant="text" width={40} height={16} className="md:w-20 md:h-8" />
                 </div>
                 <Skeleton variant="text" width={60} height={12} className="md:w-24 md:h-5 opacity-10" />
               </div>
               <Skeleton variant="rectangle" width="100%" height={6} className="md:h-4 rounded-full" />
            </div>

            <div className="mt-auto bg-kraft-accent/[0.02] rounded-xl md:rounded-t2 p-3 md:p-6 border border-hairline-soft space-y-3 md:space-y-6">
              <div className="flex justify-between items-center pb-2 md:pb-6 border-b border-hairline-soft">
                <div className="min-w-0 flex-1">
                  <Skeleton variant="text" width={30} height={8} className="opacity-10 mb-1" />
                  <Skeleton variant="text" width="80%" height={20} className="md:h-10" />
                </div>
                <Skeleton variant="circle" width={32} height={32} className="md:w-14 md:h-14 rounded-xl md:rounded-t2 shrink-0 opacity-10" />
              </div>
              <div className="hidden md:grid grid-cols-2 gap-4">
                <Skeleton variant="rectangle" width="100%" height={24} className="rounded-lg opacity-5" />
                <Skeleton variant="rectangle" width="100%" height={24} className="rounded-lg opacity-5" />
              </div>
            </div>

            <div className="hidden md:flex mt-4 pt-6 border-t border-hairline-soft items-center justify-between">
              <div className="flex gap-4">
                <Skeleton width={56} height={56} className="rounded-t2 opacity-10" />
                <Skeleton width={56} height={56} className="rounded-t2 opacity-10" />
              </div>
              <Skeleton width={100} height={16} className="opacity-10" />
            </div>

            <div className="flex md:hidden items-center justify-end mt-2 pt-2 border-t border-hairline-soft">
              <Skeleton width={14} height={14} className="opacity-10" />
            </div>
          </CardContentSection>
        </CardShell>
      ))}
    </div>
  );

  if (hideHeader) return gridContent;

  return (
    <PageShell>
      <PageHeaderShell>
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
      </PageHeaderShell>
      <div className="flex-1 overflow-hidden mt-12">
        {gridContent}
      </div>
    </PageShell>
  );
};
