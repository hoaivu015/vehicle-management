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
      container: "bg-emerald-50/80 border-emerald-200/50 text-emerald-800",
      icon: "text-emerald-600",
      closeBtn: "bg-emerald-100/50 text-emerald-600 hover:bg-emerald-200/50"
    },
    error: {
      container: "bg-red-50/80 border-red-200/50 text-red-800",
      icon: "text-red-600",
      closeBtn: "bg-red-100/50 text-red-600 hover:bg-red-200/50"
    },
    warning: {
      container: "bg-amber-50/80 border-amber-200/50 text-amber-800",
      icon: "text-amber-600",
      closeBtn: "bg-amber-100/50 text-amber-600 hover:bg-amber-200/50"
    },
    info: {
      container: "bg-blue-50/80 border-blue-200/50 text-blue-800",
      icon: "text-blue-600",
      closeBtn: "bg-blue-100/50 text-blue-600 hover:bg-blue-200/50"
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
