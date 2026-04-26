import { useState, useEffect } from 'react';
import { AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';
import { CloudinaryVehicleStorageRepository } from '@/src/modules/inventory/infrastructure/CloudinaryVehicleStorageRepository';

const initialFormState: AddVehicleRequest = {
  name: '',
  year: new Date().getFullYear(),
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
  buying_commission: 0
};

export const useAddVehicleForm = (isOpen: boolean, onSubmit: (data: AddVehicleRequest) => Promise<void>, onClose: () => void) => {
  const [formData, setFormData] = useState<AddVehicleRequest>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const storageRepo = new CloudinaryVehicleStorageRepository();

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
    if (formData.is_coinvested && (!formData.coinvestor_code || formData.coinvest_amount === 0)) {
      return setFormError('Vui lòng nhập đầy đủ thông tin góp vốn');
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi lưu thông tin. Vui lòng kiểm tra lại.');
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
    } catch (error: any) {
      setFormError(error.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
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
