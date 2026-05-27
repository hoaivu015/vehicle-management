import { Palette, Type, Layers, Box } from 'lucide-react';

export const ThemeSpec = () => {
  return (
    <div className="space-y-8">
      {/* Brand Color Spec (OKLCH Palette) */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Palette size={20} />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Màu sắc Hệ thống (OKLCH Spec)</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Các dải màu OKLCH chuẩn hóa giúp hiển thị rực rỡ và hài hòa trên tất cả màn hình OLED thế hệ mới.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Amber */}
          <div className="bg-white/60 border border-white/70 p-5 rounded-3xl space-y-4">
            <div className="h-24 bg-amber-500 rounded-2xl shadow-inner flex items-end p-4">
              <span className="text-white font-black text-sm">Kraft Amber</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-kraft-ink">
                <span>Tên màu:</span>
                <span className="text-amber-600">Primary Amber</span>
              </div>
              <div className="flex justify-between text-[10px] text-kraft-ink/40 font-bold uppercase">
                <span>Mã màu:</span>
                <span>bg-amber-500 (#F59E0B)</span>
              </div>
              <div className="flex justify-between text-[10px] text-kraft-ink/40 font-bold uppercase">
                <span>Môi trường:</span>
                <span>OLED HDR Optimized</span>
              </div>
            </div>
          </div>

          {/* Dark Ink */}
          <div className="bg-white/60 border border-white/70 p-5 rounded-3xl space-y-4">
            <div className="h-24 bg-kraft-ink rounded-2xl shadow-inner flex items-end p-4">
              <span className="text-white font-black text-sm">Kraft Ink</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-kraft-ink">
                <span>Tên màu:</span>
                <span className="text-kraft-ink">Kraft Ink (Dark)</span>
              </div>
              <div className="flex justify-between text-[10px] text-kraft-ink/40 font-bold uppercase">
                <span>Mã màu:</span>
                <span>#1C1917 (Stone-900)</span>
              </div>
              <div className="flex justify-between text-[10px] text-kraft-ink/40 font-bold uppercase">
                <span>Môi trường:</span>
                <span>Deep Contrast Core</span>
              </div>
            </div>
          </div>

          {/* Liquid Glass Overlay */}
          <div className="bg-white/60 border border-white/70 p-5 rounded-3xl space-y-4">
            <div className="h-24 bg-white/40 border border-white/60 backdrop-blur-md rounded-2xl shadow-inner flex items-end p-4">
              <span className="text-kraft-ink font-black text-sm">Glass Overlay</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-kraft-ink">
                <span>Tên màu:</span>
                <span className="text-kraft-ink/60">Liquid Glass</span>
              </div>
              <div className="flex justify-between text-[10px] text-kraft-ink/40 font-bold uppercase">
                <span>Mã màu:</span>
                <span>white/40 backdrop-blur</span>
              </div>
              <div className="flex justify-between text-[10px] text-kraft-ink/40 font-bold uppercase">
                <span>Môi trường:</span>
                <span>Overlay & Dialogs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Spec */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Type size={20} />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Hệ thống phông chữ (Typography Hierarchy)</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Sử dụng cặp phông chữ cao cấp Plus Jakarta Sans (Tiêu đề - Tương đồng 99% Google Sans) và Be Vietnam Pro (Đoạn văn - Tối ưu 100% tiếng Việt) được phân cấp tỷ lệ vàng giúp tối ưu trải nghiệm đọc nhanh báo cáo tài chính và dữ liệu xe.
          </p>
        </div>

        <div className="bg-white/60 border border-white/70 p-8 rounded-3xl space-y-6">
          <div className="border-b border-black/5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-[150px]">
              <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest">H1 Ultra-Bold</span>
              <p className="text-[9px] text-kraft-ink/40 font-bold mt-1">30px / font-black / Plus Jakarta Sans</p>
            </div>
            <div className="text-3xl font-black text-kraft-ink uppercase tracking-tight">LAND ROVER DEFENDER</div>
          </div>

          <div className="border-b border-black/5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-[150px]">
              <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest">H2 Module Title</span>
              <p className="text-[9px] text-kraft-ink/40 font-bold mt-1">20px / font-extrabold / Plus Jakarta Sans</p>
            </div>
            <div className="text-xl font-extrabold text-kraft-ink">Quản lý kho xe Auto 28</div>
          </div>

          <div className="border-b border-black/5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-[150px]">
              <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest">H3 Card Header</span>
              <p className="text-[9px] text-kraft-ink/40 font-bold mt-1">16px / font-bold / Plus Jakarta Sans</p>
            </div>
            <div className="text-base font-bold text-kraft-ink">Porsche 911 GT3 RS</div>
          </div>

          <div className="border-b border-black/5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-[150px]">
              <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest">Body Text</span>
              <p className="text-[9px] text-kraft-ink/40 font-bold mt-1">14px / font-medium / Be Vietnam Pro</p>
            </div>
            <div className="text-sm font-medium text-kraft-ink/70 leading-relaxed">
              Dòng xe thể thao hạng sang với động cơ hút khí tự nhiên 4.0L sản sinh công suất 518 mã lực.
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-[150px]">
              <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest">Caption Label</span>
              <p className="text-[9px] text-kraft-ink/40 font-bold mt-1">10px / font-black / tracking</p>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/40 italic">
              LIQUID PROFESSIONAL STANDARD V4
            </div>
          </div>
        </div>
      </div>

      {/* Spacing & Radii Spec */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Layers size={20} />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Spacing & Radii Spec (Bo góc & Khoảng cách)</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Bo góc bo tròn mượt mà (Continuous Curves) tương thích tuyệt đối với viền màn hình cong của iPhone và iPad Pro mới.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white/60 border border-white/70 p-6 rounded-3xl flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-3">
              <Box className="text-amber-500" size={18} />
              <span className="text-xs font-black text-kraft-ink uppercase tracking-wider">Bo góc Card Lớn / Modals</span>
            </div>
            <div className="h-28 bg-black/5 border border-black/5 rounded-[2.5rem] flex items-center justify-center p-4">
              <span className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest text-center">
                rounded-[2.5rem] (40px)
              </span>
            </div>
            <p className="text-[10px] text-kraft-ink/40 font-bold">
              Thích hợp cho các modal chính, trang chứa chi tiết xe và popup toàn màn hình.
            </p>
          </div>

          <div className="bg-white/60 border border-white/70 p-6 rounded-3xl flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-3">
              <Box className="text-amber-500" size={18} />
              <span className="text-xs font-black text-kraft-ink uppercase tracking-wider">Bo góc Card Vừa / Inputs</span>
            </div>
            <div className="h-28 bg-black/5 border border-black/5 rounded-[1.5rem] flex items-center justify-center p-4">
              <span className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-widest text-center">
                rounded-[1.5rem] (24px)
              </span>
            </div>
            <p className="text-[10px] text-kraft-ink/40 font-bold">
              Dành cho các thẻ thông tin sản phẩm cỡ vừa, form nhập liệu và nút bấm PillButton lớn.
            </p>
          </div>
        </div>
      </div>

      {/* 🌊 Fluid Scroll Indicators Spec */}
      <div className="bg-[#0B0E14] text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <Palette size={20} />
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Chỉ báo dòng chảy thị giác (Fluid Scroll Indicators)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Vật liệu kính lỏng Liquid Glassmorphism kết hợp hiệu ứng co giãn lò xo (Overshoot Stretch) khi chạm đáy/đỉnh dữ liệu.
            </p>
          </div>
          
          <div className="glass-badge-purple !opacity-100 !text-white flex items-center justify-center font-black">
            NEURAL PHYSICS
          </div>
        </div>

        {/* 📐 Spec Table */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 pb-3">
                <th className="pb-3 text-slate-400 font-bold uppercase tracking-wider">Thành phần nút cuộn</th>
                <th className="pb-3 text-slate-400 font-bold uppercase tracking-wider">Chiều rộng</th>
                <th className="pb-3 text-slate-400 font-bold uppercase tracking-wider">Chiều cao</th>
                <th className="pb-3 text-slate-400 font-bold uppercase tracking-wider">Độ bo góc</th>
                <th className="pb-3 text-slate-400 font-bold uppercase tracking-wider">Khoảng cách biên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              <tr>
                <td className="py-3 font-bold text-purple-400">1. Nút cuộn nhanh (Scroll Arrow)</td>
                <td className="py-3">Khóa cứng 40px</td>
                <td className="py-3">Khóa cứng 40px</td>
                <td className="py-3 text-slate-400">rounded-full</td>
                <td className="py-3 text-slate-400">Cách lề biên 16px</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-purple-400">2. Con trượt dọc (Vertical Thumb)</td>
                <td className="py-3">Khóa mảnh 6px</td>
                <td className="py-3">Co giãn động theo trang</td>
                <td className="py-3 text-slate-400">rounded-full</td>
                <td className="py-3 text-slate-400">Cách rìa phải 8px</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-purple-400">3. Con trượt ngang (Horizontal Thumb)</td>
                <td className="py-3">Co giãn động theo content</td>
                <td className="py-3">Khóa mảnh 6px</td>
                <td className="py-3 text-slate-400">rounded-full</td>
                <td className="py-3 text-slate-400">Dưới đáy list 12px</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🛠️ DEMO WORKSPACE */}
        <div className="bg-black/60 rounded-3xl p-6 border border-white/5 relative group/demo">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Nút cuộn trang lơ lửng & Carousel (Floating Scroll Pill)</span>
          
          {/* SCROLL CONTAINER */}
          <div className="relative">
            <div 
              id="showroomScrollContainer" 
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pr-12 scrollbar-none [&::-webkit-scrollbar]:hidden"
            >
              {[
                { title: 'Thẻ dữ liệu 01', desc: 'Bảo mật dữ liệu tối cao', color: 'from-blue-600/30 to-purple-600/10' },
                { title: 'Thẻ dữ liệu 02', desc: 'Động cơ lò xo nảy vật lý', color: 'from-purple-600/30 to-pink-600/10' },
                { title: 'Thẻ dữ liệu 03', desc: 'Phản hồi chạm haptic mượt', color: 'from-pink-600/30 to-amber-600/10' },
                { title: 'Thẻ dữ liệu 04', desc: 'Hiệu suất Gemini 3.5 Flash', color: 'from-emerald-600/30 to-blue-600/10' },
              ].map((card, i) => (
                <div 
                  key={i} 
                  className={`w-[280px] h-[160px] shrink-0 bg-gradient-to-br ${card.color} backdrop-blur-xl border border-white/10 rounded-[28px] p-6 snap-start flex flex-col justify-between hover:border-white/20 transition-all duration-300`}
                >
                  <div>
                    <h4 className="text-white font-black text-lg tracking-tight">{card.title}</h4>
                    <p className="text-slate-300 text-xs mt-1 font-medium">{card.desc}</p>
                  </div>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Liquid Glass v4</span>
                </div>
              ))}
            </div>

            {/* FLOATING CONTROLS */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-60 group-hover/demo:opacity-100 transition-opacity duration-300 z-10">
              <button 
                onClick={() => {
                  const container = document.getElementById('showroomScrollContainer');
                  if (container) {
                    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                      container.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                      container.scrollBy({ left: 296, behavior: 'smooth' });
                    }
                  }
                }}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-sm font-black shadow-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:bg-purple-600 hover:text-white hover:border-purple-400 active:scale-90"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
