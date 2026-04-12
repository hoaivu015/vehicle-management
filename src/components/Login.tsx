import React, { useState } from 'react';
import { Car, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/src/shared/infrastructure/supabase';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      setLoading(false);
      return;
    }

    try {
      // 1. Try standard login
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError) {
        return; // Success, App.tsx will handle state
      }

      // If user doesn't exist in Auth, check if they are provisioned in the employees table
      if (signInError.message.toLowerCase().includes('invalid login credentials')) {
        // 1. Verify if the email is allowed first (Must exist in employees table)
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('email')
          .eq('email', email)
          .maybeSingle();

        if (employeeError || !employeeData) {
          setError('Email này chưa được cấp phép truy cập hệ thống. Vui lòng liên hệ Quản trị viên.');
          return;
        }

        // 2. Only then, allow the user to "claim" their account via signUp
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          console.error("Auto-provision error:", signUpError);
          if (signUpError.message.includes('already registered')) {
            setError('Email hoặc mật khẩu không chính xác');
          } else {
            setError('Đã xảy ra lỗi khi xác thực tài khoản được cấp.');
          }
          return;
        }

        if (signUpData?.user && !signUpData.user.email_confirmed_at) {
          setError('Tài khoản đã được tạo! Vui lòng kiểm tra hộp thư (' + email + ') để kích hoạt trước khi đăng nhập.');
          return;
        }

        // Re-fetch full profile now that they are authed
        const { data: finalData } = await supabase
          .from('employees')
          .select('*')
          .eq('email', email)
          .single();

        if (!finalData) {
          await supabase.auth.signOut();
          setError('Lỗi đồng bộ hồ sơ nhân sự. Vui lòng thử lại.');
          return;
        }

        return;
      }
      
      throw signInError; // Re-throw other errors to be caught by outer catch
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không chính xác');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.');
      } else {
        setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kraft-bg flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full highlight-card p-12 relative z-10 shadow-kraft-deep"
      >
        <div className="flex justify-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="bg-white p-2 rounded-2xl shadow-lg border border-kraft-accent/10"
          >
            <img src="/logo_auto28.jpg" alt="AUTO 28 Logo" className="w-24 h-24 object-contain" />
          </motion.div>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black tracking-tighter text-kraft-ink uppercase">AUTO 28</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider mt-4 opacity-60">Hồ sơ quản lý Showroom</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider ml-2 opacity-60">Email công ty</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="liquid-input h-14 px-6 text-base font-bold bg-white/40 backdrop-blur-sm border-white/40 text-kraft-ink"
              placeholder="name@auto28.vn"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider ml-2 opacity-60">Mật khẩu</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="liquid-input h-14 px-6 text-base font-bold bg-white/40 backdrop-blur-sm border-white/40 text-kraft-ink"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-kraft-red/10 text-kraft-red p-5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-4 border border-kraft-red/20"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full liquid-button-primary h-16 flex items-center justify-center gap-4 disabled:opacity-50 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={22} className="group-hover:translate-x-1 transition-transform" />
                <span className="text-lg font-black uppercase tracking-widest">Mở hồ sơ</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-kraft-accent/10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed opacity-40">
            Hệ thống quản lý nội bộ AUTO 28.<br />
            Liên hệ <span className="text-kraft-accent font-black">Quản trị viên</span> để cấp quyền.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
