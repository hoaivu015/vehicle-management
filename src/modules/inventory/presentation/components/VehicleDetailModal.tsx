import React from 'react';
import { Calendar, Clock, CircleDollarSign, RefreshCw, Pin, Save, Edit2, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_CONFIG } from '@/src/shared/domain/constants';
import { cn } from '@/src/shared/utils/cn';
import { BaseModal as Modal } from '@/src/shared/design-system/BaseModal';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { haptics } from '@/src/shared/utils/haptics';
import { formatDate } from './VehicleDetail/VehicleDetailModalShared';

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
   onAddCost: (id: number, name: string, amount: number, staffId?: string) => Promise<void>;
   onDeleteCost: (id: number, index: number) => Promise<void>;
   onPin: (id: number, isPinned: boolean) => Promise<void>;
   onAddPurchasePayment: (id: number, amount: number, note: string, receiver: string) => Promise<void>;
   onAddSalePayment: (id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number, buyingBonus?: number) => Promise<void>;
   onCancelSale: (id: number, userCode: string, cancelType?: 'REFUND' | 'FORFEIT') => Promise<void>;
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
      isUploadingImage, handleUpdateStatus, handleDeleteVehicle, handleUpdateVehicle, handleAddCost,
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
         case 'info': return (
            <InfoTab 
               vehicle={vehicle} 
               isEditing={isEditing} 
               editForm={editForm} 
               setEditForm={setEditForm} 
               staffList={staffList} 
               userRole={userRole} 
               isSubmitting={isSubmitting} 
               handleDeleteVehicle={handleDeleteVehicle} 
               showDeleteConfirm={showDeleteConfirm} 
               setShowDeleteConfirm={setShowDeleteConfirm} 
            />
         );
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
                  onCancelSale: handleCancelSale,
                  onUpdateVehicle: handleUpdateVehicle
               }}
            />
         );
         case 'history': return <HistoryTab vehicle={vehicle} />;
         default: return null;
      }
   };

   // Top-Right Header Actions (Icon-only Ghim + Sửa/Lưu)
   const headerActions = (
      <div className="flex items-center gap-1.5 md:gap-2">
         {/* Nút Ghim xe (Icon-only) */}
         <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={async () => {
               haptics.medium();
               await handlePin(vehicle.id, !vehicle.is_pinned);
            }} 
            disabled={isSubmitting} 
            className={cn(
               "w-9 h-9 md:w-10 md:h-10 rounded-full transition-all shadow-2xs flex items-center justify-center", 
               vehicle.is_pinned 
                  ? "bg-kraft-accent text-white border border-kraft-accent shadow-kraft-accent/20" 
                  : "bg-surface-soft text-sub-label hover:text-kraft-ink hover:bg-black/5 border border-hairline-soft"
            )}
            title={vehicle.is_pinned ? "Bỏ ghim xe" : "Ghim xe lên đầu danh sách"}
            aria-label={vehicle.is_pinned ? "Bỏ ghim xe" : "Ghim xe"}
         >
            {isSubmitting ? (
               <RefreshCw className="animate-spin" size={15} />
            ) : (
               <Pin size={15} fill={vehicle.is_pinned ? "currentColor" : "none"} strokeWidth={2.5} />
            )}
         </motion.button>

         {/* Nút Sửa / Lưu thay đổi (Chỉ cho Admin/Kế toán, Icon-only) */}
         {isAdminOrAccountant && (
            isEditing ? (
               <div className="flex items-center gap-1.5">
                  <motion.button
                     whileTap={{ scale: 0.95 }}
                     onClick={async () => {
                        haptics.medium();
                        await handleSaveEdit();
                     }}
                     disabled={isSubmitting}
                     className="h-9 md:h-10 px-3.5 rounded-full bg-income text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-income/20 hover:bg-income/90 transition-all"
                     title="Lưu thay đổi"
                  >
                     {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                     <span>Lưu</span>
                  </motion.button>

                  <motion.button
                     whileTap={{ scale: 0.95 }}
                     onClick={() => {
                        haptics.light();
                        setIsEditing(false);
                     }}
                     className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-soft border border-hairline-soft text-xs font-bold text-sub-label hover:text-kraft-ink transition-all flex items-center justify-center"
                     title="Hủy chỉnh sửa"
                     aria-label="Hủy chỉnh sửa"
                  >
                     <X size={15} strokeWidth={2.5} />
                  </motion.button>
               </div>
            ) : (
               <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                     haptics.light();
                     handleStartEdit();
                  }}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-soft hover:bg-black/5 border border-hairline-soft text-kraft-ink flex items-center justify-center shadow-2xs transition-all"
                  title="Chỉnh sửa thông tin xe"
                  aria-label="Chỉnh sửa thông tin"
               >
                  <Edit2 size={15} strokeWidth={2.5} />
               </motion.button>
            )
         )}
      </div>
   );

   // Title and Subtitle with crisp identity typography
   const modalTitle = (
      <div className="flex items-center gap-2 flex-wrap min-w-0">
         <span className="text-xl md:text-2xl font-black text-kraft-ink tracking-tight uppercase truncate">
            {vehicle.name}
         </span>
         <div className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-2xs whitespace-nowrap",
            VEHICLE_STATUS_CONFIG[vehicle.status as VehicleStatus]?.badgeClass || "bg-kraft-ink"
         )}>
            {VEHICLE_STATUS_LABELS[vehicle.status as VehicleStatus] || vehicle.status}
         </div>
         {vehicle.is_coinvested && (
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50/80 border border-blue-200/60 shadow-2xs whitespace-nowrap flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
               <span>Góp vốn</span>
            </div>
         )}
      </div>
   );

   const modalSubtitle = (
      <div className="flex items-center gap-2 text-sub-label text-xs font-bold mt-0.5">
         <span className="font-mono font-black uppercase text-kraft-ink/70">Mã: {vehicle.code}</span>
         {vehicle.purchase_date && (
            <>
               <span className="text-black/20">•</span>
               <span>Nhập: {formatDate(vehicle.purchase_date)}</span>
            </>
         )}
      </div>
   );

   return (
      <Modal 
         isOpen={isOpen} 
         onClose={onClose} 
         maxWidth="6xl" 
         title={modalTitle}
         subtitle={modalSubtitle}
         headerActions={headerActions}
         mobileHideTitle={true}
         className="h-[88dvh] lg:h-[86vh]"
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
               onClose={onClose} 
            />

            {/* RIGHT SIDE / BOTTOM SIDE: Streamlined Tabs & Content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-white">
               {/* Tab Navigation Header Bar */}
               <div className="px-3 sm:px-6 pt-2.5 sm:pt-4 pb-2.5 shrink-0 border-b border-hairline-soft bg-surface-soft/40 flex items-center">
                  <nav className={cn(
                    "w-full sm:w-auto grid sm:flex items-center gap-1 bg-black/[0.06] p-1 rounded-full border border-black/[0.06] relative shrink-0 shadow-inner",
                    tabs.length === 3 ? "grid-cols-3" : "grid-cols-2"
                  )}>
                     {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                           <button
                              key={tab.id}
                              onClick={() => handleTabChange(tab.id as 'info' | 'financials' | 'history')}
                              className="relative flex items-center justify-center h-8.5 px-2 sm:px-5 rounded-full transition-all active:scale-95 cursor-pointer z-10 group whitespace-nowrap"
                           >
                              {isActive && (
                                 <motion.div
                                    layoutId="vehicleDetailTabPill"
                                    className="absolute inset-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] rounded-full z-0 border border-white/80"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                 />
                              )}
                              <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5">
                                 <Icon size={13} className={cn("transition-all duration-300 shrink-0", isActive ? "scale-105 text-kraft-accent" : "text-kraft-ink/60 group-hover:text-kraft-ink/90")} />
                                 <span className={cn("text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap", isActive ? "text-kraft-ink font-black" : "text-kraft-ink/65 font-bold group-hover:text-kraft-ink/90")}>
                                    {tab.label}
                                 </span>
                              </div>
                           </button>
                        );
                     })}
                  </nav>
               </div>

               {/* Scrollable Content Area */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-6 pb-28 md:pb-8">
                  <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>
               </div>

               {/* Mobile Sticky Action Bar (iPhone Native Liquid Glass Dock) */}
               <div className="lg:hidden absolute bottom-0 left-0 right-0 z-[120] px-4 py-3 bg-white/95 backdrop-blur-2xl border-t border-hairline-soft pb-[calc(14px+env(safe-area-inset-bottom,16px))] shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.15)]">
                  <div className="flex gap-2.5 items-center">
                     {isAdminOrAccountant && (
                        <>
                           {isEditing ? (
                              <motion.button
                                 whileTap={{ scale: 0.96 }}
                                 onClick={async () => {
                                    haptics.medium();
                                    await handleSaveEdit();
                                 }}
                                 disabled={isSubmitting}
                                 className="h-12 flex-1 bg-income text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-income/20 active:scale-[0.98] transition-all cursor-pointer"
                              >
                                 {isSubmitting ? <RefreshCw className="animate-spin" size={15} /> : <Save size={15} />}
                                 <span>Lưu thay đổi</span>
                              </motion.button>
                           ) : (
                              <motion.button
                                 whileTap={{ scale: 0.96 }}
                                 onClick={() => {
                                    haptics.medium();
                                    setIsUpdatingStatus(true);
                                 }}
                                 className="h-12 flex-1 bg-kraft-ink text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-kraft-ink/20 active:scale-[0.98] transition-all cursor-pointer"
                              >
                                 <TrendingUp size={15} />
                                 <span>Đổi trạng thái</span>
                              </motion.button>
                           )}

                           <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={() => {
                                 haptics.light();
                                 if (isEditing) setIsEditing(false);
                                 else handleStartEdit();
                              }}
                              className="w-12 h-12 bg-white border border-hairline-soft rounded-full flex items-center justify-center text-kraft-ink shadow-sm active:scale-[0.95] transition-all shrink-0 cursor-pointer"
                              aria-label={isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa xe"}
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
