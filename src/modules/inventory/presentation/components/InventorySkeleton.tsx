import React from 'react';
import { Skeleton } from '../../../../shared/design-system/Skeleton';
import { PageShell, PageHeaderShell } from '@/src/shared/design-system/PageShell';
import { CarCardSkeleton } from './CarCardSkeleton';

interface InventorySkeletonProps {
  hideHeader?: boolean;
}

export const InventorySkeleton: React.FC<InventorySkeletonProps> = ({ hideHeader = false }) => {
  // 1. Core Grid Content - Reusing CarCardSkeleton to match the Grid in InventoryGrid
  const gridContent = (
    <div className="grid grid-cols-2 gap-2.5 md:gap-10 pb-20 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  );

  if (hideHeader) return gridContent;

  return (
    <PageShell>
      <PageHeaderShell>
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
      </PageHeaderShell>
      {gridContent}
    </PageShell>
  );
};

