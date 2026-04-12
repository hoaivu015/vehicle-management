import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign } from 'lucide-react';
import { parseSmartInput, numberToVietnameseText } from '../utils/currency';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  error
}) => {
  const [inputValue, setInputValue] = useState<string>(value > 0 ? value.toLocaleString('vi-VN') : '');
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
        setInputValue(value.toLocaleString('vi-VN'));
        setPreviewValue(value);
      }
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const parsed = parseSmartInput(val);
    setPreviewValue(parsed);
    onChange(parsed);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (previewValue > 0) {
      setInputValue(previewValue.toLocaleString('vi-VN'));
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
                 {previewValue.toLocaleString('vi-VN')}{suffix}
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
    <div className={cn("space-y-2.5", className)}>
      {label && (
        <label htmlFor={id} className="block text-[9px] font-black uppercase tracking-widest px-2 opacity-40">
          {label}
        </label>
      )}
      <div className="relative group/smart">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-kraft-accent group-focus-within/smart:text-kraft-accent transition-colors opacity-40 group-focus-within/smart:opacity-100">
          <Icon size={18} />
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
            "liquid-input pl-14 pr-12 h-16 bg-white/40 backdrop-blur-sm border-white/40 text-kraft-ink",
            "text-base font-black placeholder:font-bold placeholder:text-kraft-ink/20",
            isFocused && "border-kraft-accent shadow-kraft bg-white/60",
            error && "border-red-500/50 bg-red-50/10"
          )}
        />
        
        {inputValue && (
          <button 
            type="button"
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-kraft-ink/20 hover:text-kraft-accent transition-colors"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-kraft-accent/10">
              <span className="text-lg leading-none">×</span>
            </div>
          </button>
        )}
      </div>

      {error && (
        <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider px-2">
          {error}
        </p>
      )}
      
      <AnimatePresence>
        {isFocused && previewValue > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className="absolute z-[110] left-0 right-0 md:left-auto md:w-[360px] top-full mt-3 flex flex-col p-5 bg-white/95 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 shadow-kraft-deep origin-top"
          >
            <div className="flex items-start gap-4">
              <div className="bg-kraft-accent/10 p-3 rounded-[1.25rem] border border-kraft-accent/20">
                <Icon size={20} className="text-kraft-accent shrink-0" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black text-kraft-ink tracking-tight flex items-baseline gap-1.5 leading-none">
                  {previewValue.toLocaleString('vi-VN')}
                  <span className="text-[10px] uppercase opacity-40 font-black">{suffix.trim()}</span>
                </p>
                {showTextPreview && previewValue >= 1000 && (
                  <p className="text-[9px] font-black uppercase tracking-widest text-kraft-accent italic leading-tight pt-1">
                    {numberToVietnameseText(previewValue)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
