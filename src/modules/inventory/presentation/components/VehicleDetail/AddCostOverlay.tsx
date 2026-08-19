import React, { useState, useEffect } from 'react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { Plus, FileText, Car, Sparkles, Building2, User } from 'lucide-react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { SectionHeader } from '@/src/shared/design-system/BaseCard';
import { Vehicle, CostItem, Staff } from '@/src/shared/domain/types';
import { formatCurrency } from '@/src/shared/utils/currency';
import { haptics } from '@/src/shared/utils/haptics';
import { motion } from 'motion/react';

interface AddCostOverlayProps {
   isOpen: boolean;
   onClose: () => void;
   onAdd: (name: string, amount: number, staffId?: string) => Promise<void>;
   isSubmitting: boolean;
   vehicle?: Vehicle;
   staffList?: Staff[];
   initialForm?: { name: string; amount: number };
}

const VEHICLE_COST_PRESETS = [
   { label: '🧴 Rửa xe & Dọn dẹp', name: 'Rửa xe và dọn dẹp nội thất' },
   { label: '🎨 Sơn dặm & Đánh bóng', name: 'Sơn dặm và đánh bóng' },
   { label: '🛢️ Thay dầu & Bảo dưỡng', name: 'Thay dầu và bảo dưỡng định kỳ' },
   { label: '📋 Đăng kiểm & Đường bộ', name: 'Phí đăng kiểm và đường bộ' },
   { label: '🛞 Thay lốp / Phụ tùng', name: 'Thay lốp và phụ tùng xe' },
];

const QUICK_AMOUNTS = [
   { label: '+500k', value: 500000 },
   { label: '+1tr', value: 1000000 },
   { label: '+2tr', value: 2000000 },
   { label: '+5tr', value: 5000000 },
];

export const AddCostOverlay: React.FC<AddCostOverlayProps> = ({
   isOpen,
   onClose,
   onAdd,
   isSubmitting,
   vehicle,
   staffList = [],
   initialForm
}) => {
   const [name, setName] = useState<string>(initialForm?.name || '');
   const [amount, setAmount] = useState<number>(initialForm?.amount || 0);
   const [paymentSource, setPaymentSource] = useState<'company' | 'staff'>('company');
   const [selectedStaffId, setSelectedStaffId] = useState<string>('');
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (isOpen) {
         // eslint-disable-next-line react-hooks/set-state-in-effect
         setName(initialForm?.name || '');
         setAmount(initialForm?.amount || 0);
         setPaymentSource('company');
         setSelectedStaffId('');
         setError(null);
      }
   }, [isOpen, initialForm]);

   const handleSelectPreset = (preset: typeof VEHICLE_COST_PRESETS[0]) => {
      haptics.light();
      setName(preset.name);
      if (error) setError(null);
   };

   const handleAddQuickAmount = (val: number) => {
      haptics.light();
      setAmount(prev => (prev || 0) + val);
      if (error) setError(null);
   };

   const handleConfirm = async () => {
      if (!name || name.trim() === '') {
         setError("Tên chi phí không được để trống");
         return;
      }
      if (!amount || amount <= 0) {
         setError("Số tiền phải lớn hơn 0 ₫");
         return;
      }
      if (paymentSource === 'staff' && !selectedStaffId) {
         setError("Vui lòng chọn nhân viên ứng tiền");
         return;
      }

      setError(null);
      await onAdd(name.trim(), amount, paymentSource === 'staff' ? selectedStaffId : undefined);
      onClose();
   };

   // Financial Simulation
   const currentTotalCost = Array.isArray(vehicle?.cost_history)
      ? vehicle.cost_history.reduce((sum: number, c: CostItem) => sum + (c.amount || 0), 0)
      : (vehicle?.total_cost || 0);
   const currentCOGS = (vehicle?.purchase_price || 0) + currentTotalCost;
   const newCOGS = currentCOGS + (amount || 0);
   const hasSalePrice = vehicle?.sale_price && vehicle.sale_price > 0;
   const currentProfit = hasSalePrice ? (vehicle!.sale_price! - currentCOGS) : null;
   const newProfit = hasSalePrice ? (vehicle!.sale_price! - newCOGS) : null;

   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         maxWidth="lg"
         title="Ghi nhận chi phí xe"
         subtitle={vehicle ? `Hạng mục làm đẹp, bảo dưỡng cho xe ${vehicle.name} (${vehicle.code})` : "Hạng mục làm đẹp, bảo dưỡng cho xe"}
         icon={Plus}
         height="auto"
      >
         <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }} className="flex-1 flex flex-col overflow-hidden">
            <ModalBody className="flex-1">
               <div className="space-y-4 md:space-y-5 py-0.5">
                  {/* Nguồn tiền chi trả: Quỹ Showroom (Mặc định) vs Nhân viên ứng */}
                  <div className="space-y-2">
                     <span className="text-[10px] font-black uppercase tracking-wider text-sub-label block px-1">
                        Hình thức thanh toán
                     </span>
                     <div className="grid grid-cols-2 gap-2">
                        <motion.button
                           whileTap={{ scale: 0.97 }}
                           type="button"
                           onClick={() => {
                              haptics.light();
                              setPaymentSource('company');
                              setSelectedStaffId('');
                              if (error) setError(null);
                           }}
                           className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              paymentSource === 'company'
                                 ? 'bg-brand/10 border-brand/40 text-brand shadow-xs font-black'
                                 : 'bg-surface-soft/60 border-hairline-soft text-sub-label hover:text-kraft-ink'
                           }`}
                        >
                           <Building2 size={16} />
                           <div className="text-left">
                              <span className="text-[11px] block leading-tight">Quỹ Showroom chi</span>
                              <span className="text-[9px] opacity-70 block font-normal">(Mặc định công ty chi)</span>
                           </div>
                        </motion.button>

                        <motion.button
                           whileTap={{ scale: 0.97 }}
                           type="button"
                           onClick={() => {
                              haptics.light();
                              setPaymentSource('staff');
                              if (error) setError(null);
                           }}
                           className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              paymentSource === 'staff'
                                 ? 'bg-warning/10 border-warning/40 text-warning shadow-xs font-black'
                                 : 'bg-surface-soft/60 border-hairline-soft text-sub-label hover:text-kraft-ink'
                           }`}
                        >
                           <User size={16} />
                           <div className="text-left">
                              <span className="text-[11px] block leading-tight">Nhân viên ứng trước</span>
                              <span className="text-[9px] opacity-70 block font-normal">(Hoàn ứng sau)</span>
                           </div>
                        </motion.button>
                     </div>

                     {paymentSource === 'staff' && (
                        <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           className="pt-1"
                        >
                           <BaseSelect
                              label="Nhân viên ứng tiền"
                              required
                              value={selectedStaffId}
                              onChange={e => {
                                 setSelectedStaffId(e.target.value);
                                 if (error) setError(null);
                              }}
                              variant="dense"
                              icon={User}
                              error={error && paymentSource === 'staff' && !selectedStaffId ? error : undefined}
                           >
                              <option value="">-- Chọn nhân viên ứng tiền --</option>
                              {staffList.map(s => (
                                 <option key={s.id} value={s.id}>
                                    {s.name} ({s.role})
                                 </option>
                              ))}
                           </BaseSelect>
                        </motion.div>
                     )}
                  </div>

                  {/* Quick Category Chips */}
                  <div className="space-y-2">
                     <div className="flex items-center gap-1.5 px-1">
                        <Sparkles size={12} className="text-warning" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-sub-label">
                           Gợi ý làm đẹp nhanh
                        </span>
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                        {VEHICLE_COST_PRESETS.map((preset) => {
                           const isSelected = name === preset.name;
                           return (
                              <motion.button
                                 key={preset.label}
                                 type="button"
                                 whileTap={{ scale: 0.95 }}
                                 onClick={() => handleSelectPreset(preset)}
                                 className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border cursor-pointer ${
                                    isSelected
                                       ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                       : 'bg-surface-soft/80 text-kraft-ink hover:bg-surface-soft border-hairline-soft'
                                 }`}
                              >
                                 {preset.label}
                              </motion.button>
                           );
                        })}
                     </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3.5 pt-1">
                     <SectionHeader accentColor="bg-warning" noMargin className="mb-1 md:mb-3">
                        Thông tin chi phí
                     </SectionHeader>

                     <BaseInput
                        label="Tên hạng mục chi phí"
                        placeholder="VD: Thay dầu, Sơn dặm, Rửa xe..."
                        value={name}
                        onChange={e => {
                           setName(e.target.value);
                           if (error) setError(null);
                        }}
                        icon={FileText}
                        autoFocus
                        variant="dense"
                        error={error && !name ? error : undefined}
                     />

                     <div className="space-y-1.5">
                        <SmartAmountInput
                           label="Số tiền thực chi"
                           value={amount}
                           onChange={v => {
                              setAmount(v);
                              if (error) setError(null);
                           }}
                           placeholder="VD: 500k, 1.5tr..."
                           variant="dense"
                           error={error && amount <= 0 ? error : undefined}
                        />

                        {/* Quick Add Amount Buttons */}
                        <div className="flex items-center gap-1.5 pt-1 px-1">
                           <span className="text-[9px] font-black uppercase text-sub-label tracking-wider mr-1">Cộng nhanh:</span>
                           {QUICK_AMOUNTS.map(q => (
                              <button
                                 key={q.label}
                                 type="button"
                                 onClick={() => handleAddQuickAmount(q.value)}
                                 className="px-2.5 py-1 rounded-full bg-surface-soft hover:bg-black/5 text-[10px] font-mono font-bold text-kraft-ink border border-hairline-soft cursor-pointer transition-colors active:scale-95"
                              >
                                 {q.label}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {error && (
                     <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-100 text-[10px] font-bold text-red-500 uppercase tracking-tight animate-shake">
                        {error}
                     </div>
                  )}

                  {/* Real-time Financial Impact Simulation */}
                  <div className="p-3.5 md:p-4 bg-amber-50/60 rounded-2xl border border-amber-200/50 space-y-2">
                     <div className="flex items-center gap-2 text-amber-900">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700 shrink-0">
                           <Car size={13} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider">
                           Mô phỏng tác động giá vốn & P&L
                        </span>
                     </div>

                     <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/40 text-[11px]">
                        <div className="space-y-0.5">
                           <span className="text-[9px] font-black uppercase tracking-wider text-amber-900/60 block">
                              Tổng giá vốn mới
                           </span>
                           <span className="font-black text-expense">
                              {formatCurrency(newCOGS)}
                              {amount > 0 && <span className="text-[9px] font-normal text-sub-label ml-1">(+{formatCurrency(amount)})</span>}
                           </span>
                        </div>

                        {hasSalePrice && currentProfit !== null && newProfit !== null && (
                           <div className="space-y-0.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-900/60 block">
                                 Lợi nhuận gộp mới
                              </span>
                              <span className={`font-black ${newProfit >= 0 ? 'text-emerald-700' : 'text-expense'}`}>
                                 {formatCurrency(newProfit)}
                              </span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </ModalBody>

            <ModalFooter
               onSubmit={handleConfirm}
               isSubmitting={isSubmitting}
               submitLabel="Ghi nhận chi"
               error={error}
            />
         </form>
      </Modal>
   );
};

