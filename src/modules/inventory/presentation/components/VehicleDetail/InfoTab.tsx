import React from 'react';
import { motion } from 'motion/react';
import { 
   Calendar, TrendingUp, Clock, User, Trash2, AlertCircle, 
   ShieldAlert, Sparkles
} from 'lucide-react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { formatCurrency } from '@/src/shared/utils/currency';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { BaseInput, BaseSelect, BaseTextArea } from '@/src/shared/design-system/FormElements';
import { AlertBlock } from './VehicleDetailModalShared';
import { PillButton, ExecutiveSection } from '@/src/shared/design-system/ExecutiveModules';
import { cn } from '@/src/shared/utils/cn';

interface InfoTabProps {
   vehicle: Vehicle;
   isEditing: boolean;
   editForm: Partial<Vehicle>;
   setEditForm: React.Dispatch<React.SetStateAction<Partial<Vehicle>>>;
   staffList: Staff[];
   userRole: string;
   isSubmitting: boolean;
   handleDeleteVehicle: (id: number) => Promise<void>;
   showDeleteConfirm: boolean;
   setShowDeleteConfirm: (val: boolean) => void;
}

export const InfoTab: React.FC<InfoTabProps> = ({
   vehicle,
   isEditing,
   editForm,
   setEditForm,
   staffList,
   userRole,
   isSubmitting,
   handleDeleteVehicle,
   showDeleteConfirm,
   setShowDeleteConfirm
}) => {
   const agingDays = vehicle.purchase_date 
      ? Math.max(0, Math.floor((new Date().getTime() - new Date(vehicle.purchase_date).getTime()) / (1000 * 60 * 60 * 24)))
      : (vehicle.days || 0);

   const isLongAging = agingDays >= 45;

   return (
      <motion.div
         key="info"
         initial={{ opacity: 0, x: 16 }}
         animate={{ opacity: 1, x: 0 }}
         exit={{ opacity: 0, x: -16 }}
         transition={{ duration: 0.2 }}
         className="space-y-6 pb-24 md:pb-8"
      >
         {isEditing ? (
            /* ═════════════════════════════════════════════════════════
               CHẾ ĐỘ CHỈNH SỬA (EDIT MODE - FIELD STANDARDIZATION)
               ═════════════════════════════════════════════════════════ */
            <div className="space-y-6">
               <ExecutiveSection title="Thông tin cơ bản" animate>
                  <div className="space-y-4">
                     <BaseInput
                        label="Tên xe"
                        icon={Sparkles}
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="VD: VinFast VF5 Plus"
                     />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BaseInput
                           label="Năm sản xuất"
                           type="number"
                           icon={Calendar}
                           value={String(editForm.year || '')}
                           onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                           placeholder="VD: 2023"
                        />
                        <BaseInput
                           label="Màu sắc ngoại thất"
                           icon={Sparkles}
                           value={editForm.color || ''}
                           onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                           placeholder="VD: Đỏ / Nóc trắng"
                        />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-widest text-sub-label leading-none block">
                              Số ODO hiện tại
                           </label>
                           <SmartAmountInput
                              value={editForm.odo || 0}
                              onChange={(v) => setEditForm({ ...editForm, odo: v })}
                              suffix=" km"
                              icon={Clock}
                              showTextPreview={false}
                           />
                        </div>
                        <BaseInput
                           label="Tên khách hàng liên hệ"
                           icon={User}
                           value={editForm.customer_name || ''}
                           onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                           placeholder="Dành cho xe đã bán hoặc nhận cọc"
                        />
                     </div>
                  </div>
               </ExecutiveSection>

               <ExecutiveSection title="Giá bán & Chi phí nhập" divider animate>
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-widest text-sub-label leading-none block">
                              Giá nhập xe (Vốn ban đầu)
                           </label>
                           <SmartAmountInput
                              value={editForm.purchase_price || 0}
                              onChange={(v) => setEditForm({ ...editForm, purchase_price: v })}
                              placeholder="VD: 850tr"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-widest text-sub-label leading-none block">
                              Giá chào bán niêm yết
                           </label>
                           <SmartAmountInput
                              value={editForm.sale_price || 0}
                              onChange={(v) => setEditForm({ ...editForm, sale_price: v })}
                              placeholder="VD: 920tr"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-widest text-sub-label leading-none block">
                              Lương mua xe (Hoa hồng nhập)
                           </label>
                           <SmartAmountInput
                              value={editForm.buying_commission || 0}
                              onChange={(v) => setEditForm({ ...editForm, buying_commission: v })}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black uppercase tracking-widest text-sub-label leading-none block">
                              Thưởng nóng mua xe
                           </label>
                           <div className="flex items-center gap-3">
                              <div className="flex-1">
                                 <SmartAmountInput
                                    value={editForm.buying_bonus || 0}
                                    onChange={(v) => setEditForm({ ...editForm, buying_bonus: v })}
                                 />
                              </div>
                              <div className="flex items-center gap-2 px-4 h-14 bg-white border border-hairline-soft rounded-2xl shrink-0">
                                 <input
                                    type="checkbox"
                                    id="buying_bonus_paid"
                                    checked={editForm.buying_bonus_paid || false}
                                    onChange={(e) => setEditForm({ ...editForm, buying_bonus_paid: e.target.checked })}
                                    className="w-5 h-5 accent-kraft-accent cursor-pointer"
                                 />
                                 <label htmlFor="buying_bonus_paid" className="text-xs font-black text-kraft-ink cursor-pointer">
                                    Đã chi
                                 </label>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </ExecutiveSection>

               <ExecutiveSection title="Nhân sự phụ trách" divider animate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <BaseSelect
                        label="Nhân viên mua xe"
                        value={editForm.buyer || ''}
                        onChange={(e) => {
                           const selected = staffList.find(s => s.code === e.target.value);
                           setEditForm({
                              ...editForm,
                              buyer: e.target.value,
                              buyer_name: selected ? selected.name : ''
                           });
                        }}
                     >
                        <option value="">Chưa phân bổ</option>
                        {staffList.map(staff => (
                           <option key={staff.code} value={staff.code}>
                              {staff.name} ({staff.code})
                           </option>
                        ))}
                     </BaseSelect>

                     <BaseSelect
                        label="Nhân viên bán xe"
                        value={editForm.seller || ''}
                        onChange={(e) => {
                           const selected = staffList.find(s => s.code === e.target.value);
                           setEditForm({
                              ...editForm,
                              seller: e.target.value,
                              seller_name: selected ? selected.name : ''
                           });
                        }}
                     >
                        <option value="">Chưa phân bổ</option>
                        {staffList.map(staff => (
                           <option key={staff.code} value={staff.code}>
                              {staff.name} ({staff.code})
                           </option>
                        ))}
                     </BaseSelect>
                  </div>
               </ExecutiveSection>

               <ExecutiveSection title="Ghi chú nội bộ" divider animate>
                  <BaseTextArea
                     label="Ghi chú hồ sơ xe"
                     value={editForm.notes || ''}
                     onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                     placeholder="Nhập tình trạng pháp lý, phụ kiện đi kèm, cam kết kỹ thuật..."
                     rows={3}
                  />
               </ExecutiveSection>
            </div>
         ) : (
            /* ═════════════════════════════════════════════════════════
               CHẾ ĐỘ XEM (VIEW MODE - EXECUTIVE BENTO GRID)
               ═════════════════════════════════════════════════════════ */
            <div className="space-y-5">
               {/* ── BENTO 1: THƯƠNG MẠI & GIÁ BÁN (HERO TARGET CARD) ── */}
               <div className="bg-white rounded-2xl md:rounded-[22px] border border-hairline-soft p-4 md:p-5 space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline-soft pb-3">
                     <div className="flex items-center gap-2 text-kraft-ink">
                        <div className="w-7 h-7 rounded-lg bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
                           <TrendingUp size={15} strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-kraft-ink">
                           Giá chào bán (Target Niêm Yết)
                        </span>
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-sub-label bg-black/[0.04] border border-black/5 px-3 py-1 rounded-full whitespace-nowrap w-fit">
                        Niêm yết Showroom
                     </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                     <div className="space-y-0.5">
                        <p className="text-2xl sm:text-3xl font-black text-kraft-ink tracking-tight whitespace-nowrap">
                           {Number(vehicle.sale_price) > 0 ? formatCurrency(Number(vehicle.sale_price)) : 'Chưa niêm yết'}
                        </p>
                     </div>

                     {/* Hero Metric Pill: Lưu kho */}
                     <div className="flex items-center gap-2 flex-wrap">
                        <div className={cn(
                           "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap shadow-2xs",
                           isLongAging ? "bg-warning/10 border-warning/20 text-warning" : "bg-surface-soft border-hairline-soft text-kraft-ink"
                        )}>
                           <Clock size={12} className={isLongAging ? "text-warning" : "text-sub-label"} />
                           <span>Lưu kho: <strong className="font-black">{agingDays}</strong> ngày</span>
                           {isLongAging && <ShieldAlert size={12} className="text-warning ml-0.5" />}
                        </div>
                     </div>
                  </div>
               </div>

               {/* ── BENTO 2: THÔNG SỐ XE & KHÁCH HÀNG ── */}
               {vehicle.customer_name && (
                  <div className="bg-white rounded-2xl md:rounded-[22px] border border-hairline-soft p-4 md:p-5 shadow-2xs space-y-3">
                     <div className="p-3.5 bg-kraft-accent/5 rounded-[18px] border border-kraft-accent/15 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-kraft-accent">
                           <User size={14} />
                           <span className="text-[10px] font-black uppercase tracking-wider">Khách hàng liên hệ:</span>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-kraft-accent whitespace-nowrap">
                           {vehicle.customer_name}
                        </span>
                     </div>
                  </div>
               )}

               {/* ── BENTO 3: PHÂN BỔ NHÂN SỰ PHỤ TRÁCH ── */}
               <div className="bg-white rounded-2xl md:rounded-[22px] border border-hairline-soft p-4 md:p-5 shadow-2xs space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sub-label mb-2">
                     Nhân sự phụ trách
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {/* NV Nhập */}
                     <div className="p-3.5 bg-surface-soft rounded-[18px] border border-hairline-soft flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-black/[0.04] flex items-center justify-center text-kraft-ink/60 shrink-0">
                           <User size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                           <span className="text-[9px] font-black uppercase tracking-wider text-sub-label block">
                              Nhân viên Nhập (Mua xe)
                           </span>
                           <p className="text-xs sm:text-sm font-black text-kraft-ink truncate mt-0.5">
                              {vehicle.buyer_name || staffList.find(s => s.code === vehicle.buyer)?.name || vehicle.buyer || '---'}
                           </p>
                           {vehicle.buyer && (
                              <span className="text-[10px] font-mono text-sub-label font-bold">
                                 Mã: {vehicle.buyer}
                              </span>
                           )}
                        </div>
                     </div>

                     {/* NV Bán */}
                     <div className="p-3.5 bg-surface-soft rounded-[18px] border border-hairline-soft flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-black/[0.04] flex items-center justify-center text-kraft-ink/60 shrink-0">
                           <User size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                           <span className="text-[9px] font-black uppercase tracking-wider text-sub-label block">
                              Nhân viên Bán (Xuất xe)
                           </span>
                           <p className="text-xs sm:text-sm font-black text-kraft-ink truncate mt-0.5">
                              {staffList.find(s => s.code === vehicle.seller)?.name || vehicle.seller || 'Chưa phân bổ'}
                           </p>
                           {vehicle.seller && (
                              <span className="text-[10px] font-mono text-sub-label font-bold">
                                 Mã: {vehicle.seller}
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               {/* ── BENTO 4: GHI CHÚ NỘI BỘ ── */}
               <div className="bg-white rounded-2xl md:rounded-[22px] border border-hairline-soft p-4 md:p-5 shadow-2xs space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sub-label">
                     Ghi chú nội bộ & Tình trạng xe
                  </p>
                  <div className="p-3.5 bg-surface-soft/60 rounded-[18px] border border-hairline-soft min-h-[56px]">
                     <p className="text-xs sm:text-sm text-kraft-ink/75 italic leading-relaxed">
                        {vehicle.notes ? `"${vehicle.notes}"` : 'Không có ghi chú đặc biệt cho chiếc xe này.'}
                     </p>
                  </div>
               </div>

               {/* ── BENTO 5: NÚT XÓA XE (CHỈ CHO ACCOUNTANT / ADMIN) ── */}
               {PermissionService.canDeleteVehicle(userRole) && (
                  <div className="pt-4 flex justify-end">
                     <PillButton
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="ghost"
                        icon={Trash2}
                        className="text-expense hover:text-expense hover:border-expense/20 text-xs font-black uppercase tracking-wider"
                     >
                        Xóa xe khỏi kho
                     </PillButton>

                     <Modal 
                        isOpen={showDeleteConfirm} 
                        onClose={() => setShowDeleteConfirm(false)} 
                        title="Xác nhận xóa xe" 
                        maxWidth="md"
                     >
                        <ModalBody>
                           <AlertBlock
                              variant="danger"
                              icon={AlertCircle}
                              title="Xóa vĩnh viễn xe và dữ liệu liên quan?"
                              description={
                                 <div className="space-y-2 text-xs">
                                    <p>Thao tác này sẽ xóa vĩnh viễn thông tin xe <strong>{vehicle.name} ({vehicle.code})</strong> cùng các khoản chi phí, thanh toán liên quan.</p>
                                    <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">
                                       Lưu ý: Dữ liệu báo cáo tài chính sẽ được tính toán lại sau khi xóa!
                                    </p>
                                 </div>
                              }
                           />
                        </ModalBody>
                        <ModalFooter 
                           onCancel={() => setShowDeleteConfirm(false)} 
                           onDelete={() => handleDeleteVehicle(vehicle.id)}
                           deleteLabel="Xóa vĩnh viễn"
                           isSubmitting={isSubmitting}
                        />
                     </Modal>
                  </div>
               )}
            </div>
         )}
      </motion.div>
   );
};
