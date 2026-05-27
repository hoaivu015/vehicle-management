import { useState, useEffect } from 'react';
import { AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';

export interface VehicleStorageRepository {
  uploadImage(file: File): Promise<string>;
}

export const useAddVehicleForm = (
  isOpen: boolean, 
  onSubmit: (data: AddVehicleRequest) => Promise<void>, 
  onClose: () => void,
  storageRepo: VehicleStorageRepository
) => {
  const initialFormState: AddVehicleRequest = {
    name: '',
    year: new Date().getFullYear().toString(),
    odo: 0,
    color: '',
    purchase_price: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    buyer: '',
    is_coinvested: false,
    coinvestor_code: '',
    coinvest_amount: 0,
    notes: '',
    image_url: '',
    buying_commission: 0,
    battery_type: 'None'
  };

  const [formData, setFormData] = useState<AddVehicleRequest>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setFormError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError(null);

    if (!formData.name) return setFormError('Vui lòng nhập tên xe');
    if (!formData.buyer) return setFormError('Vui lòng chọn nhân viên mua');
    
    if (formData.is_coinvested) {
      if (!formData.coinvestor_code) return setFormError('Vui lòng chọn nhà đầu tư');
      if ((formData.coinvest_amount || 0) === 0) return setFormError('Vui lòng nhập số tiền góp vốn');
      if ((formData.coinvest_amount || 0) > formData.purchase_price) {
        return setFormError('Số tiền góp không được lớn hơn giá nhập');
      }
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      console.error('[AddVehicleForm] Submit error:', err);
      const message = err instanceof Error ? err.message : 'Lỗi khi lưu thông tin. Vui lòng kiểm tra lại.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);
    try {
      const publicUrl = await storageRepo.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi khi tải ảnh lên';
      setFormError(message);
    } finally {
      setIsUploading(false);
      // Reset value to allow selecting the same file again
      e.target.value = '';
    }
  };

  return {
    formData,
    setFormData,
    loading,
    isUploading,
    formError,
    handleSubmit,
    handleFileUpload
  };
};
