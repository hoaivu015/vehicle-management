import React from 'react';
import { AnimatePresence } from 'motion/react';

import { InventoryHeader } from './components/InventoryHeader';
import { InventoryGrid } from './components/InventoryGrid';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { useInventoryState } from './useInventoryState';

interface InventoryPageProps {
  userRole: string;
  currentUser: any;
  initialSearch?: string;
  initialFilter?: string;
  initialAction?: string;
  hasPermission: (p: string) => boolean;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
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

  return (
    <div className="space-y-6 md:space-y-12 py-4 md:py-12 px-4 md:px-12 max-w-[1700px] mx-auto h-full flex flex-col overflow-hidden">
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
      />

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

      {/* Modals */}
      <AnimatePresence>
        {isDetailOpen && (
          <VehicleDetailModal
            isOpen={isDetailOpen}
            vehicle={selectedVehicle}
            onClose={() => setIsDetailOpen(false)}
            onUpdateStatus={handleUpdateStatus}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateVehicle={(id, data) => presenter.updateVehicle(id, data)}
            onAddCost={(vehicle, name, amount) => presenter.addVehicleCost(vehicle, name, amount)}
            onDeleteCost={(vehicle, idx) => presenter.deleteVehicleCost(vehicle, idx)}
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
    </div>
  );
};
