import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Hash, Target, Briefcase, Edit2, ShieldCheck, Layout, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from '@/src/components/Modal';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { UserRole, USER_ROLE_LABELS, ADMIN_EMAILS } from '@/src/shared/domain/constants';
import { Staff } from '@/src/shared/domain/types';
import { cn } from '@/src/utils/cn';

interface StaffAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (staffData: any) => Promise<void>;
  member?: Staff;
}

export const StaffAddModal: React.FC<StaffAddModalProps> = ({ isOpen, onClose, onAdd, member }) => {
  const isEdit = !!member;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.STAFF as string,
    department: 'Kinh doanh',
    base_salary: 0,
    commission_per_car: 0,
    target: 1,
    status: 'ACTIVE',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (member) {
        setFormData({
          name: member.name || '',
          email: member.email || '',
          role: member.role || UserRole.STAFF,
          department: member.department || 'Kinh doanh',
          base_salary: member.base_salary || 0,
          commission_per_car: member.commission_per_car || 0,
          target: member.target || 1,
          status: member.status || 'ACTIVE',
          password: '' // Don't edit password here
        });
      } else {
        setFormData({
          name: '',
          email: '',
          role: UserRole.STAFF,
          department: 'Kinh doanh',
          base_salary: 0,
          commission_per_car: 0,
          target: 1,
          status: 'ACTIVE',
          password: ''
        });
      }
    }
  }, [isOpen, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.email && ADMIN_EMAILS.includes(formData.email) && formData.role !== UserRole.ADMIN) {
        if (!confirm(`Email ${formData.email} thuộc danh sách Quản trị viên. Bạn có muốn đặt vai trò là Quản trị viên cho nhân sự này không?`)) {
          setLoading(false);
          return;
        }
        formData.role = UserRole.ADMIN;
      }

      const dataToSubmit = {
        ...formData
      };

      // Remove password if empty in edit mode
      if (isEdit && !formData.password) {
        delete (dataToSubmit as any).password;
      }

      await onAdd(dataToSubmit);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const title = (
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border",
        isEdit ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-kraft-accent/10 text-kraft-accent border-kraft-accent/20"
      )}>
        {isEdit ? <Edit2 size={22} strokeWidth={2.5} /> : <UserPlus size={22} strokeWidth={2.5} />}
      </div>
      <div>
        <h3 className="text-xl font-black tracking-tight text-kraft-ink uppercase leading-none mb-1">
          {isEdit ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}
        </h3>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
          {isEdit ? `Cập nhật hồ sơ mã #${member?.code}` : 'Tạo tài khoản và phân quyền hệ thống'}
        </p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="p-8 space-y-10">

        {/* Section: Thông tin cơ bản */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-kraft-accent" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">Thông tin định danh</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Họ và tên</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="liquid-input pl-12 h-14"
                  placeholder="NGUYỄN VĂN A"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Email đăng nhập</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                <input
                  type="email"
                  value={formData.email}
                  disabled={isEdit}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={cn("liquid-input pl-12 h-14", isEdit && "opacity-50 cursor-not-allowed bg-black/5")}
                  placeholder="Để trống nếu không có"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Chức vụ</label>
              <div className="relative group/select">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 pointer-events-none" size={16} />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="liquid-input h-14 pl-12 pr-6 appearance-none"
                >
                  {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                    <option key={role} value={role}>{USER_ROLE_LABELS[role as UserRole]}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                  <Layout size={14} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Phòng ban</label>
              <input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="liquid-input h-14"
                placeholder="Phòng kinh doanh"
              />
            </div>
          </div>
        </div>

        {/* Section: Chế độ đãi ngộ */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">Lương & Hoa hồng</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SmartAmountInput
              label="Lương cơ bản"
              value={formData.base_salary}
              onChange={(v) => setFormData({ ...formData, base_salary: v })}
              placeholder="VD: 7tr"
            />

            <SmartAmountInput
              label="Hoa hồng/Xe"
              value={formData.commission_per_car}
              onChange={(v) => setFormData({ ...formData, commission_per_car: v })}
              placeholder="VD: 500k"
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Mục tiêu xe/tháng</label>
              <div className="relative group">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input
                  type="number"
                  value={formData.target || ''}
                  onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 0 })}
                  className="liquid-input pl-12 h-16 pr-4"
                  placeholder="Số xe"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Account Security (Only for Add or if explicitly needing reset) */}
        {!isEdit && (
          <div className="space-y-6 pt-4 border-t border-black/5">
            <div className="flex items-center gap-3 ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-kraft-red" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">Bảo mật hệ thống</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Mật khẩu khởi tạo</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-red/30 group-focus-within:text-kraft-red transition-colors" size={16} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="liquid-input pl-12 h-14"
                    placeholder="Mặc định: auto28"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-black/5 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="liquid-button-secondary h-16 flex-1 text-[10px] font-black uppercase tracking-widest"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="liquid-button-primary h-16 flex-[1.5] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : isEdit ? <ShieldCheck size={18} /> : <UserPlus size={18} />}
            {isEdit ? 'Cập nhật thay đổi' : 'Khởi tạo nhân sự'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
