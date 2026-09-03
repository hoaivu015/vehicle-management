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
  onToggleCoInvest?: (isCoinvested: boolean) => void;
  onCoinvestorChange?: (investorCode: string) => void;
}

export const CoInvestModule: React.FC<CoInvestModuleProps> = ({ 
  formData, 
  setFormData, 
  staffList,
  onToggleCoInvest,
  onCoinvestorChange
}) => {
  const isActive = formData.is_coinvested;

  const handleToggle = (coinvest: boolean) => {
    if (onToggleCoInvest) {
      onToggleCoInvest(coinvest);
    } else {
      setFormData(prev => {
        if (coinvest) {
          const syncedStaff = prev.buyer || prev.coinvestor_code || '';
          return {
            ...prev,
            is_coinvested: true,
            buying_commission: 0,
            buyer: syncedStaff,
            coinvestor_code: syncedStaff
          };
        } else {
          return {
            ...prev,
            is_coinvested: false,
            buying_commission: 3000000,
            coinvestor_code: '',
            coinvest_amount: 0
          };
        }
      });
    }
  };

  const handleInvestorSelect = (code: string) => {
    if (onCoinvestorChange) {
      onCoinvestorChange(code);
    } else {
      setFormData(prev => ({
        ...prev,
        coinvestor_code: code,
        ...(prev.is_coinvested ? { buyer: code } : {})
      }));
    }
  };

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
            onClick={() => handleToggle(false)}
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
            onClick={() => handleToggle(true)}
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
            className="space-y-3 overflow-hidden pt-4 border-t border-hairline-soft"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200/60 text-[10.5px] font-bold text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>Xe góp vốn: Hoa hồng thu mua = 0 ₫ • Nhân viên thu mua đồng thời là đối tác góp vốn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseSelect 
                label="Nhà đầu tư (Nhân viên thu mua)"
                value={formData.coinvestor_code}
                onChange={(e) => handleInvestorSelect(e.target.value)}
                variant="dense"
              >
                <option value="">Chọn nhà đầu tư...</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </BaseSelect>
              <SmartAmountInput
                label="Số tiền góp vốn"
                value={formData.coinvest_amount || 0}
                onChange={(amount) => setFormData(prev => ({ ...prev, coinvest_amount: amount }))}
                variant="dense"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
