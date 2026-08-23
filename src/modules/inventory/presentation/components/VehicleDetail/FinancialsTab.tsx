import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
   AlertCircle, Check, Plus, ArrowUpCircle, ArrowDownCircle, 
   TrendingUp, DollarSign, Sparkles, Users, Layers, Receipt
} from 'lucide-react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, UserRole } from '@/src/shared/domain/constants';
import { formatCurrency } from '@/src/shared/utils/currency';
import { cn } from '@/src/shared/utils/cn';
import { formatDate, ActivityItem } from './VehicleDetailModalShared';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';
import { PillButton } from '@/src/shared/design-system/ExecutiveModules';
import { AddCostOverlay } from './AddCostOverlay';
import { useVehicleFinancials } from './useVehicleFinancials';
import { haptics } from '@/src/shared/utils/haptics';

interface FinancialsTabProps {
   vehicle: Vehicle;
   canSeeFinancials: boolean;
   isAdminOrAccountant: boolean;
   userCode: string;
   staffList: Staff[];
   actions: {
      onAddCost: (id: number, name: string, amount: number, staffId?: string) => Promise<void>;
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
      onCancelSale: (id: number, userCode: string, cancelType?: 'REFUND' | 'FORFEIT') => Promise<void>;
      onUpdateVehicle?: (id: number, data: Partial<Vehicle>) => Promise<void>;
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

   if (!canSeeFinancials) {
      return (
         <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center text-sub-label">
               <AlertCircle size={24} />
            </div>
            <p className="text-sm font-bold text-kraft-ink">Bạn không có quyền xem thông tin tài chính</p>
            <p className="text-xs text-sub-label max-w-sm">Chỉ Quản trị viên và Kế toán mới có quyền truy cập báo cáo tài chính của xe.</p>
         </div>
      );
   }

   if (!financials) return null;

   const formatFinance = (val: number) => formatCurrency(val);
   const totalCOGS = financials.purchasePrice + financials.totalCost;
   const profitMargin = financials.salePrice > 0 ? (financials.grossProfit / financials.salePrice) * 100 : 0;
   const hasCommission = financials.buyingCommission > 0 || financials.sellingCommission > 0 || financials.buyingBonus > 0;

   return (
      <motion.div
         key="financials"
         initial={{ opacity: 0, x: 20 }} 
         animate={{ opacity: 1, x: 0 }} 
         exit={{ opacity: 0, x: -20 }}
         className="space-y-5"
      >
         {/* ── SECTION 1: FINANCIAL BENTO MATRIX ── */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 1.1 BENTO SUMMARY (DOANH THU, CHI PHÍ & LỢI NHUẬN) */}
            <div className="lg:col-span-6 bg-white rounded-2xl md:rounded-[22px] p-4 sm:p-5 border border-hairline-soft shadow-2xs space-y-4 flex flex-col justify-between">
               <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-hairline-soft">
                     <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
                           <DollarSign size={15} strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-kraft-ink">
                           Hạch Toán Dự Kiến
                        </span>
                     </div>
                     <span className="text-[10px] font-mono font-bold text-sub-label bg-surface-soft px-2.5 py-0.5 rounded-full border border-hairline-soft">
                        SSoT Auto 28
                     </span>
                  </div>

                  {/* 2 Core Metric Cards: Doanh thu & Tổng giá vốn */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                     {/* Doanh thu */}
                     <div className="p-3 bg-income/5 rounded-xl border border-income/15 flex flex-col justify-between gap-1 shadow-2xs">
                        <span className="text-[9px] font-black uppercase tracking-widest text-income/80 whitespace-nowrap">
                           Doanh thu bán xe
                        </span>
                        <span className="text-base sm:text-lg font-black text-income tracking-tight whitespace-nowrap">
                           {formatCurrency(financials.salePrice)}
                        </span>
                     </div>

                     {/* Tổng Giá Vốn */}
                     <div className="p-3 bg-expense/5 rounded-xl border border-expense/15 flex flex-col justify-between gap-1 shadow-2xs">
                        <span className="text-[9px] font-black uppercase tracking-widest text-expense/80 whitespace-nowrap">
                           Tổng giá vốn
                        </span>
                        <span className="text-base sm:text-lg font-black text-expense tracking-tight whitespace-nowrap">
                           {`-${formatCurrency(totalCOGS)}`}
                        </span>
                     </div>
                  </div>

                  {/* Lợi nhuận gộp Hero Card */}
                  <div className={cn(
                     "p-3.5 sm:p-4 rounded-xl border flex items-center justify-between transition-all shadow-2xs",
                     financials.grossProfit > 0 
                        ? "bg-income/10 border-income/25 text-income"
                        : financials.grossProfit < 0
                        ? "bg-expense/10 border-expense/25 text-expense"
                        : "bg-warning/10 border-warning/25 text-warning"
                  )}>
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-85 block">
                           Lợi nhuận gộp
                        </span>
                        {financials.salePrice > 0 && (
                           <span className={cn(
                              "text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs",
                              financials.grossProfit > 0 ? "bg-income/20 text-income" : "bg-black/10 text-kraft-ink"
                           )}>
                              {profitMargin > 0 ? `+${profitMargin.toFixed(1)}%` : `${profitMargin.toFixed(1)}%`}
                           </span>
                        )}
                     </div>
                     <span className="text-xl sm:text-2xl font-black tracking-tight whitespace-nowrap">
                        {formatCurrency(financials.grossProfit)}
                     </span>
                  </div>
               </div>

               {/* Nhân sự & Hoa hồng Section */}
               <div className="pt-3 border-t border-hairline-soft space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                     <div className="flex items-center gap-1.5 text-sub-label">
                        <div className="w-5 h-5 rounded-md bg-black/[0.04] flex items-center justify-center text-sub-label">
                           <Users size={12} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-kraft-ink">
                           Nhân sự & Hoa hồng
                        </span>
                     </div>
                     {!hasCommission && (
                        <span className="text-[9.5px] font-bold text-sub-label bg-surface-soft px-2.5 py-0.5 rounded-full border border-hairline-soft inline-flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-sub-label/40" />
                           <span>0 đ • Chưa phát sinh</span>
                        </span>
                     )}
                  </div>

                  {hasCommission && (
                     <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-surface-soft rounded-xl border border-hairline-soft flex flex-col justify-between">
                           <span className="text-[9px] font-black uppercase tracking-wider text-sub-label">Lương mua</span>
                           <span className="text-xs sm:text-sm font-black text-expense whitespace-nowrap">
                              {financials.buyingCommission > 0 ? `-${formatCurrency(financials.buyingCommission)}` : '0 đ'}
                           </span>
                        </div>
                        <div className="p-2.5 bg-surface-soft rounded-xl border border-hairline-soft flex flex-col justify-between">
                           <span className="text-[9px] font-black uppercase tracking-wider text-sub-label">Lương bán</span>
                           <span className="text-xs sm:text-sm font-black text-expense whitespace-nowrap">
                              {financials.sellingCommission > 0 ? `-${formatCurrency(financials.sellingCommission)}` : '0 đ'}
                           </span>
                        </div>
                        {financials.buyingBonus > 0 && (
                           <div className="p-2.5 bg-surface-soft rounded-xl border border-hairline-soft col-span-2 flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase tracking-wider text-sub-label">Thưởng nóng mua</span>
                              <span className="text-xs sm:text-sm font-black text-expense whitespace-nowrap">
                                 {`-${formatCurrency(financials.buyingBonus)}`}
                              </span>
                           </div>
                        )}
                     </div>
                  )}
               </div>

               {/* Cơ cấu góp vốn & Quản lý quỹ đầu tư (Nếu có) */}
               {financials.isCoinvested && (() => {
                  const coinvestRatio = (vehicle.purchase_price && vehicle.purchase_price > 0 && financials.coinvestAmount > 0)
                     ? Math.min(100, Math.round((financials.coinvestAmount / vehicle.purchase_price) * 1000) / 10)
                     : 0;

                  return (
                     <div className="pt-3 border-t border-hairline-soft space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sub-label px-0.5">
                           <div className="flex items-center gap-1.5 shrink-0">
                              <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                                 <Layers size={12} strokeWidth={2.5} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-kraft-ink">
                                 Cơ cấu góp vốn
                              </span>
                           </div>
                           <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              <span>#{vehicle.coinvestor_code || 'ĐT'}</span>
                              <span className="text-blue-400">•</span>
                              <span>{coinvestRatio > 0 ? `${coinvestRatio.toFixed(1)}% giá nhập` : 'Góp vốn'}</span>
                           </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                           {/* Vốn gốc đối tác góp */}
                           <div className="p-3 bg-surface-soft/90 rounded-xl border border-hairline-soft flex flex-col justify-between gap-2.5 shadow-2xs overflow-hidden">
                              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                 <span className="text-[9.5px] font-bold text-sub-label uppercase tracking-wider">
                                    Vốn góp ban đầu
                                 </span>
                                 <span className={cn(
                                    "text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center gap-1",
                                    vehicle.partner_capital_repaid
                                       ? "text-income bg-income/10 border-income/20"
                                       : "text-blue-700 bg-blue-50 border-blue-200/80"
                                 )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", vehicle.partner_capital_repaid ? "bg-income" : "bg-blue-600 animate-pulse")} />
                                    <span>{vehicle.partner_capital_repaid ? 'Đã hoàn vốn' : 'Đang giữ'}</span>
                                 </span>
                              </div>
                              <div className="flex flex-wrap items-baseline justify-between gap-2 pt-0.5">
                                 <div className="min-w-0">
                                    <span className="text-sm sm:text-base font-black text-kraft-ink tracking-tight whitespace-nowrap">
                                       {formatCurrency(financials.coinvestAmount)}
                                    </span>
                                    {vehicle.status === VehicleStatus.SOLD && financials.partnerProfitShare < 0 && (
                                       <span className="text-[9.5px] font-bold text-expense block mt-0.5">
                                          Thực nhận: {formatCurrency(financials.refundablePartnerCapital)} (Lỗ {formatCurrency(Math.abs(financials.partnerProfitShare))})
                                       </span>
                                    )}
                                 </div>
                                 {isAdminOrAccountant && actions.onUpdateVehicle && (
                                    vehicle.partner_capital_repaid ? (
                                       <button
                                          type="button"
                                          onClick={async () => {
                                             haptics.medium();
                                             await actions.onUpdateVehicle?.(vehicle.id, { partner_capital_repaid: false });
                                          }}
                                          className="text-[9.5px] font-bold text-sub-label hover:text-expense underline transition-colors whitespace-nowrap cursor-pointer"
                                       >
                                          Hủy hoàn vốn
                                       </button>
                                    ) : (
                                       <button
                                          type="button"
                                          onClick={async () => {
                                             haptics.success();
                                             await actions.onUpdateVehicle?.(vehicle.id, { partner_capital_repaid: true });
                                          }}
                                          className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
                                       >
                                          Hoàn vốn {financials.partnerProfitShare < 0 ? `(${formatCurrency(financials.refundablePartnerCapital)})` : ''}
                                       </button>
                                    )
                                 )}
                              </div>
                           </div>

                           {/* Lợi nhuận được chia */}
                           <div className="p-3 bg-surface-soft/90 rounded-xl border border-hairline-soft flex flex-col justify-between gap-2.5 shadow-2xs overflow-hidden">
                              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                 <span className="text-[9.5px] font-bold text-sub-label uppercase tracking-wider">
                                    Lợi nhuận đối tác
                                 </span>
                                 {vehicle.status === VehicleStatus.SOLD ? (
                                    <span className={cn(
                                       "text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center gap-1",
                                       vehicle.partner_profit_shared
                                          ? "text-income bg-income/10 border-income/20"
                                          : "text-amber-700 bg-amber-50 border-amber-200/80"
                                    )}>
                                       <span className={cn("w-1.5 h-1.5 rounded-full", vehicle.partner_profit_shared ? "bg-income" : "bg-amber-500 animate-pulse")} />
                                       <span>{vehicle.partner_profit_shared ? 'Đã chi lương' : 'Chờ chi'}</span>
                                    </span>
                                 ) : (
                                    <span className="text-[8.5px] font-bold text-sub-label bg-black/[0.04] px-2 py-0.5 rounded-full border border-hairline-soft whitespace-nowrap inline-flex items-center gap-1">
                                       <span className="w-1.5 h-1.5 rounded-full bg-sub-label/40" />
                                       <span>Tạm tính</span>
                                    </span>
                                 )}
                              </div>
                              <div className="flex flex-wrap items-baseline justify-between gap-2 pt-0.5">
                                 <span className={cn(
                                    "text-sm sm:text-base font-black tracking-tight whitespace-nowrap",
                                    financials.partnerProfitShare > 0 ? "text-income" : financials.partnerProfitShare < 0 ? "text-expense" : "text-kraft-ink"
                                 )}>
                                    {financials.partnerProfitShare > 0 ? `+${formatCurrency(financials.partnerProfitShare)}` : formatCurrency(financials.partnerProfitShare)}
                                 </span>
                                 {isAdminOrAccountant && actions.onUpdateVehicle && vehicle.status === VehicleStatus.SOLD && financials.partnerProfitShare > 0 && (
                                    vehicle.partner_profit_shared ? (
                                       <button
                                          type="button"
                                          onClick={async () => {
                                             haptics.medium();
                                             await actions.onUpdateVehicle?.(vehicle.id, { partner_profit_shared: false });
                                          }}
                                          className="text-[9.5px] font-bold text-sub-label hover:text-expense underline transition-colors whitespace-nowrap cursor-pointer"
                                       >
                                          Hủy chi
                                       </button>
                                    ) : (
                                       <button
                                          type="button"
                                          onClick={async () => {
                                             haptics.success();
                                             await actions.onUpdateVehicle?.(vehicle.id, { partner_profit_shared: true });
                                          }}
                                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
                                       >
                                          Chi lãi
                                       </button>
                                    )
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  );
               })()}
            </div>

            {/* 1.2 CỘT PHẢI: SỔ CÁI DÒNG TIỀN & QUẢN LÝ CHI PHÍ SPA (STACKED BENTO) */}
            <div className="lg:col-span-6 space-y-4 flex flex-col">
               {/* 1.2.1 SỔ CÁI THANH TOÁN (LEDGER) */}
               <div className="bg-white rounded-2xl md:rounded-[22px] p-4 sm:p-5 border border-hairline-soft shadow-2xs space-y-3.5">
                  {/* Ledger Header: Switcher Pill & Debt Hero Badge */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-hairline-soft flex-wrap">
                     <div className="flex items-center gap-1 bg-black/[0.06] p-1 rounded-full border border-black/[0.06] shadow-inner">
                        <button
                           onClick={() => {
                              haptics.light();
                              setActiveLedger('purchase');
                           }}
                           className={cn(
                              "relative px-3 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all z-10 cursor-pointer whitespace-nowrap",
                              activeLedger === 'purchase' ? "text-kraft-ink" : "text-sub-label hover:text-kraft-ink"
                           )}
                        >
                           {activeLedger === 'purchase' && (
                              <motion.div
                                 layoutId="activeLedgerPill"
                                 className="absolute inset-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-full z-[-1] border border-white/80"
                                 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              />
                           )}
                           Chi mua
                        </button>

                        <button
                           onClick={() => {
                              haptics.light();
                              setActiveLedger('sale');
                           }}
                           className={cn(
                              "relative px-3 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all z-10 cursor-pointer whitespace-nowrap",
                              activeLedger === 'sale' ? "text-kraft-ink" : "text-sub-label hover:text-kraft-ink"
                           )}
                        >
                           {activeLedger === 'sale' && (
                              <motion.div
                                 layoutId="activeLedgerPill"
                                 className="absolute inset-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-full z-[-1] border border-white/80"
                                 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              />
                           )}
                           Thu bán
                        </button>
                     </div>

                     {/* Debt Hero Pill */}
                     <div className={cn(
                        "px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs whitespace-nowrap",
                        activeLedger === 'purchase'
                           ? purchaseDebt > 0 
                              ? "bg-expense/10 border-expense/20 text-expense" 
                              : "bg-income/10 border-income/20 text-income"
                           : saleDebt > 0 
                              ? "bg-warning/10 border-warning/20 text-warning" 
                              : "bg-income/10 border-income/20 text-income"
                     )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                           {activeLedger === 'purchase'
                              ? (purchaseDebt > 0 ? `Còn nợ: ${formatFinance(purchaseDebt)}` : "Đã trả đủ tiền xe")
                              : (saleDebt > 0 ? `Công nợ còn lại: ${formatFinance(saleDebt)}` : "Đã thu đủ 100%")
                           }
                        </span>
                     </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="overflow-y-auto custom-scrollbar pr-1 max-h-[160px] min-h-[100px]">
                     <AnimatePresence mode="wait">
                        <motion.div
                           key={activeLedger}
                           initial={{ opacity: 0, y: 8 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -8 }}
                           transition={{ duration: 0.15 }}
                           className="space-y-2"
                        >
                           {activeLedger === 'purchase' ? (
                              (vehicle.purchase_payment_history || []).length > 0 ? (
                                 (vehicle.purchase_payment_history || []).map((p, idx) => (
                                    <motion.div
                                       key={idx}
                                       initial={{ opacity: 0, y: 4 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       transition={{ delay: idx * 0.03 }}
                                    >
                                       <ActivityItem 
                                          date={formatDate(p.date)}
                                          title={p.note || "Thanh toán tiền nhập xe"}
                                          category={p.receiver ? `Người nhận: ${p.receiver}` : "Chi tiền mặt"}
                                          amount={formatCurrency(p.amount)}
                                          amountType="expense"
                                       />
                                    </motion.div>
                                 ))
                              ) : (
                                 <div className="py-6 text-center flex flex-col items-center justify-center space-y-1.5">
                                    <div className="w-8 h-8 rounded-full bg-black/[0.03] flex items-center justify-center text-sub-label">
                                       <Receipt size={15} />
                                    </div>
                                    <p className="text-xs font-bold text-kraft-ink">Chưa có lịch sử chi tiền</p>
                                    <p className="text-[10px] text-sub-label">Các đợt thanh toán nhập xe sẽ xuất hiện tại đây.</p>
                                 </div>
                              )
                           ) : (
                              (vehicle.sale_payment_history || []).length > 0 ? (
                                 (vehicle.sale_payment_history || []).map((p, idx) => (
                                    <motion.div
                                       key={idx}
                                       initial={{ opacity: 0, y: 4 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       transition={{ delay: idx * 0.03 }}
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
                              ) : (
                                 <div className="py-6 text-center flex flex-col items-center justify-center space-y-1.5">
                                    <div className="w-8 h-8 rounded-full bg-black/[0.03] flex items-center justify-center text-sub-label">
                                       <Receipt size={15} />
                                    </div>
                                    <p className="text-xs font-bold text-kraft-ink">Chưa có lịch sử thu tiền</p>
                                    <p className="text-[10px] text-sub-label">Các đợt thu tiền bán xe sẽ hiển thị tại đây.</p>
                                 </div>
                              )
                           )}
                        </motion.div>
                     </AnimatePresence>
                  </div>
               </div>

               {/* 1.2.2 QUẢN LÝ CHI PHÍ SPA / DỌN XE */}
               <div className="bg-white rounded-2xl md:rounded-[22px] p-4 sm:p-5 border border-hairline-soft shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-hairline-soft">
                     <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
                           <Sparkles size={15} />
                        </div>
                        <div>
                           <h3 className="text-xs font-black uppercase tracking-wider text-kraft-ink">
                              Chi Phí Spa / Dọn Xe
                           </h3>
                           <p className="text-[10px] text-sub-label font-bold">
                              Tổng chi: <span className="text-expense font-black">{formatCurrency(financials.totalCost)}</span>
                           </p>
                        </div>
                     </div>

                     {isAdminOrAccountant && (
                        <motion.button
                           whileTap={{ scale: 0.95 }}
                           onClick={() => {
                              haptics.light();
                              setIsAddingCost(true);
                           }}
                           className="h-8 px-3 rounded-full bg-kraft-accent text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-kraft-accent/20 hover:bg-kraft-accent/90 transition-all cursor-pointer whitespace-nowrap"
                        >
                           <Plus size={13} strokeWidth={2.5} />
                           <span>Ghi chi phí</span>
                        </motion.button>
                     )}
                  </div>

                  {/* Danh sách chi phí Spa */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                     {(vehicle.cost_history || []).map((c, idx) => (
                        <motion.div
                           key={idx}
                           initial={{ opacity: 0, y: 4 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.03 }}
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
                        <div className="py-6 text-center flex flex-col items-center justify-center space-y-1.5 border border-dashed border-hairline-soft rounded-xl bg-surface-soft/30">
                           <Sparkles size={16} className="text-sub-label opacity-40" />
                           <p className="text-xs font-bold text-sub-label">Chưa phát sinh chi phí làm đẹp cho xe này</p>
                        </div>
                     )}
                  </div>

                  <AddCostOverlay 
                     isOpen={isAddingCost}
                     onClose={() => setIsAddingCost(false)}
                     isSubmitting={isSubmitting}
                     vehicle={vehicle}
                     staffList={staffList}
                     onAdd={async (name, amount, staffId) => {
                        await handleAddCost(vehicle.id, name, amount, staffId);
                     }}
                  />
               </div>
            </div>
         </div>

         {/* ── SECTION 3: NGHIỆP VỤ THU / CHI TIỀN (ADMIN / ACCOUNTANT) ── */}
         {isAdminOrAccountant && (
            <div className="bg-white rounded-2xl md:rounded-[22px] p-4 sm:p-5 border border-hairline-soft shadow-2xs space-y-4">
               <div className="flex items-center gap-2 pb-3 border-b border-hairline-soft">
                  <div className="w-8 h-8 rounded-xl bg-income/10 flex items-center justify-center text-income">
                     <TrendingUp size={16} />
                  </div>
                  <div>
                     <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-kraft-ink">
                        Nghiệp Vụ Thu / Chi Tiền Xe
                     </h3>
                     <p className="text-[10px] text-sub-label font-bold">
                        Tạo phiếu thu/chi và chuyển đổi trạng thái xe
                     </p>
                  </div>
               </div>

               <div className="space-y-4">
                  {/* Phiếu chi (Trả tiền chủ cũ) */}
                  {(vehicle.status === VehicleStatus.DEPOSIT_BUY || purchaseDebt > 0) && (
                     <div className="space-y-3.5 p-4 sm:p-5 bg-surface-soft/60 rounded-xl border border-hairline-soft">
                        <div className="flex items-center gap-2 text-warning">
                           <ArrowDownCircle size={16} strokeWidth={2.5} />
                           <span className="text-[11px] font-black uppercase tracking-wider">
                              Phiếu chi tiền mặt (Thanh toán tiền nhập xe)
                           </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           <SmartAmountInput 
                              label="Số tiền chi" 
                              value={purchasePaymentForm.amount} 
                              onChange={v => setPurchasePaymentForm({ ...purchasePaymentForm, amount: v })} 
                           />
                           <BaseInput 
                              label="Ghi chú chi tiền" 
                              placeholder="Ghi chú chi trả tiền nhập xe..." 
                              value={purchasePaymentForm.note} 
                              onChange={e => setPurchasePaymentForm({ ...purchasePaymentForm, note: e.target.value })} 
                           />
                        </div>

                        <PillButton 
                           onClick={() => handleAddPurchasePayment(vehicle.id, purchasePaymentForm.amount, purchasePaymentForm.note, vehicle.buyer || '')}
                           isLoading={isSubmitting} 
                           variant="primary"
                           className="w-full h-12 shadow-sm text-xs font-black cursor-pointer"
                           icon={Check}
                        >
                           Xác nhận Chi tiền
                        </PillButton>
                     </div>
                  )}

                  {/* Phiếu thu (Nhận tiền khách hàng) */}
                  {VehicleStateMachine.isSalePhase(vehicle.status) && (
                     <div className="space-y-3.5 p-4 sm:p-5 bg-income/5 rounded-xl border border-income/15">
                        <div className="flex items-center gap-2 text-income">
                           <ArrowUpCircle size={16} strokeWidth={2.5} />
                           <span className="text-[11px] font-black uppercase tracking-wider">
                              Phiếu thu tiền (Nhận tiền từ khách hàng)
                           </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           <SmartAmountInput 
                              label="Số tiền nhận" 
                              value={paymentForm.amount} 
                              onChange={v => setPaymentForm({ ...paymentForm, amount: v })} 
                           />
                           
                           <BaseSelect 
                              label="Nhân viên bán xe"
                              value={paymentForm.seller || ''}
                              onChange={e => setPaymentForm({ ...paymentForm, seller: e.target.value, receiver: e.target.value })}
                           >
                              <option value="">Chọn nhân viên...</option>
                              {staffList.filter(s => s.role !== String(UserRole.ADMIN)).map(s => (
                                 <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
                              ))}
                           </BaseSelect>

                           <BaseSelect 
                              label="Trạng thái tiếp theo"
                              value={nextStatusInTab || ''}
                              onChange={e => setNextStatusInTab(e.target.value as VehicleStatus)}
                           >
                              <option value="">Chọn trạng thái...</option>
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
                           <div className="space-y-3 p-3.5 bg-white rounded-xl border border-hairline-soft">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 <BaseInput 
                                    label="Tên khách hàng mua xe" 
                                    value={paymentForm.buyerName} 
                                    onChange={e => setPaymentForm({ ...paymentForm, buyerName: e.target.value })} 
                                 />
                                 <SmartAmountInput 
                                    label="Giá chốt bán thực tế" 
                                    value={paymentForm.salePrice || 0} 
                                    onChange={v => setPaymentForm({ ...paymentForm, salePrice: v })} 
                                 />
                              </div>
                              {isAdminOrAccountant && (
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-hairline-soft">
                                    <SmartAmountInput 
                                       label="Hoa hồng bán xe" 
                                       value={paymentForm.commission} 
                                       onChange={v => setPaymentForm({ ...paymentForm, commission: v })} 
                                    />
                                    <SmartAmountInput 
                                       label="Thưởng NV thu mua" 
                                       value={paymentForm.buying_bonus} 
                                       onChange={v => setPaymentForm({ ...paymentForm, buying_bonus: v })} 
                                    />
                                 </div>
                              )}
                           </div>
                        )}

                        <PillButton 
                           onClick={() => handleAddSalePayment(vehicle.id, paymentForm.amount, paymentForm.note, paymentForm.receiver || userCode, nextStatusInTab || vehicle.status, paymentForm.seller || userCode, paymentForm.buyerName, paymentForm.salePrice, paymentForm.commission, paymentForm.buying_bonus)}
                           isLoading={isSubmitting}
                           disabled={!nextStatusInTab} 
                           variant="success"
                           className="w-full h-12 sm:h-14 shadow-income/20 text-xs font-black cursor-pointer"
                           icon={Check}
                        >
                           {nextStatusInTab === vehicle.status ? 'Xác nhận Thu tiền' : `Sang ${VEHICLE_STATUS_LABELS[nextStatusInTab as VehicleStatus] || '...'}`}
                        </PillButton>

                        {/* Hủy giao dịch (Quay về kho) */}
                        {vehicle.status !== VehicleStatus.IN_STOCK && (
                           <div className="pt-3 border-t border-hairline-soft">
                              <AnimatePresence mode="wait">
                                 {!showCancelSaleConfirm ? (
                                    <motion.button 
                                       initial={{ opacity: 0 }} 
                                       animate={{ opacity: 1 }}
                                       onClick={() => setShowCancelSaleConfirm(true)} 
                                       className="w-full h-10 text-expense text-xs font-black uppercase tracking-widest hover:bg-expense/5 rounded-full transition-all cursor-pointer"
                                    >
                                       Hủy giao dịch (Quay về kho)
                                    </motion.button>
                                 ) : (
                                    <motion.div 
                                       initial={{ opacity: 0, scale: 0.95 }} 
                                       animate={{ opacity: 1, scale: 1 }}
                                       className="space-y-2"
                                    >
                                       <p className="text-[11px] font-bold text-center text-kraft-ink">
                                          Chọn phương thức xử lý cọc khi hủy giao dịch:
                                       </p>
                                       <div className="flex flex-col sm:flex-row gap-2">
                                          <button 
                                             onClick={() => setShowCancelSaleConfirm(false)} 
                                             className="flex-1 h-10 bg-white border border-hairline-soft rounded-full text-xs font-black uppercase tracking-widest hover:bg-surface-soft transition-all cursor-pointer"
                                          >
                                             Quay lại
                                          </button>
                                          {vehicle.received_amount && vehicle.received_amount > 0 ? (
                                             <>
                                                <button 
                                                   onClick={() => handleCancelSale(vehicle.id, userCode, 'REFUND')} 
                                                   className="flex-1 h-10 bg-amber-500 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all cursor-pointer whitespace-nowrap"
                                                >
                                                   Hoàn cọc ({formatCurrency(vehicle.received_amount)})
                                                </button>
                                                <button 
                                                   onClick={() => handleCancelSale(vehicle.id, userCode, 'FORFEIT')} 
                                                   className="flex-1 h-10 bg-expense text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-md shadow-expense/20 hover:bg-expense/90 transition-all cursor-pointer whitespace-nowrap"
                                                >
                                                   Tịch thu cọc
                                                </button>
                                             </>
                                          ) : (
                                             <button 
                                                onClick={() => handleCancelSale(vehicle.id, userCode, 'REFUND')} 
                                                className="flex-1 h-10 bg-expense text-white rounded-full text-xs font-black uppercase tracking-widest shadow-md shadow-expense/20 hover:bg-expense/90 transition-all cursor-pointer"
                                             >
                                                Xác nhận Hủy
                                             </button>
                                          )}
                                       </div>
                                    </motion.div>
                                 )}
                              </AnimatePresence>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         )}
      </motion.div>
   );
};
