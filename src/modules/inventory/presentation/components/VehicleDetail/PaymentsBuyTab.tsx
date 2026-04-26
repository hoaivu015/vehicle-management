import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { formatCurrency } from '@/src/utils/currency';
import { VehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { FinancialBox, formatDate } from './VehicleDetailModalShared';

interface PaymentsBuyTabProps {
   vehicle: Vehicle;
   financials: VehicleFinancials;
   purchaseDebt: number;
   paymentForm: any;
   setPaymentForm: React.Dispatch<React.SetStateAction<any>>;
   handleAddPurchasePayment: (id: number, amount: number, note: string, buyer: string) => Promise<void>;
   isSubmitting: boolean;
}

export const PaymentsBuyTab: React.FC<PaymentsBuyTabProps> = ({
   vehicle,
   financials,
   purchaseDebt,
   paymentForm,
   setPaymentForm,
   handleAddPurchasePayment,
   isSubmitting
}) => {
   return (
      <motion.div
         key="pay_buy"
         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
         className="space-y-10"
      >
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinancialBox label="Giá nhập thỏa thuận" value={vehicle.purchase_price} color="ink" />
            <FinancialBox label="Còn nợ nguồn nhập" value={purchaseDebt} color={purchaseDebt > 0 ? "amber" : "emerald"} />
         </div>

         {vehicle.status === VehicleStatus.DEPOSIT_BUY && (
            <section className="space-y-6">
               <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] text-kraft-accent/60 px-2">Ghi nhận thanh toán đợt mới</h4>
               <div className="p-8 bg-white/40 rounded-[2.5rem] border border-white/60 space-y-6">
                  <div className="grid grid-cols-1">
                     <SmartAmountInput label="Số tiền thanh toán" value={paymentForm.amount} onChange={v => setPaymentForm({ ...paymentForm, amount: v })} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Ghi chú thanh toán</label>
                     <input
                        placeholder="Ghi chú (VD: Chuyển khoản cọc lần 1...)"
                        className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none"
                        value={paymentForm.note} onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                     />
                  </div>
                  <button
                     onClick={async () => {
                        if (paymentForm.amount <= 0) return;
                        await handleAddPurchasePayment(vehicle.id, paymentForm.amount, paymentForm.note, vehicle.buyer || '');
                        setPaymentForm({ ...paymentForm, amount: 0, note: '' });
                     }}
                     disabled={isSubmitting}
                     className="w-full h-14 bg-kraft-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-kraft-accent/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                     {isSubmitting && <RefreshCw className="animate-spin" size={18} />}
                     Xác nhận thanh toán
                  </button>
               </div>
            </section>
         )}

         <section className="space-y-6">
            <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] text-kraft-accent/60 px-2">Lịch sử thanh toán mua xe</h4>
            <div className="bg-white/40 rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 overflow-hidden">
               <div className="hidden sm:block">
                  <table className="w-full text-left">
                     <thead className="bg-black/5">
                        <tr>
                           <th className="px-8 py-5 text-sub-label">Ngày</th>
                           <th className="px-8 py-5 text-sub-label">Nội dung</th>
                           <th className="px-8 py-5 text-sub-label text-right">Số tiền</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-black/5">
                        {(vehicle.purchase_payment_history || []).map((p, idx) => (
                           <tr key={idx}>
                              <td className="px-8 py-5 text-sm opacity-40">{formatDate(p.date)}</td>
                              <td className="px-8 py-5 text-sm">{p.note}</td>
                              <td className="px-8 py-5 text-sm font-black text-right text-red-500">{formatCurrency(p.amount)}</td>
                           </tr>
                        ))}
                        {(!vehicle.purchase_payment_history || vehicle.purchase_payment_history.length === 0) && (
                           <tr><td colSpan={3} className="px-8 py-10 text-center italic opacity-30 text-sm text-kraft-ink">Chưa có dữ liệu thanh toán</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
               <div className="sm:hidden divide-y divide-black/5">
                  {(vehicle.purchase_payment_history || []).map((p, idx) => (
                     <div key={idx} className="p-4 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black opacity-40 uppercase tracking-widest">
                           <span>{formatDate(p.date)}</span>
                        </div>
                        <div className="text-sm font-bold text-kraft-ink">{p.note}</div>
                        <div className="text-sm font-black text-red-500">{formatCurrency(p.amount)}</div>
                     </div>
                  ))}
                  {(!vehicle.purchase_payment_history || vehicle.purchase_payment_history.length === 0) && (
                     <div className="p-8 text-center italic opacity-30 text-xs text-kraft-ink">Chưa có dữ liệu thanh toán</div>
                  )}
               </div>
            </div>
         </section>
      </motion.div>
   );
};
