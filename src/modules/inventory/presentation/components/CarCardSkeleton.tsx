import React from 'react';
import { Skeleton } from '../../../../shared/design-system/Skeleton';
import { BaseCard as CardShell, CardImageSection, CardContentSection, CardFooter } from '@/src/shared/design-system/BaseCard';
import { cn } from '@/src/shared/utils/cn';

interface CarCardSkeletonProps {
  isCompact?: boolean;
}

export const CarCardSkeleton: React.FC<CarCardSkeletonProps> = ({ isCompact = false }) => {
  return (
    <CardShell isCompact={isCompact} minHeight="md:min-h-[350px] min-h-0">
      <CardImageSection className="relative bg-kraft-accent/5">
        <Skeleton height="100%" className="rounded-[16px] bg-black/5" />
        <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2">
          <Skeleton variant="rectangle" width={60} height={18} className="md:w-20 md:h-6 rounded-lg md:rounded-xl bg-white/20" />
          <Skeleton variant="rectangle" width={40} height={14} className="md:w-16 md:h-5 rounded-lg md:rounded-xl bg-white/10" />
        </div>
        <div className="absolute top-2 right-2 md:top-4 md:right-4">
          <Skeleton variant="circle" width={24} height={24} className="md:w-8 md:h-8 rounded-lg md:rounded-xl bg-white/10" />
        </div>
        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
          <div className="px-3 py-1.5 md:px-5 md:py-2.5 bg-white shadow-sm rounded-xl md:rounded-[20px] w-[80px] md:w-[120px]">
            <Skeleton variant="text" width="40%" height={6} className="bg-black/5 ml-auto mb-1" />
            <Skeleton variant="text" width="100%" height={12} className="md:h-4 bg-black/10" />
          </div>
        </div>
      </CardImageSection>

      <CardContentSection 
        isCompact={isCompact} 
        padding={isCompact ? "p-3 md:p-4" : "p-4 md:px-6 md:py-4 md:pt-5"}
        className="flex-1 flex flex-col"
      >
        <div className={isCompact ? "mb-1 md:mb-2" : "mb-2 md:mb-3"}>
          <div className={cn("flex items-center", isCompact ? "min-h-[1.25rem] md:min-h-[2.5rem]" : "min-h-[1.25rem] md:min-h-[3rem]")}>
            <Skeleton variant="text" width="100%" height={20} className="md:h-6 rounded-lg" />
          </div>
          {!isCompact && (
            <div className="flex gap-1 md:gap-2 mt-1 md:mt-2.5 items-center">
              <Skeleton variant="rectangle" width={40} height={14} className="md:w-16 md:h-5 rounded md:rounded-lg opacity-20" />
              <Skeleton variant="rectangle" width={40} height={14} className="md:w-16 md:h-5 rounded md:rounded-lg opacity-20" />
            </div>
          )}
        </div>

        <CardFooter className={isCompact ? "pt-2 md:pt-3" : "pt-3 md:pt-4"}>
          <div className="space-y-1 md:space-y-1.5">
            {!isCompact && <Skeleton variant="text" width={20} height={8} className="opacity-10" />}
            <Skeleton variant="text" width={40} height={12} className="md:w-12 md:h-4 rounded-md" />
          </div>
          <div className="text-right space-y-1 md:space-y-1.5 items-end flex flex-col pl-4">
            {!isCompact && <Skeleton variant="text" width={30} height={8} className="opacity-10" />}
            <Skeleton variant="text" width={60} height={12} className="md:w-20 md:h-4 rounded-md" />
          </div>
        </CardFooter>
      </CardContentSection>
    </CardShell>
  );
};
