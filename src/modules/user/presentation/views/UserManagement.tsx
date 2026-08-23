import React from 'react';
import { Shield, UserPlus, Mail, Trash2, Edit2, Check, X, Key, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole, USER_ROLE_LABELS } from '@/src/shared/domain/constants';
import { useUserManagement } from '../hooks/useUserManagement';
import { BaseModal } from '@/src/shared/design-system';
import { UserProfile } from '../../domain/UserRepository';

export const UserManagement = () => {
  const { uniqueUsers, showAddModal, setShowAddModal, editingId, setEditingId, formData, setFormData, handleSubmit, handleUpdate, presenter } = useUserManagement();

  return (
    <div className="space-y-8 md:space-y-12 py-4 md:py-6 px-1 md:px-2 max-w-full mx-auto overflow-y-auto pr-1 md:pr-2 custom-scrollbar pb-36 md:pb-12 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-kraft-accent p-3 md:p-4 shadow-lg flex items-center justify-center"><Shield className="text-white" size={24} /></div>
          <div><h2 className="text-3xl md:text-6xl font-black text-kraft-ink uppercase tracking-tighter">Tài khoản</h2><p className="text-liquid-label opacity-40">Cấp quyền truy cập hệ thống</p></div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="liquid-button-primary px-6 md:px-8 h-14 flex items-center justify-center gap-2 w-full md:w-auto"><UserPlus size={18} /><span className="font-black uppercase tracking-widest text-[10px] md:text-sm">Thêm tài khoản</span></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-10">
        {uniqueUsers.map((user) => {
          const userId = user.docId || user.id;
          return (
            <UserCard 
              key={userId} 
              user={user} 
              isEditing={editingId === userId} 
              onEdit={() => { setEditingId(userId); setFormData({ ...formData, role: (user.role as UserRole) || UserRole.STAFF, password: user.password || '' }); }} 
              onCancel={() => setEditingId(null)} 
              onUpdate={() => handleUpdate(userId, user.email || '')} 
              onDelete={() => presenter.deleteUser(user.id)} 
              formData={formData} 
              setFormData={setFormData} 
            />
          );
        })}
      </div>

      <BaseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Thêm tài khoản mới" maxWidth="md">
        <div className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputGroup label="Tên hiển thị" value={formData.name} onChange={(val: string) => setFormData({...formData, name: val})} placeholder="Nguyễn Văn A" />
            <InputGroup label="Email" type="email" value={formData.email} onChange={(val: string) => setFormData({...formData, email: val})} placeholder="user@auto28.vn" />
            <InputGroup label="Mật khẩu cấp" value={formData.password || ''} onChange={(val: string) => setFormData({...formData, password: val})} placeholder="••••••••" />
            <div className="space-y-2">
              <label className="text-liquid-label ml-2">Vai trò</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="liquid-input h-14 px-6 text-sm font-black uppercase tracking-widest">
                {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                  <option key={role} value={role}>{USER_ROLE_LABELS[role] || role}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-16 rounded-2xl border-2 font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-black/5 transition-all">Hủy</button>
              <button type="submit" className="flex-1 liquid-button-primary h-16 font-black uppercase text-[10px] md:text-xs tracking-widest">Xác nhận</button>
            </div>
          </form>
        </div>
      </BaseModal>
    </div>
  );
};

const UserCard = ({ user, isEditing, onEdit, onCancel, onUpdate, onDelete, formData, setFormData }: {
  user: UserProfile;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  formData: { name: string; email: string; role: UserRole; password: string };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; email: string; role: UserRole; password: string }>>;
}) => (
  <motion.div layout className="liquid-card p-6 md:p-8 space-y-6">
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <h4 className="text-lg md:text-2xl font-black text-kraft-ink uppercase">{user.name || 'Người dùng'}</h4>
        <div className="flex items-center gap-2 text-sub-label text-xs"><Mail size={12} /><span>{user.email}</span></div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="p-2 hover:bg-black/5 rounded-xl transition-all"><Edit2 size={16} /></button>
        <button onClick={() => { if(confirm('Xóa tài khoản này?')) onDelete(); }} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all"><Trash2 size={16} /></button>
      </div>
    </div>

    {isEditing ? (
      <div className="space-y-4 pt-4 border-t border-black/5">
        <div className="space-y-2">
          <label className="text-liquid-label text-[10px]">Cập nhật vai trò</label>
          <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="liquid-input h-12 px-4 text-xs font-black uppercase tracking-widest">
            {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
              <option key={role} value={role}>{USER_ROLE_LABELS[role] || role}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-liquid-label text-[10px]">Đổi mật khẩu</label>
          <input type="text" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Để trống nếu không đổi" className="liquid-input h-12 px-4 text-xs" />
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onCancel} className="flex-1 h-12 rounded-xl border font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-1"><X size={14} /><span>Hủy</span></button>
          <button onClick={onUpdate} className="flex-1 liquid-button-primary h-12 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-1"><Check size={14} /><span>Lưu</span></button>
        </div>
      </div>
    ) : (
      <div className="space-y-4 pt-4 border-t border-black/5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-sub-label">Vai trò</span>
          <span className="px-3 py-1 bg-black/5 rounded-full text-[10px] font-black uppercase tracking-wider">{USER_ROLE_LABELS[user.role as UserRole] || user.role}</span>
        </div>
        {user.password && (
          <div className="flex justify-between items-center bg-black/[0.02] p-3 rounded-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-sub-label flex items-center gap-1.5"><Key size={12} />Mật khẩu</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-kraft-ink">{user.password}</span>
              <button onClick={() => { navigator.clipboard.writeText(user.password || ''); alert('Đã sao chép mật khẩu'); }} className="p-1 hover:bg-black/5 rounded text-sub-label"><Copy size={12} /></button>
            </div>
          </div>
        )}
      </div>
    )}
  </motion.div>
);

const InputGroup = ({ label, value, onChange, placeholder, type = 'text' }: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-2">
    <label className="text-liquid-label ml-2">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="liquid-input h-14 px-6 text-sm font-bold" />
  </div>
);
