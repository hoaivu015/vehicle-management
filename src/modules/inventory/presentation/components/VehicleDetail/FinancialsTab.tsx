import React from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, RefreshCw, Award, Clock } from 'lucide-react';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { formatCurrency } from '@/src/utils/currency';
import { VehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { FinancialBox, formatDate } from './VehicleDetailModalShared';

interface FinancialsTabProps {
   vehicle: Vehicle;
   financials: VehicleFinancials;
   costForm: { name: string; amount: number };
   setCostForm: React.Dispatch<React.SetStateAction<{ name: string; amount: number }>>;
   handleAddCost: (vehicle: Vehicle, name: string, amount: number) => Promise<void>;
   handleDeleteCost: (vehicle: Vehicle, index: number) => Promise<void>;
   isSubmitting: boolean;
   canSeeFinancials: boolean;
   isAdminOrAccountant: boolean;
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({
   vehicle,
   financials,
   costForm,
   setCostForm,
   handleAddCost,
   handleDeleteCost,
   isSubmitting,
   canSeeFinancials,
   isAdminOrAccountant
}) => {
   return (
      <motion.div
         key="fin"
         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
         className="space-y-10"
      >
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FinancialBox label="Vốn gốc nhập xe" value={financials.purchasePrice} color="ink" />
            <FinancialBox label="Tổng phí Spa/Dọn" value={financials.totalCost} color="amber" />
            <FinancialBox
               label={vehicle.status === VehicleStatus.SOLD ? "Lợi nhuận ròng" : "Dự tính LN ròng"}
               value={financials.netProfit}
               color="emerald"
               isEstimated={financials.isEstimated}
            />
         </div>

         <section className="space-y-6">
            <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] text-kraft-accent/60 px-2">Chi phí phát sinh (Spa/Dọn)</h4>
            <div className="bg-white/60 rounded-[2.5rem] border border-white/60 shadow-sm relative">
               <div className="p-8 border-b border-black/5 bg-kraft-ink/[0.02] rounded-t-[2.5rem] grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  <div className="md:col-span-6 space-y-2.5">
                     <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Nội dung chi phí</label>
                     <input
                        type="text" value={costForm.name}
                        onChange={e => setCostForm({ ...costForm, name: e.target.value })}
                        className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent transition-all"
                        placeholder="Vd: Thay lốp mới, Spa, Dọn nội thất..."
                     />
                  </div>
                  <div className="md:col-span-4">
                     <SmartAmountInput label="Số tiền chi" value={costForm.amount} onChange={v => setCostForm({ ...costForm, amount: v })} />
                  </div>
                  <div className="md:col-span-2">
                     <button
                        onClick={() => {
                           if (!costForm.name || !costForm.amount) return;
                           handleAddCost(vehicle, costForm.name, costForm.amount);
                           setCostForm({ name: '', amount: 0 });
                        }}
                        disabled={isSubmitting}
                        className="w-full h-14 bg-kraft-accent text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-kraft-accent/80 transition-all disabled:opacity-50 shadow-lg shadow-kraft-accent/20"
                     >
                        {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Plus size={14} />}
                        Thêm
                     </button>
                  </div>
               </div>

               <div className="hidden sm:block overflow-x-auto rounded-b-[2.5rem]">
                  <table className="w-full text-left min-w-[600px]">
                     <thead className="bg-black/[0.02] border-b border-black/5">
                        <tr>
                           <th className="px-8 py-5 text-sub-label w-1/4">Ngày ghi nhận</th>
                           <th className="px-8 py-5 text-sub-label">Nội dung</th>
                           <th className="px-8 py-5 text-sub-label text-right min-w-[150px]">Số tiền</th>
                           <th className="px-8 py-5 w-20"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-black/5">
                        {(vehicle.cost_history || []).map((cost, idx) => (
                           <tr key={idx} className="group hover:bg-white/60 transition-colors">
                              <td className="px-8 py-5 text-sm font-bold opacity-40">{formatDate(cost.date)}</td>
                              <td className="px-8 py-5 text-sm font-black text-kraft-ink">{cost.note}</td>
                              <td className="px-8 py-5 text-sm font-black text-right text-red-500">{formatCurrency(cost.amount)}</td>
                              <td className="px-8 py-5 text-right">
                                 <button
                                    onClick={() => handleDeleteCost(vehicle, idx)}
                                    disabled={isSubmitting}
                                    className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-xl disabled:opacity-50"
                                 >
                                    {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                 </button>
                              </td>
                           </tr>
                        ))}
                        {(vehicle.cost_history || []).length === 0 && (
                           <tr>
                              <td colSpan={4} className="px-8 py-16 text-center italic opacity-20 text-sm">Chưa có dữ liệu chi phí spa/dọn</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>

               <div className="sm:hidden space-y-3 pb-8">
                  {(vehicle.cost_history || []).map((cost, idx) => (
                     <div key={idx} className="p-4 bg-white/40 rounded-2xl border border-white/60 flex justify-between items-start gap-4 shadow-sm">
                        <div className="space-y-1 flex-1">
                           <div className="flex justify-between">
                              <span className="text-[10px] font-bold opacity-40">{formatDate(cost.date)}</span>
                              <button
                                 onClick={() => handleDeleteCost(vehicle, idx)}
                                 className="text-red-500 p-1"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                           <div className="text-sm font-black text-kraft-ink">{cost.note}</div>
                           <div className="text-sm font-black text-red-500">{formatCurrency(cost.amount)}</div>
                        </div>
                     </div>
                  ))}
                  {(vehicle.cost_history || []).length === 0 && (
                     <div className="p-8 text-center italic opacity-20 text-xs text-kraft-ink">Chưa có dữ liệu chi phí</div>
                  )}
               </div>
            </div>
         </section>

         {canSeeFinancials && (
            <section className="space-y-6">
               <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] text-kraft-accent/60 px-2">Bảng kê lợi nhuận ròng</h4>
               <div className="p-8 bg-white text-kraft-ink rounded-[2.5rem] shadow-2xl border border-black/5 space-y-8 relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-kraft-accent/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                     <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/40">1. Doanh thu & Vốn</p>
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs font-bold">
                              <span className="opacity-60">Giá bán chốt:</span>
                              <span className="text-emerald-600">{formatCurrency(financials.salePrice)}</span>
                           </div>
                           <div className="flex justify-between text-xs font-bold">
                              <span className="opacity-60">Giá nhập gốc:</span>
                              <span className="text-red-500">-{formatCurrency(financials.purchasePrice)}</span>
                           </div>
                           <div className="flex justify-between text-xs font-bold">
                              <span className="opacity-60">Spa/Dọn:</span>
                              <span className="text-red-500">-{formatCurrency(financials.totalCost)}</span>
                           </div>
                           <div className="pt-2 border-t border-black/5 flex justify-between text-sm font-black text-amber-600">
                              <span>Lợi nhuận gộp:</span>
                              <span>{formatCurrency(financials.grossProfit)}</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/40">2. Thưởng & Hoa hồng</p>
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs font-bold">
                              <span className="opacity-60">Hoa hồng mua xe:</span>
                              <span className="text-red-500">-{formatCurrency(financials.buyingCommission)}</span>
                           </div>
                           <div className="flex justify-between text-xs font-bold">
                              <span className="opacity-60">Hoa hồng bán:</span>
                              <span className="text-red-500">-{formatCurrency(financials.sellingCommission)}</span>
                           </div>
                           <div className="pt-2 border-t border-black/5 flex justify-between text-sm font-black text-emerald-600">
                              <span>Lợi nhuận ròng:</span>
                              <span>{formatCurrency(financials.netProfit)}</span>
                           </div>
                        </div>
                     </div>

                     {financials.isCoinvested ? (
                        <div className="space-y-4 lg:col-span-2">
                           <p className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/40">3. Lợi nhuận</p>
                           <div className="bg-kraft-accent/5 rounded-t2 p-6 border border-kraft-accent/10 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Vốn Showroom</p>
                                    <p className="text-sm font-black">{formatCurrency(financials.showroomCapital)}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Vốn Đối tác</p>
                                    <p className="text-sm font-black">{formatCurrency(financials.coinvestAmount)}</p>
                                 </div>
                              </div>
                              <div className="pt-4 border-t border-black/5 flex justify-between items-center gap-6">
                                 <div className="flex-1 flex justify-between">
                                    <div>
                                       <p className="text-[8px] font-black uppercase tracking-widest text-amber-600 mb-1">Showroom:</p>
                                       <p className="text-lg font-black text-emerald-600">{formatCurrency(financials.showroomProfitShare)}</p>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[8px] font-black uppercase tracking-widest text-purple-600 mb-1">Đối tác:</p>
                                       <p className="text-lg font-black text-kraft-ink">{formatCurrency(financials.partnerProfitShare)}</p>
                                    </div>
                                 </div>
                                 <div className="w-12 h-12 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent shrink-0">
                                    <Award size={24} />
                                 </div>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="lg:col-span-2 flex items-center justify-center bg-black/[0.02] rounded-3xl border border-dashed border-black/10 p-8">
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/20 mb-2">Showroom sở hữu 100%</p>
                              <p className="text-xs font-bold text-kraft-ink/40 max-w-[200px]">Không có đối tác góp vốn cho chiếc xe này.</p>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="pt-6 border-t border-black/5 flex justify-between items-center text-[10px]">
                     <div className="flex items-center gap-2 text-kraft-ink/40 italic">
                        <Clock size={12} />
                        <span>Lợi nhuận {financials.isEstimated ? 'dự tính (chưa hoàn tất giao dịch)' : 'thực tế (đã thu đủ tiền)'}</span>
                     </div>
                     {isAdminOrAccountant && (
                        <div className="px-3 py-1 bg-kraft-accent/10 rounded-full font-black uppercase tracking-widest text-kraft-accent/60">
                           Admin View Only
                        </div>
                     )}
                  </div>
               </div>
            </section>
         )}
      </motion.div>
   );
};
