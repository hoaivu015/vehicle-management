import React from 'react';
import { User, Phone, Lock } from 'lucide-react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { BaseInput } from '@/src/shared/design-system/FormElements';

export interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu" maxWidth="sm">
      <ModalBody>
        <div className="space-y-4">
          <p className="text-[11px] font-medium text-sub-label leading-relaxed">
            Nhập mật khẩu mới cho tài khoản. Mật khẩu phải có tối thiểu 6 ký tự.
          </p>
          <BaseInput
            type="password"
            label="Mật khẩu mới"
            placeholder="••••••••"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            icon={Lock}
            autoFocus
          />
        </div>
      </ModalBody>
      <ModalFooter
        onCancel={onClose}
        onSubmit={onSubmit}
        submitLabel="Cập nhật mật khẩu"
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { name: string; phone: string; department?: string };
  onChange: (data: { name: string; phone: string; department?: string }) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  data,
  onChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa hồ sơ" maxWidth="md">
      <ModalBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            label="Họ và tên"
            placeholder="Nhập họ và tên..."
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            icon={User}
          />
          <BaseInput
            label="Số điện thoại"
            placeholder="Nhập số điện thoại..."
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            icon={Phone}
          />
        </div>
      </ModalBody>
      <ModalFooter
        onCancel={onClose}
        onSubmit={onSubmit}
        submitLabel="Lưu thông tin"
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};
