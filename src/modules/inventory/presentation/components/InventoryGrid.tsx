import React from 'react';
import { Package } from 'lucide-react';
import { Vehicle } from '@/src/shared/domain/types';
import { CarCard } from './CarCard';
import { InventorySkeleton } from './InventorySkeleton';

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
  setIsDetailOpen
}) => {
  const currentCars = activeTab === 'AVAILABLE' ? availableCars : soldCars;

  if (loading) {
    return <InventorySkeleton hideHeader />;
  }

  if (currentCars.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-48 gap-8 opacity-20">
        <Package size={80} strokeWidth={1} />
        <p className="text-xs font-black uppercase tracking-[0.5em] italic">Danh bạ kho trống</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar min-h-0">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 pb-20 justify-items-center">
        {currentCars.map((car) => (
          <div key={car.id} className="w-full max-w-[380px] h-full">
            <CarCard
              car={car}
              userRole={userRole}
              userCode={userCode}
              onPin={onPin}
              onClick={(c) => {
                onSelectVehicle(c);
                setIsDetailOpen(true);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
