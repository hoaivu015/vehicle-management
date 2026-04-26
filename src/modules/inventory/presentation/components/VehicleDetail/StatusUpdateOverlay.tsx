import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Clock, RefreshCw } from 'lucide-react';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, STAFF_CONSTANTS } from '@/src/shared/domain/constants';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';

interface StatusUpdateOverlayProps {
   vehicle: Vehicle;
   staffList: any[];
   userCode: string;
   isSubmitting: boolean;
   transitionStatus: VehicleStatus | null;
   setTransitionStatus: (status: VehicleStatus | null) => void;
   paymentForm: any;
   setPaymentForm: React.Dispatch<React.SetStateAction<any>>;
   handleUpdateStatus: (id: number, status: VehicleStatus, extra?: any) => Promise<void>;
   handleCancelSale: (id: number, userCode: string) => Promise<void>;
   handleAddSalePayment: (id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number) => Promise<void>;
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
   return (
      <motion.div
         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
         className="absolute inset-0 bg-white/60 backdrop-blur-3xl z-[150] flex items-center justify-center p-6"
      >
         <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl border border-black/5 overflow-hidden"
         >
            <div className="p-8 border-b border-black/5 flex justify-between items-center bg-black/5">
               <h3 className="text-sm font-black uppercase tracking-widest">
                  {transitionStatus ? `Thông tin ${VEHICLE_STATUS_LABELS[transitionStatus]}` : 'Kế hoạch tiếp theo'}
               </h3>
               <button
                  onClick={() => {
                     setIsUpdatingStatus(false);
                     setTransitionStatus(null);
                  }}
                  className="p-2 hover:bg-black/5 rounded-xl"
               >
                  <X size={20} />
               </button>
            </div>

            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
               {!transitionStatus ? (
                  VehicleStateMachine.getValidNextStatuses(vehicle.status as VehicleStatus).map(status => (
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
                                 buyerName: vehicle.buyer_name || '',
                                 note: `Giao dịch ${VEHICLE_STATUS_LABELS[status as VehicleStatus]}`,
                                 seller: vehicle.seller || userCode,
                                 receiver: vehicle.seller || userCode,
                                 commission: vehicle.commission || STAFF_CONSTANTS.DEFAULT_SALE_COMMISSION
                              });
                           } else if (status === VehicleStatus.IN_STOCK && saleStatuses.includes(vehicle.status as VehicleStatus)) {
                              handleCancelSale(vehicle.id, userCode);
                              setIsUpdatingStatus(false);
                           } else if (status === VehicleStatus.IN_STOCK && vehicle.status === VehicleStatus.SPA) {
                              setTransitionStatus(VehicleStatus.IN_STOCK);
                              setPaymentForm({
                                 ...paymentForm,
                                 salePrice: vehicle.sale_price || 0,
                                 note: 'Hoàn thành Spa - Nhập kho chờ bán',
                                 seller: userCode,
                                 receiver: userCode
                              });
                           } else {
                              handleUpdateStatus(vehicle.id, status as VehicleStatus);
                              setIsUpdatingStatus(false);
                           }
                        }}
                        className="w-full flex items-center justify-between p-6 rounded-2xl bg-white border border-black/5 hover:border-kraft-accent hover:bg-kraft-accent/5 transition-all group disabled:opacity-50"
                     >
                        <span className="text-xs font-black uppercase tracking-widest">{VEHICLE_STATUS_LABELS[status as VehicleStatus] || status}</span>
                        <div className="w-8 h-8 rounded-full bg-kraft-accent/10 flex items-center justify-center text-kraft-accent group-hover:bg-kraft-accent group-hover:text-white transition-all">
                           {isSubmitting && status === transitionStatus ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
                        </div>
                     </button>
                  ))
               ) : (
                  <div className="space-y-6">
                     <div className="space-y-4">
                        <label className="text-sub-label ml-2">
                           {transitionStatus === VehicleStatus.IN_STOCK ? 'Giá bán niêm yết' : 'Giá bán chốt'}
                        </label>
                        <SmartAmountInput
                           value={paymentForm.salePrice}
                           onChange={v => setPaymentForm({ ...paymentForm, salePrice: v })}
                        />
                     </div>

                     {transitionStatus !== VehicleStatus.IN_STOCK && (
                        <>
                           <div className="space-y-4">
                              <label className="text-sub-label ml-2">
                                 {transitionStatus === VehicleStatus.SOLD ? 'Tổng tiền thanh toán' : 'Số tiền đặt cọc'}
                              </label>
                              <SmartAmountInput
                                 value={paymentForm.amount}
                                 onChange={v => setPaymentForm({ ...paymentForm, amount: v })}
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-sub-label ml-2">Tên khách hàng</label>
                              <input
                                 className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent"
                                 value={paymentForm.buyerName}
                                 onChange={e => setPaymentForm({ ...paymentForm, buyerName: e.target.value })}
                                 placeholder="Nhập tên khách..."
                              />
                           </div>

                           <div className="space-y-4">
                              <label className="text-sub-label ml-2">Hoa hồng bán xe</label>
                              <SmartAmountInput
                                 value={paymentForm.commission}
                                 onChange={v => setPaymentForm({ ...paymentForm, commission: v })}
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-sub-label ml-2">Nhân viên bán xe</label>
                              <select
                                 className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent"
                                 value={paymentForm.seller}
                                 onChange={e => setPaymentForm({ ...paymentForm, seller: e.target.value, receiver: e.target.value })}
                              >
                                 {staffList.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                              </select>
                           </div>
                        </>
                     )}

                     <div className="space-y-2">
                        <label className="text-sub-label ml-2">Ghi chú</label>
                        <input
                           className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent"
                           value={paymentForm.note}
                           onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                           placeholder="Nhập ghi chú..."
                        />
                     </div>

                     <div className="pt-4 flex gap-3">
                        <button
                           onClick={() => setTransitionStatus(null)}
                           disabled={isSubmitting}
                           className="flex-1 h-14 border border-black/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/5 transition-all disabled:opacity-50"
                        >
                           Quay lại
                        </button>
                        <button
                           onClick={async () => {
                              if (transitionStatus === VehicleStatus.IN_STOCK) {
                                 if (paymentForm.salePrice <= 0) return;
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
                                    paymentForm.commission
                                 );
                              }
                              setIsUpdatingStatus(false);
                              setTransitionStatus(null);
                           }}
                           disabled={isSubmitting || (transitionStatus === VehicleStatus.IN_STOCK && paymentForm.salePrice <= 0)}
                           className="flex-[2] h-14 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                           {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : null}
                           Xác nhận {VEHICLE_STATUS_LABELS[transitionStatus || VehicleStatus.IN_STOCK]}
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </motion.div>
      </motion.div>
   );
};
