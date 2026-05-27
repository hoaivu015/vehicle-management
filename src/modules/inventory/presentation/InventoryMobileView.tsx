import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Filter } from 'lucide-react';
import { Skeleton } from '@/src/shared/design-system/Skeleton';
import { cn } from '@/src/shared/utils/cn';

import { InventoryGrid } from './components/InventoryGrid';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { useInventoryState } from './useInventoryState';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';

const InventoryMobileSkeleton = () => (
  <NativePage className="bg-kraft-folder px-4 py-6 space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="text" width={100} height={10} className="animate-pulse bg-black/5" />
        <Skeleton variant="text" width={80} height={28} className="animate-pulse bg-black/5" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="circle" width={44} height={44} className="rounded-full animate-pulse bg-black/5" />
        <Skeleton variant="circle" width={44} height={44} className="rounded-full animate-pulse bg-black/5" />
      </div>
    </div>
    {/* Tab selector skeleton */}
    <Skeleton variant="rectangle" width="100%" height={44} className="rounded-full animate-pulse bg-black/8" />
    {/* Car card skeletons */}
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-[2rem] border border-black/5 overflow-hidden flex">
          <Skeleton variant="rectangle" width={110} height={110} className="shrink-0 animate-pulse bg-black/5" />
          <div className="flex-1 p-4 space-y-2">
            <Skeleton variant="text" width="80%" height={14} className="animate-pulse bg-black/5" />
            <Skeleton variant="text" width="50%" height={10} className="animate-pulse bg-black/5" />
            <Skeleton variant="text" width="60%" height={16} className="animate-pulse bg-black/5 mt-2" />
          </div>
        </div>
      ))}
    </div>
  </NativePage>
);

interface InventoryMobileViewProps {
  userRole: string;
  currentUser: import('../../../shared/domain/types').Staff | null;
  initialSearch?: string;
  initialFilter?: string;
  initialAction?: string;
  hasPermission: (p: string) => boolean;
}

/**
 * 🍎 iPhone Native Inventory View.
 * Implements high-end native feel with safe areas and premium interactions.
 */
export const InventoryMobileView: React.FC<InventoryMobileViewProps> = ({
  userRole,
  currentUser,
  initialSearch = '',
  initialFilter = 'ALL',
  initialAction = '',
  hasPermission
}) => {
  const {
    availableCars,
    soldCars,
    staffList,
    loading,
    activeTab,
    setActiveTab,
    selectedVehicle,
    setSelectedVehicle,
    isDetailOpen,
    setIsDetailOpen,
    isAddOpen,
    setIsAddOpen,
    filterCriteria,
    handleAddVehicle,
    handleUpdateStatus,
    handleDeleteVehicle,
    handleUpdateVehicle,
    handleAddCost,
    handleDeleteCost,
    handlePin,
    handleAddPurchasePayment,
    handleAddSalePayment,
    handleCancelSale
  } = useInventoryState({
    userRole,
    currentUser,
    initialSearch,
    initialFilter,
    initialAction
  });

  const isInitialLoading = loading && !availableCars.length && !soldCars.length;

  if (isInitialLoading) return <InventoryMobileSkeleton />;

  return (
    <NativePage className="bg-kraft-folder animate-in fade-in slide-in-from-bottom-4 duration-700">

      <NativeHeader>
        <div className="flex items-center justify-between">
          <div>
            <SecondaryLabel>Quản lý tài sản</SecondaryLabel>
            <LargeTitle>Kho xe</LargeTitle>
          </div>
          
          {/* Mobile Search, Filter & Add Actions */}
          <div className="flex gap-g2">
            {hasPermission('EDIT_INVENTORY') && (
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddOpen(true)}
                className="w-touch h-touch rounded-full bg-kraft-accent text-white shadow-kraft flex items-center justify-center native-interactive"
              >
                <Plus size={20} strokeWidth={3} />
              </motion.button>
            )}
            <motion.button 
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-touch h-touch rounded-full bg-kraft-bg shadow-kraft flex items-center justify-center border border-hairline-soft native-interactive",
                filterCriteria !== 'ALL' ? "text-kraft-accent" : "text-kraft-ink"
              )}
            >
              <Filter size={18} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        <div className="mt-g4 flex p-gs bg-kraft-ink/5 rounded-full w-full border border-hairline-soft relative">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('AVAILABLE')}
            className={cn(
              "relative flex-1 py-g2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all duration-300 cursor-pointer",
              activeTab === 'AVAILABLE' ? "text-kraft-ink" : "text-kraft-ink/40"
            )}
          >
            {activeTab === 'AVAILABLE' && (
              <motion.div 
                layoutId="inventoryMobileTabPill"
                className="absolute inset-0 bg-kraft-bg rounded-full shadow-kraft border border-hairline-soft z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 block w-full text-center">Trong kho</span>
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('SOLD')}
            className={cn(
              "relative flex-1 py-g2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all duration-300 cursor-pointer",
              activeTab === 'SOLD' ? "text-income" : "text-kraft-ink/40"
            )}
          >
            {activeTab === 'SOLD' && (
              <motion.div 
                layoutId="inventoryMobileTabPill"
                className="absolute inset-0 bg-kraft-bg rounded-full shadow-kraft border border-hairline-soft z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 block w-full text-center">Đã bán</span>
          </motion.button>
        </div>
      </NativeHeader>

      {/* Grid Content */}
      <div className="mt-g1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <InventoryGrid
              loading={loading}
              activeTab={activeTab}
              availableCars={availableCars}
              soldCars={soldCars}
              userRole={userRole}
              userCode={currentUser?.code || 'SYSTEM'}
              onPin={handlePin}
              onSelectVehicle={setSelectedVehicle}
              setIsDetailOpen={setIsDetailOpen}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isDetailOpen && (
          <VehicleDetailModal
            isOpen={isDetailOpen}
            vehicle={selectedVehicle}
            onClose={() => setIsDetailOpen(false)}
            onUpdateStatus={handleUpdateStatus}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onAddCost={handleAddCost}
            onDeleteCost={handleDeleteCost}
            onPin={handlePin}
            onAddPurchasePayment={handleAddPurchasePayment}
            onAddSalePayment={handleAddSalePayment}
            onCancelSale={handleCancelSale}
            staffList={staffList}
            userRole={userRole}
            userCode={currentUser?.code || 'SYSTEM'}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddOpen && (
          <AddVehicleModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onSubmit={handleAddVehicle}
            staffList={staffList}
          />
        )}
      </AnimatePresence>
    </NativePage>
  );
};
