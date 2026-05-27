import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, ShieldAlert, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { haptics } from '../../../../shared/utils/haptics';

export const HapticPhysicsLab = () => {
  const [lastTriggered, setLastTriggered] = useState<string>('Chưa có');
  const [animationDuration, setAnimationDuration] = useState<number>(300); // ms
  const [isRotating, setIsRotating] = useState(false);

  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'error', label: string) => {
    setLastTriggered(label);
    try {
      await haptics[type]();
    } catch (e) {
      console.warn('Haptics not supported:', e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Capacitor Haptics Laboratory */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Zap size={20} className="animate-pulse" />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Capacitor Haptics Lab</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Thử nghiệm và cảm nhận phản hồi vật lý xúc giác (Vibration & Tactile Feedback) trên thiết bị Simulator hoặc Native Mobile.
          </p>
        </div>

        <div className="bg-black/5 p-5 rounded-3xl border border-black/[0.02] flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-kraft-ink/40">Phản hồi cuối:</span>
          <span className="text-xs font-bold text-kraft-ink px-4 py-1.5 bg-white/90 rounded-full border border-black/5 shadow-sm inline-flex items-center gap-1.5 animate-pulse">
            <Activity size={12} className="text-amber-500" />
            {lastTriggered}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => triggerHaptic('light', 'Chạm nhẹ (Light Tap)')}
            className="flex flex-col items-center justify-center p-6 bg-white/70 hover:bg-white border border-white/80 hover:border-amber-500/30 rounded-3xl transition-all duration-300 shadow-sm active:scale-95 group text-center"
          >
            <Sparkles size={24} className="text-gray-400 group-hover:text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-kraft-ink mt-3">Light Impact</span>
            <span className="text-[9px] font-black text-kraft-ink/30 uppercase mt-1">Nút bấm/Toggle</span>
          </button>

          <button
            onClick={() => triggerHaptic('medium', 'Chạm vừa (Medium Tap)')}
            className="flex flex-col items-center justify-center p-6 bg-white/70 hover:bg-white border border-white/80 hover:border-amber-500/30 rounded-3xl transition-all duration-300 shadow-sm active:scale-95 group text-center"
          >
            <Zap size={24} className="text-gray-400 group-hover:text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-kraft-ink mt-3">Medium Impact</span>
            <span className="text-[9px] font-black text-kraft-ink/30 uppercase mt-1">Xác nhận thường</span>
          </button>

          <button
            onClick={() => triggerHaptic('heavy', 'Chạm mạnh (Heavy Tap)')}
            className="flex flex-col items-center justify-center p-6 bg-white/70 hover:bg-white border border-white/80 hover:border-amber-500/30 rounded-3xl transition-all duration-300 shadow-sm active:scale-95 group text-center"
          >
            <ShieldAlert size={24} className="text-gray-400 group-hover:text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-kraft-ink mt-3">Heavy Impact</span>
            <span className="text-[9px] font-black text-kraft-ink/30 uppercase mt-1">Xóa xe / Cảnh báo</span>
          </button>

          <button
            onClick={() => triggerHaptic('success', 'Thành công (Success)')}
            className="flex flex-col items-center justify-center p-6 bg-white/70 hover:bg-white border border-white/80 hover:border-emerald-500/30 rounded-3xl transition-all duration-300 shadow-sm active:scale-95 group text-center"
          >
            <CheckCircle size={24} className="text-emerald-400 group-hover:text-emerald-500 group-hover:scale-110 transition-transform animate-bounce" />
            <span className="text-xs font-bold text-emerald-600 mt-3">Success Notification</span>
            <span className="text-[9px] font-black text-emerald-600/40 uppercase mt-1">Lưu thành công</span>
          </button>

          <button
            onClick={() => triggerHaptic('error', 'Lỗi (Error)')}
            className="flex flex-col items-center justify-center p-6 bg-white/70 hover:bg-white border border-white/80 hover:border-rose-500/30 rounded-3xl transition-all duration-300 shadow-sm active:scale-95 group text-center"
          >
            <AlertTriangle size={24} className="text-rose-400 group-hover:text-rose-500 group-hover:scale-110 transition-transform animate-shake" />
            <span className="text-xs font-bold text-rose-600 mt-3">Error Notification</span>
            <span className="text-[9px] font-black text-rose-600/40 uppercase mt-1">Sai định dạng/Lỗi</span>
          </button>
        </div>
      </div>

      {/* Physics & Animations Laboratory */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Activity size={20} />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Physics & Animation Lab</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Tinh chỉnh và trực quan hóa tốc độ của hiệu ứng chuyển động lướt Glass (Liquid Glass Transitions) trong hệ thống Auto 28.
          </p>
        </div>

        <div className="space-y-6 bg-black/5 p-6 rounded-3xl border border-black/[0.02]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-kraft-ink">Animation Speed (Thời lượng)</span>
              <p className="text-[10px] text-kraft-ink/40 font-bold uppercase tracking-wider">Quyết định độ mượt của vi-tương tác</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={animationDuration}
                onChange={(e) => {
                  setAnimationDuration(Number(e.target.value));
                  haptics.light();
                }}
                className="w-48 accent-amber-500 h-2 bg-white rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-black text-kraft-ink min-w-[50px] text-right">{animationDuration}ms</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Demo 1: Spring/Elastic scale */}
          <div className="flex flex-col items-center justify-center p-8 bg-white/60 border border-white/70 rounded-3xl space-y-4">
            <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest">Spring Scale Effect</span>
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => triggerHaptic('light', 'Nhấp Spring Card')}
              className="w-40 h-40 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-3xl flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/10 cursor-pointer select-none active:shadow-sm"
            >
              CHẠM TÔI
            </motion.div>
            <p className="text-[10px] text-kraft-ink/40 text-center leading-relaxed">
              Mô phỏng hiệu ứng lò xo kéo dãn lực biến thiên cực nhạy trên iOS.
            </p>
          </div>

          {/* Card Demo 2: Linear Glass Rotation */}
          <div className="flex flex-col items-center justify-center p-8 bg-white/60 border border-white/70 rounded-3xl space-y-4">
            <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest">Liquid Linear Transition</span>
            <motion.div
              animate={{ rotate: isRotating ? 360 : 0 }}
              transition={{ duration: animationDuration / 1000, ease: "easeInOut" }}
              onClick={() => {
                setIsRotating(!isRotating);
                triggerHaptic('medium', 'Kích hoạt Rotation');
              }}
              className="w-40 h-40 bg-white/90 border border-white/60 backdrop-blur-md rounded-3xl flex items-center justify-center text-kraft-ink font-black shadow-md cursor-pointer select-none"
            >
              {isRotating ? 'ĐANG QUAY' : 'BẤM QUAY'}
            </motion.div>
            <p className="text-[10px] text-kraft-ink/40 text-center leading-relaxed">
              Tốc độ thay đổi linh hoạt theo thanh trượt thời gian ở trên (hiện tại: {animationDuration}ms).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
