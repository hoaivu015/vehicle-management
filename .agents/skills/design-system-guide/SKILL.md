---
name: Design System Code Guide (Auto 28 Edition)
description: Hướng dẫn lập trình và áp dụng ngôn ngữ thiết kế Neural Expressive 2.0 (Liquid Glassmorphism, Spring Physics, và Mobile Haptic Matrix) cho hệ sinh thái Auto 28 Showroom Manager. Tham chiếu trực tiếp từ src/shared/design-system/.
---

# 🎨 NEURAL EXPRESSIVE & LIQUID GLASS 2.0 — CODE GUIDE

> **Quy tắc tối thượng:** KHÔNG tự viết CSS inline hoặc Tailwind ad-hoc cho UI đã được design system cover. Mọi thẻ (card), hộp nhập liệu (input), và bảng dữ liệu phải sử dụng component chuẩn từ `src/shared/design-system/` để đảm bảo tính đồng bộ SSOT.
> 1. **BOLD-FIRST (Quy tắc 2 Giây):** Đẩy toàn bộ độ tương phản vào các tiêu đề cực đậm, khít chữ, giúp nhà quản lý showroom đọc lướt dữ liệu và đưa ra quyết định tức thì.
> 2. **BO GÓC CỰC ĐẠI (Super Ellipse):** Sử dụng các góc bo Squircle cực lớn (`rounded-[32px]`) để triệt tiêu hoàn toàn cảm giác cơ học khô cứng.
> 3. **VẬT LIỆU DẠNG LỎNG (Liquid Translucency):** Sử dụng kính mờ (`backdrop-blur-xl`) kết hợp viền mờ siêu mảnh (`Hairline border`) để mô phỏng chiều sâu đa tầng lơ lửng.

---

## ═══ I. HỆ THỐNG TOKENS THIẾT KẾ CỐT LÕI ═══

### 1. Phân Lớp Màu Sắc & Chiều Sâu (Neural Elevation)
Hệ thống sử dụng cấu trúc đa tầng kính mờ lồng nhau (Translucency Layout) song hành cả hai chế độ Sáng/Tối:

| Tầng lớp (Layer) | Chế độ Sáng (Light Mode Tokens) | Chế độ Tối (Dark Mode Tokens) | Hiệu ứng lớp kính & Đổ bóng |
| :--- | :--- | :--- | :--- |
| **Layer 0 (Canvas BG)** | `bg-[#F8FAF4]` | `bg-[#0B0E14]` | Phối hợp Ambient Gradient chuyển động ngầm chậm rãi (`animate-ambient`). |
| **Layer 1 (Surface/Card)** | `bg-white/75` | `rgba(22,26,35,0.65)` | `backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm`. |
| **Layer 2 (Nút / Pill)** | `bg-gray-50/50` | `bg-white/5` | `border border-transparent hover:border-indigo-100 dark:hover:border-white/10`. |
| **Layer 3 (Overlay / AI)** | Dải màu gradient sáng (`bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500`) | Bóng đổ cực rộng tỏa sáng Neon: `shadow-xl shadow-indigo-500/10`. |

* **Ambient Glow Trạng Thái:**
  * **Tích cực / Dòng tiền dương:** `#00F2FE` $\rightarrow$ `#4FACFE` (Neon Blue/Mint) - Phát sáng nhẹ biên độ thấp (`Breathe`).
  * **Cảnh báo / Khóa vốn:** `#FF0844` $\rightarrow$ `#FFB199` (Vibrant Coral/Amber) - Xung động nhẹ (`Pulse`) khi tương tác.

### 2. Spacing Lưới Động Mềm (Fluid Soft Grid)
Sử dụng hệ số nhân của **`8px`** kết hợp tỷ lệ vàng để tạo không gian thoáng đạt cho dữ liệu:
* **Border Radius:** Thẻ lớn (`rounded-[32px]`), thành phần con (`rounded-[20px]` đến `rounded-[24px]`), nút bấm (`rounded-full`).
* **Padding:** Đệm viền của thẻ tối thiểu `p-6` (24px), lý tưởng là `p-8` (32px).
* **Gap:** Tiêu đề & Mô tả ngắn (`gap-1` hoặc `gap-2`), Khối chữ & Hình ảnh/Biểu đồ (`gap-4` hoặc `gap-6`).

### 3. Thang Đo Kiểu Chữ Phân Tầng (Bold-First Typography)
| Thành phần chữ | Kích thước | Trọng lượng | Khoảng cách chữ | Mã Tailwind | Ứng dụng thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Số liệu lớn (Metrics)** | `32px - 40px` | `Black (900)` | Thắt chặt (`-0.05em`) | `text-4xl font-black tracking-tighter leading-[1.1]` | Số dư tài khoản, doanh thu lớn |
| **Tiêu đề Thẻ (Card Title)**| `20px - 24px` | `Black (900)` | Thu hẹp (`-0.025em`) | `text-xl font-black tracking-tight leading-[1.25]` | Tiêu đề xe, Tên thẻ chính |
| **Tiêu đề con (Subtitle)** | `18px` | `Bold (700)` | Hơi thu hẹp | `text-lg font-bold tracking-tight leading-[1.3]` | Nhóm chức năng phụ |
| **Văn bản phụ** | `14px - 15px` | `Medium (500)` | Bình thường | `text-sm font-medium text-gray-500 leading-[1.4]` | Ghi chú phụ, mốc thời gian |
| **Nhãn viên thuốc (Tag/Pill)**| **`12px` (11pt)** | `Bold (700)` | Mở rộng (`0.1em`) | `text-xs font-bold tracking-widest uppercase leading-[1]` | Nhãn `TRONG KHO`, `CỌC MUA` |

---

## ═══ II. BẢN ĐỒ PHẢN HỒI XÚC GIÁC (MOBILE HAPTIC MATRIX)

Đối với các thiết bị di động chạy ứng dụng thông qua Capacitor iOS/Android, phản hồi vật lý từ mô-tơ rung (Haptic Engine) là cầu nối quan trọng cho sự thấu cảm thiết kế:

```tsx
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// 1. Chạm Tab / Click Nút bấm
await Haptics.impact({ style: ImpactStyle.Light }); // Rung nhẹ, dứt khoát cực ngắn

// 2. Nhập liệu / Nhảy số ký tự tiền
await Haptics.selection(); // Rung siêu nhẹ theo nhịp gõ số

// 3. Lưu cọc / Thanh toán / Giao dịch thành công
await Haptics.notification({ type: NotificationType.Success }); // Rung kép nhịp điệu nhanh dần

// 4. Lỗi nhập liệu / Cảnh báo lưu kho vượt hạn mức (>30 ngày)
await Haptics.notification({ type: NotificationType.Warning }); // Rung 3 nhịp mạnh cách quãng ngắn
```

---

## ═══ III. THIẾT KẾ CÁC THÀNH PHẦN CORE (REACT CODE ANATOMY SAMPLES)

### 1. CarCard (Tương thích Responsive Dual-Layout & Lò xo 3D)
Thẻ hiển thị xe có khả năng tự động biến đổi cấu trúc: dạng danh sách ngang vuốt chạm tối ưu trên Mobile và dạng thẻ dọc 3D nảy lò xo trên Desktop.

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gauge, Clock, ArrowRight, Pin } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface CarCardProps {
  car: {
    id: number;
    name: string;
    image_url: string;
    year: number;
    odo: number;
    sale_price: number;
    days: number;
    status: 'IN_STOCK' | 'DEPOSITED' | 'SOLD';
    is_pinned: boolean;
  };
  onClick: (car: any) => void;
  onPin?: (id: number, pinned: boolean) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onClick, onPin }) => {
  const isEmergency = car.days > 30;

  const handleCardClick = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    onClick(car);
  };

  const handlePinClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
    onPin?.(car.id, !car.is_pinned);
  };

  return (
    <>
      {/* ── MOBILE LAYOUT: Thẻ nằm ngang vuốt chạm tối ưu diện tích cuộn ── */}
      <div
        className="md:hidden flex flex-row w-full bg-white/70 backdrop-blur-md border border-black/5 rounded-[20px] shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] active:brightness-95 transition-all duration-200"
        onClick={handleCardClick}
      >
        <div className="relative shrink-0 w-[120px] h-[120px]">
          <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" loading="lazy" />
          {isEmergency && (
            <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center animate-pulse">
              <Clock size={12} strokeWidth={3} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-black text-kraft-ink leading-tight line-clamp-2 tracking-tight">
                {car.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-500 font-bold">
                <span className="flex items-center gap-0.5"><Calendar size={10} />{car.year}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5"><Gauge size={10} />{car.odo.toLocaleString()} km</span>
              </div>
            </div>
            <button
              onClick={handlePinClick}
              className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                car.is_pinned ? 'bg-indigo-600 text-white' : 'bg-black/5 text-gray-400'
              }`}
            >
              <Pin size={12} fill={car.is_pinned ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col">
              <span className={`text-[11px] font-black ${isEmergency ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                {car.days} ngày lưu kho
              </span>
              <span className="text-sm font-black text-kraft-ink">
                {(car.sale_price / 1000000).toLocaleString()} Tr
              </span>
            </div>
            <ArrowRight size={14} className="text-indigo-600" strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT: Thẻ dọc 3D Squircle mờ kính, nảy lò xo khi hover ── */}
      <motion.div
        whileHover={{ translateY: -6, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        className="hidden md:flex flex-col w-[340px] aspect-[1/1.3] bg-white/70 backdrop-blur-xl border border-black/5 rounded-[32px] p-6 shadow-sm cursor-pointer group select-none overflow-hidden"
        onClick={handleCardClick}
      >
        <div className="relative w-full aspect-[1.5/1] rounded-[24px] overflow-hidden mb-5">
          <img
            src={car.image_url}
            alt={car.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <button
            onClick={handlePinClick}
            className={`absolute top-4 right-4 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
              car.is_pinned ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-500 border border-black/5 hover:scale-105'
            }`}
          >
            <Pin size={14} fill={car.is_pinned ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 leading-tight tracking-tight mb-2 line-clamp-2">
              {car.name}
            </h3>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 bg-gray-100/50 px-3 py-1 rounded-full text-xs font-bold text-gray-600">
                <Calendar size={12} /> {car.year}
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-100/50 px-3 py-1 rounded-full text-xs font-bold text-gray-600">
                <Gauge size={12} /> {car.odo.toLocaleString()} km
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between pt-4 border-t border-black/5">
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${isEmergency ? 'text-red-500 font-extrabold' : 'text-gray-400'}`}>
                {car.days} ngày lưu kho
              </span>
              <span className="text-[20px] font-black text-gray-900 leading-none mt-1">
                {(car.sale_price / 1000000).toLocaleString()} Tr
              </span>
            </div>
            <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transition-colors group-hover:bg-indigo-600">
              <ArrowRight size={16} strokeWidth={3} />
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
};
```

### 2. SmartAmountInput (Morphing chữ Việt & Rung cơ học)
Hộp nhập số tiền thông minh. Khi gõ số, tự động trượt ra chữ diễn giải tiếng Việt ("Tám trăm triệu đồng") có màu Mint sinh học. Nếu gõ sai hoặc vượt mức an toàn, kích hoạt hoạt ảnh rung lắc cơ học và cảnh báo Warning Haptics.

```tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { convertNumberToVietnameseWords } from '@/src/shared/utils/numberToWords'; // Helper chuẩn

export const SmartAmountInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  maxLimit?: number;
}> = ({ value, onChange, maxLimit = 1000000000 }) => {
  const [error, setError] = useState(false);
  const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
  const vietnameseWords = numericValue > 0 ? convertNumberToVietnameseWords(numericValue) : '';

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = parseInt(rawVal) || 0;

    try { await Haptics.selection(); } catch (err) {}

    if (maxLimit && num > maxLimit) {
      setError(true);
      try { await Haptics.notification({ type: NotificationType.Warning }); } catch (err) {}
      setTimeout(() => setError(false), 300); // Reset animation shake
      return;
    }

    setError(false);
    onChange(rawVal);
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Số Tiền Giao Dịch</label>
      
      <motion.div
        animate={error ? { x: [-6, 6, -6, 6, 0] } : {}}
        transition={{ duration: 0.25 }}
        className={`flex items-center w-full h-14 bg-white/70 backdrop-blur-xl rounded-[20px] px-5 border transition-all duration-200 ${
          error ? 'border-red-500 shadow-lg shadow-red-500/10' : 'border-black/5 focus-within:border-indigo-500'
        }`}
      >
        <input
          type="text"
          value={numericValue > 0 ? numericValue.toLocaleString('vi-VN') : ''}
          onChange={handleInputChange}
          placeholder="Nhập số tiền..."
          className="flex-1 bg-transparent border-none outline-none font-black text-gray-900 text-lg placeholder-gray-400"
        />
        <span className="font-bold text-gray-400">VND</span>
      </motion.div>

      {/* Hiệu ứng Morphing trượt chữ Việt */}
      <div className="h-6 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {vietnameseWords && (
            <motion.span
              key={vietnameseWords}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute left-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-none"
            >
              {vietnameseWords}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
```

### 3. BaseModal (Floating Bottom Sheet & Spring Animation)
Modal trung tâm lơ lửng, hỗ trợ mờ kính và hiệu ứng kéo thả nảy lò xo. Tự động bám đáy và mở rộng an toàn (Safe Area) trên thiết bị di động.

```tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      const triggerHaptic = async () => {
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
      };
      triggerHaptic();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: "100%", scale: 1 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl border border-black/5 rounded-t-[40px] md:rounded-[32px] shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh] z-10 overflow-hidden"
          >
            {/* Safe Area Top cho di động */}
            <div style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }} />

            {/* Mobile Drag Indicator */}
            <div className="md:hidden flex justify-center py-3 shrink-0">
              <div className="w-12 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-black/5 shrink-0">
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin">
              {children}
            </div>

            {/* Safe Area Bottom cho di động */}
            <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
```

---

## ═══ IV. CHECKLIST QUY CHUẨN TRƯỚC KHI SUBMIT UI ═══

### 🚀 Hiệu Năng Đồ Họa (GPU Acceleration)
- [ ] Các phần tử mờ kính hoặc có lò xo (Card, Modal, AI Blob) bắt buộc có `will-change: transform` và `transform: translateZ(0)` để GPU xử lý riêng Graphics Layer.
- [ ] Không lạm dụng hiệu ứng kính mờ vượt quá `backdrop-blur(20px)` và hạn chế tối đa số lượng kính mờ hiển thị đồng thời ($< 8$ phần tử).
- [ ] Shimmer Skeleton sử dụng `transform: translateX()` của GPU thay vì chỉnh sửa `background-position` thủ công.

### 📱 Tương Thích Di Động (iOS / Android Haptic & Touch targets)
- [ ] Touch target tối thiểu đạt tiêu chuẩn $44 \times 44\text{px}$ (`h-14` cho nút hành động).
- [ ] Tích hợp Capacitor Haptics đồng bộ theo Bản Đồ Xúc Giác bên trên.
- [ ] Đảm bảo padding an toàn `env(safe-area-inset-top)` và `env(safe-area-inset-bottom)` cho các thanh điều hướng và modal bottom sheet.

### 🎨 Thẩm Mỹ Trực Quan & Chữ (Visual Clarity)
- [ ] Kiểm tra lỗi khuyết chữ (No truncation): Tất cả nhãn, chỉ số tiền, và nút bấm phải được hiển thị trọn vẹn.
- [ ] Mọi con số tài chính quan trọng phải dùng `text-4xl font-black tracking-tighter leading-[1.1]` của **Typography Metrics**.
- [ ] Mọi nút bấm tương tác phải gắn `active:scale-[0.96] transition-transform` nẩy lò xo.
- [ ] Trạng thái trống (Empty State) không để trống trơn: Sử dụng Liquid Blob AI thu nhỏ ở chế độ "Ngủ đông" mờ xám kết hợp giải trình thấu cảm bằng chữ nghiêng `text-xs italic`.

---

> [!TIP]
> Khi cần component mới, luôn ưu tiên Compose (kết hợp) các cấu kiện sẵn có. Chỉ tạo cấu kiện hoàn toàn mới khi tính chất nghiệp vụ xuất hiện $\ge 3$ lần trong codebase.
