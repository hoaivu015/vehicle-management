import React from 'react';
import { Calendar, TrendingUp, Award, Clock, ArrowRight, Pin, PinOff } from 'lucide-react';
import { motion } from 'motion/react';
import { Vehicle } from '../../../../shared/domain/types';
import { VehicleStatus, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_CONFIG, UserRole } from '../../../../shared/domain/constants';
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
  const isAvailable = car.status !== VehicleStatus.SOLD;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: isLarge ? -20 : -12, transition: { duration: 0.4, ease: "easeOut" } }}
      onClick={() => onClick(car)}
      className={cn(
        "group bg-white/40 backdrop-blur-md border border-white/60 shadow-xl overflow-hidden cursor-pointer flex flex-col hover:bg-white/60 transition-colors duration-500",
        isLarge ? "rounded-[3rem] h-auto max-w-[600px] mx-auto shadow-2xl shadow-black/10" : "rounded-[2rem] w-full h-full"
      )}
    >
      {/* ... (Upper Sections) ... */}
      <div className="aspect-[16/9] relative overflow-hidden shrink-0">
        <img
          src={car.image_url || "/default-car.jpg"}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className={cn(
            "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest backdrop-blur-xl border shadow-2xl",
            VEHICLE_STATUS_CONFIG[car.status as VehicleStatus]?.badgeClass ?? "bg-kraft-ink/90 text-white border-white/20"
          )}>
            {VEHICLE_STATUS_CONFIG[car.status as VehicleStatus]?.label || car.status}
          </div>
          
          {car.is_coinvested && (
             <div className="px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-purple-500/90 text-white border border-purple-400/50 backdrop-blur-xl shadow-2xl flex items-center gap-2 w-max">
                <Award size={12} />
                Cùng đầu tư
             </div>
          )}
        </div>

        {/* Aging Indicator */}
        {isAging && car.status !== VehicleStatus.SOLD && (
          <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-red-500/90 backdrop-blur-xl border border-red-400/50 flex items-center justify-center text-white shadow-2xl animate-pulse">
            <Clock size={18} />
          </div>
        )}

        {/* Pin Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPin && onPin(car.id, !car.is_pinned);
          }}
          className={cn(
            "absolute top-4 right-4 w-9 h-9 rounded-xl backdrop-blur-xl border shadow-2xl flex items-center justify-center transition-all",
            car.is_pinned 
              ? "bg-kraft-accent text-white border-white/20" 
              : "bg-white/20 text-white/60 border-white/10 opacity-0 group-hover:opacity-100"
          )}
          style={{ 
            // If aging, shift pin button slightly
            top: isAging && car.status !== VehicleStatus.SOLD ? '60px' : '16px' 
          }}
        >
          {car.is_pinned ? <Pin size={16} fill="currentColor" /> : <Pin size={16} />}
        </button>

        <div className={cn(
          "absolute inset-x-0 bottom-4 flex justify-center",
          isLarge && "bottom-10"
        )}>
           <div className={cn(
             "px-10 py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full shadow-2xl transform transition-transform group-hover:scale-110 text-center",
             isLarge && "px-16 py-4"
           )}>
              <p className={cn(
                "text-[7px] font-black uppercase tracking-[0.2em] text-white/40 mb-0.5",
                isLarge && "text-[9px]"
              )}>{car.status === VehicleStatus.SOLD ? "Giá bán thực tế" : "Giá chào bán"}</p>
              <p className={cn(
                "text-lg font-black text-white leading-none tracking-tighter",
                isLarge && "text-4xl"
              )}>
                {formatCurrency(car.sale_price || 0)}
              </p>
           </div>
        </div>
      </div>

      {/* Info Section */}
      <div className={cn("p-5 flex-1 flex flex-col justify-between", isLarge && "p-10")}>
        <div>
          <h3 className={cn(
            "text-lg font-black text-kraft-ink tracking-tighter uppercase line-clamp-2 leading-[1.1] mb-2 group-hover:text-kraft-accent transition-colors",
            isLarge && "text-3xl mb-4"
          )}>
            {car.name}
          </h3>
          <div className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-2 opacity-40 text-[10px] font-black uppercase tracking-widest",
            isLarge && "text-sm gap-x-8"
          )}>
            <span className="text-kraft-ink">#{car.code}</span>
            <span className="flex items-center gap-1.5"><Calendar size={isLarge ? 18 : 12} strokeWidth={2.5} /> {car.year}</span>
            <span className="flex items-center gap-1.5"><TrendingUp size={isLarge ? 18 : 12} strokeWidth={2.5} /> {(car.odo || 0).toLocaleString()} km</span>
          </div>
        </div>

        {/* Footer info: Days in stock or Profit info */}
        <div className="pt-4 border-t border-black/5 flex justify-between items-end mt-4">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Lưu kho</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-black tracking-tight",
                isAging ? "text-red-500" : "text-kraft-ink"
              )}>
                {car.days || 0} ngày
              </span>
              {isAging && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
            </div>
          </div>
          <div className="text-right space-y-1.5">
             <span className="text-[9px] font-black uppercase tracking-widest opacity-30">
               {canSeeFullInfo 
                 ? (car.status === VehicleStatus.SOLD ? "Lợi nhuận ròng" : "Lợi nhuận dự tính") 
                 : ""}
             </span>
             <p className={cn(
               "text-sm font-black tracking-tight",
               canSeeFullInfo ? "text-emerald-500" : "text-kraft-ink"
             )}>
                {canSeeFullInfo 
                  ? formatCurrency(financials.showroomProfitShare)
                  : ""
                }
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

