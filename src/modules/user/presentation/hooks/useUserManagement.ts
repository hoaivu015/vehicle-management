import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { UserRole, ADMIN_EMAILS } from '@/src/shared/domain/constants';
import { UserManagementPresenter, UserManagementView } from '../UserManagementPresenter';
import { SupabaseUserRepository } from '../../infrastructure/SupabaseUserRepository';
import { UserProfile } from '../../domain/UserRepository';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: UserRole.SALES_STAFF, password: '' });

  const presenter = useMemo(() => new UserManagementPresenter(new SupabaseUserRepository()), []);

  useEffect(() => {
    const view: UserManagementView = {
      updateUsers: setUsers,
      setLoading: setLoading,
      showError: (msg) => toast.error(msg)
    };
    presenter.attach(view);
    return () => presenter.detach();
  }, [presenter]);

  const uniqueUsers = useMemo(() => {
    const emailMap = new Map<string, any>();
    users.forEach(user => {
      if (!user.email) return;
      const existing = emailMap.get(user.email);
      if (!existing || (user.uid && !existing.uid)) emailMap.set(user.email, user);
    });
    return Array.from(emailMap.values()).filter(u => u.role !== UserRole.ADMIN);
  }, [users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    let finalRole = formData.role;
    if (formData.email && ADMIN_EMAILS.includes(formData.email) && finalRole !== UserRole.ADMIN) {
      if (!confirm(`Email ${formData.email} thuộc danh sách Quản trị viên. Đặt vai trò Admin?`)) return;
      finalRole = UserRole.ADMIN;
    }
    presenter.addUser({ ...formData, role: finalRole });
    setShowAddModal(false);
    setFormData({ name: '', email: '', role: UserRole.SALES_STAFF, password: '' });
    toast.success('Đã tạo tài khoản');
  };

  const handleUpdate = (userId: string, email: string) => {
    let roleToUpdate = formData.role;
    if (email && ADMIN_EMAILS.includes(email) && roleToUpdate !== UserRole.ADMIN) {
      if (!confirm(`Email ${email} thuộc danh sách Quản trị viên. Đặt vai trò Admin?`)) return;
      roleToUpdate = UserRole.ADMIN;
    }
    presenter.updateUser(userId, { role: roleToUpdate, password: formData.password });
    setEditingId(null);
    toast.success('Đã cập nhật');
  };

  return {
    uniqueUsers, loading, showAddModal, setShowAddModal, editingId, setEditingId, formData, setFormData,
    handleSubmit, handleUpdate, presenter
  };
};
