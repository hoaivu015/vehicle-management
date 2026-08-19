import React from 'react';
import { Calendar, Gauge, Award, Clock, ArrowRight, Pin } from 'lucide-react';
import { motion } from 'motion/react';
import { Vehicle } from '../../../../shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_CONFIG } from '../../../../shared/domain/constants';
import { cn } from '@/src/shared/utils/cn';
import { formatCurrency } from '@/src/shared/utils/currency';
import { BaseCard, CardImageSection, CardContentSection, PriceBadge, CardFooter } from '@/src/shared/design-system/BaseCard';
import { StatusBadge } from '@/src/shared/design-system/DataDisplay';
import { calculateVehicleFinancials, getInventoryAgingTier } from '../../../../shared/utils/vehicle_calculations';
import { optimizeCloudinaryUrl } from '@/src/shared/utils/cloudinary';
import { haptics } from '@/src/shared/utils/haptics';

interface CarCardProps {
  car: Vehicle;
  onClick: (car: Vehicle) => void;
  onPin?: (id: number, pinned: boolean) => Promise<void> | void;
  userRole?: string;
  userCode?: string;
  variant?: 'standard' | 'large';
  isCompact?: boolean;
  financials: ReturnType<typeof calculateVehicleFinancials>;
  canSeeFullInfo: boolean;
  priority?: boolean;
}

export const CarCard: React.FC<CarCardProps> = React.memo(({ 
  car, 
  onClick, 
  onPin, 
  variant = 'standard', 
  isCompact = false,
  financials,
  canSeeFullInfo,
  priority = false
}) => {
  const agingTier = getInventoryAgingTier(car.days || 0);
  const isAging = agingTier.isAging;
  const isCompressed = (car.days || 0) > 30;
  const isLarge = variant === 'large';
  const statusConfig = VEHICLE_STATUS_CONFIG[car.status as VehicleStatus];

  return (
    <>
      {/* ── MOBILE LAYOUT: Thẻ nằm ngang tối ưu chạm và diện tích cuộn ── */}
      <div
        className="md:hidden group bg-white/70 hover:bg-white/85 backdrop-blur-xl rounded-[20px] border border-white/60 shadow-[inset_1px_1px_0_rgba(255,255,255,0.6)] overflow-hidden flex flex-row cursor-pointer active:scale-[0.97] ease-[cubic-bezier(0.34,1.56,0.64,1)] transition-all duration-300 native-interactive"
        onClick={() => {
          haptics.light();
          onClick(car);
        }}
      >
        {/* Thumbnail square - Clean 1 Hero Badge */}
        <div className="relative shrink-0 w-[110px] h-[110px] rounded-l-[20px] overflow-hidden bg-slate-100">
          <img
            src={optimizeCloudinaryUrl(car.image_url, { width: priority ? 400 : 320 })}
            alt={car.name}
            className="w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : "auto"}
          />
          {/* Status badge - Single hero badge on image */}
          <div className="absolute top-2 left-2">
            <StatusBadge 
              label={statusConfig?.label || car.status} 
              badgeClass={statusConfig?.badgeClass ?? "glass-badge-dark"} 
            />
          </div>
        </div>

        {/* Info section - 100% Cố định đúng 4 hàng đồng bộ tuyệt đối */}
        <div className="flex-1 min-w-0 p-2.5 flex flex-col justify-between">
          <div>
            {/* Hàng 1: Code & Pin Button */}
            <div className="flex items-center justify-between gap-1.5 mb-0.5">
              {car.code ? (
                <span className="text-[10px] font-mono font-bold tracking-wider text-sub-label whitespace-nowrap">
                  #{car.code}
                </span>
              ) : <div />}

              {/* Pin action button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPin?.(car.id, !car.is_pinned);
                }}
                className={cn(
                  "shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all native-interactive",
                  car.is_pinned
                    ? "bg-kraft-accent text-white border-transparent shadow-sm"
                    : "bg-black/5 hover:bg-black/10 text-slate-500 border-transparent"
                )}
                title={car.is_pinned ? "Bỏ ghim" : "Ghim xe"}
              >
                <Pin size={11} fill={car.is_pinned ? "currentColor" : "none"} />
              </motion.button>
            </div>

            {/* Hàng 2: Tên xe & Tag Góp Vốn Inline */}
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-sm font-black text-slate-900 leading-tight truncate tracking-tight">
                {car.name}
              </h3>
              {car.is_coinvested && (
                <span className="shrink-0 px-2 py-0.5 bg-surface-soft text-kraft-ink rounded-full text-[8.5px] font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-0.5 border border-hairline-soft shadow-2xs">
                  <Award size={8.5} strokeWidth={2.5} className="text-warning" />
                  Góp vốn
                </span>
              )}
            </div>

            {/* Hàng 3: Thông số & Ngày lưu kho */}
            <div className="flex items-center gap-1 mt-1 text-slate-500 flex-nowrap overflow-hidden">
              <div className="flex items-center gap-0.5 text-[10px] font-bold whitespace-nowrap">
                <Calendar size={9} />
                <span>{car.year}</span>
              </div>
              <span className="text-[10px] text-slate-400">•</span>
              <div className="flex items-center gap-0.5 text-[10px] font-bold whitespace-nowrap">
                <Gauge size={9} />
                <span>{((car.odo || 0) / 1000).toFixed(0)}K km</span>
              </div>
              <span className="text-[10px] text-slate-400">•</span>
              <span className={cn(
                "text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-0.5 whitespace-nowrap",
                agingTier.colorClass,
                isAging && "font-black"
              )}>
                <Clock size={9} className="shrink-0" />
                {car.days || 0}d
              </span>
            </div>
          </div>

          {/* Bottom: price (left) + profit (right) - Zero Collision Matrix */}
          <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-black/[0.04]">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap">
                {car.status === VehicleStatus.SOLD ? "Giá chốt" : "Giá chào"}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 whitespace-nowrap">
                {formatCurrency(car.sale_price || 0)}
              </span>
            </div>
            {canSeeFullInfo ? (
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap">
                  Lãi dự kiến
                </span>
                <span className="text-xs sm:text-sm font-black text-income whitespace-nowrap">
                  +{formatCurrency(financials.showroomProfitShare).replace('₫', '')}
                </span>
              </div>
            ) : (
              <ArrowRight size={14} className="text-kraft-accent shrink-0" strokeWidth={3} />
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP: Clean Squircle Card ── */}
      <BaseCard 
        isLarge={isLarge} 
        isCompact={isCompact} 
        onClick={() => onClick(car)}
        glowState={isAging ? 'warning' : 'none'}
        minHeight="md:min-h-[340px] min-h-0"
        className="gpu-accelerated hidden md:flex neural-card-morph native-interactive"
      >
        <motion.div 
          layout 
          animate={{ scaleX: isCompressed ? 0.94 : 1, scaleY: isCompressed ? 0.97 : 1 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 20 }} 
          className="flex flex-col h-full origin-center"
        >
          <CardImageSection isLarge={isLarge} className="relative">
            <img
              src={optimizeCloudinaryUrl(car.image_url, { width: isLarge ? 1000 : 700 })}
              alt={car.name}
              className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105 rounded-[20px]"
              loading={priority ? "eager" : "lazy"}
              decoding={priority ? "sync" : "async"}
              fetchPriority={priority ? "high" : "auto"}
            />

            {/* Single Hero Status Badge (Góc trên bên trái) */}
            <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3">
              <StatusBadge 
                label={statusConfig?.label || car.status} 
                badgeClass={statusConfig?.badgeClass ?? "glass-badge-dark"} 
              />
            </div>

            {/* Pin action button (Góc trên bên phải) */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => {
                e.stopPropagation();
                onPin?.(car.id, !car.is_pinned);
              }}
              className={cn(
                "absolute top-2.5 right-2.5 md:top-3 md:right-3 w-8 h-8 rounded-full border shadow-kraft flex items-center justify-center transition-all duration-300 backdrop-blur-md",
                car.is_pinned
                  ? "bg-kraft-accent text-white border-white/20 opacity-100"
                  : "bg-white/60 text-slate-700 border-white/60 opacity-0 group-hover:opacity-100 hover:bg-white/90"
              )}
              title={car.is_pinned ? "Bỏ ghim" : "Ghim xe"}
            >
              <Pin size={13} fill={car.is_pinned ? "currentColor" : "none"} />
            </motion.button>

            {/* Price Badge (Góc dưới bên phải) */}
            <PriceBadge 
              label={car.status === VehicleStatus.SOLD ? "Giá chốt" : "Giá chào"}
              value={formatCurrency(car.sale_price || 0)}
            />
          </CardImageSection>

          <CardContentSection 
            isLarge={isLarge} 
            isCompact={isCompact} 
            padding={isCompact ? "p-3 md:p-3.5" : "p-3.5 md:px-5 md:py-3.5"}
            className="flex-1 flex flex-col justify-between"
          >
            <div>
              {/* Hàng 1: Mã xe & Tag Góp vốn */}
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                {car.code ? (
                  <span className="text-[10.5px] font-mono font-bold tracking-wider text-sub-label whitespace-nowrap">
                    #{car.code}
                  </span>
                ) : <div />}

                {car.is_coinvested && (
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1 border border-amber-200/60 shadow-2xs">
                    <Award size={9.5} strokeWidth={2.5} />
                    Góp vốn
                  </span>
                )}
              </div>

              {/* Hàng 2: Tên xe - Khóa cứng màu chữ đen Slate-900 sắc nét */}
              <h3 className={cn(
                "font-black text-slate-900 tracking-tight uppercase leading-snug line-clamp-1 transition-colors group-hover:text-kraft-accent",
                isCompact ? "text-sm md:text-base" : "text-base md:text-[17px]",
                isLarge && "text-3xl md:text-4xl mb-3"
              )}>
                {car.name}
              </h3>

              {/* Hàng 3: Thông số kỹ thuật - Clean Inline Minimalist Specs */}
              {!isCompact && (
                <div className={cn("flex items-center gap-2 mt-2 text-xs font-bold text-slate-600", isLarge && "gap-3 text-sm")}>
                  <span>{car.year}</span>
                  <span className="text-slate-400 font-normal">•</span>
                  <span>{((car.odo || 0) / 1000).toFixed(0)}K km</span>
                </div>
              )}
            </div>

            {/* Hàng 4: Footer - Lưu kho & Lãi dự kiến */}
            <CardFooter className={cn(
              "border-t border-slate-100",
              isCompact ? "pt-2 md:pt-2.5 mt-2" : "pt-2.5 md:pt-3 mt-2.5"
            )}>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className={cn("shrink-0", agingTier.colorClass)} />
                <span className={cn(
                  "text-[11px] font-semibold tracking-tight whitespace-nowrap",
                  agingTier.colorClass,
                  isAging && "font-black",
                  isCompact && "text-[10px]"
                )}>
                  {car.days || 0} ngày lưu kho
                </span>
              </div>

              <div className="text-right">
                {canSeeFullInfo ? (
                  <p className="text-sm md:text-[15px] font-black text-income tracking-tight leading-none whitespace-nowrap">
                    +{formatCurrency(financials.showroomProfitShare).replace('₫', '')}
                  </p>
                ) : (
                  <ArrowRight size={14} className="text-kraft-accent" strokeWidth={3} />
                )}
              </div>
            </CardFooter>
          </CardContentSection>
        </motion.div>
      </BaseCard>
    </>
  );
});

CarCard.displayName = 'CarCard';
