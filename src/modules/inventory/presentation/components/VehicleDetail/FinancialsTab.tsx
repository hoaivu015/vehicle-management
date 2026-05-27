import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CircleDollarSign, Check, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, UserRole } from '@/src/shared/domain/constants';
import { formatCurrency } from '@/src/shared/utils/currency';
import { cn } from '@/src/shared/utils/cn';
import { formatDate, ActivityItem, EmptyState } from './VehicleDetailModalShared';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';
import { DESIGN_TOKENS } from '@/src/shared/design-system/tokens';
import { 
   FinancialMatrix, 
   MatrixSummary, MatrixLedger, MatrixRow, PillButton, ExecutiveSection
} from '@/src/shared/design-system/ExecutiveModules';
import { AddCostOverlay } from './AddCostOverlay';

import { useVehicleFinancials } from './useVehicleFinancials';

interface FinancialsTabProps {
   vehicle: Vehicle;
   canSeeFinancials: boolean;
   isAdminOrAccountant: boolean;
   userCode: string;
   staffList: Staff[];
   actions: {
      onAddCost: (id: number, name: string, amount: number) => Promise<void>;
      onDeleteCost: (id: number, index: number) => Promise<void>;
      onAddPurchasePayment: (id: number, amount: number, note: string, receiver: string) => Promise<void>;
      onAddSalePayment: (
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
      onCancelSale: (id: number, userCode: string) => Promise<void>;
   };
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({
   vehicle,
   canSeeFinancials,
   isAdminOrAccountant,
   userCode,
   staffList,
   actions
}) => {
   if (!canSeeFinancials) return <EmptyState icon={AlertCircle} title="Bạn không có quyền xem thông tin tài chính" />;

   const {
      financials,
      activeLedger,
      setActiveLedger,
      purchaseDebt,
      saleDebt,
      isAddingCost,
      setIsAddingCost,
      isSubmitting,
      paymentForm,
      setPaymentForm,
      purchasePaymentForm,
      setPurchasePaymentForm,
      nextStatusInTab,
      setNextStatusInTab,
      showCancelSaleConfirm,
      setShowCancelSaleConfirm,
      handleAddCost,
      handleDeleteCost,
      handleAddPurchasePayment,
      handleAddSalePayment,
      handleCancelSale
   } = useVehicleFinancials({
      vehicle,
      userCode,
      ...actions
   });

   if (!financials) return null;

   const formatFinance = (val: number) => formatCurrency(val);

   return (
      <motion.div
         key="financials"
         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
         className="space-y-12 pb-32"
      >
         {/* SECTION 1: PROFIT & CASHFLOW MATRIX */}
         <section className="space-y-2">
            <FinancialMatrix>
               <MatrixSummary className="shadow-kraft-deep">
                  <div className="grid grid-cols-2 gap-x-g2 lg:gap-x-g4 gap-y-3">
                     <MatrixRow label="Doanh thu bán xe" value={<span className="text-base lg:text-sm">{formatCurrency(financials.salePrice)}</span>} type="income" className="border-b-0" />
                     <MatrixRow label="Vốn nhập xe" value={<span className="text-base lg:text-sm">{`-${formatCurrency(financials.purchasePrice)}`}</span>} type="expense" className="border-b-0" />
                     <MatrixRow label="Chi phí Spa/Dọn" value={<span className="text-base lg:text-sm">{`-${formatCurrency(financials.totalCost)}`}</span>} type="expense" className="col-span-2 border-b-0" />
                     
                     <div className={cn("col-span-2 pt-5 mt-3 border-t border-hairline-soft flex justify-between items-center", DESIGN_TOKENS.layout.item_px)}>
                        <span className="text-[10px] font-black uppercase tracking-widest text-warning opacity-80">Lợi nhuận gộp</span>
                        <span className="text-2xl lg:text-xl font-black text-warning tracking-tighter">{formatCurrency(financials.grossProfit)}</span>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-hairline-soft mt-8">
                     <p className={cn("text-[10px] font-black uppercase tracking-widest text-sub-label opacity-40 mb-4", DESIGN_TOKENS.layout.item_px)}>Nhân sự & Hoa hồng</p>
                     <div className="grid grid-cols-2 gap-x-g2 lg:gap-x-g4 gap-y-3">
                        <MatrixRow label="Lương mua" value={<span className="text-base lg:text-sm">{`-${formatCurrency(financials.buyingCommission)}`}</span>} type="expense" className="border-b-0" />
                        <MatrixRow label="Lương bán" value={<span className="text-base lg:text-sm">{`-${formatCurrency(financials.sellingCommission)}`}</span>} type="expense" className="border-b-0" />
                        {financials.buyingBonus > 0 && (
                           <MatrixRow label="Thưởng mua" value={<span className="text-base lg:text-sm">{`-${formatCurrency(financials.buyingBonus)}`}</span>} type="expense" className="col-span-2 border-b-0" />
                        )}
                     </div>
                  </div>

                  {financials.isCoinvested && (
                     <div className="pt-8 border-t border-hairline-soft mt-8 space-y-4">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest text-sub-label opacity-40 mb-4", DESIGN_TOKENS.layout.item_px)}>Cơ cấu góp vốn</p>
                        <div className="grid grid-cols-2 gap-x-g4">
                           <MatrixRow label="Phần Showroom" value={formatCurrency(financials.showroomProfitShare)} type="income" className="bg-income/5 rounded-xl border-none" />
                           <MatrixRow label="Phần Đối tác" value={formatCurrency(financials.partnerProfitShare)} type="neutral" className="bg-surface-soft rounded-xl border-none" />
                        </div>
                     </div>
                  )}
               </MatrixSummary>

               <MatrixLedger className="shadow-kraft-deep">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-kraft-accent">
                     <CircleDollarSign size={120} />
                  </div>

                  <div className="flex items-center justify-between mb-10 relative z-10">
                     <div className="flex gap-1 bg-surface-soft p-1 rounded-full border border-hairline-soft">
                        <motion.button 
                           whileTap={{ scale: 0.95 }}
                           onClick={() => setActiveLedger('purchase')}
                           className={cn(
                              "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                              activeLedger === 'purchase' ? "bg-white text-kraft-ink shadow-sm" : "text-sub-label opacity-40 hover:opacity-100"
                           )}
                        >
                           Lịch sử Chi
                        </motion.button>
                        <motion.button 
                           whileTap={{ scale: 0.95 }}
                           onClick={() => setActiveLedger('sale')}
                           className={cn(
                              "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                              activeLedger === 'sale' ? "bg-white text-kraft-ink shadow-sm" : "text-sub-label opacity-40 hover:opacity-100"
                           )}
                        >
                           Lịch sử Thu
                        </motion.button>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-sub-label opacity-40 mb-1">
                           {activeLedger === 'purchase' ? 'Tiền xe nợ' : 'Khách nợ'}
                        </p>
                        <p className={cn(
                           "text-2xl lg:text-xl font-black tracking-tighter",
                           (activeLedger === 'purchase' ? purchaseDebt : saleDebt) > 0 ? "text-expense" : "text-income"
                        )}>
                           {formatFinance(activeLedger === 'purchase' ? purchaseDebt : saleDebt)}
                        </p>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 min-h-[300px]">
                     <AnimatePresence mode="wait">
                        <motion.div
                           key={activeLedger}
                           initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                           animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                           exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
                           transition={{ duration: 0.25 }}
                           className="space-y-4"
                        >
                           {activeLedger === 'purchase' ? (
                              (vehicle.purchase_payment_history || []).length > 0 ? (
                                 (vehicle.purchase_payment_history || []).map((p, idx) => (
                                    <motion.div
                                       key={idx}
                                       initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
                                       animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                       transition={{ type: 'spring', stiffness: 120, damping: 18, delay: idx * 0.04 }}
                                    >
                                       <ActivityItem 
                                          date={formatDate(p.date)}
                                          title={p.note || "Thanh toán tiền mua xe"}
                                          category="Chi tiền mặt"
                                          amount={formatCurrency(p.amount)}
                                          amountType="expense"
                                       />
                                    </motion.div>
                                 ))
                              ) : <EmptyState title="Chưa có dữ liệu chi tiền" icon={AlertCircle} className="py-12" />
                           ) : (
                              (vehicle.sale_payment_history || []).length > 0 ? (
                                 (vehicle.sale_payment_history || []).map((p, idx) => (
                                    <motion.div
                                       key={idx}
                                       initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
                                       animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                       transition={{ type: 'spring', stiffness: 120, damping: 18, delay: idx * 0.04 }}
                                    >
                                       <ActivityItem 
                                          date={formatDate(p.date)}
                                          title={p.note || "Thu tiền bán xe"}
                                          category={p.receiver || "Kế toán"}
                                          amount={formatCurrency(p.amount)}
                                          amountType={p.amount < 0 ? "expense" : "income"}
                                       />
                                    </motion.div>
                                 ))
                              ) : <EmptyState title="Chưa có dữ liệu thu tiền" icon={AlertCircle} className="py-12" />
                           )}
                        </motion.div>
                     </AnimatePresence>
                  </div>
               </MatrixLedger>
            </FinancialMatrix>
         </section>

          {/* SECTION 2: OPERATIONAL MANAGEMENT */}
          <div className="space-y-0 pt-12 border-t border-hairline-soft">
             <ExecutiveSection 
                title="Quản lý chi phí Spa/Dọn" 
                accent="bg-kraft-accent"
                action={
                  isAdminOrAccountant ? (
                    <PillButton 
                      onClick={() => setIsAddingCost(true)} 
                      variant="primary"
                      className="!h-11 !px-6 shadow-kraft-deep"
                      icon={Plus}
                    >
                      Ghi chi phí
                    </PillButton>
                  ) : undefined
                }
             >
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mt-4">
                   {(vehicle.cost_history || []).map((c, idx) => (
                      <motion.div
                         key={idx}
                         initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
                         animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                         transition={{ type: 'spring', stiffness: 120, damping: 18, delay: idx * 0.04 }}
                      >
                         <ActivityItem 
                            date={c.date ? formatDate(c.date) : 'Chi phí'}
                            title={c.note}
                            amount={formatCurrency(c.amount)}
                            amountType="expense"
                            onDelete={isAdminOrAccountant ? () => handleDeleteCost(vehicle.id, idx) : undefined}
                         />
                      </motion.div>
                   ))}
                   {(vehicle.cost_history || []).length === 0 && (
                      <div className="py-12 text-center text-[10px] font-black uppercase tracking-widest text-sub-label opacity-20 italic">Chưa có chi phí phát sinh</div>
                   )}
                </div>
             </ExecutiveSection>

             <AddCostOverlay 
                isOpen={isAddingCost}
                onClose={() => setIsAddingCost(false)}
                isSubmitting={isSubmitting}
                onAdd={async (name, amount) => {
                   await handleAddCost(vehicle.id, name, amount);
                }}
             />

            {isAdminOrAccountant && (
            <ExecutiveSection title="Nghiệp vụ Thu / Chi tiền" accent="bg-income" divider>
               <div className={cn("space-y-10 mt-6", DESIGN_TOKENS.layout.item_px)}>
                  {(vehicle.status === VehicleStatus.DEPOSIT_BUY || purchaseDebt > 0) && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 p-g4 glass-surface-soft rounded-t2 border border-hairline-soft shadow-kraft-deep"
                     >
                        <div className="flex items-center gap-3 text-warning">
                           <ArrowDownCircle size={20} strokeWidth={2.5} />
                           <p className="text-[10px] font-black uppercase tracking-widest">Phiếu chi (Trả tiền chủ cũ)</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-g4">
                           <SmartAmountInput label="Số tiền chi" value={purchasePaymentForm.amount} onChange={v => setPurchasePaymentForm({ ...purchasePaymentForm, amount: v })} />
                           <BaseInput label="Ghi chú" placeholder="Ghi chú chi tiền..." value={purchasePaymentForm.note} onChange={e => setPurchasePaymentForm({ ...purchasePaymentForm, note: e.target.value })} />
                        </div>
                        <PillButton 
                           onClick={() => handleAddPurchasePayment(vehicle.id, purchasePaymentForm.amount, purchasePaymentForm.note, vehicle.buyer || '')}
                           isLoading={isSubmitting} 
                           variant="primary"
                           className="w-full h-14 shadow-kraft-deep"
                           icon={Check}
                        >
                           Xác nhận Chi tiền
                        </PillButton>
                     </motion.div>
                  )}

                  {VehicleStateMachine.isSalePhase(vehicle.status) && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 p-g4 glass-surface-soft rounded-t2 border border-hairline-soft shadow-kraft-deep"
                     >
                        <div className="flex items-center gap-3 text-income">
                           <ArrowUpCircle size={20} strokeWidth={2.5} />
                           <p className="text-[10px] font-black uppercase tracking-widest">Phiếu thu (Nhận tiền khách hàng)</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-g4">
                           <SmartAmountInput label="Số tiền nhận" value={paymentForm.amount} onChange={v => setPaymentForm({ ...paymentForm, amount: v })} />
                           
                           <BaseSelect 
                              label="Nhân viên bán xe"
                              value={paymentForm.seller || ''}
                              onChange={e => setPaymentForm({ ...paymentForm, seller: e.target.value, receiver: e.target.value })}
                           >
                              <option value="">Nhân viên...</option>
                              {staffList.filter(s => s.role !== String(UserRole.ADMIN)).map(s => (
                                 <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
                              ))}
                           </BaseSelect>

                           <BaseSelect 
                              label="Trạng thái tiếp theo"
                              value={nextStatusInTab || ''}
                              onChange={e => setNextStatusInTab(e.target.value as VehicleStatus)}
                           >
                              <option value="">Trạng thái...</option>
                              {VehicleStateMachine.getValidNextStatuses(vehicle.status)
                                 .filter(s => s !== VehicleStatus.IN_STOCK)
                                 .map(s => <option key={s} value={s}>{VEHICLE_STATUS_LABELS[s] || s}</option>)
                              }
                           </BaseSelect>

                           <BaseInput 
                              label="Ghi chú giao dịch" 
                              placeholder="Ghi chú thu tiền..." 
                              value={paymentForm.note} 
                              onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })} 
                           />
                        </div>

                         {(vehicle.status === VehicleStatus.IN_STOCK || nextStatusInTab === VehicleStatus.SOLD) && (
                            <div className="space-y-8 p-g4 bg-surface-soft rounded-xl border border-dashed border-hairline-soft">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-g4">
                                  <BaseInput label="Tên khách hàng" value={paymentForm.buyerName} onChange={e => setPaymentForm({ ...paymentForm, buyerName: e.target.value })} />
                                  <SmartAmountInput label="Giá chốt bán" value={paymentForm.salePrice || 0} onChange={v => setPaymentForm({ ...paymentForm, salePrice: v })} />
                               </div>
                               {isAdminOrAccountant && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-g4 pt-6 border-t border-hairline-soft">
                                     <SmartAmountInput label="Hoa hồng bán xe" value={paymentForm.commission} onChange={v => setPaymentForm({ ...paymentForm, commission: v })} />
                                     <SmartAmountInput label="Thưởng NV thu mua" value={paymentForm.buying_bonus} onChange={v => setPaymentForm({ ...paymentForm, buying_bonus: v })} />
                                  </div>
                               )}
                            </div>
                         )}

                        <PillButton 
                           onClick={() => handleAddSalePayment(vehicle.id, paymentForm.amount, paymentForm.note, paymentForm.receiver || userCode, nextStatusInTab || vehicle.status, paymentForm.seller || userCode, paymentForm.buyerName, paymentForm.salePrice, paymentForm.commission, paymentForm.buying_bonus)}
                           isLoading={isSubmitting}
                           disabled={!nextStatusInTab} 
                           variant="success"
                           className="w-full h-16 shadow-income/20"
                           icon={Check}
                        >
                           {nextStatusInTab === vehicle.status ? 'Xác nhận Thu tiền' : `Sang ${VEHICLE_STATUS_LABELS[nextStatusInTab as VehicleStatus] || '...'}`}
                        </PillButton>

                        {vehicle.status !== VehicleStatus.IN_STOCK && (
                           <div className="pt-6 border-t border-hairline-soft">
                              <AnimatePresence mode="wait">
                                 {!showCancelSaleConfirm ? (
                                    <motion.button 
                                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                       onClick={() => setShowCancelSaleConfirm(true)} 
                                       className="w-full h-12 text-expense text-[10px] font-black uppercase tracking-widest hover:bg-expense/5 rounded-full transition-all"
                                    >
                                       Hủy giao dịch (Quay về kho)
                                    </motion.button>
                                 ) : (
                                    <motion.div 
                                       initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                       className="flex gap-2"
                                    >
                                       <button onClick={() => setShowCancelSaleConfirm(false)} className="flex-1 h-12 bg-white border border-hairline-soft rounded-full text-[10px] font-black uppercase tracking-widest">Quay lại</button>
                                       <button onClick={() => handleCancelSale(vehicle.id, userCode)} className="flex-1 h-12 bg-expense text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-kraft-deep">Xác nhận Hủy</button>
                                    </motion.div>
                                 )}
                              </AnimatePresence>
                           </div>
                        )}
                     </motion.div>
                  )}
               </div>
            </ExecutiveSection>
            )}
          </div>

         <div className="pt-12 border-t border-hairline-soft flex justify-end items-center text-[10px] font-black text-sub-label opacity-20 uppercase tracking-widest">
            {isAdminOrAccountant && <span>Quyền Quản trị viên</span>}
         </div>
      </motion.div>
   );
};
