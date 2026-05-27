import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign } from 'lucide-react';
import { parseSmartInput, numberToVietnameseText } from '@/src/shared/utils/currency';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { haptics } from '@/src/shared/utils/haptics';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SmartAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
  compact?: boolean;
  required?: boolean;
  suffix?: string;
  icon?: React.ElementType;
  showTextPreview?: boolean;
  error?: string;
  variant?: 'standard' | 'dense';
}

export const SmartAmountInput: React.FC<SmartAmountInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Nhập số tiền",
  className,
  id,
  autoFocus,
  compact = false,
  required = false,
  suffix = ' đ',
  icon: Icon = DollarSign,
  showTextPreview = true,
  error,
  variant = 'standard'
}) => {
  const isDense = variant === 'dense';
  const [inputValue, setInputValue] = useState<string>(value > 0 ? value.toLocaleString('vi-VN', { maximumFractionDigits: 3 }) : '');
  const [isFocused, setIsFocused] = useState(false);
  const [previewValue, setPreviewValue] = useState<number>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Sync with external value changes
  useEffect(() => {
    if (value === 0 && inputValue !== '') {
      setInputValue('');
      setPreviewValue(0);
    } else if (value > 0) {
      const currentParsed = parseSmartInput(inputValue);
      if (Math.abs(currentParsed - value) > 1) {
        setInputValue(value.toLocaleString('vi-VN', { maximumFractionDigits: 3 }));
        setPreviewValue(value);
      }
    }
  }, [value]);

  // Trigger error haptics when an error occurs
  useEffect(() => {
    if (error) {
      haptics.error();
    }
  }, [error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const parsed = parseSmartInput(val);
    setPreviewValue(parsed);
    onChange(parsed);

    // Kích hoạt haptic phản hồi gõ chữ
    haptics.light();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (previewValue > 0) {
      setInputValue(previewValue.toLocaleString('vi-VN', { maximumFractionDigits: 3 }));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const clearInput = () => {
    setInputValue('');
    setPreviewValue(0);
    onChange(0);
    inputRef.current?.focus();
  };

  if (compact) {
    return (
      <div className={cn("relative group/smart", className)}>
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={cn(
            "block w-full text-right font-bold bg-transparent border-b border-transparent",
            "hover:border-kraft-accent/10 focus:border-kraft-accent focus:outline-none transition-all",
            "text-kraft-ink tracking-tight",
            isDense && "text-[11px]",
            error && "border-red-500"
          )}
        />
        {isFocused && previewValue > 0 && (
          <div className="absolute z-50 right-0 top-full mt-4 p-5 bg-white/80 backdrop-blur-3xl shadow-kraft rounded-3xl border border-white/40 min-w-[320px] animate-in fade-in zoom-in-95 duration-500">
             <div className="flex items-center gap-4 mb-3">
               <div className="bg-kraft-accent/10 p-2 rounded-xl border border-kraft-accent/20">
                 <Icon size={16} className="text-kraft-accent" />
               </div>
               <p className="text-lg font-bold text-kraft-ink tracking-tight text-nowrap">
                 {previewValue.toLocaleString('vi-VN', { maximumFractionDigits: 3 })}{suffix}
               </p>
             </div>
            {showTextPreview && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-kraft-accent italic leading-relaxed opacity-60">
                {numberToVietnameseText(previewValue)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative space-y-2 w-full group", className)}>
      {label && (
        <div className="flex justify-between items-end px-g1">
          <label htmlFor={id} className="text-[11px] font-black uppercase tracking-widest text-sub-label opacity-40 group-focus-within:opacity-100 group-focus-within:text-kraft-accent transition-all leading-none">
            {label}
          </label>
          {error && <span className="text-[10px] font-black uppercase text-expense tracking-tighter leading-none">{error}</span>}
        </div>
      )}
      <div className="relative group/smart">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-kraft-accent group-focus-within/smart:text-kraft-accent transition-colors opacity-40 group-focus-within/smart:opacity-100">
          <Icon size={isDense ? 14 : 18} strokeWidth={2.5} />
        </div>
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full bg-white border rounded-t2 px-g3 pl-14 pr-12 font-black transition-all placeholder:text-sub-label/20 placeholder:font-medium",
            isDense ? "h-12 text-xs" : "h-14 text-sm",
            isFocused 
              ? "border-kraft-accent focus:ring-4 focus:ring-kraft-accent/5 shadow-kraft-deep/10" 
              : error 
                ? "border-expense bg-expense-light/30 focus:ring-expense/5 animate-micro-shake" 
                : "border-hairline-soft"
          )}
        />
        
        {inputValue && (
          <button 
            type="button"
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-kraft-ink/20 hover:text-red-500 transition-all active:scale-90"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-50">
              <span className="text-xl leading-none">×</span>
            </div>
          </button>
        )}
      </div>

      {error && !label && (
        <p className="text-[10px] font-black uppercase text-expense tracking-tighter px-g1">
          {error}
        </p>
      )}
      
      <AnimatePresence>
        {isFocused && previewValue > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className={cn(
              "absolute z-[10001] left-0 right-0 md:left-auto md:w-[380px] top-full mt-4",
              "bg-white/95 backdrop-blur-[20px] p-6 rounded-[32px]",
              "border border-white/60",
              "shadow-[0_20px_50px_rgba(0,0,0,0.12)]",
              "flex flex-col gap-3 min-w-[240px]",
              "gpu-accelerated"
            )}
          >
            <div className="flex items-start gap-5">
              <div className="bg-kraft-accent/10 p-4 rounded-2xl border border-kraft-accent/10 shadow-inner">
                <Icon size={24} className="text-kraft-accent shrink-0" strokeWidth={2.5} />
              </div>
              <div className="space-y-1.5 py-1">
                  <p className="text-2xl font-black text-kraft-ink tracking-tighter flex items-baseline gap-g1 leading-none">
                    {previewValue.toLocaleString('vi-VN', { maximumFractionDigits: 3 })}
                    <span className="text-[11px] uppercase opacity-40 font-black tracking-widest">{suffix.trim()}</span>
                  </p>
                   {showTextPreview && previewValue >= 1000 && (
                    <div className="flex items-center gap-g1 pt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-kraft-accent" />
                       <p className="text-[9px] font-black uppercase tracking-widest text-kraft-ink/30">Số tiền (Bằng chữ)</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-kraft-accent italic leading-tight">
                          {numberToVietnameseText(previewValue)}
                       </p>
                    </div>
                  )}
              </div>
            </div>
            
            <div className="absolute -top-2 left-8 w-4 h-4 bg-white/95 rotate-45 border-l border-t border-white/60" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
