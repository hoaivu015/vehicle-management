import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { Z_INDEX } from '@/src/constants';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { haptics } from '@/src/shared/utils/haptics';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ElementType;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  className?: string;
  showCloseButton?: boolean;
  /** Ẩn title/subtitle trên mobile (dùng khi popup có hero image riêng) */
  mobileHideTitle?: boolean;
  /** Thiết lập chiều cao di động: 'full' (h-[92vh]) hoặc 'auto' (tự động co giãn) */
  height?: 'auto' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

interface ModalHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ElementType;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  mobileHideTitle?: boolean;
}

/**
 * ModalHeader - Thành phần Header chuẩn iPhone Native.
 */
export const ModalHeader = ({
  title,
  subtitle,
  icon: Icon,
  onClose,
  showCloseButton = true,
  className,
  mobileHideTitle = false,
}: ModalHeaderProps) => (
  <div className={cn("px-4 py-3 md:px-g4 md:py-g3 border-b border-hairline-soft flex justify-between items-center md:items-start bg-white sticky top-0 z-10 shrink-0", className)}>
    <div className={cn("space-y-1", mobileHideTitle && "hidden md:block")}>
      <div className="flex items-center gap-g1">
        {Icon && <Icon size={24} className="text-kraft-accent" />}
        <div className="text-xl md:text-2xl font-black text-kraft-ink uppercase tracking-tight">
          {title}
        </div>
      </div>
      {subtitle && (
        <p className="text-sm text-sub-label font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
    {(onClose && showCloseButton) && (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="w-11 h-11 flex items-center justify-center hover:bg-black/5 rounded-full transition-all ml-auto"
      >
        <X size={20} className="text-sub-label" />
      </motion.button>
    )}
  </div>
);

/**
 * BaseModal - Thành phần Modal chuẩn Meta 2026.
 * Đặc điểm: Nền trắng, bo góc 32px, không mờ (non-glass), overlay tối giản.
 */
export const BaseModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'lg',
  className,
  showCloseButton = true,
  mobileHideTitle = false,
  height = 'full',
}: ModalProps) => {
  const isMobile = useIsMobile(768);
  const dragControls = useDragControls();

  // Lock body scroll when modal is open to prevent background scrolling (Scroll-Chaining)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      haptics.medium();
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex md:items-center justify-center p-0 md:p-8 items-end" style={{ zIndex: Z_INDEX.MODAL }}>
          {/* Backdrop with elegant transparency and subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[16px] cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 100 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            
            // Drag-to-Dismiss Gesture setup for Mobile (iPhone Native style)
            drag={isMobile ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) {
                onClose();
              }
            }}
            
            className={cn(
              "relative w-full overflow-hidden flex flex-col bg-white border border-hairline-soft shadow-kraft-deep",
              "rounded-t-t1 md:rounded-t2",
              maxWidthClasses[maxWidth],
              height === 'auto' ? "h-auto max-h-[92vh] md:h-auto md:max-h-[85vh]" : "h-[92vh] md:h-auto md:max-h-[85vh]",
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Grab/Drag zone for Mobile Sheet - Generous hit area for easy drag triggers */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="w-full h-6 flex items-center justify-center md:hidden shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <div className="w-12 h-1 bg-black/10 rounded-full" />
            </div>
            
            {/* Header */}
            {(title || showCloseButton) && (
              <ModalHeader 
                title={title || ""} 
                subtitle={subtitle}
                icon={icon}
                onClose={onClose} 
                showCloseButton={showCloseButton}
                mobileHideTitle={mobileHideTitle}
              />
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export const ModalBody = ({ children, className, noPadding = false }: { children: ReactNode, className?: string, noPadding?: boolean }) => (
  <div className={cn(!noPadding && "p-4 md:p-g3", "space-y-3 md:space-y-g3", className)}>
    {children}
  </div>
);

interface ModalFooterProps {
  onCancel?: () => void;
  onSubmit?: (e?: any) => void | Promise<void>;
  onDelete?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  deleteLabel?: string;
  isSubmitting?: boolean;
  isDestructive?: boolean;
  error?: string | null;
  className?: string;
}

export const ModalFooter = ({
  onCancel,
  onSubmit,
  onDelete,
  submitLabel = "Xác nhận",
  cancelLabel = "Hủy bỏ",
  deleteLabel = "Xóa bỏ",
  isSubmitting = false,
  isDestructive = false,
  error = null,
  className
}: ModalFooterProps) => (
  <div className={cn("py-3 px-4 md:p-g3 border-t border-hairline-soft bg-white sticky bottom-0 z-10 shrink-0 space-y-1.5 md:space-y-g2 safe-pb shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.1)]", className)}>
    {error && (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-g1 p-g2 bg-expense-light text-expense rounded-t2 border border-expense-light"
      >
        <AlertCircle size={18} />
        <p className="text-[10px] font-black uppercase tracking-widest leading-none">{error}</p>
      </motion.div>
    )}

    <div className="flex flex-col sm:flex-row gap-g2">
      {onDelete && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button" onClick={onDelete} disabled={isSubmitting}
          className="h-11 px-g3 text-expense hover:bg-expense-light rounded-full font-black transition-all border border-hairline-soft text-xs uppercase tracking-widest"
        >
          {deleteLabel}
        </motion.button>
      )}
      
      <div className="flex-1" />

      <div className="flex gap-g2 w-full sm:w-auto">
        {onCancel && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button" onClick={onCancel} disabled={isSubmitting}
            className="h-11 px-g3 flex-1 sm:flex-none liquid-button-secondary text-xs"
          >
            {cancelLabel}
          </motion.button>
        )}

        {onSubmit && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button" onClick={onSubmit} disabled={isSubmitting}
            className={cn(
              "h-11 px-g4 flex-1 sm:flex-none liquid-button-primary min-w-[140px] text-xs",
              isDestructive && "bg-expense"
            )}
          >
            <div className="flex items-center justify-center gap-g1">
              {isSubmitting && <RefreshCw size={16} className="animate-spin" />}
              <span>{submitLabel}</span>
            </div>
          </motion.button>
        )}
      </div>
    </div>
  </div>
);
