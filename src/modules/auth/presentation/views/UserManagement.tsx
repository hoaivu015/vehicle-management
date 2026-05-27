import { Shield, UserPlus, Mail, Trash2, Edit2, Check, X, Key, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '@/src/shared/domain/constants';
import { useUserManagement } from '../hooks/useUserManagement';
import { BaseModal } from '@/src/shared/design-system';

export const UserManagement = () => {
  const { uniqueUsers, showAddModal, setShowAddModal, editingId, setEditingId, formData, setFormData, handleSubmit, handleUpdate, presenter } = useUserManagement();

  return (
    <div className="space-y-8 md:space-y-12 py-4 md:py-6 px-1 md:px-2 max-w-full mx-auto overflow-y-auto pr-1 md:pr-2 custom-scrollbar pb-12 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-kraft-accent p-3 md:p-4 shadow-lg flex items-center justify-center"><Shield className="text-white" size={24} /></div>
          <div><h2 className="text-3xl md:text-6xl font-black text-kraft-ink uppercase tracking-tighter">Tài khoản</h2><p className="text-liquid-label opacity-40">Cấp quyền truy cập hệ thống</p></div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="liquid-button-primary px-6 md:px-8 h-14 flex items-center justify-center gap-2 w-full md:w-auto"><UserPlus size={18} /><span className="font-black uppercase tracking-widest text-[10px] md:text-sm">Thêm tài khoản</span></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-10">
        {uniqueUsers.map((user) => (
          <UserCard 
            key={user.docId} 
            user={user} 
            isEditing={editingId === user.docId} 
            onEdit={() => { setEditingId(user.docId); setFormData({ ...formData, role: user.role, password: user.password || '' }); }} 
            onCancel={() => setEditingId(null)} 
            onUpdate={() => handleUpdate(user.docId, user.email)} 
            onDelete={() => presenter.deleteUser(user.id)} 
            formData={formData} 
            setFormData={setFormData} 
          />
        ))}
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
                {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => <option key={role} value={role}>{role}</option>)}
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

import { Staff } from '@/src/shared/domain/types';

interface UserCardProps {
  user: Staff & { docId: string; password?: string };
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  formData: { role: string; password?: string };
  setFormData: (data: any) => void;
}

const UserCard = ({ user, isEditing, onEdit, onCancel, onUpdate, onDelete, formData, setFormData }: UserCardProps) => (
  <motion.div layout className="highlight-card p-4 md:p-8 group relative overflow-hidden">
    <div className="flex items-start justify-between mb-4 md:mb-8">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent font-black text-base md:text-2xl">{user.name?.charAt(0) || 'U'}</div>
        <div className="min-w-0">
          <h3 className="font-black text-kraft-ink uppercase text-[12px] md:text-base truncate">{user.name}</h3>
          <div className="flex items-center gap-1 text-kraft-accent opacity-60"><Mail size={12} /><span className="text-[10px] md:text-[11px] font-bold">{user.email}</span></div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {isEditing ? (
          <><button onClick={onUpdate} className="p-1.5 md:p-2 bg-kraft-green/10 text-kraft-green rounded-lg"><Check size={12} /></button><button onClick={onCancel} className="p-1.5 md:p-2 bg-kraft-red/10 text-kraft-red rounded-lg"><X size={12} /></button></>
        ) : (
          <><button onClick={onEdit} className="p-1.5 md:p-2 bg-kraft-accent/10 text-kraft-accent rounded-lg md:opacity-0 group-hover:opacity-100"><Edit2 size={12} /></button><button onClick={onDelete} className="p-1.5 md:p-2 bg-kraft-red/10 text-kraft-red rounded-lg md:opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button></>
        )}
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-kraft-bg rounded-t3 border border-kraft-accent/5">
        <span className="text-liquid-label opacity-40">Quyền hạn</span>
        {isEditing ? (
          <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="bg-white border rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => <option key={role} value={role}>{role}</option>)}
          </select>
        ) : <span className="px-3 py-1 bg-kraft-accent text-white text-[10px] font-black rounded-lg uppercase tracking-widest">{user.role}</span>}
      </div>
      {isEditing ? (
        <div className="space-y-1"><label className="text-liquid-label ml-2">Mật khẩu mới</label><input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="liquid-input h-14 px-6 text-sm" placeholder="Nhập mật khẩu..." /></div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-kraft-accent/5 rounded-t3 border border-kraft-accent/10">
          <div className="flex items-center gap-1.5"><Key size={14} className="text-kraft-accent" /><span className="text-[10px] md:text-[12px] font-black tracking-tight">{user.password ? <>Mật khẩu: <span className="font-mono text-kraft-accent">{user.password}</span></> : <span className="opacity-40 italic">Chưa đặt mật khẩu</span>}</span></div>
          {user.password && <button onClick={() => navigator.clipboard.writeText(user.password || '')} className="p-2 hover:bg-kraft-accent/10 rounded-xl transition-colors text-kraft-accent"><Copy size={14} /></button>}
        </div>
      )}
    </div>
  </motion.div>
);

interface InputGroupProps {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

const InputGroup = ({ label, type = "text", value, onChange, placeholder }: InputGroupProps) => (
  <div className="space-y-2">
    <label className="text-liquid-label ml-2">{label}</label>
    <input type={type} required value={value} onChange={(e) => onChange(e.target.value)} className="liquid-input h-14 px-6 text-sm" placeholder={placeholder} />
  </div>
);
