import React from 'react';
import { createPortal } from 'react-dom';
import { Calendar, TrendingUp, Clock, DollarSign, CircleDollarSign, RefreshCw, X, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, UserRole } from '@/src/shared/domain/constants';
import { cn } from '@/src/utils/cn';
import { Z_INDEX } from '@/src/constants';

import { VehicleSidebar } from './VehicleDetail/VehicleSidebar';
import { InfoTab } from './VehicleDetail/InfoTab';
import { FinancialsTab } from './VehicleDetail/FinancialsTab';
import { PaymentsBuyTab } from './VehicleDetail/PaymentsBuyTab';
import { PaymentsSaleTab } from './VehicleDetail/PaymentsSaleTab';
import { HistoryTab } from './VehicleDetail/HistoryTab';
import { StatusUpdateOverlay } from './VehicleDetail/StatusUpdateOverlay';
import { useVehicleDetail } from './VehicleDetail/useVehicleDetail';

interface VehicleDetailModalProps {
   vehicle: Vehicle | null;
   isOpen: boolean;
   onClose: () => void;
   onUpdateStatus: (id: number, nextStatus: VehicleStatus, extra?: any) => Promise<void>;
   onDeleteVehicle: (id: number) => Promise<void>;
   onUpdateVehicle: (id: number, data: Partial<Vehicle>) => Promise<void>;
   onAddCost: (vehicle: Vehicle, name: string, amount: number) => Promise<void>;
   onDeleteCost: (vehicle: Vehicle, index: number) => Promise<void>;
   onPin?: (id: number, isPinned: boolean) => Promise<void>;
   onAddPurchasePayment: (id: number, amount: number, note: string, receiver: string) => Promise<void>;
   onAddSalePayment: (id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number) => Promise<void>;
   onCancelSale: (id: number, userCode: string) => Promise<void>;
   staffList: any[];
   userRole: string;
   userCode: string;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = (props) => {
   const { vehicle, isOpen, onClose, userRole, userCode, staffList } = props;
   const {
      activeTab, setActiveTab, isUpdatingStatus, setIsUpdatingStatus, isEditing, setIsEditing,
      editForm, setEditForm, costForm, setCostForm, paymentForm, setPaymentForm,
      transitionStatus, setTransitionStatus, nextStatusInTab, setNextStatusInTab,
      isSubmitting, showDeleteConfirm, setShowDeleteConfirm, showCancelSaleConfirm, setShowCancelSaleConfirm,
      isUploadingImage, handleUpdateStatus, handleDeleteVehicle, handleUpdateVehicle, handleAddCost,
      handleDeleteCost, handlePin, handleAddPurchasePayment, handleAddSalePayment, handleCancelSale,
      handleStartEdit, handleSaveEdit, handleImageUpload, financials
   } = useVehicleDetail(vehicle, userCode, props);

   if (!vehicle || !isOpen || !financials) return null;

   const purchaseDebt = financials.purchasePrice - (vehicle.purchase_paid_amount || 0);
   const saleDebt = (financials.salePrice || 0) - (vehicle.received_amount || 0);

   const canSeeFullInfo = userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT || userRole === UserRole.MANAGER || (vehicle.is_coinvested && vehicle.coinvestor_code === userCode);
   const isAdminOrAccountant = userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT;
   const canSeeFinancials = isAdminOrAccountant || userRole === UserRole.MANAGER || (vehicle.is_coinvested && vehicle.coinvestor_code === userCode);

   const tabs = [
      { id: 'info', label: 'Thông số', icon: Calendar },
      { id: 'financials', label: 'Chi phí', icon: CircleDollarSign, show: canSeeFullInfo },
      { id: 'payments_buy', label: 'Tiền mua', icon: DollarSign, show: canSeeFullInfo && (vehicle.status === VehicleStatus.DEPOSIT_BUY || (vehicle.purchase_payment_history?.length || 0) > 0) },
      { id: 'payments_sale', label: 'Tiền bán', icon: TrendingUp, show: canSeeFullInfo && ([VehicleStatus.DEPOSIT_SALE, VehicleStatus.BANK_DEPOSIT, VehicleStatus.BANK_CONFIRMED, VehicleStatus.SOLD].includes(vehicle.status as VehicleStatus) || (vehicle.sale_payment_history?.length || 0) > 0) },
      { id: 'history', label: 'Lịch sử', icon: Clock }
   ].filter(t => t.show !== false);

   const renderTabContent = () => {
      switch (activeTab) {
         case 'info': return <InfoTab vehicle={vehicle} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} staffList={staffList} userRole={userRole} canSeeFullInfo={canSeeFullInfo} isSubmitting={isSubmitting} handleDeleteVehicle={handleDeleteVehicle} showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm} />;
         case 'financials': return <FinancialsTab vehicle={vehicle} financials={financials} costForm={costForm} setCostForm={setCostForm} handleAddCost={handleAddCost} handleDeleteCost={handleDeleteCost} isSubmitting={isSubmitting} canSeeFinancials={canSeeFinancials} isAdminOrAccountant={isAdminOrAccountant} />;
         case 'payments_buy': return <PaymentsBuyTab vehicle={vehicle} financials={financials} purchaseDebt={purchaseDebt} paymentForm={paymentForm} setPaymentForm={setPaymentForm} handleAddPurchasePayment={handleAddPurchasePayment} isSubmitting={isSubmitting} />;
         case 'payments_sale': return <PaymentsSaleTab vehicle={vehicle} saleDebt={saleDebt} paymentForm={paymentForm} setPaymentForm={setPaymentForm} nextStatusInTab={nextStatusInTab} setNextStatusInTab={setNextStatusInTab} staffList={staffList} userCode={userCode} userRole={userRole} handleAddSalePayment={handleAddSalePayment} handleCancelSale={handleCancelSale} isSubmitting={isSubmitting} showCancelSaleConfirm={showCancelSaleConfirm} setShowCancelSaleConfirm={setShowCancelSaleConfirm} />;
         case 'history': return <HistoryTab vehicle={vehicle} />;
         default: return null;
      }
   };

   return typeof document !== 'undefined' ? createPortal(
      <div className={`fixed inset-0 z-[${Z_INDEX.MODAL}] flex items-center justify-center p-2 sm:p-6 lg:p-8`}>
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-kraft-ink/60 backdrop-blur-md cursor-pointer" />
         <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-6xl bg-white/90 backdrop-blur-3xl rounded-t1 border border-white/50 shadow-[var(--shadow-kraft-deep)] overflow-hidden flex flex-col lg:flex-row h-[92vh] lg:h-[85vh] pointer-events-auto">
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[110] flex gap-2 sm:gap-3">
               <button onClick={() => handlePin(vehicle.id, !vehicle.is_pinned)} disabled={isSubmitting} className={cn("p-2 sm:p-3 rounded-t3 border transition-all shadow-lg flex items-center justify-center active:scale-[0.98]", vehicle.is_pinned ? "bg-kraft-accent text-white border-white/20" : "bg-white/40 text-kraft-ink/40 border-white/60 hover:text-kraft-ink")}>
                  {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : (vehicle.is_pinned ? <Pin size={20} fill="currentColor" /> : <Pin size={18} />)}
               </button>
               <button onClick={onClose} className="p-2 sm:p-3 bg-white/40 backdrop-blur-md border border-white/60 text-kraft-ink hover:bg-white/60 rounded-t3 transition-all shadow-lg active:scale-[0.98]"><X size={20} /></button>
            </div>
            <VehicleSidebar vehicle={vehicle} financials={financials} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} isSubmitting={isSubmitting} isUploadingImage={isUploadingImage} canSeeFullInfo={canSeeFullInfo} handleSaveEdit={handleSaveEdit} setIsUpdatingStatus={setIsUpdatingStatus} setIsEditing={setIsEditing} handleStartEdit={handleStartEdit} handleImageUpload={handleImageUpload} handlePin={handlePin} />
            <div className="flex-1 flex flex-col bg-[var(--meta-step-2)] overflow-hidden pt-6">
               <div className="ctab-bar px-8">
                  {tabs.map(tab => (
                     <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("ctab", activeTab === tab.id && "ctab-active")}>
                        <tab.icon size={14} className={cn("transition-all", activeTab === tab.id ? "text-kraft-accent scale-110" : "opacity-40")} />
                        <span className={cn("text-[10px] uppercase tracking-[0.2em] transition-all", activeTab === tab.id ? "text-kraft-ink font-black" : "text-kraft-ink/30 font-bold")}>{tab.label}</span>
                     </button>
                  ))}
               </div>
               <div className="ctab-panel flex-1 flex flex-col overflow-hidden mx-1">
                  <div className="ctab-content flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar">
                     <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>
                  </div>
               </div>
            </div>
         </motion.div>
         <AnimatePresence>
            {isUpdatingStatus && <StatusUpdateOverlay vehicle={vehicle} staffList={staffList} userCode={userCode} isSubmitting={isSubmitting} transitionStatus={transitionStatus} setTransitionStatus={setTransitionStatus} paymentForm={paymentForm} setPaymentForm={setPaymentForm} handleUpdateStatus={handleUpdateStatus} handleCancelSale={handleCancelSale} handleAddSalePayment={handleAddSalePayment} setIsUpdatingStatus={setIsUpdatingStatus} />}
         </AnimatePresence>
      </div>,
      document.body
   ) : null;
};
