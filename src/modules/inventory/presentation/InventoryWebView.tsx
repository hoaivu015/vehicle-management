import React from 'react';
import { AnimatePresence } from 'motion/react';

import { InventoryHeader } from './components/InventoryHeader';
import { InventoryGrid } from './components/InventoryGrid';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { useInventoryState } from './useInventoryState';
import { PageShell } from '@/src/shared/design-system/PageShell';
import { cn } from '@/src/shared/utils/cn';
import { motion } from 'motion/react';
import { InventorySkeleton } from './components/InventorySkeleton';

interface InventoryWebViewProps {
  userRole: string;
  currentUser: import('../../../shared/domain/types').Staff | null;
  initialSearch?: string;
  initialFilter?: string;
  initialAction?: string;
  hasPermission: (p: string) => boolean;
}

/**
 * Inventory WebView - Optimized for Desktop.
 * High-density grids, complex filters, and side-by-side layouts.
 */
export const InventoryWebView: React.FC<InventoryWebViewProps> = ({
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
    soldMonth,
    setSoldMonth,
    selectedVehicle,
    setSelectedVehicle,
    isDetailOpen,
    setIsDetailOpen,
    isAddOpen,
    setIsAddOpen,
    searchQuery,
    setSearchQuery,
    presenter,
    filterCriteria,
    setFilterCriteria,
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

  const [isCompact, setIsCompact] = React.useState(false);

  const isInitialLoading = loading && availableCars.length === 0 && soldCars.length === 0;
  const isSubsequentLoading = loading && (availableCars.length > 0 || soldCars.length > 0);

  if (isInitialLoading) {
    return <InventorySkeleton />;
  }

  return (
    <PageShell animate={true} className="slide-in-from-bottom-4">

      <InventoryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={(val) => presenter.search(val)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soldMonth={soldMonth}
        setSoldMonth={setSoldMonth}
        setIsAddOpen={setIsAddOpen}
        hasPermission={hasPermission}
        filterCriteria={filterCriteria}
        onClearFilter={() => setFilterCriteria('ALL')}
        isCompact={isCompact}
        setIsCompact={setIsCompact}
      />

      <div className="relative">
        <div className={cn("transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]", isSubsequentLoading && "opacity-50 blur-[2px] pointer-events-none")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
                isCompact={isCompact}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* LỚP PHỦ KÍNH THỞ (Liquid Flow Glass Overlay) */}
        {isSubsequentLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/5 backdrop-blur-[6px] border border-white/10 rounded-[2.5rem] flex items-center justify-center z-50 pointer-events-none"
            style={{
              animation: 'breathe-glow 3s ease-in-out infinite'
            }}
          >
            {/* Volumetric Mesh Gradient */}
            <div className="absolute inset-0 -z-10 opacity-30 mix-blend-color-dodge pointer-events-none overflow-hidden rounded-[2.5rem]">
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-10 bg-[radial-gradient(circle_at_30%_30%,#00f2fe_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#4facfe_0%,transparent_50%)] blur-[40px]"
              />
            </div>
            
            <div className="w-2.5 h-2.5 rounded-full bg-kraft-accent shadow-neon-glow" />
          </motion.div>
        )}
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
    </PageShell>
  );
};
