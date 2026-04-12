import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { Modal } from './Modal';
import { cn } from '@/src/utils/cn';

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
      btn: 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white',
      bg: 'bg-red-500/5',
      border: 'border-red-500/20'
    },
    warning: {
      icon: <AlertTriangle className="text-orange-500" size={32} />,
      btn: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 text-white',
      bg: 'bg-orange-500/5',
      border: 'border-orange-500/20'
    },
    info: {
      icon: <AlertTriangle className="text-kraft-accent" size={32} />,
      btn: 'bg-kraft-accent hover:bg-kraft-accent/90 shadow-kraft-accent/20 text-white',
      bg: 'bg-kraft-accent/5',
      border: 'border-kraft-accent/20'
    }
  };

  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false}>
      <div className="p-8 text-center">
        <div className={cn(
          "w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border shadow-inner",
          style.bg,
          style.border
        )}>
          {style.icon}
        </div>
        
        <h3 className="text-2xl font-black text-kraft-ink uppercase tracking-tighter mb-4">
          {title}
        </h3>
        
        <p className="text-sm font-bold text-kraft-ink/40 uppercase tracking-widest leading-relaxed mb-10">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-16 liquid-button-secondary rounded-2xl font-black uppercase tracking-widest text-[10px]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
              style.btn
            )}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
