import React from 'react';
import { BaseModal as Modal } from '@/src/shared/design-system/BaseModal';
import { Plus, RefreshCw, X, ChevronRight } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { DESIGN_TOKENS } from '@/src/shared/design-system/tokens';
import { VehicleStatus, VEHICLE_STATUS_LABELS, STAFF_CONSTANTS } from '@/src/shared/domain/constants';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { Vehicle } from '@/src/shared/domain/types';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { PaymentFormState } from './useVehicleDetail';

interface StatusUpdateOverlayProps {
   vehicle: Vehicle;
   staffList: import('@/src/shared/domain/types').Staff[];
   userCode: string;
   isSubmitting: boolean;
   transitionStatus: VehicleStatus | null;
   setTransitionStatus: (status: VehicleStatus | null) => void;
   paymentForm: PaymentFormState;
   setPaymentForm: (form: PaymentFormState) => void;
   handleUpdateStatus: (id: number, status: VehicleStatus, data?: { note: string; updates: Partial<import('@/src/modules/inventory/domain/VehicleSchema').VehicleDTO> }) => Promise<void>;
   handleCancelSale: (id: number, userCode: string) => Promise<void>;
   handleAddSalePayment: (
     id: number, 
     amount: number, 
     note: string, 
     receiver: string, 
     nextStatus: VehicleStatus, 
     seller: string, 
     buyerName?: string, 
     salePrice?: number, 
     commission?: number, 
     buyingBonus?: number
   ) => Promise<void>;
   setIsUpdatingStatus: (val: boolean) => void;
}

export const StatusUpdateOverlay: React.FC<StatusUpdateOverlayProps> = ({
   vehicle,
   staffList,
   userCode,
   isSubmitting,
   transitionStatus,
   setTransitionStatus,
   paymentForm,
   setPaymentForm,
   handleUpdateStatus,
   handleCancelSale,
   handleAddSalePayment,
   setIsUpdatingStatus
}) => {
   const handleClose = () => {
      setIsUpdatingStatus(false);
      setTransitionStatus(null);
   };

   const handleConfirm = async () => {
      if (transitionStatus === VehicleStatus.IN_STOCK) {
         if ((paymentForm.salePrice || 0) <= 0) return;
         await handleUpdateStatus(vehicle.id, VehicleStatus.IN_STOCK, {
            note: paymentForm.note,
            updates: { sale_price: paymentForm.salePrice }
         });
      } else if (transitionStatus) {
         await handleAddSalePayment(
            vehicle.id,
            paymentForm.amount,
            paymentForm.note,
            paymentForm.receiver,
            transitionStatus,
            paymentForm.seller,
            paymentForm.buyerName,
            paymentForm.salePrice,
            paymentForm.commission,
            paymentForm.buying_bonus
         );
      }
      setIsUpdatingStatus(false);
      setTransitionStatus(null);
   };

   return (
      <Modal isOpen={true} onClose={handleClose} maxWidth="lg" showCloseButton={false} height="auto">
         <div className="relative w-full h-full flex flex-col overflow-hidden pointer-events-auto">
            {/* Header Section with Close Button */}
            <div className="flex justify-between items-start p-6 md:p-8 pb-4">
               <div className="space-y-1">
                  <h2 className="text-apple-title-1 font-black tracking-tight">
                     {transitionStatus ? VEHICLE_STATUS_LABELS[transitionStatus] : 'Cập nhật trạng thái'}
                  </h2>
                  <p className="text-apple-subheadline text-kraft-ink/60">
                     {transitionStatus ? 'Xác nhận các thông tin nghiệp vụ' : 'Chọn bước chuyển trạng thái tiếp theo cho xe'}
                  </p>
               </div>
               
               <button 
                  onClick={handleClose} 
                  className="w-12 h-12 md:w-14 md:h-14 glass-purity-surface text-kraft-ink hover:text-red-500 rounded-full transition-all shadow-lg active:scale-[0.95] flex items-center justify-center"
               >
                  <X size={20} />
               </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
               <div className={cn("flex-1 overflow-y-auto custom-scrollbar", DESIGN_TOKENS.layout.content_padding)}>
            {!transitionStatus ? (
               <div className="grid grid-cols-1 gap-4">
                  {VehicleStateMachine.getValidNextStatuses(vehicle.status as VehicleStatus).map(status => (
                     <button
                        key={status}
                        disabled={isSubmitting}
                        onClick={() => {
                           const saleStatuses = [VehicleStatus.DEPOSIT_SALE, VehicleStatus.BANK_DEPOSIT, VehicleStatus.BANK_CONFIRMED, VehicleStatus.SOLD];
                           const isSaleTransition = saleStatuses.includes(status as VehicleStatus);

                           if (isSaleTransition) {
                              setTransitionStatus(status as VehicleStatus);
                              setPaymentForm({
                                 ...paymentForm,
                                 salePrice: vehicle.sale_price || 0,
                                 amount: (status === VehicleStatus.SOLD && vehicle.status === VehicleStatus.IN_STOCK) ? (vehicle.sale_price || 0) : 0,
                                 buyerName: vehicle.customer_name || '',
                                 note: `Giao dịch ${VEHICLE_STATUS_LABELS[status as VehicleStatus]}`,
                                 seller: vehicle.seller || userCode,
                                 receiver: vehicle.seller || userCode,
                                 commission: vehicle.commission || STAFF_CONSTANTS.DEFAULT_SALE_COMMISSION,
                                 buying_bonus: vehicle.buying_bonus || 0
                              });
                           } else if (status === VehicleStatus.IN_STOCK && saleStatuses.includes(vehicle.status as VehicleStatus)) {
                              handleCancelSale(vehicle.id, userCode);
                              setIsUpdatingStatus(false);
                           } else if (status === VehicleStatus.IN_STOCK && (vehicle.status === VehicleStatus.SPA || vehicle.status === VehicleStatus.DEPOSIT_BUY)) {
                              setTransitionStatus(VehicleStatus.IN_STOCK);
                              setPaymentForm({
                                 ...paymentForm,
                                 salePrice: vehicle.sale_price || 0,
                                 note: vehicle.status === VehicleStatus.SPA ? 'Hoàn thành Spa - Nhập kho chờ bán' : 'Hoàn tất mua - Nhập kho chờ bán',
                                 seller: userCode,
                                 receiver: userCode
                               });
                           } else {
                              handleUpdateStatus(vehicle.id, status as VehicleStatus);
                              setIsUpdatingStatus(false);
                           }
                        }}
                        className="w-full flex items-center justify-between p-4 md:p-5 px-6 md:px-8 rounded-full bg-white border border-[#e5e7eb] hover:border-kraft-accent hover:bg-kraft-accent/5 transition-all group disabled:opacity-50"
                     >
                        <span className="text-xs font-black uppercase tracking-widest">{VEHICLE_STATUS_LABELS[status as VehicleStatus] || status}</span>
                        <div className="w-8 h-8 rounded-full bg-kraft-accent/10 flex items-center justify-center text-kraft-accent group-hover:bg-kraft-accent group-hover:text-white transition-all">
                           {isSubmitting && status === transitionStatus ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
                        </div>
                     </button>
                  ))}
               </div>
            ) : (
                <div className="space-y-5">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <SmartAmountInput
                        label={transitionStatus === VehicleStatus.IN_STOCK ? 'Giá bán niêm yết' : 'Giá bán chốt'}
                        value={paymentForm.salePrice || 0}
                        onChange={v => setPaymentForm({ ...paymentForm, salePrice: v ?? 0 })}
                     />

                     {transitionStatus !== VehicleStatus.IN_STOCK && (
                        <SmartAmountInput
                           label={transitionStatus === VehicleStatus.SOLD ? 'Tiền thanh toán' : 'Số tiền đặt cọc'}
                           value={paymentForm.amount}
                           onChange={v => setPaymentForm({ ...paymentForm, amount: v ?? 0 })}
                        />
                     )}
                  </div>

                  {transitionStatus !== VehicleStatus.IN_STOCK && (
                     <>
                        <BaseInput 
                           label="Tên khách hàng"
                           placeholder="Tên khách hàng..."
                           value={paymentForm.buyerName}
                           onChange={e => setPaymentForm({ ...paymentForm, buyerName: e.target.value })}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <SmartAmountInput
                              label="Hoa hồng bán xe"
                              value={paymentForm.commission}
                              onChange={v => setPaymentForm({ ...paymentForm, commission: v ?? 0 })}
                           />
                           <SmartAmountInput
                              label="Thưởng NV nhập"
                              value={paymentForm.buying_bonus}
                              onChange={v => setPaymentForm({ ...paymentForm, buying_bonus: v ?? 0 })}
                           />
                        </div>

                        <BaseSelect 
                           label="Nhân viên bán xe"
                           value={paymentForm.seller}
                           onChange={e => setPaymentForm({ ...paymentForm, seller: e.target.value, receiver: e.target.value })}
                        >
                           {staffList.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                        </BaseSelect>
                     </>
                  )}

                  <BaseInput 
                     label="Ghi chú giao dịch"
                     placeholder="VD: Khách hẹn thanh toán nốt vào tuần sau..."
                     value={paymentForm.note}
                     onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  />
               </div>
            )}
               </div>

               {/* Premium Footer */}
               {transitionStatus && (
                  <div className="p-6 md:p-8 border-t border-black/5 bg-white/50 backdrop-blur-md">
                     <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className={cn(
                           "w-full h-16 rounded-full font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-kraft-accent/10",
                           isSubmitting ? "bg-kraft-accent/50 text-white cursor-not-allowed" : "bg-kraft-accent text-white hover:brightness-110"
                        )}
                     >
                        {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <ChevronRight size={20} />}
                        <span>Chuyển trạng thái</span>
                     </button>
                  </div>
               )}
            </div>
         </div>
      </Modal>
   );
};
