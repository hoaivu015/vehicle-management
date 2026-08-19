import React, { useState, useEffect, useRef } from 'react';
import { LogIn, AlertCircle, Eye, EyeOff, Fingerprint, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { Staff } from '@/src/shared/domain/types';
import { LoginPresenter, LoginMode, LoginViewContract } from '../presenters/LoginPresenter';
import { SavedAccountSession } from '../../domain/dtos/LoginSchema';
import { QuickPinPad } from '../components/QuickPinPad';
import { PillButton } from '@/src/shared/design-system/Buttons';
import { haptics } from '@/src/shared/utils/haptics';

export interface LoginProps {
  onLogin?: (user: Staff) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { authRepo, staffRepo } = useDependencies();
  const [presenter] = useState(() => new LoginPresenter(authRepo, staffRepo));

  const [mode, setMode] = useState<LoginMode>('SMART_FORM');
  const [savedAccount, setSavedAccount] = useState<SavedAccountSession | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);

  // Kết nối Presenter với View Contract
  useEffect(() => {
    const viewContract: LoginViewContract = {
      showLoading: (isLoading) => setLoading(isLoading),
      showError: (msg) => {
        setError(msg);
        haptics.error();
      },
      clearError: () => setError(''),
      setMode: (newMode) => setMode(newMode),
      setSavedAccount: (account) => setSavedAccount(account),
      onLoginSuccess: (staff) => {
        haptics.success();
        if (staff && onLogin) {
          onLogin(staff);
        }
      },
    };

    presenter.attachView(viewContract);
    presenter.init();

    return () => presenter.detachView();
  }, [presenter, onLogin]);

  // Xử lý gửi form đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.light();
    await presenter.loginWithPassword(identifier, password, rememberMe);
  };

  // Xử lý mở khóa bằng PIN
  const handlePinComplete = async (pin: string) => {
    await presenter.unlockWithPin(pin);
  };

  // Xử lý mở khóa bằng Sinh trắc học
  const handleBiometricClick = async () => {
    haptics.light();
    await presenter.unlockWithBiometrics();
  };

  return (
    <div className="min-h-screen bg-ambient-gradient flex items-center justify-center p-4 sm:p-6 relative overflow-hidden pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-kraft-accent/15 to-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full backdrop-blur-2xl bg-white/75 dark:bg-zinc-900/80 border border-white/60 dark:border-white/10 rounded-[32px] p-6 sm:p-10 relative z-10 shadow-2xl shadow-black/5"
      >
        {/* Top Logo & Branding */}
        <div className="flex justify-center mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-2.5 rounded-[22px] shadow-md border border-black/5"
          >
            <img src="/logo_auto28.jpg" alt="AUTO 28 Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl" />
          </motion.div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-kraft-ink uppercase">
            AUTO 28
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-sub-label mt-1 opacity-70">
            Hệ thống Quản lý Showroom Ô tô
          </p>
        </div>

        {/* Error Alert Box with Shake Animation */}
        <AnimatePresence>
          {error && (
            <motion.div
              ref={errorRef}
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                x: [-10, 10, -8, 8, -4, 4, 0],
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="mb-6 bg-expense-light/60 text-expense p-4 rounded-2xl text-xs font-bold flex items-start gap-3 border border-expense/20 shadow-sm"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chế độ 1: Bàn phím Quick PIN 4 số */}
        {mode === 'QUICK_PIN' && savedAccount ? (
          <QuickPinPad
            savedAccount={savedAccount}
            isLoading={loading}
            error={error}
            onPinComplete={handlePinComplete}
            onBiometricClick={savedAccount.hasBiometrics ? handleBiometricClick : undefined}
            onSwitchToPassword={() => presenter.switchAccount()}
            onClearAccount={() => presenter.clearSavedAccount()}
          />
        ) : (
          /* Chế độ 2: Smart Identifier & Password Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Identifier: Mã NV hoặc Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-sub-label ml-1">
                Mã Nhân Viên / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl text-sm font-bold bg-white/80 border border-black/10 focus:border-kraft-accent focus:ring-4 focus:ring-kraft-accent/10 outline-none text-kraft-ink transition-all placeholder:text-sub-label/40"
                  placeholder="VD: NV01 hoặc name@auto28.vn"
                />
              </div>
            </div>

            {/* Input Password with Visibility Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-sub-label">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-[11px] font-bold text-kraft-accent hover:underline inline-flex items-center gap-1"
                >
                  <HelpCircle size={12} />
                  <span>Trợ giúp</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-5 pr-12 rounded-2xl text-sm font-bold bg-white/80 border border-black/10 focus:border-kraft-accent focus:ring-4 focus:ring-kraft-accent/10 outline-none text-kraft-ink transition-all placeholder:text-sub-label/40"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => {
                    haptics.light();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sub-label hover:text-kraft-ink p-1 rounded-lg transition-colors"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Biometrics Prompt */}
            <div className="flex items-center justify-between px-1 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-kraft-accent focus:ring-kraft-accent accent-kraft-accent"
                />
                <span className="text-xs font-bold text-sub-label">Ghi nhớ thiết bị này</span>
              </label>

              {savedAccount?.hasBiometrics && (
                <button
                  type="button"
                  onClick={handleBiometricClick}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-kraft-accent hover:underline py-1"
                >
                  <Fingerprint size={16} />
                  <span>Face ID / Vân tay</span>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <PillButton
              type="submit"
              size="lg"
              variant="primary"
              fullWidth
              isLoading={loading}
              icon={LogIn}
              className="h-14 mt-2"
            >
              Đăng nhập hệ thống
            </PillButton>

            {/* Nút quay lại mã PIN nếu có tài khoản đã lưu */}
            {savedAccount?.hasPin && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    haptics.light();
                    setMode('QUICK_PIN');
                  }}
                  className="text-xs font-bold text-kraft-accent hover:underline inline-flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} />
                  <span>Mở khóa nhanh bằng mã PIN của {savedAccount.name || savedAccount.staffCode}</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-black/5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sub-label opacity-60 leading-relaxed">
            Hệ thống bảo mật nội bộ AUTO 28.<br />
            Liên hệ <span className="text-kraft-accent font-black">Quản trị viên</span> nếu cần cấp mới hoặc đặt lại mật khẩu.
          </p>
        </div>
      </motion.div>

      {/* Help / Password Reset Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-kraft-accent">
                <ShieldCheck size={24} />
                <h3 className="text-base font-black text-kraft-ink">Hướng Dẫn Đăng Nhập</h3>
              </div>
              <div className="text-xs text-sub-label space-y-2 leading-relaxed">
                <p>
                  • <strong>Đăng nhập nhanh:</strong> Bạn có thể gõ trực tiếp Mã nhân viên (VD: <code className="bg-gray-100 px-1.5 py-0.5 rounded-full text-kraft-ink font-bold">NV01</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded-full text-kraft-ink font-bold">ADMIN</code>) thay cho email dài.
                </p>
                <p>
                  • <strong>Quên mật khẩu:</strong> Vui lòng liên hệ trực tiếp Bộ phận Quản trị Showroom để nhận lại mật khẩu cấp mới.
                </p>
                <p>
                  • <strong>Kích hoạt Face ID / PIN:</strong> Sau khi đăng nhập bằng mật khẩu, bật tùy chọn &quot;Ghi nhớ thiết bị&quot; để sử dụng mở khóa 1-chạm cho các lần sau.
                </p>
              </div>
              <PillButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setShowHelpModal(false)}
              >
                Đã hiểu
              </PillButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
