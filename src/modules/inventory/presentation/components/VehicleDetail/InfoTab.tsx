import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Award, TrendingUp, MapPin, Clock, User, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { DESIGN_TOKENS } from '@/src/shared/design-system/tokens';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from './VehicleDetailModalShared';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { BaseSelect, BaseTextArea } from '@/src/shared/design-system/FormElements';
import { GlassSection } from '@/src/shared/design-system/BaseCard';
import { InfoBox, EditRow, AlertBlock } from './VehicleDetailModalShared';
import { PillButton, DataRow, ExecutiveSection } from '@/src/shared/design-system/ExecutiveModules';

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
   return (
      <motion.div
         key="info"
         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
         className="flex flex-col gap-0"
      >
         <ExecutiveSection title="Đặc điểm xe" animate>
            <div className="space-y-3">
               {isEditing ? (
                  <>
                     <EditRow label="Tên xe" value={editForm.name} onChange={(v: string) => setEditForm({ ...editForm, name: v })} />
                     <div className="grid grid-cols-2 gap-6">
                        <EditRow label="Năm SX" value={editForm.year} onChange={(v: string) => setEditForm({ ...editForm, year: v })} type="number" />
                        <EditRow label="Màu sắc" value={editForm.color} onChange={(v: string) => setEditForm({ ...editForm, color: v })} />
                     </div>
                     <div className="space-y-4">
                        <label className="text-sub-label ml-2">Số ODO (km)</label>
                        <SmartAmountInput
                           value={editForm.odo || 0}
                           onChange={v => setEditForm({ ...editForm, odo: v })}
                           suffix=" km" icon={Clock} showTextPreview={false}
                        />
                     </div>
                     <div className="space-y-4">
                        <BaseSelect
                           label="Trạng thái Pin (Chỉ dành cho xe điện VinFast)"
                           value={editForm.battery_type || 'None'}
                           onChange={(e) => setEditForm({ ...editForm, battery_type: e.target.value })}
                        >
                           <option value="None">Không (Xe xăng / Khác)</option>
                           <option value="Pin Thuê">Pin Thuê</option>
                           <option value="Pin Mua Đứt">Pin Mua Đứt</option>
                        </BaseSelect>
                     </div>
                     <EditRow label="Tên khách hàng" value={editForm.customer_name} onChange={(v: string) => setEditForm({ ...editForm, customer_name: v })} placeholder="Dành cho xe đã bán hoặc nhận cọc" />
                  </>
               ) : (
                    <GlassSection noPadding className="border-white/60 shadow-kraft-deep overflow-hidden">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-g2">
                         <DataRow label="Mã xe" value={<span className="text-base md:text-sm font-black tracking-tight">{vehicle.code}</span>} icon={Award} highlight className="border-b md:border-b-0 md:border-r border-hairline-soft" />
                         <DataRow label="Năm SX" value={<span className="text-base md:text-sm font-black tracking-tight">{vehicle.year}</span>} icon={Calendar} className="border-b md:border-b-0 md:border-r border-hairline-soft" />
                         <DataRow label="Số ODO" value={<span className="text-base md:text-sm font-black tracking-tight">{`${(vehicle.odo || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} km`}</span>} icon={TrendingUp} className="border-b md:border-b-0 md:border-r border-hairline-soft" />
                         <DataRow label="Màu sắc" value={<span className="text-base md:text-sm font-black tracking-tight">{vehicle.color || '---'}</span>} icon={MapPin} className="border-b md:border-b-0 md:border-r border-hairline-soft" />
                         <DataRow label="Trạng thái Pin" value={<span className="text-base md:text-sm font-black tracking-tight">{vehicle.battery_type && vehicle.battery_type !== 'None' ? vehicle.battery_type : 'Không có'}</span>} icon={Layers} className="border-b md:border-b-0" />
                      </div>
                      {vehicle.customer_name && (
                         <div className="border-t border-hairline-soft bg-kraft-accent/[0.03]">
                            <DataRow label="Khách hàng hiện tại" value={vehicle.customer_name} icon={User} highlight />
                         </div>
                      )}
                    </GlassSection>
               )}
            </div>
         </ExecutiveSection>

         <ExecutiveSection title="Thông tin nhập kho" divider animate>
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <label className="text-sub-label ml-2">Hoa hồng nhập (Lương mua)</label>
                           <SmartAmountInput value={editForm.buying_commission || 0} onChange={v => setEditForm({ ...editForm, buying_commission: v })} />
                        </div>
                        <div className="space-y-4">
                           <label className="text-sub-label ml-2 text-kraft-accent font-black uppercase tracking-widest text-[10px]">Thưởng mua</label>
                           <div className="flex items-center gap-4">
                              <div className="flex-1">
                                 <SmartAmountInput value={editForm.buying_bonus || 0} onChange={v => setEditForm({ ...editForm, buying_bonus: v })} />
                              </div>
                              <div className="flex items-center gap-2 px-4 h-14 bg-white/40 border border-white/60 rounded-2xl">
                                 <input 
                                    type="checkbox" 
                                    checked={editForm.buying_bonus_paid || false} 
                                    onChange={(e) => setEditForm({ ...editForm, buying_bonus_paid: e.target.checked })}
                                    className="w-5 h-5 accent-kraft-accent"
                                 />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">Đã chi</span>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-sub-label ml-2">Hoa hồng bán xe (Commission)</label>
                        <SmartAmountInput value={editForm.commission || 0} onChange={v => setEditForm({ ...editForm, commission: v })} />
                     </div>
                      <div className="space-y-4">
                         <BaseSelect
                            label="Nhân viên nhập"
                            icon={User}
                            value={editForm.buyer || ""}
                            onChange={(e) => setEditForm({ ...editForm, buyer: e.target.value })}
                         >
                            <option value="">Nhân viên...</option>
                            {staffList.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                         </BaseSelect>
                      </div>
                      <div className="space-y-4">
                         <BaseSelect
                            label="Nhân viên bán"
                            icon={User}
                            value={editForm.seller || ""}
                            onChange={(e) => setEditForm({ ...editForm, seller: e.target.value })}
                         >
                            <option value="">Nhân viên...</option>
                            {staffList.map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                         </BaseSelect>
                      </div>
                  </>
               ) : (
                  <div className={cn("space-y-8", DESIGN_TOKENS.layout.container_px)}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 -mx-4">
                        <InfoBox 
                           label="Nhân viên nhập" 
                           value={vehicle.buyer_name || staffList.find(s => s.code === vehicle.buyer)?.name || vehicle.buyer || '---'} 
                           icon={User} 
                        />
                        <InfoBox 
                           label="Nhân viên bán" 
                           value={staffList.find(s => s.code === vehicle.seller)?.name || vehicle.seller || '---'} 
                           icon={User} 
                        />
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-g4 -mx-4">
                        {/* Thời gian lưu kho */}
                        <div className={cn("bg-surface-soft rounded-t2 border border-hairline-soft flex flex-col justify-between shadow-sm p-6 lg:p-8", DESIGN_TOKENS.layout.item_px)}>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-sub-label mb-2">Lưu kho</p>
                              <p className="text-4xl lg:text-3xl font-black text-kraft-ink tracking-tighter">
                                 {Math.floor((new Date().getTime() - new Date(vehicle.purchase_date || '').getTime()) / (1000 * 60 * 60 * 24))} <span className="text-xs text-sub-label">ngày</span>
                              </p>
                           </div>
                           <div className="mt-4 pt-4 border-t border-hairline-soft flex items-center gap-2">
                              <Clock size={12} className="text-sub-label opacity-40" />
                              <span className="text-[10px] font-bold text-sub-label opacity-30 uppercase tracking-widest">Tính từ ngày nhập</span>
                           </div>
                        </div>

                        {/* Ngày nhập thực tế */}
                        <div className={cn("bg-white rounded-t2 border border-hairline-soft flex flex-col justify-between shadow-sm p-6 lg:p-8", DESIGN_TOKENS.layout.item_px)}>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-sub-label mb-2">Ngày nhập thực tế</p>
                              <p className="text-2xl lg:text-xl font-black text-kraft-ink tracking-tighter">
                                 {vehicle.purchase_date ? formatDate(vehicle.purchase_date) : '---'}
                              </p>
                           </div>
                           <div className="mt-4 pt-4 border-t border-hairline-soft flex items-center gap-2">
                              <Calendar size={12} className="text-sub-label opacity-30" />
                           </div>
                        </div>

                        {/* Giá chào bán */}
                        <div className={cn("bg-income/5 rounded-t2 border border-income/10 flex flex-col justify-between shadow-sm p-6 lg:p-8", DESIGN_TOKENS.layout.item_px)}>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-income opacity-60 mb-2">Giá chào bán (Target)</p>
                              <p className="text-3xl lg:text-2xl font-black text-income tracking-tighter">
                                 {Number(vehicle.sale_price) > 0 ? formatCurrency(Number(vehicle.sale_price)) : '---'}
                              </p>
                           </div>
                           <div className="mt-4 pt-4 border-t border-income/10 flex items-center gap-2">
                              <TrendingUp size={12} className="text-income opacity-40" />
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </ExecutiveSection>

          <ExecutiveSection title="Ghi chú nội bộ" divider animate>
             {isEditing ? (
                <div className="pt-2">
                   <BaseTextArea 
                      placeholder="Mô tả chi tiết tình trạng xe, lịch sử bảo dưỡng..."
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="min-h-[150px] italic shadow-inner bg-black/[0.01]"
                   />
                </div>
             ) : (
                <GlassSection className="italic text-sm text-kraft-ink/60 min-h-[120px] shadow-sm py-8">
                   {vehicle.notes || 'Không có ghi chú nào cho chiếc xe này.'}
                </GlassSection>
             )}
          </ExecutiveSection>

         {PermissionService.canDeleteVehicle(userRole) && (
            <div className="pt-8 mt-4 border-t border-hairline-soft flex justify-end">
               <PillButton
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="ghost"
                  icon={Trash2}
                  className="text-expense hover:text-expense hover:border-expense/20"
               >
                  Xóa xe khỏi kho
               </PillButton>

               <Modal 
                  isOpen={showDeleteConfirm} 
                  onClose={() => setShowDeleteConfirm(false)} 
                  title="Xóa xe" 
                  maxWidth="md"
               >
                  <ModalBody>
                      <AlertBlock
                         variant="danger"
                         icon={AlertCircle}
                         title="Xóa vĩnh viễn xe và dữ liệu liên quan?"
                         description={
                            <div className="space-y-2">
                               <p>Thao tác này sẽ xóa vĩnh viễn xe, các khoản thanh toán, chi phí spa và ảnh.</p>
                               <p className="text-[10px] text-red-600 font-black uppercase tracking-widest opacity-80">**Dữ liệu báo cáo tài chính sẽ bị thay đổi**</p>
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
      </motion.div>
   );
};
