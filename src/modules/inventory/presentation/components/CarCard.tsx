import React from 'react';
import { Calendar, TrendingUp, Award, Clock, ArrowRight, Pin } from 'lucide-react';
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

export const CarCard: React.FC<CarCardProps> = ({ 
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
        {/* Thumbnail square */}
        <div className="relative shrink-0 w-[120px] h-[120px]">
          <img
            src={optimizeCloudinaryUrl(car.image_url, { width: 400 })}
            alt={car.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <StatusBadge 
              label={statusConfig?.label || car.status} 
              badgeClass={statusConfig?.badgeClass ?? "glass-badge-dark"} 
            />
          </div>
          {/* Aging indicator */}
          {isAging && car.status !== VehicleStatus.SOLD && (
            <div className="absolute bottom-2 left-2 w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center">
              <Clock size={12} strokeWidth={3} />
            </div>
          )}
          {/* Coinvested */}
          {car.is_coinvested && (
            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Award size={12} />
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          {/* Top: name + pin */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-black text-kraft-ink leading-tight line-clamp-2 tracking-tight">
                {car.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <div className="flex items-center gap-0.5 text-[10px] text-kraft-ink/50 font-bold">
                  <Calendar size={9} />
                  <span>{car.year}</span>
                </div>
                <span className="text-[10px] text-kraft-ink/20">•</span>
                <div className="flex items-center gap-0.5 text-[10px] text-kraft-ink/50 font-bold">
                  <TrendingUp size={9} />
                  <span>{((car.odo || 0) / 1000).toFixed(0)}K km</span>
                </div>
                {car.battery_type && car.battery_type !== 'None' && (
                  <>
                    <span className="text-[10px] text-kraft-ink/20">•</span>
                    <span className="text-[10px] text-kraft-accent font-black uppercase tracking-wider">{car.battery_type}</span>
                  </>
                )}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation();
                onPin && onPin(car.id, !car.is_pinned);
              }}
              className={cn(
                "shrink-0 w-7 h-7 rounded-xl border flex items-center justify-center transition-all",
                car.is_pinned
                  ? "bg-kraft-accent text-white border-transparent"
                  : "bg-kraft-ink/5 text-kraft-ink/30 border-transparent"
              )}
            >
              <Pin size={12} fill={car.is_pinned ? "currentColor" : "none"} />
            </motion.button>
          </div>

          {/* Bottom: days + price + profit */}
          <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col gap-0.5">
              <span className={cn(
                "text-[11px] font-black uppercase tracking-wider",
                isAging ? "text-coral/80 font-bold" : "text-kraft-ink/40"
              )}>
                {car.days || 0} ngày lưu kho
              </span>
              <span className="text-xs font-black text-kraft-ink">
                {formatCurrency(car.sale_price || 0)}
              </span>
            </div>
            {canSeeFullInfo ? (
              <span className="text-xs font-black text-emerald-600">
                +{formatCurrency(financials.showroomProfitShare).replace('₫', '')}
              </span>
            ) : (
              <ArrowRight size={14} className="text-kraft-accent" strokeWidth={3} />
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
                onPin && onPin(car.id, !car.is_pinned);
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
                    <InfoTag label={car.battery_type} />
                  )}
                </div>
              )}
            </div>

            <CardFooter className={isCompact ? "pt-2 md:pt-3" : "pt-3 md:pt-4"}>
              <div className="flex items-center gap-g1">
                <span className={cn(
                  "text-body font-black tracking-tighter leading-none uppercase",
                  isAging ? "text-coral/80 font-bold" : "text-kraft-ink/40",
                  isCompact && "text-sm"
                )}>
                  {car.days || 0}d lưu kho
                </span>
              </div>

              <div className="text-right">
                {canSeeFullInfo ? (
                  <p className="text-body font-black text-income tracking-tighter leading-none">
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
};

