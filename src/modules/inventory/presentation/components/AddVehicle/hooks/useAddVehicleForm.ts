import React, { useState, useEffect } from 'react';
import { AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';

export interface VehicleStorageRepository {
  uploadImage(file: File): Promise<string>;
}

const getInitialFormState = (): AddVehicleRequest => ({
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
  buying_commission: 3000000
});

export const useAddVehicleForm = (
  isOpen: boolean, 
  onSubmit: (data: AddVehicleRequest) => Promise<void>, 
  onClose: () => void,
  storageRepo: VehicleStorageRepository
) => {
  const [formData, setFormData] = useState<AddVehicleRequest>(getInitialFormState);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(getInitialFormState());
      setFormError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError(null);

    if (!formData.name) return setFormError('Vui lòng nhập tên xe và phiên bản');
    if (!formData.buyer) return setFormError('Vui lòng chọn nhân viên thu mua phụ trách');
    
    if (formData.is_coinvested) {
      if (!formData.coinvestor_code) return setFormError('Vui lòng chọn đối tác góp vốn');
      if ((formData.coinvest_amount || 0) === 0) return setFormError('Vui lòng nhập số tiền góp vốn hợp lệ');
      if ((formData.coinvest_amount || 0) > formData.purchase_price) {
        return setFormError('Số tiền góp vốn không được vượt quá giá nhập xe. Vui lòng kiểm tra lại.');
      }
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      console.error('[AddVehicleForm] Submit error:', err);
      const message = err instanceof Error ? err.message : 'Không thể khởi tạo hồ sơ xe. Vui lòng kiểm tra lại kết nối và thử lại.';
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
      const message = error instanceof Error ? error.message : 'Không thể tải ảnh xe lên máy chủ. Vui lòng kiểm tra lại tệp ảnh và thử lại.';
      setFormError(message);
    } finally {
      setIsUploading(false);
      // Reset value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleToggleCoInvest = (isCoinvested: boolean) => {
    setFormData(prev => {
      if (isCoinvested) {
        // Khi bật Góp vốn:
        // 1. Lương mua = 0 đ
        // 2. Nhân viên thu mua là nhân viên góp vốn: đồng bộ coinvestor_code và buyer
        const syncedStaff = prev.buyer || prev.coinvestor_code || '';
        return {
          ...prev,
          is_coinvested: true,
          buying_commission: 0,
          buyer: syncedStaff,
          coinvestor_code: syncedStaff
        };
      } else {
        // Khi quay về Showroom:
        // 1. Khôi phục lương mua 3.000.000 đ
        // 2. Xóa dữ liệu góp vốn
        return {
          ...prev,
          is_coinvested: false,
          buying_commission: 3000000,
          coinvestor_code: '',
          coinvest_amount: 0
        };
      }
    });
  };

  const handleBuyerChange = (buyerCode: string) => {
    setFormData(prev => ({
      ...prev,
      buyer: buyerCode,
      ...(prev.is_coinvested ? { coinvestor_code: buyerCode } : {})
    }));
  };

  const handleCoinvestorChange = (coinvestorCode: string) => {
    setFormData(prev => ({
      ...prev,
      coinvestor_code: coinvestorCode,
      ...(prev.is_coinvested ? { buyer: coinvestorCode } : {})
    }));
  };

  return {
    formData,
    setFormData,
    loading,
    isUploading,
    formError,
    handleSubmit,
    handleFileUpload,
    handleToggleCoInvest,
    handleBuyerChange,
    handleCoinvestorChange
  };
};
