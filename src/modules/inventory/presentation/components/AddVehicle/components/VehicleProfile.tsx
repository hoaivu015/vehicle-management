import React from 'react';
import { Car, Calendar, Layers, Clock } from 'lucide-react';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
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
    <div className="space-y-6">
      <div className="space-y-4">
        <BaseInput 
          label="Tên sản phẩm / Model"
          required
          placeholder="VD: Mercedes C300 AMG 2021"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          icon={Car}
          className="!h-14"
        />
        
        <div className="grid grid-cols-2 gap-g2">
          <BaseInput 
            label="Năm SX"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
            icon={Calendar}
            className="!h-14"
          />
          <BaseInput 
            label="Màu ngoại thất"
            placeholder="Trắng / Đen..."
            value={formData.color || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            icon={Layers}
            className="!h-14"
          />
        </div>

        <SmartAmountInput
          label="Số ODO (km)"
          value={formData.odo || 0}
          onChange={(v) => setFormData(prev => ({ ...prev, odo: v }))}
          suffix=" km"
          icon={Clock}
          showTextPreview={false}
          placeholder="VD: 5k, 12k..."
        />

        <BaseSelect
          label="Trạng thái Pin (Chỉ dành cho xe điện VinFast)"
          value={formData.battery_type || 'None'}
          onChange={(e) => setFormData(prev => ({ ...prev, battery_type: e.target.value }))}
          icon={Layers}
          className="!h-14"
        >
          <option value="None">Không (Xe xăng / Khác)</option>
          <option value="Pin Thuê">Pin Thuê</option>
          <option value="Pin Mua Đứt">Pin Mua Đứt</option>
        </BaseSelect>
      </div>
    </div>
  );
};
