import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { cn } from '@/src/shared/utils/cn';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  isLoading = false
}) => {
  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={32} />,
      bg: 'bg-red-500/5',
      border: 'border-red-500/20'
    },
    warning: {
      icon: <AlertTriangle className="text-orange-500" size={32} />,
      bg: 'bg-orange-500/5',
      border: 'border-orange-500/20'
    },
    info: {
      icon: <AlertTriangle className="text-kraft-accent" size={32} />,
      bg: 'bg-kraft-accent/5',
      border: 'border-kraft-accent/20'
    }
  };

  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false} height="auto">
      <ModalBody>
        <div className="text-left py-4">
          <div className={cn(
            "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 border shadow-inner",
            style.bg,
            style.border
          )}>
            {style.icon}
          </div>
          
          <h3 className="text-2xl font-black text-kraft-ink uppercase tracking-tighter mb-4">
            {title}
          </h3>
          
          <p className="text-sm font-bold text-kraft-ink/40 uppercase tracking-widest leading-relaxed">
            {message}
          </p>
        </div>
      </ModalBody>
      <ModalFooter 
        onCancel={onClose} 
        onSubmit={onConfirm} 
        isSubmitting={isLoading}
        submitLabel={confirmText}
        cancelLabel={cancelText}
      />
    </Modal>
  );
};
