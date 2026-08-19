import React from 'react';
import { Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { BaseSelect } from '@/src/shared/design-system/FormElements';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';
import { Staff } from '@/src/shared/domain/types';

interface CoInvestModuleProps {
  formData: AddVehicleRequest;
  setFormData: React.Dispatch<React.SetStateAction<AddVehicleRequest>>;
  staffList: Staff[];
}

export const CoInvestModule: React.FC<CoInvestModuleProps> = ({ 
  formData, 
  setFormData, 
  staffList 
}) => {
  const isActive = formData.is_coinvested;

  return (
    <div className={cn(
      "p-3.5 md:p-4 rounded-[20px] border transition-all duration-300",
      isActive ? "bg-kraft-accent/[0.03] border-kraft-accent/30 shadow-sm" : "bg-white border-hairline-soft"
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
            isActive ? "bg-kraft-accent/10 text-kraft-accent" : "bg-surface-soft text-sub-label"
          )}>
            <Users size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-kraft-ink">Hình thức đầu tư</span>
        </div>
        
        {/* Dual Sliding Segmented Pill */}
        <div className="flex items-center bg-black/[0.04] p-1 rounded-full border border-black/[0.04] relative shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, is_coinvested: false }))}
            className={cn(
              "relative px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 z-10 whitespace-nowrap cursor-pointer",
              !isActive ? "text-kraft-ink" : "text-sub-label hover:text-kraft-ink"
            )}
          >
            {!isActive && (
              <motion.div
                layoutId="addVehicleCoInvestPill"
                className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5 z-[-1]"
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            )}
            <span>Showroom</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, is_coinvested: true }))}
            className={cn(
              "relative px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 z-10 whitespace-nowrap cursor-pointer",
              isActive ? "text-white" : "text-sub-label hover:text-kraft-ink"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="addVehicleCoInvestPill"
                className="absolute inset-0 bg-kraft-accent rounded-full shadow-[0_2px_10px_rgba(10,80,250,0.3)] z-[-1]"
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            )}
            <span>Góp vốn</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden pt-4 border-t border-hairline-soft"
          >
            <BaseSelect 
              label="Nhà đầu tư"
              value={formData.coinvestor_code}
              onChange={(e) => setFormData(prev => ({ ...prev, coinvestor_code: e.target.value }))}
              variant="dense"
            >
              <option value="">Chọn nhà đầu tư...</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </BaseSelect>
            <SmartAmountInput
              label="Số tiền góp"
              value={formData.coinvest_amount || 0}
              onChange={(amount) => setFormData(prev => ({ ...prev, coinvest_amount: amount }))}
              variant="dense"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
