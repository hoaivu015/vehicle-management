import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, UserRole, STAFF_CONSTANTS } from '@/src/shared/domain/constants';
import { formatCurrency } from '@/src/utils/currency';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';
import { cn } from '@/src/utils/cn';
import { FinancialBox, formatDate } from './VehicleDetailModalShared';

interface PaymentsSaleTabProps {
   vehicle: Vehicle;
   saleDebt: number;
   paymentForm: any;
   setPaymentForm: React.Dispatch<React.SetStateAction<any>>;
   nextStatusInTab: VehicleStatus | null;
   setNextStatusInTab: (val: VehicleStatus | null) => void;
   staffList: any[];
   userCode: string;
   userRole: string;
   handleAddSalePayment: (id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number) => Promise<void>;
   handleCancelSale: (id: number, userCode: string) => Promise<void>;
   isSubmitting: boolean;
   showCancelSaleConfirm: boolean;
   setShowCancelSaleConfirm: (val: boolean) => void;
}

export const PaymentsSaleTab: React.FC<PaymentsSaleTabProps> = ({
   vehicle,
   saleDebt,
   paymentForm,
   setPaymentForm,
   nextStatusInTab,
   setNextStatusInTab,
   staffList,
   userCode,
   userRole,
   handleAddSalePayment,
   handleCancelSale,
   isSubmitting,
   showCancelSaleConfirm,
   setShowCancelSaleConfirm
}) => {
   return (
      <motion.div
         key="pay_sale"
         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
         className="space-y-10"
      >
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinancialBox label="Giá bán thỏa thuận" value={vehicle.sale_price || 0} color="emerald" />
            <FinancialBox label="Còn phải thu khách" value={saleDebt} color={saleDebt > 0 ? "amber" : "emerald"} />
         </div>

         {vehicle.status === VehicleStatus.IN_STOCK && (vehicle.sale_payment_history?.length || 0) > 0 && (
            <motion.div
               initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
               className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4"
            >
               <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertCircle size={20} />
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-black text-red-900 uppercase tracking-widest">Giao dịch trước đó đã hủy</p>
                  <p className="text-[10px] text-red-700/60 font-bold">Lịch sử bên dưới ghi nhận các khoản đã thu và hoàn trả. Bạn có thể bắt đầu giao dịch mới tại đây.</p>
               </div>
            </motion.div>
         )}

         {vehicle.status !== VehicleStatus.SOLD && (userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT) && (
            <section className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.2em] text-kraft-accent/60">Ghi nhận dòng tiền bán xe</h4>
               </div>

               <div className="p-8 bg-white/40 rounded-[2.5rem] border border-white/60 space-y-6 shadow-sm">
                  <div className="grid grid-cols-1">
                     <SmartAmountInput label="Số tiền nhận" value={paymentForm.amount} onChange={v => setPaymentForm({ ...paymentForm, amount: v })} />
                  </div>

                  {(vehicle.status === VehicleStatus.IN_STOCK || nextStatusInTab === VehicleStatus.SOLD) && (
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Tên khách hàng</label>
                              <input
                                 className="w-full h-14 bg-white border border-black/5 rounded-t3 px-6 font-bold text-sm outline-none focus:border-kraft-accent transition-all"
                                 value={paymentForm.buyerName} onChange={e => setPaymentForm({ ...paymentForm, buyerName: e.target.value })}
                                 placeholder="Nhập tên khách hàng..."
                              />
                           </div>
                           <SmartAmountInput label="Giá bán chốt" value={paymentForm.salePrice} onChange={v => setPaymentForm({ ...paymentForm, salePrice: v })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <SmartAmountInput label="Hoa hồng bán xe" value={paymentForm.commission} onChange={v => setPaymentForm({ ...paymentForm, commission: v })} />
                        </div>
                     </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Nhân viên bán (Tư vấn)</label>
                        <select
                           className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent transition-all"
                           value={paymentForm.seller || userCode}
                           onChange={e => setPaymentForm({ ...paymentForm, seller: e.target.value, receiver: e.target.value })}
                        >
                           <option value="">Chọn nhân viên bán...</option>
                           {staffList.filter(s => s.role !== UserRole.ADMIN).map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Trạng thái tiếp theo</label>
                        <select
                           className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-black text-sm outline-none focus:border-kraft-accent transition-all uppercase tracking-widest text-[#CB9800]"
                           value={nextStatusInTab || ''}
                           onChange={e => setNextStatusInTab(e.target.value as VehicleStatus)}
                        >
                           {[VehicleStatus.DEPOSIT_SALE, VehicleStatus.BANK_DEPOSIT, VehicleStatus.BANK_CONFIRMED].includes(vehicle.status as VehicleStatus) && (
                              <option value={vehicle.status}>Giữ nguyên {VEHICLE_STATUS_LABELS[vehicle.status as VehicleStatus]}</option>
                           )}
                           {VehicleStateMachine.getValidNextStatuses(vehicle.status as VehicleStatus)
                              .filter(s => s !== VehicleStatus.IN_STOCK && s !== (vehicle.status as any))
                              .map(s => (
                                 <option key={s} value={s}>{VEHICLE_STATUS_LABELS[s as VehicleStatus] || s}</option>
                              ))
                           }
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Ghi chú giao dịch</label>
                     <input
                        placeholder="Ghi chú (VD: Thu thêm cọc đợt 2, Khách thanh toán nốt...)"
                        className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent transition-all"
                        value={paymentForm.note} onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                     />
                  </div>

                  <button
                     onClick={async () => {
                        if (paymentForm.amount <= 0 && nextStatusInTab !== VehicleStatus.SOLD) return;
                        if (!nextStatusInTab) return;
                        await handleAddSalePayment(
                           vehicle.id,
                           paymentForm.amount,
                           paymentForm.note,
                           paymentForm.seller || vehicle.seller || userCode,
                           nextStatusInTab,
                           paymentForm.seller || vehicle.seller || userCode,
                           paymentForm.buyerName,
                           paymentForm.salePrice,
                           paymentForm.commission
                        );
                        setPaymentForm({ ...paymentForm, amount: 0, note: '', commission: STAFF_CONSTANTS.DEFAULT_SALE_COMMISSION });
                     }}
                     disabled={isSubmitting}
                     className="w-full h-16 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                     {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : null}
                     {nextStatusInTab === vehicle.status ?
                        "Ghi nhận bổ sung dòng tiền" :
                        `Xác nhận & Chuyển sang ${VEHICLE_STATUS_LABELS[nextStatusInTab as VehicleStatus] || nextStatusInTab}`
                     }
                  </button>

                  {(vehicle.status !== VehicleStatus.IN_STOCK) && (
                     <div className="pt-4 border-t border-black/10">
                        <AnimatePresence mode="wait">
                           {!showCancelSaleConfirm ? (
                              <motion.button
                                 key="cancel"
                                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                 onClick={() => setShowCancelSaleConfirm(true)}
                                 className="w-full h-12 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                 <Trash2 size={14} /> Hủy giao dịch (Quay về kho)
                              </motion.button>
                           ) : (
                              <motion.div
                                 key="cancel-confirm"
                                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                 className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-3"
                              >
                                 <p className="text-[10px] font-black text-red-700 text-center uppercase tracking-widest">Xác nhận hủy giao dịch và quay về kho?</p>
                                 <div className="flex gap-2">
                                    <button
                                       onClick={() => setShowCancelSaleConfirm(false)}
                                       className="flex-1 h-10 bg-white border border-red-100 text-red-600 rounded-xl text-[9px] font-black uppercase"
                                    >
                                       Quay lại
                                    </button>
                                    <button
                                       onClick={async () => {
                                          await handleCancelSale(vehicle.id, userCode);
                                          setShowCancelSaleConfirm(false);
                                       }}
                                       disabled={isSubmitting}
                                       className="flex-1 h-10 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2"
                                    >
                                       {isSubmitting ? <RefreshCw className="animate-spin" size={12} /> : <Trash2 size={12} />}
                                       Xác nhận hủy
                                    </button>
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  )}
               </div>
            </section>
         )}

         <section className="space-y-6">
            <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.2em] text-kraft-accent/60 px-2">Lịch sử nhận tiền từ khách</h4>
            <div className="bg-white/40 rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 overflow-hidden">
               <div className="hidden sm:block">
                  <table className="w-full text-left">
                     <thead className="bg-black/5">
                        <tr>
                           <th className="px-8 py-5 text-sub-label">Ngày</th>
                           <th className="px-8 py-5 text-sub-label">Người nhận</th>
                           <th className="px-8 py-5 text-sub-label">Nội dung</th>
                           <th className="px-8 py-5 text-sub-label text-right">Số tiền</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-black/5">
                        {(vehicle.sale_payment_history || []).map((p, idx) => (
                           <tr key={idx}>
                              <td className="px-8 py-5 text-sm opacity-40">{formatDate(p.date)}</td>
                              <td className="px-8 py-5 text-sm font-bold">{p.receiver}</td>
                              <td className="px-8 py-5 text-sm">{p.note}</td>
                              <td className={cn(
                                 "px-8 py-5 text-sm font-black text-right",
                                 p.amount < 0 ? "text-red-500" : "text-emerald-600"
                              )}>
                                 {formatCurrency(p.amount)}
                              </td>
                           </tr>
                        ))}
                        {(!vehicle.sale_payment_history || vehicle.sale_payment_history.length === 0) && (
                           <tr><td colSpan={4} className="px-8 py-10 text-center italic opacity-30 text-sm text-kraft-ink">Chưa có dữ liệu nhận tiền</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
               <div className="sm:hidden divide-y divide-black/5">
                  {(vehicle.sale_payment_history || []).map((p, idx) => (
                     <div key={idx} className="p-4 space-y-1">
                        <div className="flex justify-between items-center">
                           <span className="text-sub-label">{formatDate(p.date)}</span>
                           <span className="text-[10px] font-black text-kraft-accent bg-kraft-accent/10 px-2 py-0.5 rounded-md">{p.receiver}</span>
                        </div>
                        <div className="text-sm font-bold text-kraft-ink">{p.note}</div>
                        <div className={cn(
                           "text-sm font-black",
                           p.amount < 0 ? "text-red-500" : "text-emerald-600"
                        )}>
                           {formatCurrency(p.amount)}
                        </div>
                     </div>
                  ))}
                  {(!vehicle.sale_payment_history || vehicle.sale_payment_history.length === 0) && (
                     <div className="p-8 text-center italic opacity-30 text-xs text-kraft-ink">Chưa có dữ liệu nhận tiền</div>
                  )}
               </div>
            </div>
         </section>
      </motion.div>
   );
};
