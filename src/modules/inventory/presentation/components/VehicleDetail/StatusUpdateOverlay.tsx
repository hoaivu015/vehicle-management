import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
   ChevronRight, ChevronLeft, RefreshCw, AlertCircle, AlertTriangle, 
   Sparkles, Warehouse, HandCoins, Landmark, BadgeCheck, Check,
   Zap, DollarSign, TrendingUp, User, Users, ArrowRight
} from 'lucide-react';
import { BaseModal as Modal } from '@/src/shared/design-system/BaseModal';
import { cn } from '@/src/shared/utils/cn';
import { 
   VehicleStatus, 
   VEHICLE_STATUS_LABELS, 
   VEHICLE_STATUS_CONFIG, 
   STAFF_CONSTANTS 
} from '@/src/shared/domain/constants';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { PaymentFormState } from './useVehicleDetail';
import { formatCurrency } from '@/src/shared/utils/currency';
import { haptics } from '@/src/shared/utils/haptics';

interface StatusUpdateOverlayProps {
   vehicle: Vehicle;
   staffList: Staff[];
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

interface StatusMeta {
   icon: React.ElementType;
   colorClass: string;
   bgClass: string;
   borderClass: string;
   description: string;
   actionLabel: string;
}

const STATUS_METAS: Record<VehicleStatus, StatusMeta> = {
   [VehicleStatus.DEPOSIT_BUY]: {
      icon: HandCoins,
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/20 hover:border-amber-500/40',
      description: 'Đã cọc mua xe từ chủ cũ, đang hoàn tất thủ tục.',
      actionLabel: 'Xác nhận Đặt cọc mua'
   },
   [VehicleStatus.SPA]: {
      icon: Sparkles,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-500/10',
      borderClass: 'border-blue-500/20 hover:border-blue-500/40',
      description: 'Chuyển xe vào khu vực làm đẹp, hoàn thiện và kiểm tra kỹ thuật.',
      actionLabel: 'Chuyển xe đi làm đẹp hoàn thiện'
   },
   [VehicleStatus.IN_STOCK]: {
      icon: Warehouse,
      colorClass: 'text-kraft-ink',
      bgClass: 'bg-black/[0.04]',
      borderClass: 'border-black/10 hover:border-black/25',
      description: 'Xe đã sẵn sàng trong kho để chào bán tới khách hàng.',
      actionLabel: 'Nhập kho sẵn sàng bán'
   },
   [VehicleStatus.DEPOSIT_SALE]: {
      icon: HandCoins,
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/20 hover:border-amber-500/40',
      description: 'Khách hàng đặt cọc giữ xe và lưu thông tin hợp đồng đặt cọc.',
      actionLabel: 'Xác nhận Đặt cọc bán xe'
   },
   [VehicleStatus.BANK_DEPOSIT]: {
      icon: Landmark,
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-500/10',
      borderClass: 'border-orange-500/20 hover:border-orange-500/40',
      description: 'Khách đặt cọc và làm thủ tục vay trả góp qua ngân hàng.',
      actionLabel: 'Xác nhận Cọc ngân hàng'
   },
   [VehicleStatus.BANK_CONFIRMED]: {
      icon: Check,
      colorClass: 'text-teal-600',
      bgClass: 'bg-teal-500/10',
      borderClass: 'border-teal-500/20 hover:border-teal-500/40',
      description: 'Ngân hàng đã phê duyệt hồ sơ tín dụng / giải ngân giữ xe.',
      actionLabel: 'Xác nhận Đã duyệt ngân hàng'
   },
   [VehicleStatus.SOLD]: {
      icon: BadgeCheck,
      colorClass: 'text-income',
      bgClass: 'bg-income/10',
      borderClass: 'border-income/20 hover:border-income/40',
      description: 'Khách hàng thanh toán tiền, hoàn tất bàn giao và xuất kho xe.',
      actionLabel: 'Hoàn tất Bán xe & Xuất kho'
   }
};

const QUICK_DEPOSITS = [10_000_000, 20_000_000, 50_000_000, 100_000_000];

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
   const [formError, setFormError] = useState<string | null>(null);
   const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

   const currentStatus = vehicle.status as VehicleStatus;
   const validNextStatuses = useMemo(() => {
      return VehicleStateMachine.getValidNextStatuses(currentStatus);
   }, [currentStatus]);

   const saleStatuses = useMemo(() => [
      VehicleStatus.DEPOSIT_SALE, 
      VehicleStatus.BANK_DEPOSIT, 
      VehicleStatus.BANK_CONFIRMED, 
      VehicleStatus.SOLD
   ], []);

   const isCurrentInSale = saleStatuses.includes(currentStatus);
   const isTargetingCancelSale = transitionStatus === VehicleStatus.IN_STOCK && isCurrentInSale;

   // Tính toán chi phí và giá vốn xe (COGS)
   const totalCosts = useMemo(() => {
      return (vehicle.cost_history || []).reduce((sum, c) => sum + (c.amount || 0), 0);
   }, [vehicle.cost_history]);

   const totalCOGS = (vehicle.purchase_price || 0) + totalCosts;
   const currentReceivedAmount = vehicle.received_amount || 0;
   const effectiveSalePrice = paymentForm.salePrice || vehicle.sale_price || 0;
   const remainingDebt = Math.max(0, effectiveSalePrice - currentReceivedAmount - (transitionStatus === VehicleStatus.SOLD ? paymentForm.amount : 0));
   const estimatedGrossProfit = effectiveSalePrice > 0 ? effectiveSalePrice - totalCOGS : 0;
   const totalStaffRemuneration = (paymentForm.commission || 0) + (paymentForm.buying_bonus || 0);

   const handleClose = () => {
      haptics.light();
      setIsUpdatingStatus(false);
      setTransitionStatus(null);
      setFormError(null);
      setShowCancelConfirmation(false);
   };

   const handleSelectStatus = (status: VehicleStatus) => {
      haptics.light();
      setFormError(null);

      if (status === VehicleStatus.IN_STOCK && isCurrentInSale) {
         setTransitionStatus(VehicleStatus.IN_STOCK);
         setShowCancelConfirmation(true);
         return;
      }

      setShowCancelConfirmation(false);
      const isSaleTransition = saleStatuses.includes(status);

      if (isSaleTransition) {
         setTransitionStatus(status);
         const initialAmount = (status === VehicleStatus.SOLD && currentStatus === VehicleStatus.IN_STOCK)
            ? (vehicle.sale_price || 0)
            : status === VehicleStatus.SOLD
            ? Math.max(0, (vehicle.sale_price || 0) - currentReceivedAmount)
            : (paymentForm.amount || 0);

         setPaymentForm({
            ...paymentForm,
            salePrice: vehicle.sale_price || 0,
            amount: initialAmount,
            buyerName: vehicle.customer_name || '',
            note: `Giao dịch ${VEHICLE_STATUS_LABELS[status] || status}`,
            seller: vehicle.seller || userCode,
            receiver: vehicle.seller || userCode,
            commission: vehicle.commission || STAFF_CONSTANTS.DEFAULT_SALE_COMMISSION,
            buying_bonus: vehicle.buying_bonus || 0
         });
      } else if (status === VehicleStatus.IN_STOCK && (currentStatus === VehicleStatus.SPA || currentStatus === VehicleStatus.DEPOSIT_BUY)) {
         setTransitionStatus(VehicleStatus.IN_STOCK);
         setPaymentForm({
            ...paymentForm,
            salePrice: vehicle.sale_price || 0,
            amount: 0,
            buyerName: '',
            note: currentStatus === VehicleStatus.SPA ? 'Hoàn thành Spa - Nhập kho chờ bán' : 'Hoàn tất mua - Nhập kho chờ bán',
            seller: userCode,
            receiver: userCode,
            commission: 0,
            buying_bonus: 0
         });
      } else {
         handleUpdateStatus(vehicle.id, status, {
            note: `Chuyển sang ${VEHICLE_STATUS_LABELS[status] || status}`,
            updates: {}
         });
         setIsUpdatingStatus(false);
      }
   };

   const handleBackToStatusList = () => {
      haptics.light();
      setTransitionStatus(null);
      setFormError(null);
      setShowCancelConfirmation(false);
   };

   const handleFillFullPayment = () => {
      haptics.medium();
      const due = Math.max(0, effectiveSalePrice - currentReceivedAmount);
      setPaymentForm({
         ...paymentForm,
         amount: due
      });
   };

   const handleSelectQuickDeposit = (val: number) => {
      haptics.light();
      setPaymentForm({
         ...paymentForm,
         amount: val
      });
   };

   const handleConfirm = async () => {
      setFormError(null);

      if (isTargetingCancelSale) {
         haptics.medium();
         await handleCancelSale(vehicle.id, userCode);
         setIsUpdatingStatus(false);
         setTransitionStatus(null);
         return;
      }

      if (transitionStatus === VehicleStatus.IN_STOCK) {
         if ((paymentForm.salePrice || 0) <= 0) {
            setFormError('Vui lòng nhập giá niêm yết chào bán của xe (lớn hơn 0).');
            haptics.error();
            return;
         }
         await handleUpdateStatus(vehicle.id, VehicleStatus.IN_STOCK, {
            note: paymentForm.note || 'Nhập kho chờ bán',
            updates: { sale_price: paymentForm.salePrice }
         });
      } else if (transitionStatus) {
         if ((paymentForm.salePrice || 0) <= 0) {
            setFormError('Vui lòng nhập giá chốt bán thực tế của xe.');
            haptics.error();
            return;
         }

         if (transitionStatus === VehicleStatus.SOLD && !paymentForm.buyerName?.trim()) {
            setFormError('Vui lòng nhập tên khách hàng mua xe.');
            haptics.error();
            return;
         }

         if (!paymentForm.seller) {
            setFormError('Vui lòng chọn nhân viên phụ trách bán xe.');
            haptics.error();
            return;
         }

         await handleAddSalePayment(
            vehicle.id,
            paymentForm.amount || 0,
            paymentForm.note || `Giao dịch ${VEHICLE_STATUS_LABELS[transitionStatus]}`,
            paymentForm.receiver || paymentForm.seller || userCode,
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

   // ── MODAL HEADER COMPONENTS ──
   const modalTitle = (
      <div className="flex items-center gap-2 flex-wrap min-w-0">
         {transitionStatus ? (
            <div className="flex items-center gap-1.5 flex-wrap">
               <span className="text-sm md:text-base font-black text-kraft-ink uppercase tracking-tight">
                  Chuyển Trạng Thái:
               </span>
               <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-2xs leading-none",
                  VEHICLE_STATUS_CONFIG[currentStatus]?.badgeClass || "bg-kraft-ink"
               )}>
                  {VEHICLE_STATUS_LABELS[currentStatus] || currentStatus}
               </div>
               <ArrowRight size={12} className="text-sub-label shrink-0" />
               <div className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-2xs leading-none animate-pulse",
                  VEHICLE_STATUS_CONFIG[transitionStatus]?.badgeClass || "bg-kraft-accent"
               )}>
                  {VEHICLE_STATUS_LABELS[transitionStatus]}
               </div>
            </div>
         ) : (
            <span className="text-sm md:text-base font-black text-kraft-ink uppercase tracking-tight">
               Cập nhật trạng thái xe
            </span>
         )}
      </div>
   );

   const modalSubtitle = (
      <div className="flex items-center gap-2 text-sub-label text-xs font-bold mt-0.5">
         <span className="font-mono font-black uppercase text-kraft-ink/70">Mã: {vehicle.code}</span>
         <span className="text-black/20">•</span>
         <span className="truncate max-w-[200px] md:max-w-[300px]">{vehicle.name}</span>
      </div>
   );

   const headerActions = transitionStatus ? (
      <motion.button
         whileTap={{ scale: 0.95 }}
         onClick={handleBackToStatusList}
         className="h-8 px-3 rounded-full bg-surface-soft hover:bg-black/5 border border-hairline-soft text-kraft-ink text-xs font-bold flex items-center gap-1 transition-all cursor-pointer mr-1"
         title="Quay lại danh sách trạng thái"
      >
         <ChevronLeft size={14} strokeWidth={2.5} />
         <span className="hidden sm:inline">Quay lại</span>
      </motion.button>
   ) : null;

   return (
      <Modal 
         isOpen={true} 
         onClose={handleClose} 
         maxWidth={transitionStatus && !showCancelConfirmation ? "3xl" : "2xl"} 
         title={modalTitle}
         subtitle={modalSubtitle}
         headerActions={headerActions}
         showCloseButton={true}
         height="auto"
      >
         <div className="p-4 sm:p-6 space-y-4">
            {/* Actionable Error Banner */}
            {formError && (
               <motion.div 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-expense/10 border border-expense/25 text-expense rounded-xl flex items-center gap-2.5 text-xs font-bold shadow-2xs"
               >
                  <AlertCircle size={16} className="shrink-0 text-expense" />
                  <span>{formError}</span>
               </motion.div>
            )}

            {/* ── BƯỚC 1: DANH SÁCH CHỌN TRẠNG THÁI (INTERACTIVE BIO-CARDS) ── */}
            {!transitionStatus ? (
               <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                     <p className="text-[11px] font-black uppercase tracking-wider text-sub-label">
                        Chọn bước chuyển tiếp theo cho xe:
                     </p>
                     <span className="text-[10px] font-bold text-sub-label bg-surface-soft px-2 py-0.5 rounded-full border border-hairline-soft">
                        {validNextStatuses.length} lựa chọn hợp lệ
                     </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                     {validNextStatuses.map(status => {
                        const meta = STATUS_METAS[status] || {
                           icon: Warehouse,
                           colorClass: 'text-kraft-ink',
                           bgClass: 'bg-surface-soft',
                           borderClass: 'border-hairline-soft',
                           description: 'Chuyển sang trạng thái tiếp theo.',
                           actionLabel: 'Chuyển trạng thái'
                        };
                        const Icon = meta.icon;
                        const isCancelBranch = status === VehicleStatus.IN_STOCK && isCurrentInSale;

                        return (
                           <motion.button
                              key={status}
                              whileTap={{ scale: 0.98 }}
                              disabled={isSubmitting}
                              onClick={() => handleSelectStatus(status)}
                              className={cn(
                                 "text-left p-3.5 rounded-[18px] border transition-all flex items-center justify-between gap-3 shadow-2xs group cursor-pointer",
                                 isCancelBranch
                                    ? "bg-expense/[0.03] border-expense/20 hover:border-expense/50 hover:bg-expense/[0.06] sm:col-span-2"
                                    : cn("bg-white", meta.borderClass, "hover:shadow-sm")
                              )}
                           >
                              <div className="flex items-center gap-3 min-w-0">
                                 <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                    isCancelBranch ? "bg-expense/10 text-expense" : cn(meta.bgClass, meta.colorClass)
                                 )}>
                                    {isCancelBranch ? <AlertTriangle size={18} /> : <Icon size={18} strokeWidth={2.5} />}
                                 </div>
                                 <div className="min-w-0 space-y-0.5">
                                    <span className={cn(
                                       "text-xs font-black uppercase tracking-tight block truncate",
                                       isCancelBranch ? "text-expense" : "text-kraft-ink"
                                    )}>
                                       {isCancelBranch ? 'Hủy giao dịch (Quay về kho)' : (VEHICLE_STATUS_LABELS[status] || status)}
                                    </span>
                                    <p className="text-[10px] text-sub-label font-medium line-clamp-1">
                                       {isCancelBranch ? 'Hoàn tác cọc và chuyển xe về Trong kho.' : meta.description}
                                    </p>
                                 </div>
                              </div>

                              <div className={cn(
                                 "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all",
                                 isCancelBranch 
                                    ? "bg-expense/10 text-expense group-hover:bg-expense group-hover:text-white"
                                    : "bg-surface-soft text-sub-label group-hover:bg-kraft-accent group-hover:text-white"
                              )}>
                                 <ChevronRight size={14} strokeWidth={2.5} />
                              </div>
                           </motion.button>
                        );
                     })}
                  </div>
               </div>
            ) : (
               /* ── BƯỚC 2: FORM 2 CỘT (SWISS EXECUTIVE SPLIT LAYOUT) ── */
               <div className="space-y-4">
                  {/* CẢNH BÁO NẾU HỦY GIAO DỊCH BÁN */}
                  {showCancelConfirmation ? (
                     <div className="p-4 sm:p-5 rounded-2xl bg-expense/10 border border-expense/25 space-y-3.5">
                        <div className="flex items-start gap-3">
                           <div className="w-9 h-9 rounded-xl bg-expense text-white flex items-center justify-center shrink-0 shadow-sm shadow-expense/20">
                              <AlertTriangle size={18} />
                           </div>
                           <div className="space-y-1 min-w-0">
                              <h3 className="text-sm font-black uppercase tracking-wider text-expense">
                                 Cảnh báo: Xác nhận hủy giao dịch
                              </h3>
                              <p className="text-xs font-bold text-kraft-ink/80 leading-relaxed">
                                 Thao tác này sẽ xóa trắng thông tin lượt bán xe (người mua, cọc, hoa hồng) và chuyển trạng thái xe về <span className="font-black text-kraft-ink underline">TRONG KHO</span> để sẵn sàng bán lại.
                              </p>
                           </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                           <button
                              type="button"
                              onClick={handleBackToStatusList}
                              className="flex-1 h-11 bg-white border border-hairline-soft rounded-full text-xs font-black uppercase tracking-wider text-kraft-ink hover:bg-surface-soft transition-all cursor-pointer"
                           >
                              Quay lại
                           </button>
                           <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={handleConfirm}
                              className="flex-1 h-11 bg-expense text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md shadow-expense/20 hover:bg-expense/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                           >
                              {isSubmitting ? <RefreshCw className="animate-spin" size={15} /> : <Check size={15} strokeWidth={2.5} />}
                              <span>Xác nhận Hủy</span>
                           </button>
                        </div>
                     </div>
                  ) : transitionStatus === VehicleStatus.IN_STOCK ? (
                     /* CASE A: NHẬP KHO CHỜ BÁN TỪ SPA/DEPOSIT BUY */
                     <div className="space-y-4">
                        <div className="p-4 bg-surface-soft/60 rounded-2xl border border-hairline-soft space-y-3.5">
                           <div className="flex items-center gap-2 text-kraft-ink">
                              <DollarSign size={15} className="text-kraft-accent" strokeWidth={2.5} />
                              <span className="text-[11px] font-black uppercase tracking-wider">
                                 Thiết lập giá niêm yết chào bán
                              </span>
                           </div>

                           <SmartAmountInput
                              label="Giá bán niêm yết (VNĐ)"
                              value={paymentForm.salePrice || 0}
                              onChange={v => setPaymentForm({ ...paymentForm, salePrice: v ?? 0 })}
                           />

                           <BaseInput 
                              label="Ghi chú hoàn tất"
                              placeholder="VD: Xe đã hoàn thành spa dọn dẹp, nhập kho A2..."
                              value={paymentForm.note}
                              onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                           />
                        </div>

                        <div className="flex gap-2.5 pt-1">
                           <button
                              type="button"
                              onClick={handleBackToStatusList}
                              className="h-11 px-5 rounded-full bg-surface-soft hover:bg-black/5 border border-hairline-soft font-black text-xs uppercase tracking-wider text-kraft-ink transition-all cursor-pointer"
                           >
                              Quay lại
                           </button>
                           <button
                              type="button"
                              onClick={handleConfirm}
                              disabled={isSubmitting}
                              className="flex-1 h-11 rounded-full bg-kraft-accent hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-kraft-accent/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                           >
                              {isSubmitting ? <RefreshCw className="animate-spin" size={15} /> : <Check size={15} strokeWidth={2.5} />}
                              <span>Xác nhận Nhập kho</span>
                           </button>
                        </div>
                     </div>
                  ) : (
                     /* CASE B: SWISS EXECUTIVE 2-COLUMN SPLIT LAYOUT (BÁN / CỌC) */
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* ── CỘT TRÁI (COL 1-7): THÔNG TIN GIAO DỊCH & KHÁCH HÀNG ── */}
                        <div className="md:col-span-7 space-y-3.5">
                           {/* 1. GIÁ BÁN & TIỀN THU ĐỢT NÀY */}
                           <div className="p-3.5 bg-income/[0.04] rounded-2xl border border-income/15 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                 <div className="flex items-center gap-1.5 text-income">
                                    <TrendingUp size={14} strokeWidth={2.5} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                       {transitionStatus === VehicleStatus.SOLD ? 'Thanh toán & Chốt bán' : 'Tiền đặt cọc & Giá bán'}
                                    </span>
                                 </div>

                                 {transitionStatus === VehicleStatus.SOLD && remainingDebt > 0 && (
                                    <button
                                       type="button"
                                       onClick={handleFillFullPayment}
                                       className="px-2 py-0.5 rounded-full bg-income text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                                    >
                                       <Zap size={10} fill="currentColor" />
                                       <span>Thu đủ 100%</span>
                                    </button>
                                 )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                 <SmartAmountInput
                                    label="Giá chốt bán thực tế"
                                    value={paymentForm.salePrice || 0}
                                    onChange={v => setPaymentForm({ ...paymentForm, salePrice: v ?? 0 })}
                                 />

                                 <SmartAmountInput
                                    label={transitionStatus === VehicleStatus.SOLD ? 'Tiền thu đợt này' : 'Số tiền nhận cọc'}
                                    value={paymentForm.amount}
                                    onChange={v => setPaymentForm({ ...paymentForm, amount: v ?? 0 })}
                                 />
                              </div>

                              {/* Quick Deposit Chips */}
                              {transitionStatus !== VehicleStatus.SOLD && (
                                 <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                    <span className="text-[9px] font-black uppercase text-sub-label">Cọc nhanh:</span>
                                    {QUICK_DEPOSITS.map(d => (
                                       <button
                                          key={d}
                                          type="button"
                                          onClick={() => handleSelectQuickDeposit(d)}
                                          className={cn(
                                             "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer",
                                             paymentForm.amount === d 
                                                ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                                                : "bg-white border-hairline-soft text-kraft-ink hover:bg-surface-soft"
                                          )}
                                       >
                                          {formatCurrency(d)}
                                       </button>
                                    ))}
                                 </div>
                              )}

                              {/* Báo công nợ còn lại */}
                              {transitionStatus === VehicleStatus.SOLD && remainingDebt > 0 && (
                                 <div className="p-2 bg-warning/10 border border-warning/20 rounded-xl flex items-center justify-between text-[11px] font-bold text-warning">
                                    <span>Khách còn nợ lại:</span>
                                    <span className="font-black">{formatCurrency(remainingDebt)}</span>
                                 </div>
                              )}
                           </div>

                           {/* 2. KHÁCH HÀNG & NHÂN VIÊN */}
                           <div className="p-3.5 bg-surface-soft/60 rounded-2xl border border-hairline-soft space-y-2.5">
                              <div className="flex items-center gap-1.5 text-sub-label">
                                 <User size={13} />
                                 <span className="text-[10px] font-black uppercase tracking-wider">
                                    Khách hàng & Nhân sự phụ trách
                                 </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                 <BaseInput 
                                    label="Tên khách hàng"
                                    placeholder="Họ và tên khách mua..."
                                    value={paymentForm.buyerName}
                                    onChange={e => setPaymentForm({ ...paymentForm, buyerName: e.target.value })}
                                 />

                                 <BaseSelect 
                                    label="Nhân viên bán xe"
                                    value={paymentForm.seller}
                                    onChange={e => setPaymentForm({ ...paymentForm, seller: e.target.value, receiver: e.target.value })}
                                 >
                                    <option value="">Chọn nhân viên...</option>
                                    {staffList.map(s => (
                                       <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
                                    ))}
                                 </BaseSelect>
                              </div>
                           </div>

                           {/* 3. GHI CHÚ GIAO DỊCH */}
                           <BaseInput 
                              label="Ghi chú giao dịch"
                              placeholder="VD: Khách hẹn thanh toán nốt vào tuần sau..."
                              value={paymentForm.note}
                              onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                           />
                        </div>

                        {/* ── CỘT PHẢI (COL 8-12): HẠCH TOÁN SSoT, HOA HỒNG & HÀNH ĐỘNG ── */}
                        <div className="md:col-span-5 flex flex-col justify-between gap-3.5">
                           <div className="space-y-3">
                              {/* 1. HOA HỒNG & THÙ LAO */}
                              <div className="p-3.5 bg-surface-soft/60 rounded-2xl border border-hairline-soft space-y-2.5">
                                 <div className="flex items-center gap-1.5 text-sub-label">
                                    <Users size={13} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                       Thù lao & Hoa hồng
                                    </span>
                                 </div>

                                 <div className="space-y-2">
                                    <SmartAmountInput
                                       label="Hoa hồng bán xe"
                                       value={paymentForm.commission}
                                       onChange={v => setPaymentForm({ ...paymentForm, commission: v ?? 0 })}
                                    />
                                    <SmartAmountInput
                                       label="Thưởng NV thu mua"
                                       value={paymentForm.buying_bonus}
                                       onChange={v => setPaymentForm({ ...paymentForm, buying_bonus: v ?? 0 })}
                                    />
                                 </div>
                              </div>

                              {/* 2. LIVE FINANCIAL PREVIEW BENTO */}
                              <div className="p-3.5 bg-white rounded-2xl border border-hairline-soft shadow-2xs space-y-2">
                                 <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-sub-label pb-1 border-b border-hairline-soft">
                                    <span>Hạch toán dự kiến</span>
                                    <span className="text-kraft-accent">SSoT Auto 28</span>
                                 </div>

                                 <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between text-sub-label">
                                       <span>Tổng giá vốn:</span>
                                       <span className="font-mono font-black text-expense">{formatCurrency(totalCOGS)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sub-label">
                                       <span>Tổng hoa hồng:</span>
                                       <span className="font-mono font-bold text-kraft-ink">{formatCurrency(totalStaffRemuneration)}</span>
                                    </div>
                                    <div className={cn(
                                       "p-2 rounded-xl border flex items-center justify-between mt-1",
                                       estimatedGrossProfit >= 0 
                                          ? "bg-income/10 border-income/20 text-income" 
                                          : "bg-expense/10 border-expense/20 text-expense"
                                    )}>
                                       <span className="text-[10px] font-black uppercase">Lợi nhuận gộp</span>
                                       <span className="text-sm font-black whitespace-nowrap font-mono">
                                          {formatCurrency(estimatedGrossProfit)}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* 3. NÚT XÁC NHẬN NẰM NGAY ĐÁY CỘT PHẢI */}
                           <div className="pt-2">
                              <button
                                 type="button"
                                 onClick={handleConfirm}
                                 disabled={isSubmitting}
                                 className={cn(
                                    "w-full h-12 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer",
                                    isSubmitting 
                                       ? "bg-kraft-accent/50 text-white cursor-not-allowed" 
                                       : "bg-kraft-accent text-white hover:brightness-110 shadow-kraft-accent/20"
                                 )}
                              >
                                 {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} strokeWidth={2.5} />}
                                 <span>
                                    {transitionStatus === VehicleStatus.SOLD
                                       ? 'Hoàn tất Bán xe'
                                       : `Xác nhận ${VEHICLE_STATUS_LABELS[transitionStatus]}`}
                                 </span>
                              </button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}
         </div>
      </Modal>
   );
};
