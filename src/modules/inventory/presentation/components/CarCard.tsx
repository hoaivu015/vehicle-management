import React from 'react';
import { Calendar, TrendingUp, Award, Clock, ArrowRight, Pin, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Vehicle } from '../../../../shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_CONFIG, INVENTORY_CONSTANTS } from '../../../../shared/domain/constants';
import { cn } from '@/src/shared/utils/cn';
import { formatCurrency } from '@/src/shared/utils/currency';
import { BaseCard, CardImageSection, CardContentSection, PriceBadge, InfoTag, CardFooter } from '@/src/shared/design-system/BaseCard';
import { StatusBadge } from '@/src/shared/design-system/DataDisplay';
import { calculateVehicleFinancials } from '../../../../shared/utils/vehicle_calculations';
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
}

export const CarCard: React.FC<CarCardProps> = React.memo(({ 
  car, 
  onClick, 
  onPin, 
  variant = 'standard', 
  isCompact = false,
  financials,
  canSeeFullInfo
}) => {
  const isAging = (car.days || 0) > INVENTORY_CONSTANTS.AGING_THRESHOLD_DAYS;
  const isCompressed = (car.days || 0) > 30;
  const isLarge = variant === 'large';
  const statusConfig = VEHICLE_STATUS_CONFIG[car.status as VehicleStatus];

  return (
    <>
      {/* ── MOBILE LAYOUT: Thẻ nằm ngang tối ưu chạm và diện tích cuộn ── */}
      <div
        className="md:hidden group bg-white/60 hover:bg-white/75 backdrop-blur-xl rounded-[20px] border border-white/50 shadow-[inset_1px_1px_0_rgba(255,255,255,0.4)] overflow-hidden flex flex-row cursor-pointer active:scale-[0.97] ease-[cubic-bezier(0.34,1.56,0.64,1)] transition-all duration-300 native-interactive"
        onClick={() => {
          haptics.light();
          onClick(car);
        }}
      >
        {/* Thumbnail square - Clean 1 Hero Badge */}
        <div className="relative shrink-0 w-[110px] h-[110px] rounded-l-[20px] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={optimizeCloudinaryUrl(car.image_url, { width: 400 })}
            alt={car.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
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
                <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded text-[9px] font-black uppercase tracking-wider text-kraft-ink/60 whitespace-nowrap">
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
                  "shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all native-interactive",
                  car.is_pinned
                    ? "bg-kraft-accent text-white border-transparent shadow-sm"
                    : "bg-kraft-ink/5 hover:bg-kraft-ink/10 text-kraft-ink/40 border-transparent"
                )}
                title={car.is_pinned ? "Bỏ ghim" : "Ghim xe"}
              >
                <Pin size={11} fill={car.is_pinned ? "currentColor" : "none"} />
              </motion.button>
            </div>

            {/* Hàng 2: Tên xe & Tag Góp Vốn Inline */}
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-sm font-black text-kraft-ink leading-tight truncate tracking-tight">
                {car.name}
              </h3>
              {car.is_coinvested && (
                <span className="shrink-0 px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-[8.5px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-0.5 border border-purple-500/20">
                  <Award size={8.5} strokeWidth={2.5} />
                  Góp vốn
                </span>
              )}
            </div>

            {/* Hàng 3: Thông số & Ngày lưu kho */}
            <div className="flex items-center gap-1 mt-1 text-kraft-ink/50 flex-nowrap overflow-hidden">
              <div className="flex items-center gap-0.5 text-[10px] font-bold whitespace-nowrap">
                <Calendar size={9} />
                <span>{car.year}</span>
              </div>
              <span className="text-[10px] text-kraft-ink/20">•</span>
              <div className="flex items-center gap-0.5 text-[10px] font-bold whitespace-nowrap">
                <TrendingUp size={9} />
                <span>{((car.odo || 0) / 1000).toFixed(0)}K km</span>
              </div>
              <span className="text-[10px] text-kraft-ink/20">•</span>
              <span className={cn(
                "text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-0.5 whitespace-nowrap",
                isAging ? "text-coral font-black" : "text-kraft-ink/50"
              )}>
                <Clock size={9} className="shrink-0" />
                {car.days || 0}d
              </span>
            </div>
          </div>

          {/* Bottom: price (left) + profit (right) - Zero Collision Matrix */}
          <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-kraft-ink/40 uppercase tracking-tight whitespace-nowrap">
                {car.status === VehicleStatus.SOLD ? "Giá chốt" : "Giá chào"}
              </span>
              <span className="text-xs sm:text-sm font-black text-kraft-ink whitespace-nowrap">
                {formatCurrency(car.sale_price || 0)}
              </span>
            </div>
            {canSeeFullInfo ? (
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-[9px] font-bold text-kraft-ink/40 uppercase tracking-tight whitespace-nowrap">
                  Lãi dự kiến
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-600 whitespace-nowrap">
                  +{formatCurrency(financials.showroomProfitShare).replace('₫', '')}
                </span>
              </div>
            ) : (
              <ArrowRight size={14} className="text-kraft-accent shrink-0" strokeWidth={3} />
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP: Original vertical card ── */}
      <BaseCard 
        isLarge={isLarge} 
        isCompact={isCompact} 
        onClick={() => onClick(car)}
        glowState={isAging ? 'warning' : 'none'}
        minHeight="md:min-h-[350px] min-h-0"
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
              src={optimizeCloudinaryUrl(car.image_url, { width: 800 })}
              alt={car.name}
              className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110 rounded-[16px]"
              loading="lazy"
              decoding="async"
            />

            <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2">
              <StatusBadge 
                label={statusConfig?.label || car.status} 
                badgeClass={statusConfig?.badgeClass ?? "glass-badge-dark"} 
              />
              {car.is_coinvested && (
                <StatusBadge 
                  label="Góp vốn" 
                  badgeClass="glass-badge-purple shadow-lg" 
                  icon={Award} 
                />
              )}
            </div>

            {isAging && car.status !== VehicleStatus.SOLD && (
              <div className="absolute top-g2 right-12 md:top-g4 md:right-16 w-touch h-touch rounded-xl bg-expense text-white shadow-kraft flex items-center justify-center border border-white/20">
                <Clock size={20} strokeWidth={3} />
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => {
                e.stopPropagation();
                onPin?.(car.id, !car.is_pinned);
              }}
              className={cn(
                "absolute top-g2 right-g2 md:top-g4 md:right-g4 w-touch h-touch rounded-xl border shadow-kraft flex items-center justify-center transition-all duration-300",
                car.is_pinned
                  ? "bg-kraft-accent text-white border-white/20"
                  : "bg-white/30 text-white border-white/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-md"
              )}
            >
              <Pin size={16} fill={car.is_pinned ? "currentColor" : "none"} />
            </motion.button>

            <PriceBadge 
              label={car.status === VehicleStatus.SOLD ? "Giá chốt" : "Giá chào"}
              value={formatCurrency(car.sale_price || 0)}
            />
          </CardImageSection>

          <CardContentSection 
            isLarge={isLarge} 
            isCompact={isCompact} 
            padding={isCompact ? "p-3 md:p-4" : "p-4 md:px-6 md:py-4 md:pt-5"}
            className="flex-1 flex flex-col"
          >
            <div className={isCompact ? "mb-1 md:mb-2" : "mb-2 md:mb-3"}>
              <div className="flex items-center gap-1.5 mb-1">
                {car.code && (
                  <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded text-[10px] font-black uppercase tracking-wider text-kraft-ink/50 whitespace-nowrap">
                    #{car.code}
                  </span>
                )}
              </div>
              <h3 className={cn(
                "font-black text-kraft-ink tracking-tighter uppercase leading-tight line-clamp-2 transition-colors group-hover:text-kraft-accent",
                isCompact ? "text-sm md:text-lg min-h-[1.25rem] md:min-h-[2.5rem]" : "text-sm md:text-xl min-h-[1.25rem] md:min-h-[3rem]",
                isLarge && "text-5xl mb-6"
              )}>
                {car.name}
              </h3>
              {!isCompact && (
                <div className={cn("flex flex-wrap items-center gap-1 md:gap-2 mt-1 md:mt-2.5", isLarge && "gap-4")}>
                  <InfoTag icon={Calendar} label={car.year} />
                  <InfoTag icon={TrendingUp} label={`${((car.odo || 0) / 1000).toFixed(0)}K`} />
                  {car.battery_type && car.battery_type !== 'None' && (
                    <InfoTag icon={Layers} label={car.battery_type} />
                  )}
                </div>
              )}
            </div>

            <CardFooter className={isCompact ? "pt-2 md:pt-3" : "pt-3 md:pt-4"}>
              <div className="flex items-center gap-g1">
                <span className={cn(
                  "text-body font-black tracking-tighter leading-none uppercase whitespace-nowrap",
                  isAging ? "text-coral/80 font-bold" : "text-kraft-ink/40",
                  isCompact && "text-sm"
                )}>
                  {car.days || 0}d lưu kho
                </span>
              </div>

              <div className="text-right">
                {canSeeFullInfo ? (
                  <p className="text-body font-black text-income tracking-tighter leading-none whitespace-nowrap">
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

