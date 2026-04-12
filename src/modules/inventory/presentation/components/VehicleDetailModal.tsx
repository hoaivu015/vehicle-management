import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calendar, TrendingUp, Award, Clock, DollarSign, 
  CircleDollarSign, User, MapPin, Trash2, Edit2, Plus, TrendingDown, Save, Pin, RefreshCw, AlertCircle, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_CONFIG, UserRole, STAFF_CONSTANTS } from '@/src/shared/domain/constants';
import { cn } from '@/src/utils/cn';
import { formatCurrency } from '@/src/utils/currency';
import { VehicleStateMachine } from '@/src/modules/inventory/domain/VehicleStateMachine';
import { Z_INDEX } from '@/src/constants';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: number, nextStatus: VehicleStatus, extra?: any) => Promise<void>;
  onDeleteVehicle: (id: number) => Promise<void>;
  onUpdateVehicle: (id: number, data: Partial<Vehicle>) => Promise<void>;
  onAddCost: (vehicle: Vehicle, name: string, amount: number) => Promise<void>;
  onDeleteCost: (vehicle: Vehicle, index: number) => Promise<void>;
  onPin?: (id: number, isPinned: boolean) => Promise<void>;
  onAddPurchasePayment: (id: number, amount: number, note: string, receiver: string) => Promise<void>;
  onAddSalePayment: (id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number) => Promise<void>;
  onCancelSale: (id: number, userCode: string) => Promise<void>;
  staffList: any[];
  userRole: string;
  userCode: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '---';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({ 
  vehicle, 
  isOpen, 
  onClose, 
  onUpdateStatus,
  onDeleteVehicle,
  onUpdateVehicle,
  onAddCost,
  onDeleteCost,
  onPin,
  onAddPurchasePayment,
  onAddSalePayment,
  onCancelSale,
  staffList,
  userRole,
  userCode
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'financials' | 'history' | 'payments_buy' | 'payments_sale'>('info');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Vehicle>>({});
  const [costForm, setCostForm] = useState({ name: '', amount: 0 });
  const [paymentForm, setPaymentForm] = useState({ 
    amount: 0, 
    note: '', 
    receiver: userCode,
    seller: userCode, 
    buyerName: '', 
    salePrice: 0,
    commission: STAFF_CONSTANTS.DEFAULT_SALE_COMMISSION
  });
  const [transitionStatus, setTransitionStatus] = useState<VehicleStatus | null>(null);
  const [nextStatusInTab, setNextStatusInTab] = useState<VehicleStatus | null>(null);
  
  // NEW: State for Submitting and Confirmations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelSaleConfirm, setShowCancelSaleConfirm] = useState(false);

  // NEW: Action Wrapper for Async Tasks
  const withSubmitState = (fn: Function) => async (...args: any[]) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fn(...args);
    } catch (error) {
      console.error("Action error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wrapped actions
  const handleUpdateStatus = withSubmitState(onUpdateStatus);
  const handleDeleteVehicle = withSubmitState(onDeleteVehicle);
  const handleUpdateVehicle = withSubmitState(onUpdateVehicle);
  const handleAddCost = withSubmitState(onAddCost);
  const handleDeleteCost = withSubmitState(onDeleteCost);
  const handlePin = withSubmitState(onPin);
  const handleAddPurchasePayment = withSubmitState(onAddPurchasePayment);
  const handleAddSalePayment = withSubmitState(onAddSalePayment);
  const handleCancelSale = withSubmitState(onCancelSale);

  React.useEffect(() => {
    if (activeTab === 'payments_sale' && vehicle?.status) {
      const validNext = VehicleStateMachine.getValidNextStatuses(vehicle.status as VehicleStatus)
        .filter(s => s !== VehicleStatus.IN_STOCK);
      if (validNext.length > 0 && !nextStatusInTab) {
        setNextStatusInTab(validNext[0] as VehicleStatus);
      }
      if (paymentForm.salePrice === 0 && vehicle.sale_price) {
        setPaymentForm(prev => ({ ...prev, salePrice: vehicle.sale_price || 0 }));
      }
    }
  }, [activeTab, vehicle?.status, vehicle?.sale_price]);

  if (!vehicle) return null;

  const handleStartEdit = () => {
    setEditForm({
      name: vehicle.name,
      year: vehicle.year,
      odo: vehicle.odo,
      color: vehicle.color,
      purchase_price: vehicle.purchase_price,
      sale_price: vehicle.sale_price,
      commission: vehicle.commission,
      buying_commission: vehicle.buying_commission || STAFF_CONSTANTS.DEFAULT_BUYING_COMMISSION,
      buyer: vehicle.buyer,
      coinvestor_code: vehicle.coinvestor_code,
      notes: vehicle.notes
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    await handleUpdateVehicle(vehicle.id, editForm);
    setIsEditing(false);
  };

  const financials = calculateVehicleFinancials(vehicle);
  const purchaseDebt = financials.purchasePrice - (vehicle.purchase_paid_amount || 0);
  const saleDebt = financials.salePrice - (vehicle.received_amount || 0);

  const canSeeFullInfo = 
    userRole === UserRole.ADMIN || 
    userRole === UserRole.ACCOUNTANT || 
    userRole === UserRole.MANAGER ||
    (vehicle.is_coinvested && vehicle.coinvestor_code === userCode);

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className={`fixed inset-0 z-[${Z_INDEX.MODAL}] flex items-center justify-center p-4 sm:p-6 lg:p-8`}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-kraft-ink/60 backdrop-blur-md cursor-pointer"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl bg-white/70 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 shadow-[0_32px_96px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col lg:flex-row h-[90vh] lg:h-[80vh] pointer-events-auto"
          >
            <div className="absolute top-8 right-8 z-[110] flex gap-3">
               <button 
                onClick={() => handlePin(vehicle.id, !vehicle.is_pinned)}
                disabled={isSubmitting}
                className={cn(
                  "p-3 rounded-2xl border transition-all shadow-lg items-center justify-center flex",
                  vehicle.is_pinned 
                    ? "bg-kraft-accent text-white border-white/20" 
                    : "bg-white/40 text-kraft-ink/40 border-white/60 hover:text-kraft-ink",
                   "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
               >
                  {isSubmitting ? <RefreshCw className="animate-spin" size={24} /> : (vehicle.is_pinned ? <Pin size={24} fill="currentColor" /> : <Pin size={24} />)}
               </button>
               <button 
                onClick={onClose}
                className="p-3 bg-white/40 backdrop-blur-md border border-white/60 text-kraft-ink hover:bg-white/60 rounded-2xl transition-all shadow-lg"
               >
                  <X size={24} />
               </button>
            </div>

            <div className="lg:w-1/3 p-8 border-r border-black/5 flex flex-col gap-8 bg-gradient-to-b from-white/20 to-transparent overflow-y-auto custom-scrollbar shrink-0">
               <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl relative group">
                  <img 
                    src={vehicle.image_url || "/default-car.jpg"} 
                    alt={vehicle.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <div className={cn(
                      "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest backdrop-blur-xl border shadow-xl text-white",
                      VEHICLE_STATUS_CONFIG[vehicle.status as VehicleStatus]?.badgeClass ?? "bg-kraft-ink/80 border-white/20"
                    )}>
                      {VEHICLE_STATUS_CONFIG[vehicle.status as VehicleStatus]?.label || vehicle.status}
                    </div>
                  </div>
               </div>

               {canSeeFullInfo && (
                 <div className="space-y-4">
                    <div className="p-6 bg-white/40 rounded-3xl border border-white/60 shadow-sm flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">
                             {vehicle.status === VehicleStatus.SOLD ? "Lợi nhuận ròng" : "Lợi nhuận dự tính"}
                          </p>
                          <p className="text-2xl font-black text-emerald-600 tracking-tighter">
                             {formatCurrency(financials.showroomProfitShare)}
                          </p>
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <TrendingUp size={24} />
                       </div>
                    </div>

                    <div className="p-6 bg-kraft-ink rounded-3xl shadow-2xl shadow-kraft-ink/20 flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Tổng vốn đầu tư</p>
                          <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(financials.totalInvestment)}</p>
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/40">
                          <DollarSign size={24} />
                       </div>
                    </div>
                 </div>
               )}

               <div className="flex gap-4 mt-auto">
                  {canSeeFullInfo && (
                    <>
                      {isEditing ? (
                        <button 
                          onClick={handleSaveEdit}
                          disabled={isSubmitting}
                          className="flex-1 h-14 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} 
                          Lưu thay đổi
                        </button>
                      ) : (
                        <button 
                          onClick={() => setIsUpdatingStatus(true)}
                          className="flex-1 h-14 bg-kraft-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-kraft-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <TrendingUp size={18} /> Cập nhật trạng thái
                        </button>
                      )}

                      <button 
                        onClick={() => {
                            if(isEditing) setIsEditing(false);
                            else handleStartEdit();
                        }}
                        className="w-14 h-14 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-kraft-ink hover:bg-white/60 transition-all"
                      >
                        {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                      </button>
                    </>
                  )}
               </div>
            </div>

            <div className="flex-1 flex flex-col bg-white/30 overflow-hidden">
               <div className="flex px-8 pt-6 gap-2 border-b border-black/5 overflow-x-auto no-scrollbar shrink-0">
                  {[
                    { id: 'info', label: 'Thông số', icon: Calendar },
                    { id: 'financials', label: 'Chi phí', icon: CircleDollarSign, show: canSeeFullInfo },
                    { id: 'payments_buy', label: 'Tiền mua', icon: DollarSign, show: canSeeFullInfo && (vehicle.status === VehicleStatus.DEPOSIT_BUY || (vehicle.purchase_payment_history?.length || 0) > 0) },
                    { id: 'payments_sale', label: 'Tiền bán', icon: TrendingUp, show: canSeeFullInfo && ([VehicleStatus.DEPOSIT_SALE, VehicleStatus.BANK_DEPOSIT, VehicleStatus.BANK_CONFIRMED, VehicleStatus.SOLD].includes(vehicle.status as VehicleStatus) || (vehicle.sale_payment_history?.length || 0) > 0) },
                    { id: 'history', label: 'Lịch sử', icon: Clock }
                  ].filter(t => t.show !== false).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "px-6 py-4 rounded-t-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative shrink-0",
                        activeTab === tab.id 
                          ? "bg-white text-kraft-accent shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)] translate-y-[1px]" 
                          : "text-kraft-ink/40 hover:text-kraft-ink/60 hover:bg-white/20"
                      )}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
               </div>

               <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {activeTab === 'info' && (
                      <motion.div 
                        key="info"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12"
                      >
                         <section className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60 px-2">Đặc điểm xe</h4>
                            <div className="space-y-3">
                               {isEditing ? (
                                 <>
                                   <EditRow label="Tên xe" value={editForm.name} onChange={v => setEditForm({...editForm, name: v})} />
                                   <div className="grid grid-cols-2 gap-4">
                                      <EditRow label="Năm SX" value={editForm.year} onChange={v => setEditForm({...editForm, year: v})} type="number" />
                                      <EditRow label="Màu sắc" value={editForm.color} onChange={v => setEditForm({...editForm, color: v})} />
                                   </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Số ODO (km)</label>
                                      <SmartAmountInput 
                                        value={editForm.odo || 0} 
                                        onChange={v => setEditForm({...editForm, odo: v})}
                                        suffix=" km" icon={Clock} showTextPreview={false}
                                      />
                                    </div>
                                 </>
                               ) : (
                                 <>
                                   <InfoBox label="Mã xe" value={vehicle.code} icon={Award} />
                                   <InfoBox label="Năm SX" value={vehicle.year} icon={Calendar} />
                                   <InfoBox label="Số ODO" value={`${(vehicle.odo || 0).toLocaleString()} km`} icon={TrendingUp} />
                                   <InfoBox label="Màu sắc" value={vehicle.color || '---'} icon={MapPin} />
                                 </>
                               )}
                            </div>
                         </section>

                         <section className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60 px-2">Thông tin nhập kho</h4>
                            <div className="space-y-3">
                               {isEditing ? (
                                 <>
                                   <div className="space-y-4">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Giá nhập xe</label>
                                      <SmartAmountInput value={editForm.purchase_price || 0} onChange={v => setEditForm({...editForm, purchase_price: v})} />
                                   </div>
                                   <div className="space-y-4">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Giá chào bán</label>
                                      <SmartAmountInput value={editForm.sale_price || 0} onChange={v => setEditForm({...editForm, sale_price: v})} />
                                   </div>
                                   <div className="space-y-4">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Hoa hồng nhập (Mua xe)</label>
                                      <SmartAmountInput value={editForm.buying_commission || 0} onChange={v => setEditForm({...editForm, buying_commission: v})} />
                                   </div>
                                   <div className="space-y-4">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Hoa hồng bán xe (Commission)</label>
                                      <SmartAmountInput value={editForm.commission || 0} onChange={v => setEditForm({...editForm, commission: v})} />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Chốt nhập bởi</label>
                                      <div className="relative group">
                                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                                         <select 
                                            className="w-full h-14 bg-white/40 border border-white/60 rounded-2xl pl-12 pr-10 font-bold text-sm focus:bg-white focus:border-kraft-accent outline-none appearance-none transition-all"
                                            value={editForm.buyer || ''} onChange={(e) => setEditForm({...editForm, buyer: e.target.value})}
                                         >
                                            <option value="">Chọn nhân viên...</option>
                                            {staffList.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                                         </select>
                                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 rotate-90">
                                            <ChevronRight size={14} />
                                         </div>
                                      </div>
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Chốt bán bởi</label>
                                      <div className="relative group">
                                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                                         <select 
                                            className="w-full h-14 bg-white/40 border border-white/60 rounded-2xl pl-12 pr-10 font-bold text-sm focus:bg-white focus:border-kraft-accent outline-none appearance-none transition-all"
                                            value={editForm.seller || ''} onChange={(e) => setEditForm({...editForm, seller: e.target.value})}
                                         >
                                            <option value="">Chọn nhân viên...</option>
                                            {staffList.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                                         </select>
                                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 rotate-90">
                                            <ChevronRight size={14} />
                                         </div>
                                      </div>
                                   </div>
                                 </>
                               ) : (
                                 <>
                                   <InfoBox label="Ngày nhập kho" value={formatDate(vehicle.purchase_date)} icon={Calendar} />
                                   {canSeeFullInfo && <InfoBox label="Nhân viên nhập" value={vehicle.buyer_name || '---'} icon={User} />}
                                   {vehicle.seller && (
                                      <InfoBox label="Nhân viên bán" value={vehicle.seller_name || '---'} icon={User} />
                                   )}
                                   {canSeeFullInfo && <InfoBox label="Hoa hồng mua" value={formatCurrency(vehicle.buying_commission || 0)} icon={Award} />}
                                   {canSeeFullInfo && <InfoBox label="Hoa hồng bán" value={formatCurrency(vehicle.commission || 0)} icon={Award} />}
                                   {canSeeFullInfo && <InfoBox label="Giá nhập xe" value={formatCurrency(vehicle.purchase_price)} icon={TrendingDown} highlight />}
                                   {(vehicle.sale_price || 0) > 0 && <InfoBox label="Giá chào bán" value={formatCurrency(vehicle.sale_price || 0)} icon={TrendingUp} highlight />}
                                 </>
                               )}
                            </div>
                         </section>

                         <div className="md:col-span-2 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60 px-2">Ghi chú nội bộ</h4>
                            <div className="p-8 bg-white/40 rounded-[2rem] border border-white/60 italic text-sm text-kraft-ink/60 min-h-[120px]">
                               {vehicle.notes || 'Không có ghi chú nào cho chiếc xe này.'}
                            </div>
                         </div>

                         {(userRole === UserRole.ADMIN && (vehicle.purchase_paid_amount || 0) === 0 && (vehicle.received_amount || 0) === 0 && (vehicle.total_cost || 0) === 0) && (
                            <div className="md:col-span-2 pt-8 mt-4 border-t border-black/5 flex justify-end">
                               <AnimatePresence mode="wait">
                                 {!showDeleteConfirm ? (
                                   <motion.button 
                                     key="delete-btn"
                                     initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                     onClick={() => setShowDeleteConfirm(true)}
                                     className="h-14 px-10 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-red-100 transition-all border border-red-200 shadow-sm"
                                   >
                                     <Trash2 size={18} /> Xóa xe khỏi kho
                                   </motion.button>
                                 ) : (
                                   <motion.div 
                                     key="delete-confirm"
                                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                     className="flex flex-col md:flex-row items-center gap-6 p-6 bg-red-50 border border-red-200 rounded-3xl"
                                   >
                                      <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                          <AlertCircle size={24} />
                                        </div>
                                        <div>
                                          <p className="text-xs font-black text-red-900 uppercase tracking-tighter">Xác nhận xóa xe?</p>
                                          <p className="text-[10px] text-red-700/60 font-bold max-w-[200px]">Thao tác này sẽ xóa vĩnh viễn dữ liệu xe khỏi hệ thống.</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 w-full md:w-auto">
                                        <button 
                                          onClick={() => setShowDeleteConfirm(false)}
                                          disabled={isSubmitting}
                                          className="flex-1 px-6 h-12 bg-white border border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase transition-all hover:bg-red-100 disabled:opacity-50"
                                        >
                                          Hủy
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteVehicle(vehicle.id)}
                                          disabled={isSubmitting}
                                          className="flex-1 px-6 h-12 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase transition-all hover:bg-red-700 shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                          {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                          Xác nhận xóa
                                        </button>
                                      </div>
                                   </motion.div>
                                 )}
                               </AnimatePresence>
                            </div>
                         )}
                      </motion.div>
                   )}

                    {activeTab === 'financials' && (
                      <motion.div 
                        key="fin"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-10"
                      >
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FinancialBox label="Vốn gốc nhập xe" value={financials.purchasePrice} color="ink" />
                            <FinancialBox label="Chi phí phát sinh" value={financials.totalCost} color="amber" />
                            <FinancialBox 
                                label={vehicle.status === VehicleStatus.SOLD ? "Lợi nhuận ròng" : "Dự kiến LN ròng"} 
                                value={financials.netProfit} 
                                color="emerald" 
                             />
                         </div>

                         <section className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60 px-2">Chi phí phát sinh</h4>
                            <div className="bg-white/40 rounded-[2.5rem] border border-white/60 shadow-sm relative">
                               <div className="p-8 border-b border-black/5 bg-kraft-ink/[0.02] rounded-t-[2.5rem] grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                  <div className="md:col-span-6 space-y-2.5">
                                     <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Nội dung chi phí</label>
                                     <input 
                                        type="text" value={costForm.name}
                                        onChange={e => setCostForm({...costForm, name: e.target.value})}
                                        className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent transition-all"
                                        placeholder="Vd: Thay lốp mới, Spa, Dọn nội thất..."
                                     />
                                  </div>
                                  <div className="md:col-span-4">
                                     <SmartAmountInput label="Số tiền chi" value={costForm.amount} onChange={v => setCostForm({...costForm, amount: v})} />
                                  </div>
                                  <div className="md:col-span-2">
                                     <button 
                                       onClick={() => {
                                         if (!costForm.name || !costForm.amount) return;
                                         handleAddCost(vehicle, costForm.name, costForm.amount);
                                         setCostForm({ name: '', amount: 0 });
                                       }}
                                       disabled={isSubmitting}
                                       className="w-full h-14 bg-kraft-ink text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-kraft-ink/80 transition-all disabled:opacity-50 shadow-lg shadow-black/5"
                                     >
                                       {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Plus size={14} />}
                                       Thêm
                                     </button>
                                  </div>
                               </div>

                               <div className="overflow-x-auto rounded-b-[2.5rem]">
                                  <table className="w-full text-left min-w-[600px]">
                                     <thead className="bg-black/[0.02] border-b border-black/5">
                                        <tr>
                                           <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 w-1/4">Ngày ghi nhận</th>
                                           <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Nội dung</th>
                                           <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 text-right min-w-[150px]">Số tiền</th>
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
                             </div>
                          </section>

                          {/* Bảng kê lợi nhuận ròng - CHỈ DÀNH CHO ADMIN/KẾ TOÁN */}
                          {(userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT) && (
                             <section className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60 px-2">Bảng kê lợi nhuận ròng</h4>
                                <div className="p-8 bg-kraft-ink text-white rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                                   <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                      <div className="space-y-4">
                                         <p className="text-[9px] font-black uppercase tracking-widest text-white/40">1. Doanh thu & Vốn</p>
                                         <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                               <span className="opacity-60">Giá bán chốt:</span>
                                               <span className="text-emerald-400">{formatCurrency(financials.salePrice)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold">
                                               <span className="opacity-60">Giá nhập gốc:</span>
                                               <span className="text-red-400">-{formatCurrency(financials.purchasePrice)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold">
                                               <span className="opacity-60">Spa/Dọn:</span>
                                               <span className="text-red-400">-{formatCurrency(financials.totalCost)}</span>
                                            </div>
                                            <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-amber-400">
                                               <span>Lợi nhuận gộp:</span>
                                               <span>{formatCurrency(financials.grossProfit)}</span>
                                            </div>
                                         </div>
                                      </div>

                                      <div className="space-y-4">
                                         <p className="text-[9px] font-black uppercase tracking-widest text-white/40">2. Thưởng & Hoa hồng</p>
                                         <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                               <span className="opacity-60">Hoa hồng mua xe:</span>
                                               <span className="text-red-400">-{formatCurrency(financials.buyingCommission)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold">
                                               <span className="opacity-60">Hoa hồng bán:</span>
                                               <span className="text-red-400">-{formatCurrency(financials.sellingCommission)}</span>
                                            </div>
                                            <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-emerald-400">
                                               <span>Lợi nhuận ròng:</span>
                                               <span>{formatCurrency(financials.netProfit)}</span>
                                            </div>
                                         </div>
                                      </div>

                                      {financials.isCoinvested ? (
                                         <div className="space-y-4 lg:col-span-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">3. Phân chia Showroom vs Đối tác</p>
                                            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
                                               <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                     <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Vốn đối tác</p>
                                                     <p className="text-sm font-black">{formatCurrency(financials.coinvestAmount)}</p>
                                                  </div>
                                                  <div>
                                                     <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Vốn Showroom</p>
                                                     <p className="text-sm font-black">{formatCurrency(financials.showroomCapital)}</p>
                                                  </div>
                                               </div>
                                               <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                                  <div>
                                                     <p className="text-[8px] font-black uppercase tracking-widest text-amber-400 mb-1">Showroom nhận ({((financials.showroomCapital / financials.purchasePrice) * 100).toFixed(0)}%)</p>
                                                     <p className="text-xl font-black text-emerald-400">{formatCurrency(financials.showroomProfitShare)}</p>
                                                  </div>
                                                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/40">
                                                     <Award size={24} />
                                                  </div>
                                               </div>
                                            </div>
                                         </div>
                                      ) : (
                                         <div className="lg:col-span-2 flex items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10 p-8">
                                            <div className="text-center">
                                               <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Showroom sở hữu 100%</p>
                                               <p className="text-xs font-bold text-white/40 max-w-[200px]">Không có đối tác góp vốn cho chiếc xe này.</p>
                                            </div>
                                         </div>
                                      )}
                                   </div>

                                   <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px]">
                                      <div className="flex items-center gap-2 text-white/40 italic">
                                         <Clock size={12} />
                                         <span>Lợi nhuận {financials.isEstimated ? 'dự tính (chưa hoàn tất giao dịch)' : 'thực tế (đã thu đủ tiền)'}</span>
                                      </div>
                                      <div className="px-3 py-1 bg-white/10 rounded-full font-black uppercase tracking-widest text-white/60">
                                         Admin View Only
                                      </div>
                                   </div>
                                </div>
                             </section>
                          )}
                       </motion.div>
                    )}

                    {activeTab === 'payments_buy' && (
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
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60 px-2">Ghi nhận thanh toán đợt mới</h4>
                                <div className="p-8 bg-white/40 rounded-[2.5rem] border border-white/60 space-y-6">
                                   <div className="grid grid-cols-1 gap-6">
                                      <SmartAmountInput label="Số tiền thanh toán" value={paymentForm.amount} onChange={v => setPaymentForm({...paymentForm, amount: v})} />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Ghi chú thanh toán</label>
                                      <input 
                                         placeholder="Ghi chú (VD: Chuyển khoản cọc lần 1...)"
                                         className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none"
                                         value={paymentForm.note} onChange={e => setPaymentForm({...paymentForm, note: e.target.value})}
                                      />
                                   </div>
                                   <button 
                                      onClick={async () => {
                                         if (paymentForm.amount <= 0) return;
                                         await handleAddPurchasePayment(vehicle.id, paymentForm.amount, paymentForm.note, vehicle.buyer);
                                         setPaymentForm({...paymentForm, amount: 0, note: ''});
                                      }}
                                      disabled={isSubmitting}
                                      className="w-full h-14 bg-kraft-ink text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-kraft-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                   >
                                      {isSubmitting && <RefreshCw className="animate-spin" size={18} />}
                                      Xác nhận thanh toán
                                   </button>
                                </div>
                             </section>
                          )}

                          <section className="space-y-6">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60 px-2">Lịch sử thanh toán mua xe</h4>
                             <div className="bg-white/40 rounded-[2.5rem] border border-white/60 overflow-hidden">
                                <table className="w-full text-left">
                                   <thead className="bg-black/5">
                                      <tr>
                                         <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Ngày</th>
                                         <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Nội dung</th>
                                         <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 text-right">Số tiền</th>
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
                                         <tr><td colSpan={3} className="px-8 py-10 text-center italic opacity-30 text-sm">Chưa có dữ liệu thanh toán</td></tr>
                                      )}
                                   </tbody>
                                </table>
                             </div>
                          </section>
                       </motion.div>
                    )}

                    {activeTab === 'payments_sale' && (
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
                                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60">Ghi nhận dòng tiền bán xe</h4>
                                </div>
                                
                                {(userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT) && (
                                   <div className="p-8 bg-white/40 rounded-[2.5rem] border border-white/60 space-y-6 shadow-sm">
                                      <div className="grid grid-cols-1">
                                         <SmartAmountInput label="Số tiền nhận" value={paymentForm.amount} onChange={v => setPaymentForm({...paymentForm, amount: v})} />
                                      </div>

                                      {(vehicle.status === VehicleStatus.IN_STOCK || nextStatusInTab === VehicleStatus.SOLD) && (
                                         <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                               <div className="space-y-2">
                                                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Tên khách hàng</label>
                                                  <input 
                                                     className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent transition-all"
                                                     value={paymentForm.buyerName} onChange={e => setPaymentForm({...paymentForm, buyerName: e.target.value})}
                                                     placeholder="Nhập tên khách hàng..."
                                                  />
                                               </div>
                                               <SmartAmountInput label="Giá bán chốt" value={paymentForm.salePrice} onChange={v => setPaymentForm({...paymentForm, salePrice: v})} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <SmartAmountInput label="Hoa hồng bán xe" value={paymentForm.commission} onChange={v => setPaymentForm({...paymentForm, commission: v})} />
                                            </div>
                                         </div>
                                      )}

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                         <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Nhân viên bán (Tư vấn)</label>
                                            <select 
                                               className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent transition-all"
                                               value={paymentForm.seller || userCode} 
                                               onChange={e => setPaymentForm({...paymentForm, seller: e.target.value, receiver: e.target.value})}
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
                                            value={paymentForm.note} onChange={e => setPaymentForm({...paymentForm, note: e.target.value})}
                                         />
                                      </div>

                                      <button 
                                         onClick={async () => {
                                            if (paymentForm.amount <= 0 && nextStatusInTab !== VehicleStatus.SOLD) return;
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
                                            setPaymentForm({...paymentForm, amount: 0, note: '', commission: STAFF_CONSTANTS.DEFAULT_SALE_COMMISSION});
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
                                )}
                             </section>
                           )}

                          <section className="space-y-6">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60 px-2">Lịch sử nhận tiền từ khách</h4>
                             <div className="bg-white/40 rounded-[2.5rem] border border-white/60 overflow-hidden">
                                <table className="w-full text-left">
                                   <thead className="bg-black/5">
                                      <tr>
                                         <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Ngày</th>
                                         <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Người nhận</th>
                                         <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Nội dung</th>
                                         <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 text-right">Số tiền</th>
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
                                         <tr><td colSpan={4} className="px-8 py-10 text-center italic opacity-30 text-sm">Chưa có dữ liệu nhận tiền</td></tr>
                                      )}
                                   </tbody>
                                </table>
                             </div>
                          </section>
                       </motion.div>
                    )}

                    {activeTab === 'history' && (
                      <motion.div 
                        key="hist"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                         <div className="relative pl-8 space-y-12">
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-kraft-accent via-kraft-accent/20 to-transparent" />
                            {(vehicle.history || []).map((h, idx) => (
                              <div key={idx} className="relative">
                                 <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-white border-4 border-kraft-accent shadow-lg" />
                                 <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-4">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-kraft-accent">{formatDate(h.date)}</span>
                                       <span className="px-3 py-1 bg-kraft-ink text-white text-[8px] font-black uppercase tracking-widest rounded-lg">{VEHICLE_STATUS_LABELS[h.status as VehicleStatus] || h.status}</span>
                                    </div>
                                    <div className="p-6 bg-white/40 rounded-[1.5rem] border border-white/60">
                                       <p className="text-sm font-black text-kraft-ink mb-1">{h.user}</p>
                                       <p className="text-sm text-kraft-ink/60">{h.note}</p>
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            <AnimatePresence>
              {isUpdatingStatus && (
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
                                    seller: userCode,
                                    receiver: userCode,
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
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">
                                {transitionStatus === VehicleStatus.IN_STOCK ? 'Giá bán niêm yết' : 'Giá bán chốt'}
                              </label>
                              <SmartAmountInput 
                                value={paymentForm.salePrice} 
                                onChange={v => setPaymentForm({...paymentForm, salePrice: v})} 
                              />
                            </div>

                            {transitionStatus !== VehicleStatus.IN_STOCK && (
                              <>
                                <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">
                                    {transitionStatus === VehicleStatus.SOLD ? 'Tổng tiền thanh toán' : 'Số tiền đặt cọc'}
                                  </label>
                                  <SmartAmountInput 
                                    value={paymentForm.amount} 
                                    onChange={v => setPaymentForm({...paymentForm, amount: v})} 
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Tên khách hàng</label>
                                  <input 
                                    className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent"
                                    value={paymentForm.buyerName} 
                                    onChange={e => setPaymentForm({...paymentForm, buyerName: e.target.value})}
                                    placeholder="Nhập tên khách..."
                                  />
                                </div>

                                <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Hoa hồng bán xe</label>
                                  <SmartAmountInput 
                                    value={paymentForm.commission} 
                                    onChange={v => setPaymentForm({...paymentForm, commission: v})} 
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Nhân viên bán xe</label>
                                  <select 
                                    className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent"
                                    value={paymentForm.seller} 
                                    onChange={e => setPaymentForm({...paymentForm, seller: e.target.value, receiver: e.target.value})}
                                  >
                                    {staffList.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                                  </select>
                                </div>
                              </>
                            )}

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Ghi chú</label>
                              <input 
                                className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 font-bold text-sm outline-none focus:border-kraft-accent"
                                value={paymentForm.note} 
                                onChange={e => setPaymentForm({...paymentForm, note: e.target.value})}
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
              )}
            </AnimatePresence>
          </motion.div>
        </div>,
        document.body
      )
    : null;
};

// Internal UI Components
const InfoBox = ({ label, value, icon: Icon, highlight }: any) => (
  <div className={cn(
    "flex items-center justify-between p-5 rounded-2xl border transition-all",
    highlight ? "bg-white border-kraft-accent/20" : "bg-white/20 border-white/60 hover:border-black/10"
  )}>
    <div className="flex items-center gap-3">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", highlight ? "bg-kraft-accent/10 text-kraft-accent" : "bg-black/5 text-kraft-ink/40")}>
          <Icon size={18} />
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</span>
    </div>
    <span className={cn("text-xs font-black tracking-tight", highlight ? "text-kraft-accent" : "text-kraft-ink")}>{value}</span>
  </div>
);

const EditRow = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">{label}</label>
     <input 
        type={type} value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 bg-white/40 border border-white/60 rounded-2xl px-6 font-bold text-sm focus:bg-white focus:border-kraft-accent outline-none transition-all"
     />
  </div>
);

const FinancialBox = ({ label, value, color }: any) => {
   const styles = {
      emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
      amber: "bg-amber-500/10 border-amber-500/20 text-amber-600",
      ink: "bg-kraft-ink/10 border-kraft-ink/20 text-kraft-ink",
   } as any;
   return (
      <div className={cn("p-6 rounded-[2rem] border flex flex-col items-center text-center gap-2", styles[color])}>
         <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</span>
         <span className="text-xl font-black tracking-tighter">{formatCurrency(value)}</span>
      </div>
   );
};
