import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, RefreshCw } from 'lucide-react';
import { haptics } from '../../../../shared/utils/haptics';

export const LiquidGlassCard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(24); // px
  const [opacityPercent, setOpacityPercent] = useState(6); // %

  const handleActivate = async () => {
    setIsProcessing(true);
    // Đồng bộ cơ học haptic khi nhấn nút kích hoạt
    haptics.medium();
    
    // Ambient Absorption: Khi đang xử lý, tăng Blur để hướng sự tập trung
    const originalBlur = blurIntensity;
    setBlurIntensity(40);
    
    setTimeout(() => {
      setIsProcessing(false);
      setBlurIntensity(originalBlur);
      haptics.success();
    }, 2000);
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <span className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
            <Sparkles size={20} className="animate-pulse" />
          </span>
          <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">
            Vật liệu kính dạng lỏng (Liquid Glassmorphism)
          </h3>
        </div>
        <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
          Dự án di động của chúng ta sử dụng kiến trúc **Vite + React (TypeScript) + Tailwind CSS + Capacitor v8.3**. Hiệu ứng này chạy trực tiếp trên WebView di động ở tần số quét 120Hz cực kỳ mượt mà kết hợp với **Capacitor Haptics**.
        </p>
      </div>

      {/* Phòng tương tác mô phỏng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* BẢN DEMO THỰC TẾ LIQUID GLASSMORPHIC CARD */}
        <div className="relative w-full min-h-[420px] bg-gradient-to-tr from-[#0B0E14] via-[#1b1c2b] to-[#0A0D15] rounded-[2.5rem] flex items-center justify-center p-6 overflow-hidden">
          
          {/* Ambient Absorption: Dải màu sinh học chuyển động ngầm dưới card */}
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-purple-600/30 rounded-full blur-[60px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-36 h-36 bg-amber-500/20 rounded-full blur-[50px] animate-pulse delay-700 pointer-events-none" />
          
          {/* CARD BODY WITH DYNAMIC LENSING & SPRING SQUEEZE */}
          <motion.div
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={() => haptics.light()}
            style={{
              backgroundColor: `rgba(255, 255, 255, ${opacityPercent / 100})`,
              backdropFilter: `blur(${blurIntensity}px)`,
              WebkitBackdropFilter: `blur(${blurIntensity}px)`,
            }}
            className="w-full max-w-[340px] aspect-[1/1.414] rounded-[32px] p-6 shadow-2xl shadow-black/40 border border-white/10 relative overflow-hidden group transition-colors duration-500 cursor-pointer hover:bg-white/[0.09]"
          >
            {/* Hiệu ứng vệt sáng lỏng quét qua khi hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            {/* Viền phản chiếu Specular Hairline Stroke: Dải gradient 1px chéo cực tinh tế */}
            <div className="absolute inset-0 rounded-[32px] border border-white/10 pointer-events-none bg-gradient-to-br from-white/15 via-white/5 to-white/2 opacity-80" style={{ margin: '-1px' }} />

            {/* Nội dung phân tầng bên trong card */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-purple-300 uppercase tracking-widest">
                    Gemini Live
                  </span>
                  {isProcessing && (
                    <RefreshCw className="animate-spin text-purple-400" size={14} />
                  )}
                </div>
                
                <h3 className="text-xl font-black text-white tracking-tight leading-6 mb-3 font-heading">
                  Khúc xạ thấu kính bản địa
                </h3>
                
                <p className="text-[12px] font-medium text-slate-400 leading-relaxed">
                  Lớp kính lỏng co giãn lực đàn hồi lò xo, đồng bộ nhịp rung cơ học Haptic phản ứng chân thực 100% khi nhấn vào thẻ.
                </p>
              </div>

              {/* Thanh tương tác dưới đáy thẻ */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[11px] font-black text-slate-500 tracking-wider uppercase">
                  {isProcessing ? 'Thinking...' : '120Hz Fluid'}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Tránh kích hoạt click của Card
                    handleActivate();
                  }}
                  disabled={isProcessing}
                  className="bg-white text-black px-4 py-2 rounded-full text-[11px] font-black hover:bg-purple-400 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? 'Đang bật' : 'Kích hoạt'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* BẢNG ĐIỀU KHIỂN & SO SÁNH THÔNG SỐ TOKENS */}
        <div className="bg-white/60 p-6 rounded-3xl border border-white/80 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-black text-kraft-ink uppercase tracking-wider block">
              Điều chỉnh thông số Figma Design Tokens:
            </span>
            
            {/* Opacity slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-kraft-ink/70">
                <span>Fill Opacity (Màu nền trắng)</span>
                <span className="font-black text-kraft-ink">{opacityPercent}%</span>
              </div>
              <input
                type="range"
                min="4"
                max="15"
                value={opacityPercent}
                onChange={(e) => {
                  setOpacityPercent(Number(e.target.value));
                  haptics.light();
                }}
                className="w-full accent-purple-600 h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-kraft-ink/40 font-medium block">
                Khuyến nghị: 6% - 8% để có độ trong tự nhiên nhất.
              </span>
            </div>

            {/* Blur intensity slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-kraft-ink/70">
                <span>Backdrop Blur Intensity</span>
                <span className="font-black text-kraft-ink">{blurIntensity}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="64"
                value={blurIntensity}
                onChange={(e) => {
                  setBlurIntensity(Number(e.target.value));
                  haptics.light();
                }}
                className="w-full accent-purple-600 h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-kraft-ink/40 font-medium block">
                Khuyến nghị: 24px cho chế độ thường, 40px khi đang Thinking.
              </span>
            </div>
          </div>

          {/* Haptic Synchronization Explanation */}
          <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10 space-y-2">
            <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={12} className="animate-pulse" />
              Đồng bộ hóa Xúc giác (Haptic Sync)
            </span>
            <p className="text-xs text-kraft-ink/70 leading-relaxed font-medium">
              Khi chạm vào kính, thiết bị kích hoạt đồng thời lực lò xo CSS/Framer Motion và lệnh gọi haptic tương ứng qua Capacitor Engine:
            </p>
            <code className="text-[10px] block bg-black/5 p-2 rounded-lg font-mono text-purple-900 overflow-x-auto">
              {`// Kích hoạt nhẹ khi nhấp vào Card
onClick={() => haptics.light()}

// Rung phản hồi thành công khi xử lý xong
haptics.success();`}
            </code>
          </div>
        </div>

      </div>
    </div>
  );
};
