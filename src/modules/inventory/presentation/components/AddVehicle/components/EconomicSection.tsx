import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';
import { Staff } from '@/src/shared/domain/types';

interface EconomicSectionProps {
  formData: AddVehicleRequest;
  setFormData: React.Dispatch<React.SetStateAction<AddVehicleRequest>>;
  staffList: Staff[];
  onBuyerChange?: (buyer: string) => void;
}

export const EconomicSection: React.FC<EconomicSectionProps> = ({ 
  formData, 
  setFormData, 
  staffList,
  onBuyerChange
}) => {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <SmartAmountInput 
          label="Giá nhập" 
          required
          value={formData.purchase_price} 
          onChange={(v) => setFormData(prev => ({ ...prev, purchase_price: v }))} 
          variant="dense"
        />
        <BaseInput 
          label="Ngày nhập xe"
          type="date"
          required
          value={formData.purchase_date}
          onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
          icon={Calendar}
          variant="dense"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <BaseSelect 
          label="Nhân viên thu mua"
          required
          value={formData.buyer}
          onChange={(e) => {
            if (onBuyerChange) {
              onBuyerChange(e.target.value);
            } else {
              const code = e.target.value;
              setFormData(prev => ({
                ...prev,
                buyer: code,
                ...(prev.is_coinvested ? { coinvestor_code: code } : {})
              }));
            }
          }}
          icon={Users}
          variant="dense"
        >
          <option value="">Chọn nhân viên thu mua...</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
          ))}
        </BaseSelect>

        <div>
          <SmartAmountInput 
            label={formData.is_coinvested ? "Hoa hồng thu mua (Góp vốn = 0 ₫)" : "Hoa hồng thu mua"} 
            value={formData.buying_commission ?? 0} 
            onChange={(v) => setFormData(prev => ({ ...prev, buying_commission: v ?? 0 }))} 
            variant="dense"
            disabled={formData.is_coinvested}
          />
        </div>
      </div>
    </div>
  );
};
