import React from 'react';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';
import { Vehicle } from '@/src/shared/domain/types';
import { CarCard } from './CarCard';
import { CarCardSkeleton } from './CarCardSkeleton';
import { EmptyState } from '@/src/shared/design-system/DataDisplay';
import { cn } from '@/src/shared/utils/cn';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';

interface InventoryGridProps {
  loading: boolean;
  activeTab: 'AVAILABLE' | 'SOLD';
  availableCars: Vehicle[];
  soldCars: Vehicle[];
  userRole: string;
  userCode: string;
  onPin: (id: number, isPinned: boolean) => Promise<void>;
  onSelectVehicle: (car: Vehicle) => void;
  setIsDetailOpen: (open: boolean) => void;
  isCompact?: boolean;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  loading,
  activeTab,
  availableCars,
  soldCars,
  userRole,
  userCode,
  onPin,
  onSelectVehicle,
  setIsDetailOpen,
  isCompact = false
}) => {
  const currentCars = activeTab === 'AVAILABLE' ? availableCars : soldCars;

  if (!loading && currentCars.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Danh bạ kho trống"
        description="Hiện tại chưa có xe nào trong danh sách này."
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pt-g2 md:pt-g4">
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-g2 md:gap-g4 pb-g6",
        isCompact 
          ? "md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" 
          : "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      )}>
        {loading ? (
          // Render Skeleton Items using the same grid configuration
          [...Array(8)].map((_, i) => (
            <motion.div 
              key={`skeleton-${i}`} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full h-full"
            >
              <CarCardSkeleton isCompact={isCompact} />
            </motion.div>
          ))
        ) : (
          // Render Actual Items
          currentCars.map((car, index) => {
            const financials = calculateVehicleFinancials(car);
            const canSeeFullInfo = PermissionService.canSeeFinancials(userRole, userCode, car);
            
            // Define custom high-end animations depending on the active tab
            const animProps = activeTab === 'AVAILABLE' ? {
              initial: { opacity: 0, x: -30, rotate: -0.5, filter: 'blur(4px)' },
              animate: { opacity: 1, x: 0, rotate: 0, filter: 'blur(0px)' },
              transition: {
                type: 'spring' as const,
                stiffness: 140,
                damping: 18,
                delay: index * 0.045
              }
            } : {
              initial: { opacity: 0, scale: 0.96, x: 25, filter: 'blur(4px)' },
              animate: { opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' },
              transition: {
                type: 'spring' as const,
                stiffness: 120,
                damping: 16,
                delay: index * 0.04
              }
            };

            return (
              <motion.div 
                key={car.id} 
                {...animProps}
                className="w-full h-full"
                style={{ willChange: 'transform, opacity' }}
              >
                <CarCard
                  car={car}
                  onPin={onPin}
                  isCompact={isCompact}
                  financials={financials}
                  canSeeFullInfo={canSeeFullInfo}
                  onClick={(c) => {
                    onSelectVehicle(c);
                    setIsDetailOpen(true);
                  }}
                />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

