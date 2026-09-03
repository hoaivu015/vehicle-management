import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddVehicleForm, VehicleStorageRepository } from '../useAddVehicleForm';

describe('useAddVehicleForm - Co-investment & Commission Synchronization', () => {
  const mockStorageRepo: VehicleStorageRepository = {
    uploadImage: vi.fn().mockResolvedValue('https://example.com/car.jpg')
  };
  const mockSubmit = vi.fn().mockResolvedValue(undefined);
  const mockClose = vi.fn();

  it('khởi tạo mặc định: xe Showroom có hoa hồng nhập 3.000.000 đ và chưa góp vốn', () => {
    const { result } = renderHook(() => 
      useAddVehicleForm(true, mockSubmit, mockClose, mockStorageRepo)
    );

    expect(result.current.formData.is_coinvested).toBe(false);
    expect(result.current.formData.buying_commission).toBe(3000000);
    expect(result.current.formData.coinvestor_code).toBe('');
    expect(result.current.formData.coinvest_amount).toBe(0);
  });

  it('khi bật góp vốn: tự động đặt lương mua = 0 đ và đồng bộ nhân viên thu mua sang người góp vốn', () => {
    const { result } = renderHook(() => 
      useAddVehicleForm(true, mockSubmit, mockClose, mockStorageRepo)
    );

    // 1. Chọn nhân viên thu mua trước
    act(() => {
      result.current.handleBuyerChange('NV01');
    });
    expect(result.current.formData.buyer).toBe('NV01');
    expect(result.current.formData.coinvestor_code).toBe(''); // Xe Showroom chưa có coinvestor

    // 2. Bật hình thức Góp vốn
    act(() => {
      result.current.handleToggleCoInvest(true);
    });

    // Lương mua phải = 0 đ
    expect(result.current.formData.is_coinvested).toBe(true);
    expect(result.current.formData.buying_commission).toBe(0);
    // Nhân viên thu mua là nhân viên góp vốn
    expect(result.current.formData.coinvestor_code).toBe('NV01');
    expect(result.current.formData.buyer).toBe('NV01');
  });

  it('khi đang bật góp vốn: đổi nhà đầu tư thì nhân viên thu mua tự động cập nhật theo', () => {
    const { result } = renderHook(() => 
      useAddVehicleForm(true, mockSubmit, mockClose, mockStorageRepo)
    );

    act(() => {
      result.current.handleToggleCoInvest(true);
    });

    // Chọn nhà đầu tư NV02
    act(() => {
      result.current.handleCoinvestorChange('NV02');
    });

    expect(result.current.formData.coinvestor_code).toBe('NV02');
    expect(result.current.formData.buyer).toBe('NV02');
    expect(result.current.formData.buying_commission).toBe(0);
  });

  it('khi đang bật góp vốn: đổi nhân viên thu mua thì nhà đầu tư tự động cập nhật theo', () => {
    const { result } = renderHook(() => 
      useAddVehicleForm(true, mockSubmit, mockClose, mockStorageRepo)
    );

    act(() => {
      result.current.handleToggleCoInvest(true);
    });

    // Đổi NV thu mua sang NV03
    act(() => {
      result.current.handleBuyerChange('NV03');
    });

    expect(result.current.formData.buyer).toBe('NV03');
    expect(result.current.formData.coinvestor_code).toBe('NV03');
  });

  it('khi tắt góp vốn quay về Showroom: khôi phục lương mua 3.000.000 đ và reset thông tin góp vốn', () => {
    const { result } = renderHook(() => 
      useAddVehicleForm(true, mockSubmit, mockClose, mockStorageRepo)
    );

    // Bật góp vốn và nhập số tiền góp
    act(() => {
      result.current.handleToggleCoInvest(true);
      result.current.handleCoinvestorChange('NV01');
      result.current.setFormData(prev => ({ ...prev, coinvest_amount: 200000000 }));
    });

    expect(result.current.formData.is_coinvested).toBe(true);
    expect(result.current.formData.buying_commission).toBe(0);
    expect(result.current.formData.coinvestor_code).toBe('NV01');
    expect(result.current.formData.coinvest_amount).toBe(200000000);

    // Bấm quay về Showroom
    act(() => {
      result.current.handleToggleCoInvest(false);
    });

    expect(result.current.formData.is_coinvested).toBe(false);
    expect(result.current.formData.buying_commission).toBe(3000000);
    expect(result.current.formData.coinvestor_code).toBe('');
    expect(result.current.formData.coinvest_amount).toBe(0);
    // Nhân viên thu mua vẫn được giữ lại cho xe Showroom
    expect(result.current.formData.buyer).toBe('NV01');
  });
});
