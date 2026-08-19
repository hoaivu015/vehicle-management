import React from 'react';
import { motion } from 'motion/react';

export const AppSplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-ambient-gradient flex flex-col items-center justify-center p-6 select-none">
      {/* Background ambient glow */}
      <div className="absolute w-96 h-96 bg-kraft-accent/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center relative z-10"
      >
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="bg-white p-3.5 rounded-[28px] shadow-2xl shadow-black/10 border border-white/80 mb-6"
        >
          <img
            src="/logo_auto28.jpg"
            alt="AUTO 28 Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl"
          />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-kraft-ink uppercase">
          AUTO 28
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-widest text-sub-label mt-1 opacity-70">
          Hệ thống Quản lý Showroom Ô tô
        </p>

        {/* Pulsing Loading Indicator */}
        <div className="flex items-center gap-2 mt-8">
          <div className="w-2 h-2 rounded-full bg-kraft-accent animate-ping" />
          <span className="text-xs font-bold text-kraft-ink/60 tracking-wider">
            Đang tải dữ liệu...
          </span>
        </div>
      </motion.div>
    </div>
  );
};
