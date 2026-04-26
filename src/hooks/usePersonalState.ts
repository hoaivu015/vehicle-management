import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { PersonalPresenter, PersonalViewInterface } from '@/src/modules/user/presentation/PersonalPresenter';
import { StaffPresenter, StaffView } from '@/src/modules/staff/presentation/StaffPresenter';
import { SupabaseVehicleRepository } from '@/src/modules/inventory/infrastructure/SupabaseVehicleRepository';
import { SupabaseStaffRepository } from '@/src/modules/staff/infrastructure/SupabaseStaffRepository';
import { SupabaseExpenseRepository } from '@/src/modules/finance/infrastructure/SupabaseExpenseRepository';
import { GetStaffList, StaffWithSalary } from '@/src/modules/staff/application/GetStaffList';
import { AddStaff } from '@/src/modules/staff/application/AddStaff';
import { UpdateStaff } from '@/src/modules/staff/application/UpdateStaff';
import { DeleteStaff } from '@/src/modules/staff/application/DeleteStaff';
import { AddStaffExpense } from '@/src/modules/staff/application/AddStaffExpense';
import { ToggleStaffExpenseReimbursement } from '@/src/modules/staff/application/ToggleStaffExpenseReimbursement';
import { DeleteStaffExpense } from '@/src/modules/staff/application/DeleteStaffExpense';
import { UpdateStaffExpense } from '@/src/modules/staff/application/UpdateStaffExpense';
import { Vehicle } from '@/src/shared/domain/types';

export const usePersonalState = (user: any, onUpdateUser: any) => {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [staffData, setStaffData] = useState<StaffWithSalary | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || 'Phòng Kinh doanh'
  });

  const presenter = useMemo(() => new PersonalPresenter(new SupabaseVehicleRepository()), []);

  const staffPresenter = useMemo(() => {
    const staffRepo = new SupabaseStaffRepository();
    const vehicleRepo = new SupabaseVehicleRepository();
    const expenseRepo = new SupabaseExpenseRepository();
    return new StaffPresenter(
      new GetStaffList(staffRepo, vehicleRepo),
      new AddStaff(staffRepo),
      new UpdateStaff(staffRepo),
      new DeleteStaff(staffRepo),
      new AddStaffExpense(staffRepo, vehicleRepo, expenseRepo),
      new ToggleStaffExpenseReimbursement(staffRepo),
      new DeleteStaffExpense(staffRepo),
      new UpdateStaffExpense(staffRepo)
    );
  }, []);

  useEffect(() => {
    if (!user) return;
    const view: PersonalViewInterface = { updateVehicles: setCars, setLoading };
    presenter.attach(view);

    const staffView: StaffView = {
      showStaffList: (list) => {
        const current = list.find(s => s.code === user.code);
        if (current) setStaffData(current);
      },
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => toast.error(msg),
      onStaffAdded: () => {},
      onStaffUpdated: () => staffPresenter.loadStaff(selectedMonth),
      onStaffDeleted: () => {}
    };
    staffPresenter.attachView(staffView);
    staffPresenter.loadStaff(selectedMonth);

    return () => {
      presenter.detach();
      staffPresenter.detachView();
    };
  }, [presenter, staffPresenter, user, selectedMonth]);

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu phải từ 6 ký tự trở lên.");
      return;
    }
    if (onUpdateUser) {
      onUpdateUser(user.email, { password: newPassword });
      setIsModalOpen(false);
      setNewPassword('');
    }
  };

  const handleUpdateProfile = () => {
    if (!editFormData.name) {
      toast.error("Vui lòng nhập tên.");
      return;
    }
    if (onUpdateUser) {
      onUpdateUser(user.email, editFormData);
      setIsEditModalOpen(false);
    }
  };

  return {
    cars, loading, selectedMonth, setSelectedMonth, staffData, isExpenseModalOpen, setIsExpenseModalOpen,
    editingExpense, setEditingExpense, isModalOpen, setIsModalOpen, isEditModalOpen, setIsEditModalOpen,
    newPassword, setNewPassword, editFormData, setEditFormData, handleChangePassword, handleUpdateProfile,
    staffPresenter
  };
};
