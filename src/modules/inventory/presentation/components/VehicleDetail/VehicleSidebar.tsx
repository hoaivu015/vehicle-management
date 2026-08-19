import React from 'react';
import { TrendingUp, DollarSign, Save, RefreshCw, Plus, X, Calendar, Gauge, Sparkles } from 'lucide-react';
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
   onClose?: () => void;
}

export const VehicleSidebar: React.FC<VehicleSidebarProps> = ({
   vehicle, financials, isEditing, editForm, isSubmitting, isUploadingImage,
   canSeeFullInfo, isAdminOrAccountant, handleSaveEdit, setIsUpdatingStatus,
   handleImageUpload, onClose
}) => {

   return (
      <div className={cn(
         DESIGN_TOKENS.layout.sidebar_width,
         "border-b md:border-b-0 md:border-r border-hairline-soft flex flex-col bg-gradient-to-b from-white/40 to-transparent overflow-y-auto custom-scrollbar shrink-0 h-auto md:h-full"
      )}>

         {/* ── MOBILE: Modern 1/4 and 3/4 split layout (Ultra-compact) ── */}
         <div className="md:hidden grid grid-cols-12 gap-3 py-2.5 px-3 bg-gradient-to-r from-kraft-folder/30 via-white/50 to-white/80 border-b border-hairline-soft shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-kraft-accent/5 rounded-full blur-2xl pointer-events-none" />

            {/* Floating Close Button on Mobile */}
            {onClose && (
               <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/[0.06] active:bg-black/15 flex items-center justify-center text-kraft-ink/70 transition-all z-20 cursor-pointer"
                  aria-label="Đóng popup"
               >
                  <X size={15} strokeWidth={2.5} />
               </motion.button>
            )}

            {/* IMAGE: Left side (1/4) */}
            <div className="col-span-3 relative aspect-square rounded-[18px] overflow-hidden shadow-kraft-deep border border-white/60 bg-kraft-folder w-full shrink-0">
               <img
                  src={optimizeCloudinaryUrl(isEditing ? editForm.image_url : vehicle.image_url, { width: 300 })}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
               />
               
               {isEditing && (
                  <label className="absolute inset-0 bg-black/30 cursor-pointer flex items-center justify-center z-20">
                     <div className="p-1.5 bg-white rounded-full text-kraft-ink shadow-lg">
                        {isUploadingImage ? <RefreshCw className="animate-spin" size={12} /> : <Plus size={12} />}
                     </div>
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
               )}
            </div>

            {/* INFO: Right side (3/4) */}
            <div className="col-span-9 flex flex-col justify-between py-0.5 min-w-0 pr-7">
               {/* Row 1: Code & Status Badge & Co-invest Badge */}
               <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-kraft-ink/60 bg-black/[0.04] px-2 py-0.5 rounded-full border border-black/[0.02] leading-none shrink-0">
                     {vehicle.code}
                  </span>
                  <div className={cn(
                     "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm transition-all duration-300 leading-none shrink-0 whitespace-nowrap",
                     VEHICLE_STATUS_CONFIG[vehicle.status as VehicleStatus]?.badgeClass || "bg-kraft-ink"
                  )}>
                     {VEHICLE_STATUS_LABELS[vehicle.status as VehicleStatus] || vehicle.status}
                  </div>
                  {vehicle.is_coinvested && (
                     <div className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50/80 border border-blue-200/60 leading-none shrink-0 whitespace-nowrap">
                        Góp vốn
                     </div>
                  )}
               </div>

               {/* Row 2: Vehicle Name */}
               <h3 className="text-xs font-black tracking-tight text-kraft-ink mt-0.5 truncate leading-tight">
                  {vehicle.name}
               </h3>

               {/* Row 3: Financials or Specs */}
               {canSeeFullInfo ? (
                  <div className="flex items-center gap-2 mt-1 pt-1.5 border-t border-hairline-soft text-[10px] font-bold text-kraft-ink/80 leading-none min-w-0">
                     <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sub-label leading-none">LN:</span>
                        <span className="text-income font-black whitespace-nowrap">{formatCurrency(financials.showroomProfitShare)}</span>
                     </div>
                     <div className="w-[1px] h-2.5 bg-black/10 shrink-0" />
                     <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sub-label leading-none">Vốn:</span>
                        <span className="font-black whitespace-nowrap">{formatCurrency(financials.totalInvestment)}</span>
                     </div>
                  </div>
               ) : (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-kraft-ink/80 leading-none mt-1 pt-1.5 border-t border-hairline-soft min-w-0">
                     <div className="flex items-center gap-0.5 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sub-label leading-none">Năm:</span>
                        <span className="font-bold">{vehicle.year || '---'}</span>
                     </div>
                     <div className="w-[1px] h-2.5 bg-black/10 shrink-0" />
                     <div className="flex items-center gap-0.5 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sub-label leading-none">ODO:</span>
                        <span className="font-bold">{vehicle.odo ? `${(vehicle.odo / 1000).toFixed(0)}k km` : '---'}</span>
                     </div>
                     <div className="w-[1px] h-2.5 bg-black/10 shrink-0" />
                     <div className="flex items-center gap-0.5 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sub-label leading-none">Màu:</span>
                        <span className="font-bold">{vehicle.color || '---'}</span>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* ── DESKTOP: Full Column Layout ── */}
         <div className={cn("hidden md:flex flex-col gap-5 h-full", DESIGN_TOKENS.layout.content_padding)}>
            {/* Hero Image - Clean & uncluttered, with Co-invested Badge only when applicable */}
            <div className="w-full aspect-[4/3] rounded-[20px] overflow-hidden shadow-kraft-deep relative group border border-white/60 bg-kraft-folder shrink-0">
               <img
                  src={optimizeCloudinaryUrl(isEditing ? editForm.image_url : vehicle.image_url, { width: 1000 })}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />

               {isEditing && (
                  <label className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 z-20">
                     <div className="p-3 bg-white rounded-full text-kraft-ink shadow-xl">
                        {isUploadingImage ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Tải ảnh mới</span>
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
               )}
            </div>

            {/* Quick Specs 3-Cell Grid (Visible for ALL roles) */}
            <div className="grid grid-cols-3 gap-2 bg-black/[0.02] p-2 rounded-2xl border border-black/[0.04]">
               <div className="p-2 bg-white rounded-xl border border-hairline-soft flex flex-col justify-between gap-1 shadow-2xs">
                  <div className="flex items-center gap-1 text-sub-label">
                     <Calendar size={11} className="text-kraft-accent shrink-0" />
                     <span className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap">Năm</span>
                  </div>
                  <span className="text-xs font-black text-kraft-ink tracking-tight whitespace-nowrap">
                     {vehicle.year || '---'}
                  </span>
               </div>

               <div className="p-2 bg-white rounded-xl border border-hairline-soft flex flex-col justify-between gap-1 shadow-2xs">
                  <div className="flex items-center gap-1 text-sub-label">
                     <Gauge size={11} className="text-kraft-accent shrink-0" />
                     <span className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap">ODO</span>
                  </div>
                  <span className="text-xs font-black text-kraft-ink tracking-tight whitespace-nowrap">
                     {vehicle.odo ? `${(vehicle.odo).toLocaleString('vi-VN')} km` : '---'}
                  </span>
               </div>

               <div className="p-2 bg-white rounded-xl border border-hairline-soft flex flex-col justify-between gap-1 shadow-2xs">
                  <div className="flex items-center gap-1 text-sub-label">
                     <Sparkles size={11} className="text-kraft-accent shrink-0" />
                     <span className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap">Màu xe</span>
                  </div>
                  <span className="text-xs font-black text-kraft-ink tracking-tight whitespace-nowrap truncate">
                     {vehicle.color || '---'}
                  </span>
               </div>
            </div>

            {/* Desktop Financial KPI Bento (Unified Dual Matrix) */}
            {canSeeFullInfo && (
               <div className="bg-white rounded-2xl p-3 border border-hairline-soft shadow-2xs space-y-2">
                  {/* Top Tier: Expected Profit */}
                  <div className="p-3 bg-income/5 rounded-xl border border-income/15 flex items-center justify-between relative overflow-hidden group hover:border-income/30 transition-all">
                     <div className="space-y-0.5 relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-income/80 whitespace-nowrap">
                           {vehicle.is_coinvested ? "LN dự kiến showroom" : "Lợi nhuận dự kiến"}
                        </p>
                        <p className="text-xl font-black text-income tracking-tight whitespace-nowrap">
                           {formatCurrency(financials.showroomProfitShare)}
                        </p>
                     </div>
                     <div className="w-8 h-8 rounded-lg bg-income/10 flex items-center justify-center text-income relative z-10 shrink-0">
                        <TrendingUp size={16} strokeWidth={2.5} />
                     </div>
                  </div>

                  {/* Bottom Tier: Total Capital / Investment */}
                  <div className="px-3 py-2 bg-surface-soft rounded-xl border border-hairline-soft flex items-center justify-between">
                     <div className="flex items-center gap-1.5 text-sub-label">
                        <DollarSign size={13} className="text-kraft-ink/60" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Tổng vốn đầu tư</span>
                     </div>
                     <span className="text-sm font-black text-kraft-ink tracking-tight whitespace-nowrap">
                        {formatCurrency(financials.totalInvestment)}
                     </span>
                  </div>
               </div>
            )}

            {/* Desktop Action Buttons: Full-Width Primary Button */}
            <div className="mt-auto pt-2 pb-2">
               {isAdminOrAccountant && (
                  isEditing ? (
                     <PillButton
                        onClick={handleSaveEdit}
                        disabled={isSubmitting}
                        variant="success"
                        className="w-full h-12 lg:h-13 bg-income shadow-income/20 text-xs font-black uppercase tracking-wider"
                        icon={isSubmitting ? RefreshCw : Save}
                     >
                        Lưu thay đổi
                     </PillButton>
                  ) : (
                     <PillButton
                        onClick={() => setIsUpdatingStatus(true)}
                        variant="primary"
                        className="w-full h-12 lg:h-13 text-xs font-black uppercase tracking-wider shadow-lg shadow-kraft-ink/15"
                        icon={TrendingUp}
                     >
                        Đổi trạng thái
                     </PillButton>
                  )
               )}
            </div>
         </div>
      </div>
   );
};
