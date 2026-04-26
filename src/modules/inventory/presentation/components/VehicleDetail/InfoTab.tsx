import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Award, TrendingUp, MapPin, Clock, User, TrendingDown, Trash2, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Vehicle } from '@/src/shared/domain/types';
import { UserRole } from '@/src/shared/domain/constants';
import { formatCurrency } from '@/src/utils/currency';
import { InfoBox, EditRow, formatDate } from './VehicleDetailModalShared';

interface InfoTabProps {
   vehicle: Vehicle;
   isEditing: boolean;
   editForm: Partial<Vehicle>;
   setEditForm: React.Dispatch<React.SetStateAction<Partial<Vehicle>>>;
   staffList: any[];
   userRole: string;
   canSeeFullInfo: boolean;
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
   canSeeFullInfo,
   isSubmitting,
   handleDeleteVehicle,
   showDeleteConfirm,
   setShowDeleteConfirm
}) => {
   return (
      <motion.div
         key="info"
         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
         className="grid grid-cols-1 md:grid-cols-2 gap-12"
      >
         <section className="space-y-6">
            <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] text-kraft-accent px-2">Đặc điểm xe</h4>
            <div className="space-y-3">
               {isEditing ? (
                  <>
                     <EditRow label="Tên xe" value={editForm.name} onChange={(v: string) => setEditForm({ ...editForm, name: v })} />
                     <div className="grid grid-cols-2 gap-4">
                        <EditRow label="Năm SX" value={editForm.year} onChange={(v: string) => setEditForm({ ...editForm, year: Number(v) })} type="number" />
                        <EditRow label="Màu sắc" value={editForm.color} onChange={(v: string) => setEditForm({ ...editForm, color: v })} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sub-label ml-2">Số ODO (km)</label>
                        <SmartAmountInput
                           value={editForm.odo || 0}
                           onChange={v => setEditForm({ ...editForm, odo: v })}
                           suffix=" km" icon={Clock} showTextPreview={false}
                        />
                     </div>
                  </>
               ) : (
                  <>
                     <InfoBox label="Mã xe" value={vehicle.code} icon={Award} highlight />
                     <InfoBox label="Năm SX" value={vehicle.year} icon={Calendar} highlight />
                     <InfoBox label="Số ODO" value={`${(vehicle.odo || 0).toLocaleString()} km`} icon={TrendingUp} highlight />
                     <InfoBox label="Màu sắc" value={vehicle.color || '---'} icon={MapPin} highlight />
                  </>
               )}
            </div>
         </section>

         <section className="space-y-6">
            <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] text-kraft-accent px-2">Thông tin nhập kho</h4>
            <div className="space-y-3">
               {isEditing ? (
                  <>
                     <div className="space-y-4">
                        <label className="text-sub-label ml-2">Giá nhập xe</label>
                        <SmartAmountInput value={editForm.purchase_price || 0} onChange={v => setEditForm({ ...editForm, purchase_price: v })} />
                     </div>
                     <div className="space-y-4">
                        <label className="text-sub-label ml-2">Giá chào bán</label>
                        <SmartAmountInput value={editForm.sale_price || 0} onChange={v => setEditForm({ ...editForm, sale_price: v })} />
                     </div>
                     <div className="space-y-4">
                        <label className="text-sub-label ml-2">Hoa hồng nhập (Mua xe)</label>
                        <SmartAmountInput value={editForm.buying_commission || 0} onChange={v => setEditForm({ ...editForm, buying_commission: v })} />
                     </div>
                     <div className="space-y-4">
                        <label className="text-sub-label ml-2">Hoa hồng bán xe (Commission)</label>
                        <SmartAmountInput value={editForm.commission || 0} onChange={v => setEditForm({ ...editForm, commission: v })} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sub-label ml-2">Chốt nhập bởi</label>
                        <div className="relative group">
                           <User className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                           <select
                              className="w-full h-14 bg-white/40 border border-white/60 rounded-2xl pl-12 pr-10 font-bold text-sm focus:bg-white focus:border-kraft-accent outline-none appearance-none transition-all"
                              value={editForm.buyer || ''} onChange={(e) => setEditForm({ ...editForm, buyer: e.target.value })}
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
                        <label className="text-sub-label ml-2">Chốt bán bởi</label>
                        <div className="relative group">
                           <User className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                           <select
                              className="w-full h-14 bg-white/40 border border-white/60 rounded-2xl pl-12 pr-10 font-bold text-sm focus:bg-white focus:border-kraft-accent outline-none appearance-none transition-all"
                              value={editForm.seller || ''} onChange={(e) => setEditForm({ ...editForm, seller: e.target.value })}
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
                     <InfoBox label="Ngày nhập kho" value={formatDate(vehicle.purchase_date)} icon={Calendar} highlight />
                     {canSeeFullInfo && (
                        <InfoBox label="Nhân viên nhập" value={vehicle.buyer || '---'} icon={User} highlight />
                     )}
                     {vehicle.seller && (
                        <InfoBox label="Nhân viên bán" value={vehicle.seller || '---'} icon={User} highlight />
                     )}
                     {canSeeFullInfo && <InfoBox label="Hoa hồng mua" value={formatCurrency(vehicle.buying_commission || 0)} icon={Award} highlight />}
                     {canSeeFullInfo && <InfoBox label="Hoa hồng bán" value={formatCurrency(vehicle.commission || 0)} icon={Award} highlight />}
                     {canSeeFullInfo && <InfoBox label="Giá nhập xe" value={formatCurrency(vehicle.purchase_price)} icon={TrendingDown} highlight />}
                     {(vehicle.sale_price || 0) > 0 && <InfoBox label="Giá chào bán" value={formatCurrency(vehicle.sale_price || 0)} icon={TrendingUp} highlight />}
                  </>
               )}
            </div>
         </section>

         <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent px-2">Ghi chú nội bộ</h4>
            <div className="p-8 bg-white/80 rounded-t2 border border-white/100 italic text-sm text-kraft-ink/80 min-h-[120px]">
               {vehicle.notes || 'Không có ghi chú nào cho chiếc xe này.'}
            </div>
         </div>

         {(userRole === UserRole.ADMIN) && (
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
                           <div className="flex-1">
                              <p className="text-xs font-black text-red-900 uppercase tracking-tighter">Xác nhận xóa xe và dữ liệu tài chính?</p>
                              <p className="text-[10px] text-red-700/60 font-bold max-w-[300px]">Thao tác này sẽ xóa vĩnh viễn xe, các khoản thanh toán, chi phí spa và ảnh. **Dữ liệu báo cáo tài chính sẽ bị thay đổi.**</p>
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
   );
};
