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
      "p-g4 rounded-t2 border transition-all duration-500",
      isActive ? "bg-kraft-accent/[0.03] border-kraft-accent/20 shadow-sm" : "bg-white border-hairline-soft"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", isActive ? "bg-kraft-accent/10 text-kraft-accent" : "bg-surface-soft text-sub-label")}>
            <Users size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-sub-label">Hình thức nhập</span>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, is_coinvested: !prev.is_coinvested }))}
          className={cn(
            "h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            isActive ? "bg-kraft-accent text-white shadow-kraft-deep" : "bg-surface-soft text-sub-label"
          )}
        >
          {isActive ? 'Đang góp vốn' : 'Xe Showroom'}
        </motion.button>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="grid grid-cols-2 gap-g2 overflow-hidden pt-4 border-t border-hairline-soft"
          >
            <BaseSelect 
              label="Nhà đầu tư"
              value={formData.coinvestor_code}
              onChange={(e) => setFormData(prev => ({ ...prev, coinvestor_code: e.target.value }))}
              variant="dense"
            >
              <option value="">--</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.code}>{s.name}</option>
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
