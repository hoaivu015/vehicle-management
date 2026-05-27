import React from 'react';
import { Calendar, Clock, CircleDollarSign, RefreshCw, Pin, Save, Edit2, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { cn } from '@/src/shared/utils/cn';
import { DESIGN_TOKENS } from '@/src/shared/design-system/tokens';
import { BaseModal as Modal } from '@/src/shared/design-system/BaseModal';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { haptics } from '@/src/shared/utils/haptics';

import { VehicleSidebar } from './VehicleDetail/VehicleSidebar';
import { InfoTab } from './VehicleDetail/InfoTab';
import { FinancialsTab } from './VehicleDetail/FinancialsTab';
import { HistoryTab } from './VehicleDetail/HistoryTab';
import { StatusUpdateOverlay } from './VehicleDetail/StatusUpdateOverlay';
import { useVehicleDetail } from './VehicleDetail/useVehicleDetail';

interface VehicleDetailModalProps {
   vehicle: Vehicle | null;
   isOpen: boolean;
   onClose: () => void;
   onUpdateStatus: (id: number, nextStatus: VehicleStatus, extra?: Record<string, unknown>) => Promise<void>;
   onDeleteVehicle: (id: number) => Promise<void>;
   onUpdateVehicle: (id: number, data: Partial<Vehicle>) => Promise<void>;
   onAddCost: (id: number, name: string, amount: number) => Promise<void>;
   onDeleteCost: (id: number, index: number) => Promise<void>;
   onPin: (id: number, isPinned: boolean) => Promise<void>;
   onAddPurchasePayment: (id: number, amount: number, note: string, receiver: string) => Promise<void>;
   onAddSalePayment: (id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number, buyingBonus?: number) => Promise<void>;
   onCancelSale: (id: number, userCode: string) => Promise<void>;
   staffList: Staff[];
   userRole: string;
   userCode: string;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = (props) => {
   const { vehicle, isOpen, onClose, userRole, userCode, staffList } = props;
   const {
      activeTab, setActiveTab, isUpdatingStatus, setIsUpdatingStatus, isEditing, setIsEditing,
      editForm, setEditForm, paymentForm, setPaymentForm,
      transitionStatus, setTransitionStatus,
      isSubmitting, showDeleteConfirm, setShowDeleteConfirm,
      isUploadingImage, handleUpdateStatus, handleDeleteVehicle, handleAddCost,
      handleDeleteCost, handlePin, handleAddPurchasePayment, handleAddSalePayment, handleCancelSale,
      handleStartEdit, handleSaveEdit, handleImageUpload, financials
   } = useVehicleDetail(vehicle, userCode, props);

   if (!vehicle || !isOpen || !financials) return null;

   const canSeeFullInfo = PermissionService.canSeeFinancials(userRole, userCode, vehicle);
   const isAdminOrAccountant = PermissionService.canManageVehicle(userRole);
   const canSeeFinancials = PermissionService.canSeeFinancials(userRole, userCode, vehicle);

   const tabs = [
      { id: 'info', label: 'Thông số', icon: Calendar },
      { id: 'financials', label: 'Tài chính', icon: CircleDollarSign, show: canSeeFullInfo },
      { id: 'history', label: 'Lịch sử', icon: Clock }
   ].filter(t => t.show !== false);

   const handleTabChange = (tabId: 'info' | 'financials' | 'history') => {
      haptics.light();
      setActiveTab(tabId);
   };

   const renderTabContent = () => {
      switch (activeTab) {
         case 'info': return <InfoTab vehicle={vehicle} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} staffList={staffList} userRole={userRole} isSubmitting={isSubmitting} handleDeleteVehicle={handleDeleteVehicle} showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm} />;
         case 'financials': return (
            <FinancialsTab 
               vehicle={vehicle} 
               canSeeFinancials={canSeeFinancials} 
               isAdminOrAccountant={isAdminOrAccountant} 
               userCode={userCode}
               staffList={staffList}
               actions={{
                  onAddCost: handleAddCost,
                  onDeleteCost: handleDeleteCost,
                  onAddPurchasePayment: handleAddPurchasePayment,
                  onAddSalePayment: handleAddSalePayment,
                  onCancelSale: handleCancelSale
               }}
            />
         );
         case 'history': return <HistoryTab vehicle={vehicle} />;
         default: return null;
      }
   };

   return (
      <Modal 
         isOpen={isOpen} 
         onClose={onClose} 
         maxWidth="6xl" 
         title={vehicle.name}
         subtitle={`Mã xe: ${vehicle.code}`}
         mobileHideTitle={true}
         className="h-[92vh] lg:h-[85vh]"
      >
         <div className="relative w-full h-full flex flex-col lg:flex-row overflow-hidden pointer-events-auto">
            <VehicleSidebar 
               vehicle={vehicle} 
               financials={financials} 
               isEditing={isEditing} 
               editForm={editForm}
               isSubmitting={isSubmitting} 
               isUploadingImage={isUploadingImage} 
               canSeeFullInfo={canSeeFullInfo} 
               isAdminOrAccountant={isAdminOrAccountant}
               handleSaveEdit={handleSaveEdit} 
               setIsUpdatingStatus={setIsUpdatingStatus} 
               setIsEditing={setIsEditing} 
               handleStartEdit={handleStartEdit} 
               handleImageUpload={handleImageUpload} 
            />

            {/* RIGHT SIDE / BOTTOM SIDE: Tabs & Content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
               <div className="flex-1 flex flex-col bg-[var(--meta-step-2)] overflow-hidden min-h-0">
                  <div className="px-4 md:px-8 py-5 shrink-0 flex items-center justify-between">
                     <nav className="flex items-center gap-1 bg-kraft-ink/[0.04] p-1 rounded-full border border-black/[0.04] backdrop-blur-xl relative h-10 w-fit transition-all duration-300">
                        {tabs.map(tab => {
                           const isActive = activeTab === tab.id;
                           const Icon = tab.icon;
                           return (
                              <button
                                 key={tab.id}
                                 onClick={() => handleTabChange(tab.id as any)}
                                 className="relative flex items-center justify-center h-8 px-5 rounded-full transition-all active:scale-95 cursor-pointer z-10 group"
                              >
                                 {isActive && (
                                    <motion.div
                                       layoutId="vehicleDetailTabPill"
                                       className="absolute inset-0 bg-white shadow-[0_3px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] rounded-full z-0 border border-black/5"
                                       transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                 )}
                                 <div className="relative z-10 flex items-center gap-2">
                                    <Icon size={13} className={cn("transition-all duration-300", isActive ? "scale-110 text-kraft-accent" : "text-kraft-ink/60 group-hover:text-kraft-ink/90")} />
                                    <span className={cn("text-[10px] uppercase tracking-[0.12em] transition-all duration-300", isActive ? "text-kraft-ink font-black" : "text-kraft-ink/65 font-bold group-hover:text-kraft-ink/90")}>
                                       {tab.label}
                                    </span>
                                 </div>
                              </button>
                           );
                        })}
                     </nav>

                     {/* Premium Integrated Desktop Pin Button - Never cut off! */}
                     <div className="hidden md:block">
                        <motion.button 
                           whileTap={{ scale: 0.9 }}
                           onClick={async () => {
                              haptics.medium();
                              await handlePin(vehicle.id, !vehicle.is_pinned);
                           }} 
                           disabled={isSubmitting} 
                           className={cn(
                              "w-10 h-10 rounded-full transition-all shadow-md flex items-center justify-center", 
                              vehicle.is_pinned ? "bg-kraft-accent text-white border-white/20" : "glass-purity-surface text-sub-label hover:text-kraft-ink"
                           )}
                        >
                           {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : (vehicle.is_pinned ? <Pin size={14} fill="currentColor" strokeWidth={2.5} /> : <Pin size={14} strokeWidth={2.5} />)}
                        </motion.button>
                     </div>
                  </div>
                  <div className="flex-1 bg-white border border-hairline-soft rounded-t1 shadow-kraft-deep overflow-hidden mx-4 md:mx-6 mb-6 flex flex-col">
                     <div className={cn("flex-1 overflow-y-auto custom-scrollbar pb-32 lg:pb-8", DESIGN_TOKENS.layout.content_padding)}>
                        <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>
                     </div>
                  </div>
               </div>

               {/* Mobile Sticky Action Bar */}
               <div className="lg:hidden absolute bottom-0 left-0 right-0 z-[120] px-4 py-3 bg-white/80 backdrop-blur-xl border-t border-hairline-soft safe-pb shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.15)]">
                  <div className="flex gap-3 items-center">
                     {isAdminOrAccountant && (
                        <>
                           {isEditing ? (
                              <motion.button
                                 whileTap={{ scale: 0.95 }}
                                 onClick={async () => {
                                    haptics.medium();
                                    await handleSaveEdit();
                                 }}
                                 disabled={isSubmitting}
                                 className="h-12 flex-1 bg-income text-white rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-income/20 active:scale-[0.98] transition-all"
                              >
                                 {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                                 <span>Lưu thay đổi</span>
                              </motion.button>
                           ) : (
                              <motion.button
                                 whileTap={{ scale: 0.95 }}
                                 onClick={() => {
                                    haptics.light();
                                    setIsUpdatingStatus(true);
                                 }}
                                 className="h-12 flex-1 bg-kraft-ink text-white rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-kraft-ink/20 active:scale-[0.98] transition-all"
                              >
                                 <TrendingUp size={14} />
                                 <span>Trạng Thái</span>
                              </motion.button>
                           )}

                           <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                 haptics.light();
                                 if (isEditing) setIsEditing(false);
                                 else handleStartEdit();
                              }}
                              className="w-12 h-12 bg-white border border-hairline-soft rounded-full flex items-center justify-center text-kraft-ink shadow-sm active:scale-[0.95] transition-all"
                           >
                              {isEditing ? <X size={18} strokeWidth={2.5} /> : <Edit2 size={18} strokeWidth={2.5} />}
                           </motion.button>
                        </>
                     )}
                  </div>
               </div>
            </div>

            <AnimatePresence>
               {isUpdatingStatus && (
                  <StatusUpdateOverlay 
                     vehicle={vehicle} 
                     staffList={staffList} 
                     userCode={userCode} 
                     isSubmitting={isSubmitting} 
                     transitionStatus={transitionStatus} 
                     setTransitionStatus={setTransitionStatus} 
                     paymentForm={paymentForm} 
                     setPaymentForm={setPaymentForm} 
                     handleUpdateStatus={handleUpdateStatus} 
                     handleCancelSale={handleCancelSale} 
                     handleAddSalePayment={handleAddSalePayment} 
                     setIsUpdatingStatus={setIsUpdatingStatus} 
                  />
               )}
            </AnimatePresence>
         </div>
      </Modal>
   );
};
