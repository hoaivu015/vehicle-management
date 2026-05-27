import React from 'react';
import { cn } from '@/src/shared/utils/cn';

/**
 * BaseInput - Trường nhập liệu chuẩn Meta 2026.
 */
interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  icon?: React.ElementType;
  variant?: 'standard' | 'dense';
  error?: string;
}

export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  ({ label, className, icon: Icon, variant = 'standard', error, ...props }, ref) => (
    <div className="space-y-2 w-full group">
      {label && (
        <div className="flex justify-between items-end px-g1">
          <label className="text-[11px] font-black uppercase tracking-widest text-sub-label opacity-40 group-focus-within:opacity-100 group-focus-within:text-kraft-accent transition-all leading-none">{label}</label>
          {error && <span className="text-[10px] font-black uppercase text-expense tracking-tighter leading-none">{error}</span>}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <div className={cn(
            "absolute left-6 top-1/2 -translate-y-1/2 transition-all",
            error ? "text-red-400" : "text-kraft-accent/40 group-focus-within:text-kraft-accent"
          )}>
            <Icon size={variant === 'dense' ? 14 : 18} />
          </div>
        )}
        <input
          ref={ref}
          onClick={(e) => {
            if (props.type === 'date' || props.type === 'month') {
              try {
                e.currentTarget.showPicker?.();
              } catch (err) {
                // Fallback
              }
            }
            props.onClick?.(e);
          }}
          className={cn(
            "w-full font-black transition-all placeholder:text-sub-label/20 placeholder:font-medium",
            error 
              ? "border-expense bg-expense-light/30 focus:ring-expense/5 rounded-t2 outline-none disabled:opacity-50 disabled:bg-gray-50" 
              : (props.type === 'month' || props.type === 'date')
                ? (variant === 'dense' ? "liquid-datepicker-dense" : "liquid-datepicker")
                : "bg-white border border-hairline-soft focus:border-kraft-accent focus:ring-4 focus:ring-kraft-accent/5 rounded-t2 outline-none disabled:opacity-50 disabled:bg-gray-50",
            variant === 'dense' ? "h-12 text-xs px-4" : "h-14 text-sm px-g3",
            Icon && "pl-14",
            className
          )}
          {...props}
        />
      </div>
    </div>
  )
);

BaseInput.displayName = 'BaseInput';

/**
 * EditRow - Hàng nhập liệu trong Modal/Popup.
 */
interface EditRowProps {
  label: string;
  value: string | number | undefined | null;
  onChange: (val: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  icon?: React.ElementType;
  variant?: 'standard' | 'dense';
}

export const EditRow = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  disabled = false, 
  placeholder,
  className,
  icon,
  variant
}: EditRowProps) => (
  <BaseInput 
    label={label}
    type={type}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    placeholder={placeholder}
    className={className}
    icon={icon}
    variant={variant}
  />
);

interface BaseSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ElementType;
  variant?: 'standard' | 'dense';
  error?: string;
}

export const BaseSelect: React.FC<BaseSelectProps> = ({ label, className, icon: Icon, children, variant = 'standard', error, ...props }) => {
  return (
    <div className="space-y-2 w-full group">
      {label && (
        <div className="flex justify-between items-end px-g1">
          <label className="text-[11px] font-black uppercase tracking-widest text-sub-label opacity-40 group-focus-within:opacity-100 group-focus-within:text-kraft-accent transition-all leading-none">{label}</label>
          {error && <span className="text-[10px] font-black uppercase text-expense tracking-tighter leading-none">{error}</span>}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <div className={cn(
            "absolute left-6 top-1/2 -translate-y-1/2 transition-all",
            error ? "text-red-400" : "text-kraft-accent/40 group-focus-within:text-kraft-accent"
          )}>
            <Icon size={variant === 'dense' ? 14 : 18} />
          </div>
        )}
        <select
          className={cn(
            "w-full bg-white border rounded-t2 px-g3 font-black transition-all",
            variant === 'dense' ? "h-12 text-xs" : "h-14 text-sm",
            error 
              ? "border-expense bg-expense-light/30 focus:ring-expense/5" 
              : "border-hairline-soft focus:border-kraft-accent focus:ring-4 focus:ring-kraft-accent/5",
            "outline-none appearance-none",
            Icon && "pl-14",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

interface BaseTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  icon?: React.ElementType;
  variant?: 'standard' | 'dense';
  error?: string;
}

export const BaseTextArea: React.FC<BaseTextAreaProps> = ({ label, className, icon: Icon, variant = 'standard', error, ...props }) => {
  return (
    <div className="space-y-2 w-full group">
      {label && (
        <div className="flex justify-between items-end px-g1">
          <label className="text-[11px] font-black uppercase tracking-widest text-sub-label opacity-40 group-focus-within:opacity-100 group-focus-within:text-kraft-accent transition-all leading-none">{label}</label>
          {error && <span className="text-[10px] font-black uppercase text-expense tracking-tighter leading-none">{error}</span>}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <div className={cn(
            "absolute left-6 top-6 transition-all",
            error ? "text-red-400" : "text-kraft-accent/40 group-focus-within:text-kraft-accent"
          )}>
            <Icon size={variant === 'dense' ? 14 : 18} />
          </div>
        )}
        <textarea
          className={cn(
            "w-full bg-white border rounded-t2 px-g3 py-g2 font-black transition-all placeholder:text-sub-label/20 placeholder:font-medium",
            variant === 'dense' ? "text-xs" : "text-sm",
            error 
              ? "border-expense bg-expense-light/30 focus:ring-expense/5" 
              : "border-hairline-soft focus:border-kraft-accent focus:ring-4 focus:ring-kraft-accent/5",
            "outline-none min-h-[120px] resize-none",
            Icon && "pl-14 pt-5",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
};

