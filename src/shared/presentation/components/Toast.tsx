import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const styles = {
    success: {
      container: "bg-income/10 border-income/20 text-income shadow-income/10",
      icon: "text-income",
      closeBtn: "bg-income/15 text-income hover:bg-income/25"
    },
    error: {
      container: "bg-expense/10 border-expense/20 text-expense shadow-expense/10",
      icon: "text-expense",
      closeBtn: "bg-expense/15 text-expense hover:bg-expense/25"
    },
    warning: {
      container: "bg-warning/10 border-warning/20 text-warning shadow-warning/10",
      icon: "text-warning",
      closeBtn: "bg-warning/15 text-warning hover:bg-warning/25"
    },
    info: {
      container: "bg-accent-soft border-brand/20 text-kraft-ink shadow-brand/10",
      icon: "text-brand",
      closeBtn: "bg-brand/15 text-brand hover:bg-brand/25"
    }
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const currentStyle = styles[type];

  return (
    <div className={cn(
      "relative flex items-center gap-3 p-4 pr-10 rounded-2xl border backdrop-blur-xl shadow-lg min-w-[320px] transition-all duration-500",
      currentStyle.container
    )}>
      {/* Close button on top-left as requested/seen in image */}
      <button 
        onClick={onClose}
        className={cn(
          "absolute -top-2 -left-2 p-1 rounded-full border border-white/50 shadow-sm transition-transform hover:scale-110 active:scale-95",
          currentStyle.closeBtn
        )}
      >
        <X className="w-3 h-3" />
      </button>

      <div className={cn("shrink-0", currentStyle.icon)}>
        {icons[type]}
      </div>
      
      <p className="text-sm font-bold tracking-tight">
        {message}
      </p>
    </div>
  );
};
