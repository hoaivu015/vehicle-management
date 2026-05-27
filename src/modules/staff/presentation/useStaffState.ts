import { useState, useMemo, useEffect } from 'react';
import { useNotification } from '@/src/shared/presentation/useNotification';
import { useActionResponse } from '@/src/shared/presentation/useActionResponse';
import { StaffView } from './StaffPresenter';
import { StaffWithSalary } from '@/src/modules/staff/application/GetStaffList';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { Vehicle } from '@/src/shared/domain/types';
import { AddStaffInput, UpdateStaffInput, AddStaffExpenseInput, UpdateStaffExpenseInput } from '../domain/StaffValidation';

export const useStaffState = (initialMonth: string, userRole?: string) => {
  const { createStaffPresenter } = useDependencies();
  const [filterMonth, setFilterMonth] = useState(initialMonth);
  const [staffList, setStaffList] = useState<StaffWithSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffWithSalary | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffWithSalary | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithSalary | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const notification = useNotification();
  const { isSubmitting, executeAction } = useActionResponse();

  const presenter = useMemo(() => {
    return createStaffPresenter();
  }, [createStaffPresenter]);

  const view: StaffView = useMemo(() => ({
    showStaffList: (list) => setStaffList(list),
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
    showError: (msg) => {
      setError(msg);
      notification.error(msg);
    },
    onStaffAdded: () => {
      presenter.loadStaff(filterMonth);
      setIsAddOpen(false);
    },
    onStaffUpdated: () => {
      presenter.loadStaff(filterMonth);
      setEditingStaff(null);
    },
    onStaffDeleted: () => {
      presenter.loadStaff(filterMonth);
    },
    onExpenseAdded: () => {
       presenter.loadStaff(filterMonth);
    },
    showVehicles: (v) => setVehicles(v)
  }), [presenter, filterMonth, notification]);

  useEffect(() => {
    presenter.attachView(view);
    presenter.loadStaff(filterMonth);
    presenter.loadVehicles(); // Load vehicles once or when needed
    presenter.subscribeToChanges(filterMonth);
    return () => presenter.detachView();
  }, [presenter, view, filterMonth]);

  useEffect(() => {
    setSelectedStaff(current => {
      if (!current) return current;
      const updated = staffList.find(s => s.id === current.id);
      return updated || current;
    });
  }, [staffList]);

  const handleAddStaff = (data: AddStaffInput) => 
    executeAction(() => presenter.addStaff(data), { successMessage: 'Thêm nhân viên thành công!' });

  const handleUpdateStaff = (data: UpdateStaffInput) => 
    executeAction(() => presenter.updateStaff(data), { successMessage: 'Cập nhật thành công!' });

   const handleDelete = () => {
    if (!deletingStaff) return Promise.resolve();
    return executeAction(async () => {
      await presenter.deleteStaff(deletingStaff.id);
      setDeletingStaff(null);
    }, { successMessage: 'Đã xóa nhân viên thành công!' });
  };

   const handleTogglePayment = (staff: StaffWithSalary, paymentDate?: string) => {
    const isPaid = staff.salaryDetails.isPaid;
    const previousList = [...staffList];

    // Optimistic Update
    setStaffList(current => current.map(s => {
      if (s.id === staff.id) {
        return { ...s, salaryDetails: { ...s.salaryDetails, isPaid: !isPaid } };
      }
      return s;
    }));

    return executeAction(
      () => presenter.toggleSalaryPayment(staff, filterMonth, paymentDate, userRole),
      {
        successMessage: isPaid ? 'Đã hủy trạng thái thanh toán' : 'Đã xác nhận thanh toán lương & chi phí',
      }
    ).catch((err) => {
      setStaffList(previousList);
      throw err;
    });
  };

  const handleAddExpense = (id: string | number, data: AddStaffExpenseInput) => 
    executeAction(() => presenter.addStaffExpense(id, data, userRole), { successMessage: 'Đã thêm chi phí!' });

  const handleToggleReimbursement = (id: string | number, exId: string) => 
    executeAction(() => presenter.toggleReimbursement(id, exId, userRole));

  const handleDeleteExpense = (id: string | number, exId: string) => 
    executeAction(() => presenter.deleteExpense(id, exId, userRole), { successMessage: 'Đã xóa chi phí!' });

  const handleUpdateExpense = (id: string | number, exId: string, data: UpdateStaffExpenseInput) => 
    executeAction(() => presenter.updateExpense(id, exId, data, userRole), { successMessage: 'Cập nhật thành công!' });

  const handleReimburseMultiple = (id: string | number, ids: string[]) => 
    executeAction(() => presenter.reimburseMultiple(id, ids, userRole), { successMessage: 'Đã hoàn tiền thành công!' });

  const handleUpdateVehicle = (id: number, data: Partial<Vehicle>) => 
    executeAction(() => presenter.updateVehicle(id, data, userRole), { successMessage: 'Cập nhật thông tin xe thành công!' });

  return {
    filterMonth, setFilterMonth,
    staffList,
    vehicles,
    loading,
    error,
    isAddOpen, setIsAddOpen,
    editingStaff, setEditingStaff,
    deletingStaff, setDeletingStaff,
    selectedStaff, setSelectedStaff,
    isSubmitting,
    presenter,
    handleAddStaff,
    handleUpdateStaff,
    handleDelete,
    handleTogglePayment,
    handleAddExpense,
    handleToggleReimbursement,
    handleDeleteExpense,
    handleUpdateExpense,
    handleReimburseMultiple,
    handleUpdateVehicle
  };
};
