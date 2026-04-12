import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, UserPlus, Shield, Mail, Trash2, Edit2, Check, X, Key, Lock, CheckCircle2, Copy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { PERMISSIONS, Z_INDEX } from '../constants';
import { UserRole, ADMIN_EMAILS } from '../shared/domain/constants';
import { cn } from '../utils/cn';

import { UserManagementPresenter, UserManagementView } from '../modules/user/presentation/UserManagementPresenter';
import { SupabaseUserRepository } from '../modules/user/infrastructure/SupabaseUserRepository';
import { UserProfile } from '../modules/user/domain/UserRepository';

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const presenter = React.useMemo(() => {
    return new UserManagementPresenter(new SupabaseUserRepository());
  }, []);

  React.useEffect(() => {
    const view: UserManagementView = {
      updateUsers: setUsers,
      setLoading: setLoading,
      showError: (msg) => toast.error(msg)
    };
    presenter.attach(view);
    return () => presenter.detach();
  }, [presenter]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.SALES_STAFF,
    password: ''
  });

  // Deduplicate users by email to avoid showing both email-indexed and UID-indexed docs
  const uniqueUsers = React.useMemo(() => {
    const emailMap = new Map<string, any>();
    
    // Sort to prioritize docs with 'uid' or 'linkedFrom' if we wanted, 
    // but for now just taking the first one found or the one with more data
    users.forEach(user => {
      if (!user.email) return;
      const existing = emailMap.get(user.email);
      if (!existing || (user.uid && !existing.uid)) {
        emailMap.set(user.email, user);
      }
    });
    
    return Array.from(emailMap.values()).filter(u => u.role !== UserRole.ADMIN);
  }, [users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (formData.email && ADMIN_EMAILS.includes(formData.email) && formData.role !== UserRole.ADMIN) {
      if (!confirm(`Email ${formData.email} thuộc danh sách Quản trị viên. Bạn có muốn đặt vai trò là Quản trị viên cho tài khoản này không?`)) {
        return;
      }
      formData.role = UserRole.ADMIN;
    }

    presenter.addUser(formData);
    setShowAddModal(false);
    setFormData({ name: '', email: '', role: UserRole.SALES_STAFF, password: '' });
    toast.success('Đã tạo tài khoản mới');
  };

  const handleUpdate = (userId: string, email: string) => {
    let roleToUpdate = formData.role;
    if (email && ADMIN_EMAILS.includes(email) && roleToUpdate !== UserRole.ADMIN) {
      if (!confirm(`Email ${email} thuộc danh sách Quản trị viên. Bạn có muốn đặt vai trò là Quản trị viên cho tài khoản này không?`)) {
        return;
      }
      roleToUpdate = UserRole.ADMIN as UserRole;
    }

    presenter.updateUser(userId, { 
      role: roleToUpdate,
      password: formData.password
    });
    setEditingId(null);
    toast.success('Đã cập nhật tài khoản');
  };

  return (
    <div className="space-y-8 md:space-y-12 py-4 md:py-6 px-1 md:px-2 max-w-full mx-auto overflow-y-auto pr-1 md:pr-2 custom-scrollbar pb-12 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-kraft-accent p-3 md:p-4 shadow-lg flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl md:text-6xl font-black text-kraft-ink uppercase tracking-tighter">Tài khoản</h2>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-60">Cấp quyền truy cập hệ thống</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="liquid-button-primary px-6 md:px-8 h-12 md:h-14 flex items-center justify-center gap-2 md:gap-3 w-full md:w-auto"
        >
          <UserPlus size={18} />
          <span className="font-black uppercase tracking-widest text-[10px] md:text-sm">Thêm tài khoản</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-10">
        {uniqueUsers.map((user) => (
          <motion.div 
            key={user.docId}
            layout
            className="highlight-card p-4 md:p-8 group relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4 md:mb-8">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent font-black text-base md:text-2xl">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-kraft-ink uppercase text-[10px] md:text-sm truncate max-w-[100px] sm:max-w-none">{user.name}</h3>
                  <div className="flex items-center gap-1.5 md:gap-2 text-kraft-accent opacity-60">
                    <Mail size={8} className="md:hidden" />
                    <Mail size={12} className="hidden md:block" />
                    <span className="text-[7px] md:text-[10px] font-bold opacity-60">
                      {user.email}
                    </span>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(user.email); }}
                      className="p-1 hover:bg-kraft-accent/10 rounded transition-colors"
                      title="Sao chép email"
                    >
                      <Copy size={8} className="md:w-3 md:h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                {editingId === user.docId ? (
                  <>
                    <button onClick={() => handleUpdate(user.docId, user.email)} className="p-1.5 md:p-2 bg-kraft-green/10 text-kraft-green rounded-md md:rounded-lg hover:bg-kraft-green/20 transition-colors">
                      <Check size={12} className="md:w-[14px] md:h-[14px]" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 md:p-2 bg-kraft-red/10 text-kraft-red rounded-md md:rounded-lg hover:bg-kraft-red/20 transition-colors">
                      <X size={12} className="md:w-[14px] md:h-[14px]" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(user.docId); setFormData({ ...formData, role: user.role, password: user.password || '' }); }} className="p-1.5 md:p-2 bg-kraft-accent/10 text-kraft-accent rounded-md md:rounded-lg hover:bg-kraft-accent/20 transition-colors md:opacity-0 group-hover:opacity-100">
                      <Edit2 size={12} className="md:w-[14px] md:h-[14px]" />
                    </button>
                    <button onClick={() => presenter.deleteUser(user.id)} className="p-1.5 md:p-2 bg-kraft-red/10 text-kraft-red rounded-md md:rounded-lg hover:bg-kraft-red/20 transition-colors md:opacity-0 group-hover:opacity-100">
                      <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between p-2.5 md:p-4 bg-kraft-bg rounded-lg md:rounded-xl border border-kraft-accent/5">
                <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-wider opacity-60">Quyền hạn</span>
                {editingId === user.docId ? (
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="bg-white border border-kraft-accent/20 rounded-md md:rounded-lg px-1.5 md:px-2 py-0.5 md:py-1 text-[7px] md:text-[10px] font-bold text-kraft-ink"
                  >
                    {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                ) : (
                  <span className="px-1.5 md:px-3 py-0.5 md:py-1 bg-kraft-accent text-white text-[7px] md:text-[10px] font-bold rounded-md md:rounded-lg uppercase tracking-wider">
                    {user.role}
                  </span>
                )}
              </div>

              {editingId === user.docId ? (
                <div className="space-y-1.5 md:space-y-3">
                  <label className="text-[7px] md:text-[10px] font-bold uppercase tracking-wider ml-2">Mật khẩu mới</label>
                  <input 
                    type="text" 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="liquid-input h-8 md:h-10 px-2.5 md:px-4 text-[9px] md:text-xs"
                    placeholder="Nhập mật khẩu mới..."
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 md:p-3 bg-kraft-accent/5 rounded-lg md:rounded-xl border border-kraft-accent/10">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Key size={8} className="md:hidden text-kraft-accent" />
                    <Key size={12} className="hidden md:block text-kraft-accent" />
                    {user.password ? (
                      <span className="text-[7px] md:text-[10px] font-bold text-kraft-ink">
                        Mật khẩu: <span className="font-mono tracking-widest">{user.password}</span>
                      </span>
                    ) : (
                      <span className="text-[7px] md:text-[10px] font-bold opacity-40 italic">Chưa đặt mật khẩu</span>
                    )}
                  </div>
                  {user.password && (
                    <button 
                      onClick={() => { navigator.clipboard.writeText(user.password); }}
                      className="p-1 md:p-1.5 hover:bg-kraft-accent/10 rounded-md md:rounded-lg transition-colors text-kraft-accent"
                      title="Sao chép mật khẩu"
                    >
                      <Copy size={8} className="md:hidden" />
                      <Copy size={12} className="hidden md:block" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showAddModal && (
            <div className={`fixed inset-0 z-[${Z_INDEX.MODAL}] flex items-center justify-center p-2 md:p-4`}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="absolute inset-0 bg-kraft-ink/60 backdrop-blur-sm cursor-pointer"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-kraft-bg w-full max-w-md p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-kraft-deep relative z-10 overflow-y-auto max-h-[95vh] pointer-events-auto"
              >
                <h3 className="text-xl md:text-3xl font-black text-kraft-ink uppercase tracking-tighter mb-6 md:mb-8">Thêm tài khoản mới</h3>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider ml-2 opacity-60">Tên hiển thị</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="liquid-input h-12 md:h-14 px-4 md:px-6 text-xs md:text-sm"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider ml-2 opacity-60">Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="liquid-input h-12 md:h-14 px-4 md:px-6 text-xs md:text-sm"
                      placeholder="user@auto28.vn"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider ml-2 opacity-60">Mật khẩu cấp</label>
                    <input 
                      type="text" 
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="liquid-input h-12 md:h-14 px-4 md:px-6 text-xs md:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider ml-2 opacity-60">Vai trò</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="liquid-input h-12 md:h-14 px-4 md:px-6 text-xs md:text-sm appearance-none"
                    >
                      {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 md:gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl border-2 border-kraft-accent/10 font-black uppercase tracking-widest text-[10px] md:text-sm hover:bg-kraft-bg transition-colors"
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 liquid-button-primary h-12 md:h-14 font-black uppercase tracking-widest text-[10px] md:text-sm"
                    >
                      Xác nhận
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
