import React from 'react';
import { Calendar, TrendingUp, Award, Clock, ArrowRight, Pin } from 'lucide-react';
import { motion } from 'motion/react';
import { Vehicle } from '../../../../shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_CONFIG, UserRole } from '../../../../shared/domain/constants';
import { cn } from '../../../../utils/cn';
import { formatCurrency } from '../../../../utils/currency';

import { calculateVehicleFinancials } from '../../../../shared/utils/vehicle_calculations';

interface CarCardProps {
  car: Vehicle;
  onClick: (car: Vehicle) => void;
  onPin?: (id: string | number, pinned: boolean) => void;
  userRole?: string;
  userCode?: string;
  variant?: 'standard' | 'large';
}

export const CarCard: React.FC<CarCardProps> = ({ car, onClick, onPin, userRole, userCode, variant = 'standard' }) => {
  const isAging = (car.days || 0) > 25;
  const isLarge = variant === 'large';

  const financials = calculateVehicleFinancials(car);

  const canSeeFullInfo =
    userRole === UserRole.ADMIN ||
    userRole === UserRole.ACCOUNTANT ||
    userRole === UserRole.MANAGER ||
    (car.is_coinvested && car.coinvestor_code === userCode);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -12, 
        transition: { duration: 0.5, ease: "easeOut" } 
      }}
      onClick={() => onClick(car)}
      className={cn(
        "group liquid-glass-core overflow-hidden cursor-pointer flex flex-col transition-all duration-700 bg-white",
        "shadow-[var(--shadow-card-industrial)] hover:shadow-[var(--shadow-card-hover)]",
        isLarge ? "rounded-t1 h-auto max-w-[800px] mx-auto" : "rounded-t1 w-full h-[450px]"
      )}
    >
      {/* 1. Header/Image Section - Scientific Standard */}
      <div className={cn(
        "relative overflow-hidden shrink-0",
        isLarge ? "aspect-video" : "aspect-[2/1]"
      )}>
        <img
          src={car.image_url || "/default-car.jpg"}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
        />

        {/* Subtle Protective Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-60" />

        {/* Status Tags - Top Left */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className={cn(
            "glass-badge flex items-center gap-2",
            VEHICLE_STATUS_CONFIG[car.status as VehicleStatus]?.badgeClass ?? "glass-badge-dark"
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {VEHICLE_STATUS_CONFIG[car.status as VehicleStatus]?.label || car.status}
          </div>

          {car.is_coinvested && (
            <div className="px-4 py-1.5 rounded-full text-sub-label !text-white glass-badge-purple flex items-center gap-2 shadow-lg w-max">
              <Award size={12} strokeWidth={3} />
              Góp vốn
            </div>
          )}
        </div>

        {/* Aging Indicator (Mobile/Compact context) */}
        {isAging && car.status !== VehicleStatus.SOLD && (
          <div className="absolute top-6 right-18 w-10 h-10 rounded-2xl bg-red-500 text-white shadow-2xl flex items-center justify-center animate-pulse border border-white/20">
            <Clock size={18} strokeWidth={3} />
          </div>
        )}

        {/* Pin Button - Secondary Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin && onPin(car.id, !car.is_pinned);
          }}
          className={cn(
            "absolute top-6 right-6 w-10 h-10 rounded-2xl border shadow-2xl flex items-center justify-center transition-all duration-300",
            car.is_pinned
              ? "bg-kraft-accent text-white border-white/20"
              : "bg-white/30 text-white border-white/40 opacity-0 group-hover:opacity-100 backdrop-blur-md"
          )}
        >
          <Pin size={18} fill={car.is_pinned ? "currentColor" : "none"} />
        </button>

        {/* Price Badge - Floating Impact */}
        <div className={cn(
          "absolute inset-x-0 bottom-6 flex justify-center px-6",
          isLarge && "bottom-10"
        )}>
          <div className={cn(
            "px-10 py-3 bg-kraft-ink text-white rounded-full shadow-2xl transform transition-transform group-hover:scale-105 text-center border border-white/10 backdrop-blur-xl",
            isLarge && "px-16 py-5"
          )}>
            <p className={cn(
              "text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-1",
              isLarge && "text-[11px]"
            )}>
              {car.status === VehicleStatus.SOLD ? "Giá bán thực tế" : "Giá chào bán"}
            </p>
            <p className={cn(
              "text-2xl font-black text-white leading-none tracking-tighter",
              isLarge && "text-5xl"
            )}>
              {formatCurrency(car.sale_price || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Primary Data Section - Clear Hierarchy */}
      <div className={cn(
        "p-8 flex-1 flex flex-col",
        isLarge && "p-14"
      )}>
        <div className="mb-8">
          <h3 className={cn(
            "text-2xl font-black text-kraft-ink tracking-tighter uppercase leading-tight line-clamp-2 min-h-[3rem] transition-colors group-hover:text-kraft-accent",
            isLarge && "text-5xl mb-6"
          )}>
            {car.name}
          </h3>
          <div className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-2",
            isLarge && "gap-x-10"
          )}>
            <span className="px-3 py-1 bg-black/5 rounded-lg text-sub-label !text-kraft-ink/60">
              #{car.code}
            </span>
            <div className="flex items-center gap-2 text-kraft-ink/30">
              <Calendar size={14} strokeWidth={3} />
              <span className="text-sub-label !text-kraft-ink/60">{car.year}</span>
            </div>
            <div className="flex items-center gap-2 text-kraft-ink/30">
              <TrendingUp size={14} strokeWidth={3} />
              <span className="text-sub-label !text-kraft-ink/60">{(car.odo || 0).toLocaleString()} km</span>
            </div>
          </div>
        </div>

        {/* 3. Footer Stats - Industrial Detail */}
        <div className="mt-auto pt-6 border-t border-black/5 flex items-end justify-between">
          <div className="space-y-2">
            <span className="text-sub-label !text-kraft-ink/60">Thời gian lưu kho</span>
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-lg font-black tracking-tighter",
                isAging ? "text-red-500" : "text-kraft-ink"
              )}>
                {car.days || 0} ngày
              </span>
              {isAging && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
            </div>
          </div>

          <div className="text-right space-y-2">
            <span className="text-sub-label !text-kraft-ink/60">
              {canSeeFullInfo ? (car.status === VehicleStatus.SOLD ? "Lợi nhuận ròng" : "Lợi nhuận dự tính") : ""}
            </span>
            {canSeeFullInfo ? (
              <p className="text-lg font-black text-emerald-600 tracking-tighter">
                +{formatCurrency(financials.showroomProfitShare)}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-kraft-accent font-black uppercase text-[10px] tracking-widest hover:translate-x-1 transition-transform">
                Chi tiết <ArrowRight size={12} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
