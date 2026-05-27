import React from 'react';
import { TrendingUp, DollarSign, Save, Edit2, RefreshCw, Plus, X } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { motion } from 'motion/react';
import { formatCurrency } from '@/src/shared/utils/currency';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_CONFIG } from '@/src/shared/domain/constants';
import { VehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { PillButton } from '@/src/shared/design-system/ExecutiveModules';
import { DESIGN_TOKENS } from '@/src/shared/design-system/tokens';
import { optimizeCloudinaryUrl } from '@/src/shared/utils/cloudinary';

interface VehicleSidebarProps {
   vehicle: Vehicle;
   financials: VehicleFinancials;
   isEditing: boolean;
   editForm: Partial<Vehicle>;
   isSubmitting: boolean;
   isUploadingImage: boolean;
   canSeeFullInfo: boolean;
   isAdminOrAccountant: boolean;
   handleSaveEdit: () => Promise<void>;
   setIsUpdatingStatus: (val: boolean) => void;
   setIsEditing: (val: boolean) => void;
   handleStartEdit: () => void;
   handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const VehicleSidebar: React.FC<VehicleSidebarProps> = ({
   vehicle, financials, isEditing, editForm, isSubmitting, isUploadingImage,
   canSeeFullInfo, isAdminOrAccountant, handleSaveEdit, setIsUpdatingStatus, setIsEditing, handleStartEdit, handleImageUpload
}) => {

   return (
      <div className={cn(
         DESIGN_TOKENS.layout.sidebar_width,
         "border-b md:border-b-0 md:border-r border-hairline-soft flex flex-col bg-gradient-to-b from-white/20 to-transparent overflow-y-auto custom-scrollbar shrink-0 h-auto md:h-full"
      )}>

         {/* ── MOBILE: Modern 1/4 and 3/4 split layout (Ultra-compact) ── */}
         <div className="md:hidden grid grid-cols-12 gap-3 py-2.5 px-3 bg-gradient-to-r from-kraft-folder/30 via-white/50 to-white/80 border-b border-hairline-soft shrink-0 relative overflow-hidden">
            {/* Dark/soft light glow backdrops for extra premium look */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-kraft-accent/5 rounded-full blur-2xl pointer-events-none" />

            {/* IMAGE: Left side (1/4) -> col-span-3 */}
            <div className="col-span-3 relative aspect-square rounded-xl overflow-hidden shadow-kraft-deep border border-white/60 bg-kraft-folder w-full shrink-0">
               <img
                  src={optimizeCloudinaryUrl(isEditing ? editForm.image_url : vehicle.image_url, { width: 300 })}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
               />
               
               {/* Edit image overlay */}
               {isEditing && (
                  <label className="absolute inset-0 bg-black/30 cursor-pointer flex items-center justify-center z-20">
                     <div className="p-1.5 bg-white rounded-full text-kraft-ink shadow-lg">
                        {isUploadingImage ? <RefreshCw className="animate-spin" size={12} /> : <Plus size={12} />}
                     </div>
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
               )}
            </div>

            {/* INFO: Right side (3/4) -> col-span-9 */}
            <div className="col-span-9 flex flex-col justify-between py-0.5 min-w-0">
               {/* Row 1: Code & Status Badge */}
               <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-kraft-ink/60 bg-black/[0.04] px-2 py-0.5 rounded-md border border-black/[0.02] leading-none">
                     {vehicle.code}
                  </span>
                  <div className={cn(
                     "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-sm transition-all duration-300 leading-none",
                     VEHICLE_STATUS_CONFIG[vehicle.status as VehicleStatus]?.badgeClass || "bg-kraft-ink"
                  )}>
                     {VEHICLE_STATUS_LABELS[vehicle.status as VehicleStatus] || vehicle.status}
                  </div>
               </div>

               {/* Row 2: Vehicle Name (Truncated to 1 line for maximum vertical compression) */}
               <h3 className="text-xs font-black tracking-tight text-kraft-ink mt-0.5 truncate leading-tight">
                  {vehicle.name}
               </h3>

               {/* Row 3: Financials (if authorized) or Specifications (if not) - Flex Horizontal Bar */}
               {canSeeFullInfo ? (
                  <div className="flex items-center gap-2.5 mt-1 pt-1.5 border-t border-hairline-soft text-[10px] font-bold text-kraft-ink/80 leading-none">
                     <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-sub-label leading-none">LN:</span>
                        <span className="text-income font-black">{formatCurrency(financials.showroomProfitShare)}</span>
                     </div>
                     <div className="w-[1px] h-2.5 bg-black/10 shrink-0" />
                     <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-sub-label leading-none">Vốn:</span>
                        <span className="font-black">{formatCurrency(financials.totalInvestment)}</span>
                     </div>
                  </div>
               ) : (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-kraft-ink/80 leading-none mt-1 pt-1.5 border-t border-hairline-soft">
                     <div className="flex items-center gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-sub-label leading-none">Năm:</span>
                        <span className="font-bold">{vehicle.year || 'N/A'}</span>
                     </div>
                     <div className="w-[1px] h-2.5 bg-black/10 shrink-0" />
                     <div className="flex items-center gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-sub-label leading-none">ODO:</span>
                        <span className="font-bold truncate max-w-[50px]">{vehicle.odo ? `${(vehicle.odo / 1000).toFixed(0)}k km` : 'N/A'}</span>
                     </div>
                     <div className="w-[1px] h-2.5 bg-black/10 shrink-0" />
                     <div className="flex items-center gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-sub-label leading-none">Màu:</span>
                        <span className="font-bold truncate max-w-[40px]">{vehicle.color || 'N/A'}</span>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* ── DESKTOP: Original column layout ── */}
         <div className={cn("hidden md:flex flex-col gap-6", DESIGN_TOKENS.layout.content_padding)}>
            <div className="flex flex-col gap-4 lg:gap-6 items-stretch">
               {/* Image */}
               <div className="w-full lg:aspect-[4/3] rounded-t3 overflow-hidden shadow-kraft-deep relative group border border-white/40" style={{ height: '200px' }}>
                  <img
                      src={optimizeCloudinaryUrl(isEditing ? editForm.image_url : vehicle.image_url, { width: 1000 })}
                      alt={vehicle.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {isEditing && (
                     <label className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 z-20">
                        <div className="p-4 bg-white rounded-full text-kraft-ink shadow-2xl">
                           {isUploadingImage ? <RefreshCw className="animate-spin" size={24} /> : <Plus size={24} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Đổi ảnh</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                     </label>
                  )}

                  <div className="absolute top-4 left-4 z-10">
                     <div className={cn(
                        "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 shadow-kraft-deep",
                        VEHICLE_STATUS_CONFIG[vehicle.status as VehicleStatus]?.badgeClass || "bg-kraft-ink"
                     )}>
                        {VEHICLE_STATUS_LABELS[vehicle.status as VehicleStatus] || vehicle.status}
                     </div>
                  </div>
               </div>
            </div>

            {/* Desktop financial metrics */}
            {canSeeFullInfo && (
               <div className="grid grid-cols-1 gap-g2">
                  <div className="p-4 lg:p-6 glass-surface-soft rounded-t2 border border-hairline-soft shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-income/20 transition-all">
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-income/5 rounded-full blur-3xl pointer-events-none group-hover:bg-income/10 transition-all" />
                     <div className="space-y-0 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-sub-label mb-1">LN dự kiến</p>
                        <p className="text-2xl font-black text-income tracking-tighter">{formatCurrency(financials.showroomProfitShare)}</p>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-income/10 flex items-center justify-center text-income relative z-10 shrink-0">
                        <TrendingUp size={24} strokeWidth={2.5} />
                     </div>
                  </div>

                  <div className="p-4 lg:p-6 glass-surface-soft rounded-t2 shadow-sm border border-hairline-soft flex items-center justify-between relative overflow-hidden group hover:border-kraft-accent/20 transition-all">
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-kraft-accent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-kraft-accent/10 transition-all" />
                     <div className="space-y-0 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-sub-label mb-1">Tổng vốn</p>
                        <p className="text-2xl font-black text-kraft-ink tracking-tighter">{formatCurrency(financials.totalInvestment)}</p>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent relative z-10 shrink-0">
                        <DollarSign size={24} strokeWidth={2.5} />
                     </div>
                  </div>
               </div>
            )}

            {/* Desktop action buttons */}
            <div className="flex gap-g2 items-center mt-auto pb-4">
               {isAdminOrAccountant && (
                  <>
                     {isEditing ? (
                        <PillButton
                           onClick={handleSaveEdit}
                           disabled={isSubmitting}
                           variant="success"
                           className="flex-1 bg-income shadow-income/20"
                           icon={isSubmitting ? RefreshCw : Save}
                        >
                           Lưu
                        </PillButton>
                     ) : (
                        <PillButton
                           onClick={() => setIsUpdatingStatus(true)}
                           variant="primary"
                           className="flex-1"
                           icon={TrendingUp}
                        >
                           Trạng thái
                        </PillButton>
                     )}

                     <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                           if (isEditing) setIsEditing(false);
                           else handleStartEdit();
                        }}
                        className="w-14 h-14 bg-white border border-hairline-soft rounded-full flex items-center justify-center text-kraft-ink hover:bg-surface-soft transition-all shrink-0 shadow-kraft-deep"
                     >
                        {isEditing ? <X size={20} strokeWidth={2.5} /> : <Edit2 size={20} strokeWidth={2.5} />}
                     </motion.button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};
