import React from 'react';
import { Car, Calendar, Layers, Gauge } from 'lucide-react';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';

interface VehicleProfileProps {
  formData: AddVehicleRequest;
  setFormData: React.Dispatch<React.SetStateAction<AddVehicleRequest>>;
}

export const VehicleProfile: React.FC<VehicleProfileProps> = ({ 
  formData, 
  setFormData
}) => {
  return (
    <div className="space-y-2.5">
      <BaseInput 
        label="Tên xe & Phiên bản"
        required
        placeholder="VD: Mercedes-Benz C300 AMG"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        icon={Car}
        variant="dense"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <BaseInput 
          label="Năm sản xuất"
          type="number"
          value={formData.year}
          onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
          icon={Calendar}
          variant="dense"
        />
        <BaseInput 
          label="Màu ngoại thất"
          placeholder="Trắng / Đen..."
          value={formData.color || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          icon={Layers}
          variant="dense"
        />
        <SmartAmountInput
          label="Số ODO"
          value={formData.odo || 0}
          onChange={(v) => setFormData(prev => ({ ...prev, odo: v }))}
          suffix=" km"
          icon={Gauge}
          showTextPreview={false}
          placeholder="VD: 15.000, 45.000..."
          variant="dense"
        />
      </div>
    </div>
  );
};
