import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Delete, Fingerprint, KeyRound, UserX } from 'lucide-react';
import { haptics } from '@/src/shared/utils/haptics';
import { SavedAccountSession } from '../../domain/dtos/LoginSchema';

interface QuickPinPadProps {
  savedAccount: SavedAccountSession;
  isLoading: boolean;
  error?: string;
  onPinComplete: (pin: string) => void;
  onBiometricClick?: () => void;
  onSwitchToPassword: () => void;
  onClearAccount: () => void;
}

export const QuickPinPad: React.FC<QuickPinPadProps> = ({
  savedAccount,
  isLoading,
  error,
  onPinComplete,
  onBiometricClick,
  onSwitchToPassword,
  onClearAccount,
}) => {
  const [pin, setPin] = useState<string>('');

  const handleKeyPress = useCallback((digit: string) => {
    if (isLoading || pin.length >= 4) return;
    haptics.light();
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      onPinComplete(newPin);
    }
  }, [isLoading, pin, onPinComplete]);

  const handleDelete = useCallback(() => {
    if (isLoading || pin.length === 0) return;
    haptics.light();
    setPin((prev) => prev.slice(0, -1));
  }, [isLoading, pin]);

  // Reset PIN khi có lỗi từ server/presenter
  useEffect(() => {
    if (!error) return;
    haptics.error();
    const timer = setTimeout(() => {
      setPin('');
    }, 400);
    return () => clearTimeout(timer);
  }, [error]);

  // Keyboard support for desktop / iPad physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete]);

  const KEYPAD_NUMBERS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Avatar & Staff Info Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-kraft-accent to-amber-500 flex items-center justify-center text-white text-xl font-black shadow-lg mb-3"
        >
          {savedAccount.name ? savedAccount.name.charAt(0).toUpperCase() : 'A'}
        </motion.div>
        <h2 className="text-xl font-black text-kraft-ink">{savedAccount.name || 'Nhân viên Showroom'}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-kraft-accent/10 text-kraft-accent border border-kraft-accent/20">
            {savedAccount.staffCode || 'NV'}
          </span>
          <span className="text-xs text-sub-label font-medium">{savedAccount.email}</span>
        </div>
      </div>

      {/* PIN Dots Display */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[0, 1, 2, 3].map((index) => {
          const isFilled = pin.length > index;
          return (
            <motion.div
              key={index}
              initial={false}
              animate={{
                scale: isFilled ? [1, 1.25, 1] : 1,
                borderColor: error ? 'var(--color-expense, #ef4444)' : isFilled ? 'var(--color-kraft-accent, #2563eb)' : 'rgba(0, 0, 0, 0.15)',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                error
                  ? 'bg-expense/20 border-expense'
                  : isFilled
                  ? 'bg-kraft-accent border-kraft-accent shadow-sm'
                  : 'bg-white/40 border-black/15'
              }`}
            >
              {isFilled && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full px-4 mb-6">
        {KEYPAD_NUMBERS.flat().map((num) => (
          <motion.button
            key={num}
            type="button"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 450, damping: 15 }}
            disabled={isLoading}
            onClick={() => handleKeyPress(num)}
            className="h-16 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-sm text-2xl font-black text-kraft-ink flex items-center justify-center hover:bg-white active:bg-kraft-accent/10 transition-colors"
          >
            {num}
          </motion.button>
        ))}

        {/* Biometric Button or Placeholder */}
        {savedAccount.hasBiometrics && onBiometricClick ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            disabled={isLoading}
            onClick={() => {
              haptics.light();
              onBiometricClick();
            }}
            title="Mở khóa bằng Face ID / Vân tay"
            className="h-16 rounded-full bg-kraft-accent/10 border border-kraft-accent/30 text-kraft-accent flex items-center justify-center hover:bg-kraft-accent/20 transition-colors"
          >
            <Fingerprint size={28} />
          </motion.button>
        ) : (
          <div className="h-16" />
        )}

        {/* Zero key */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          disabled={isLoading}
          onClick={() => handleKeyPress('0')}
          className="h-16 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-sm text-2xl font-black text-kraft-ink flex items-center justify-center hover:bg-white active:bg-kraft-accent/10 transition-colors"
        >
          0
        </motion.button>

        {/* Delete key */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          disabled={isLoading || pin.length === 0}
          onClick={handleDelete}
          title="Xóa chữ số"
          className="h-16 rounded-full bg-white/40 border border-white/60 text-kraft-ink/60 flex items-center justify-center hover:bg-white hover:text-kraft-ink disabled:opacity-30 transition-colors"
        >
          <Delete size={22} />
        </motion.button>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between w-full px-4 pt-4 border-t border-black/5 text-xs">
        <button
          type="button"
          onClick={() => {
            haptics.light();
            onSwitchToPassword();
          }}
          className="inline-flex items-center gap-1.5 font-bold text-kraft-accent hover:underline py-2"
        >
          <KeyRound size={14} />
          <span>Dùng Mật Khẩu</span>
        </button>

        <button
          type="button"
          onClick={() => {
            haptics.light();
            onClearAccount();
          }}
          className="inline-flex items-center gap-1.5 font-bold text-sub-label hover:text-expense hover:underline py-2"
        >
          <UserX size={14} />
          <span>Đổi Tài Khoản</span>
        </button>
      </div>
    </div>
  );
};
