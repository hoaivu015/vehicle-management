import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Target, Briefcase, Edit2, ShieldCheck, Lock } from 'lucide-react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { UserRole, USER_ROLE_LABELS, ADMIN_EMAILS } from '@/src/shared/domain/constants';
import { Staff } from '@/src/shared/domain/types';
import { ExecutiveSection } from '@/src/shared/design-system/ExecutiveModules';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { cn } from '@/src/shared/utils/cn';

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
    status: 'ACTIVE'
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
          status: member.status || 'ACTIVE'
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
          status: 'ACTIVE'
        });
      }
    }
  }, [isOpen, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (formData.email && ADMIN_EMAILS.includes(formData.email) && formData.role !== UserRole.ADMIN) {
        if (!confirm(`Email ${formData.email} thuộc danh sách Quản trị viên. Bạn có muốn đặt vai trò là Quản trị viên cho nhân sự này không?`)) {
          setLoading(false);
          return;
        }
        formData.role = UserRole.ADMIN;
      }

      await onAdd(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="2xl" 
      title={isEdit ? 'Cập nhật nhân sự' : 'Thêm nhân sự'}
      subtitle={isEdit ? `Chỉnh sửa mã #${member?.code}` : 'Khởi tạo tài khoản hệ thống cho nhân viên mới'}
      icon={isEdit ? Edit2 : UserPlus}
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <ModalBody className="flex-1">
          <div className="space-y-g6 py-2">
            <ExecutiveSection title="Thông tin định danh" accent="bg-brand" columns={2}>
              <BaseInput 
                label="Họ và tên"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="NGUYỄN VĂN A"
                icon={Briefcase}
              />

              <div className="relative">
                <BaseInput 
                  label="Email đăng nhập"
                  type="email"
                  value={formData.email}
                  disabled={isEdit}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Để trống nếu không có"
                  icon={isEdit ? Lock : Mail}
                  className={cn(
                    "transition-all",
                    isEdit && "opacity-60 bg-surface-soft border-hairline-soft cursor-not-allowed italic"
                  )}
                />
                {isEdit && (
                   <span className="absolute right-3 top-9 text-[8px] font-black uppercase text-sub-label opacity-40 tracking-widest">Không thể đổi</span>
                )}
              </div>

              <BaseSelect 
                label="Chức vụ"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                icon={ShieldCheck}
              >
                {Object.values(UserRole).filter(r => r !== UserRole.ADMIN).map(role => (
                  <option key={role} value={role}>{USER_ROLE_LABELS[role as UserRole]}</option>
                ))}
              </BaseSelect>

              <BaseInput 
                label="Phòng ban"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Phòng kinh doanh"
              />
            </ExecutiveSection>

            <ExecutiveSection title="Chế độ & Chỉ tiêu" accent="bg-income" columns={3} divider>
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

              <BaseInput 
                label="Mục tiêu (xe/tháng)"
                type="number"
                value={formData.target || ''}
                onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 0 })}
                placeholder="Số xe"
                icon={Target}
              />
            </ExecutiveSection>
          </div>
        </ModalBody>

        <ModalFooter 
          onCancel={onClose} 
          onSubmit={handleSubmit}
          isSubmitting={loading}
          submitLabel={isEdit ? 'Lưu thay đổi' : 'Thêm nhân sự'}
        />
      </form>
    </Modal>
  );
};
