import React from 'react';
import { TrendingUp, DollarSign, Save, Edit2, Pin, RefreshCw, Plus, X } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { formatCurrency } from '@/src/utils/currency';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS } from '@/src/shared/domain/constants';
import { VehicleFinancials } from '@/src/shared/utils/vehicle_calculations';

interface VehicleSidebarProps {
   vehicle: Vehicle;
   financials: VehicleFinancials;
   isEditing: boolean;
   editForm: Partial<Vehicle>;
   setEditForm: React.Dispatch<React.SetStateAction<Partial<Vehicle>>>;
   isSubmitting: boolean;
   isUploadingImage: boolean;
   canSeeFullInfo: boolean;
   handleSaveEdit: () => Promise<void>;
   setIsUpdatingStatus: (val: boolean) => void;
   setIsEditing: (val: boolean) => void;
   handleStartEdit: () => void;
   handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
   handlePin: (id: number, pin: boolean) => Promise<void>;
}

export const VehicleSidebar: React.FC<VehicleSidebarProps> = ({
   vehicle,
   financials,
   isEditing,
   editForm,
   setEditForm,
   isSubmitting,
   isUploadingImage,
   canSeeFullInfo,
   handleSaveEdit,
   setIsUpdatingStatus,
   setIsEditing,
   handleStartEdit,
   handleImageUpload,
   handlePin
}) => {
   return (
      <div className="lg:w-[380px] p-8 border-r border-black/5 flex flex-col gap-8 bg-gradient-to-b from-white/20 to-transparent overflow-y-auto custom-scrollbar shrink-0">
         <div className="flex flex-row lg:flex-col gap-3 sm:gap-6 items-start lg:items-stretch">
            <div className="w-28 h-28 sm:w-40 sm:h-40 lg:w-full lg:aspect-[4/3] rounded-t2 overflow-hidden shadow-2xl relative group shrink-0">
               <img
                  src={(isEditing ? editForm.image_url : vehicle.image_url) || "/default-car.jpg"}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />

               {isEditing && (
                  <label className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 z-20">
                     <div className="p-4 bg-white rounded-t3 text-kraft-ink shadow-2xl scale-110 lg:scale-90 lg:group-hover:scale-100 transition-transform">
                        {isUploadingImage ? <RefreshCw className="animate-spin" size={24} /> : <Plus size={24} />}
                     </div>
                     <span className="text-sub-label !text-white !opacity-100 drop-shadow-md lg:block hidden">Cập nhật ảnh xe</span>
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
               )}

               <div className="absolute top-2 left-2 lg:top-4 lg:left-4 z-10">
                  <div className={cn(
                     "px-4 py-2 rounded-t3 text-sub-label !opacity-100 !text-white flex items-center justify-center gap-2",
                     vehicle.status === VehicleStatus.DEPOSIT_SALE ? "glass-badge-blue" :
                        vehicle.status === VehicleStatus.DEPOSIT_BUY ? "glass-badge-purple" :
                           vehicle.status === VehicleStatus.SOLD ? "glass-badge-emerald" :
                              "glass-badge-dark"
                  )}>
                     <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                     {VEHICLE_STATUS_LABELS[vehicle.status as VehicleStatus] || vehicle.status}
                  </div>
               </div>
            </div>

            {canSeeFullInfo && (
               <div className="flex-1 grid grid-cols-1 gap-2 sm:gap-4">
                  <div className="p-3 sm:p-6 bg-white rounded-t2 border border-black/5 shadow-sm flex items-center justify-between relative overflow-hidden">
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-kraft-accent/20 rounded-full blur-3xl pointer-events-none" />
                     <div className="space-y-0.5 sm:space-y-1 relative z-10">
                        <p className="text-sub-label">
                           {vehicle.status === VehicleStatus.SOLD ? "Lợi nhuận ròng" : "Dự tính LN ròng"}
                        </p>
                        <p className="text-xs sm:text-2xl font-black text-emerald-600 tracking-tighter">
                           {formatCurrency(financials.showroomProfitShare)}
                        </p>
                     </div>
                     <div className="w-6 h-6 sm:w-12 sm:h-12 rounded-t4 sm:rounded-t3 bg-emerald-500/10 flex items-center justify-center text-emerald-600 relative z-10">
                        <TrendingUp size={12} className="sm:w-6 sm:h-6" />
                     </div>
                  </div>

                  <div className="p-3 sm:p-6 bg-white rounded-t2 shadow-2xl border border-black/5 flex items-center justify-between relative overflow-hidden">
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-kraft-accent/20 rounded-full blur-3xl pointer-events-none" />
                     <div className="space-y-0.5 sm:space-y-1 relative z-10">
                        <p className="text-sub-label text-kraft-ink/40">Tổng vốn đầu tư</p>
                        <p className="text-xs sm:text-2xl font-black text-kraft-ink tracking-tighter">{formatCurrency(financials.totalInvestment)}</p>
                     </div>
                     <div className="w-6 h-6 sm:w-12 sm:h-12 rounded-t4 sm:rounded-t3 bg-kraft-accent/10 flex items-center justify-center text-kraft-accent relative z-10">
                        <DollarSign size={12} className="sm:w-6 sm:h-6" />
                     </div>
                  </div>
               </div>
            )}
         </div>

         <div className="flex gap-2 sm:gap-4 items-center">
            {canSeeFullInfo && (
               <>
                  {isEditing ? (
                     <button
                        onClick={handleSaveEdit}
                        disabled={isSubmitting}
                        className="flex-1 h-10 sm:h-14 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                     >
                        {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                        Lưu
                     </button>
                  ) : (
                     <button
                        onClick={() => setIsUpdatingStatus(true)}
                        className="flex-1 h-10 sm:h-14 bg-kraft-accent text-white rounded-2xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-kraft-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                     >
                        <TrendingUp size={14} /> Cập nhật trạng thái
                     </button>
                  )}

                  <button
                     onClick={() => {
                        if (isEditing) setIsEditing(false);
                        else handleStartEdit();
                     }}
                     className="w-14 h-14 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-kraft-ink hover:bg-white/60 transition-all active:scale-[0.98]"
                  >
                     {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                  </button>
               </>
            )}
         </div>
      </div>
   );
};
