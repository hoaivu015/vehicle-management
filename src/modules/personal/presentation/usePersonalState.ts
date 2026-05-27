import { useState, useMemo, useEffect } from 'react';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { useActionResponse } from '@/src/shared/presentation/useActionResponse';
import { BaseView } from '@/src/shared/presentation/BasePresenter';

export interface PersonalViewInterface {
  updateVehicles(vehicles: Vehicle[]): void;
  setAllVehicles(vehicles: Vehicle[]): void;
  setLoading(loading: boolean): void;
}

export interface StaffView extends BaseView {
  showStaffList(staff: import('@/src/modules/staff/application/GetStaffList').StaffWithSalary[]): void;
  onStaffAdded(): void;
  onStaffUpdated(): void;
  onStaffDeleted(): void;
  onExpenseAdded?(): void;
}

export interface InventoryView extends BaseView {
  showAvailableCars(cars: Vehicle[]): void;
  showSoldCars(cars: Vehicle[]): void;
  onStatusUpdated(): void;
  onVehicleUpdated(vehicle: Vehicle): void;
  setStaffList(staff: Staff[]): void;
}


import { Vehicle, Staff, StaffExpense } from '@/src/shared/domain/types';
import { AddStaffExpenseInput, UpdateStaffExpenseInput } from '@/src/modules/staff/domain/StaffValidation';
import { UpdateVehicleInput } from '@/src/modules/inventory/domain/VehicleSchema';

export const usePersonalState = (user: Staff, onUpdateUser?: (email: string, data: Partial<Staff> & { password?: string }) => void) => {
  const { createPersonalPresenter, createStaffPresenter, createInventoryPresenter } = useDependencies();
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [staffData, setStaffData] = useState<import('@/src/modules/staff/application/GetStaffList').StaffWithSalary | null>(null);
  
  // Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<StaffExpense | null>(null);
  
  // Vehicle Detail Modal
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isVehicleDetailOpen, setIsVehicleDetailOpen] = useState(false);
  
  // Profile/Password Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || 'Phòng Kinh doanh'
  });
  
  const { executeAction, isSubmitting } = useActionResponse();

  const presenter = useMemo(() => createPersonalPresenter(), [createPersonalPresenter]);

  const { staffPresenter, inventoryPresenter } = useMemo(() => {
    return { 
      staffPresenter: createStaffPresenter(), 
      inventoryPresenter: createInventoryPresenter() 
    };
  }, [createStaffPresenter, createInventoryPresenter]);

  useEffect(() => {
    if (!user) return;
    const view: PersonalViewInterface = { 
      updateVehicles: setCars, 
      setAllVehicles: setAllVehicles,
      setLoading 
    };
    presenter.attach(view);

    const staffView: StaffView = {
      showStaffList: (list: import('@/src/modules/staff/application/GetStaffList').StaffWithSalary[]) => {
        const current = list.find(s => s.code === user.code);
        if (current) setStaffData(current);
      },
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: () => {},

      onStaffAdded: () => {},
      onStaffUpdated: () => staffPresenter.loadStaff(selectedMonth),
      onStaffDeleted: () => {}
    };
    staffPresenter.attachView(staffView);
    staffPresenter.loadStaff(selectedMonth);

    const inventoryView: InventoryView = {
      showAvailableCars: (cars) => setCars(cars),
      showSoldCars: () => {},
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: () => {}, // Handled by useActionResponse
      onStatusUpdated: () => {
        staffPresenter.loadStaff(selectedMonth); 
      },
      onVehicleUpdated: (v) => {
        setSelectedVehicle(v);
        staffPresenter.loadStaff(selectedMonth);
      },
      setStaffList: () => {} 
    };
    inventoryPresenter.attachView(inventoryView);

    return () => {
      presenter.detach();
      staffPresenter.detachView();
      inventoryPresenter.detachView();
    };
  }, [presenter, staffPresenter, inventoryPresenter, user, selectedMonth]);

  useEffect(() => {
    setSelectedVehicle(current => {
      if (!current) return current;
      const updated = allVehicles.find(c => c.id === current.id);
      return updated || current;
    });
  }, [allVehicles]);

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Mật khẩu phải từ 6 ký tự trở lên.");
    }

    if (onUpdateUser) {
      executeAction(async () => {
        await onUpdateUser(user.email, { password: newPassword });
        setIsModalOpen(false);
        setNewPassword('');
      }, { successMessage: 'Đổi mật khẩu thành công!' });
    }
  };

  const handleUpdateProfile = () => {
    if (!editFormData.name) {
      throw new Error("Vui lòng nhập tên.");
    }

    if (onUpdateUser) {
      executeAction(async () => {
        await onUpdateUser(user.email, editFormData);
        setIsEditModalOpen(false);
      }, { successMessage: 'Cập nhật trang cá nhân thành công!' });
    }
  };

  const handleUpdateStatus = (id: number, status: string, extra: Record<string, unknown>) =>
    executeAction(() => inventoryPresenter.updateVehicleStatus({ id, nextStatus: status as any, user: user.code, ...extra }, user.role), { 
      successMessage: 'Cập nhật trạng thái thành công!' 
    });

  const handleDeleteVehicle = (id: number) =>
    executeAction(() => inventoryPresenter.deleteVehicle(id, user.role), { 
      successMessage: 'Đã xóa xe khỏi hệ thống!' 
    });

  const handleUpdateVehicle = (id: number, data: UpdateVehicleInput) =>
    executeAction(() => inventoryPresenter.updateVehicle(id, data, user.role), { 
      successMessage: 'Cập nhật thông tin thành công!' 
    });

  const handleAddCost = (id: number, name: string, amount: number) =>
    executeAction(() => inventoryPresenter.addVehicleCost(id, name, amount, user.id, user.role), { 
      successMessage: 'Đã thêm chi phí!' 
    });

  const handleDeleteCost = (id: number, idx: number) =>
    executeAction(() => inventoryPresenter.deleteVehicleCost(id, idx, user.role), { 
      successMessage: 'Đã xóa chi phí!' 
    });

  const handlePin = (id: number, pin: boolean) =>
    executeAction(() => inventoryPresenter.togglePin(id, pin));

  const handleAddPurchasePayment = (id: number, amount: number, note: string, receiver: string) =>
    executeAction(() => inventoryPresenter.addPurchasePayment(id, amount, note, receiver, user.role), { 
      successMessage: 'Đã lưu phiếu chi!' 
    });

  const handleAddSalePayment = (id: number, amount: number, note: string, receiver: string, status: string, seller: string, bName?: string, sPrice?: number, comm?: number, bBonus?: number) =>
    executeAction(() => inventoryPresenter.addSalePayment(id, amount, note, receiver, status as any, seller, bName || '', sPrice || 0, comm || 0, bBonus || 0, user.role), { 
      successMessage: 'Ghi nhận giao dịch thành công!' 
    });

  const handleCancelSale = (id: number, code: string) =>
    executeAction(() => inventoryPresenter.cancelSale(id, code, user.role), { 
      successMessage: 'Đã hủy giao dịch bán!' 
    });

  const handleAddStaffExpense = (data: AddStaffExpenseInput) => 
    executeAction(() => staffPresenter.addStaffExpense(String(staffData?.id || user.id), data), {
      successMessage: 'Đã thêm ghi chú chi phí!'
    });

  const handleUpdateExpense = (expenseId: string, data: UpdateStaffExpenseInput) =>
    executeAction(() => staffPresenter.updateExpense(String(staffData?.id || user.id), expenseId, data), {
      successMessage: 'Cập nhật thành công!'
    });

  const handleDeleteExpense = (expenseId: string) =>
    executeAction(() => staffPresenter.deleteExpense(String(staffData?.id || user.id), expenseId), {
      successMessage: 'Đã xóa ghi chú!'
    });

  return {
    cars, allVehicles, loading, selectedMonth, setSelectedMonth, staffData, 
    isExpenseModalOpen, setIsExpenseModalOpen,
    editingExpense, setEditingExpense,
    selectedVehicle, setSelectedVehicle,
    isVehicleDetailOpen, setIsVehicleDetailOpen,
    isModalOpen, setIsModalOpen, 
    isEditModalOpen, setIsEditModalOpen,
    newPassword, setNewPassword, 
    editFormData, setEditFormData, 
    handleChangePassword, handleUpdateProfile,
    handleUpdateStatus,
    handleDeleteVehicle,
    handleUpdateVehicle,
    handleAddCost,
    handleDeleteCost,
    handlePin,
    handleAddPurchasePayment,
    handleAddSalePayment,
    handleCancelSale,
    handleAddStaffExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    staffPresenter, inventoryPresenter,
    isSubmitting
  };
};
