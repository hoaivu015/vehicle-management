---
name: Navigation & Surface UI Sentinel (Auto 28 Edition)
description: Hệ thống kiểm soát và thực thi tiêu chuẩn toàn diện cho thanh điều hướng (Bottom Nav, Tab Bar, Docked Action FAB, Header Top Bar, Segmented Tabs), Safe Area iPhone Native, Liquid Glassmorphism 2.0, Fitts's Law và Haptic Feedback cho hệ sinh thái Auto 28.
---

# 🧭 NAVIGATION & SURFACE UI SENTINEL — AUTO 28 SHOWROOM MANAGER

> **Tôn chỉ tối thượng:** Thanh điều hướng (Navigation Bar) là "xương sống" tương tác của người dùng. Một thanh điều hướng chuẩn mực phải thỏa mãn đồng thời: **Đúng chuẩn công thái học ngón cái (Thumb Zone)**, **Bảo vệ toàn vẹn phần cứng (Safe Area)**, **Thẩm mỹ kính lỏng (Liquid Glassmorphism 2.0)** và **Phản hồi vật lý tức thì (Spring Physics & Haptic Matrix)**.

---

## ═══ I. 5 TRỤ CỘT TIÊU CHUẨN ĐIỀU HƯỚNG (THE 5 CORE PILLARS) ═══

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 1. THUMB-ZONE ERGONOMICS: Vùng chạm Fitts ≥ 44x44px, đặt ở đáy màn hình di động  │
│ 2. HARDWARE INTEGRITY: Chừa Safe Area ≥ 34px đáy (Home Bar) & ≥ 44px đỉnh (Notch)│
│ 3. LIQUID TRANSLUCENCY 2.0: Kính mờ backdrop-blur-[32px] + Viền mờ Hairline 1px  │
│ 4. ACTIVE PILL & DOCKED HERO FAB: Viên thuốc trượt nảy lò xo + Nút (+) nhô cao   │
│ 5. ZERO-TRUNCATION & MICRO-TYPO: Nhãn font-black uppercase tracking-widest      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## ═══ II. QUY CHUẨN THIẾT KẾ CHO TỪNG GIAO DIỆN (SURFACE SPECS) ═══

### 1. 📱 Bottom Navigation Bar (Thanh Điều Hướng Đáy)
*Tham chiếu trực tiếp: `src/shared/presentation/components/Layout/MobileBottomNav.tsx`*

* **Số lượng mục (Tabs count):** Cố định **3 – 5 mục** điều hướng cấp cao nhất (Top-level destinations). Cấu trúc kinh điển chuẩn: `[Báo cáo] [Kho xe] (+) [Nhân sự] [Cá nhân]`.
* **Chiều cao & Safe Area:**
  * Chiều cao động: `h-[calc(60px+env(safe-area-inset-bottom,16px))]`.
  * Khoảng đệm đáy: `pb-[env(safe-area-inset-bottom,12px)]` (Fallback an toàn tối thiểu **34px**).
* **Vật liệu nền kính (Liquid Frosted Glass):**
  * Light Mode: `bg-white/80 backdrop-blur-[32px] border-t border-black/5`.
  * Dark Mode: `bg-[#161a23]/75 backdrop-blur-[32px] border-t border-white/10`.
  * Đổ bóng nổi lơ lửng: `shadow-[0_-8px_32px_rgba(0,0,0,0.06)]`.
* **Viên thuốc báo hiệu (Active Nav Pill):**
  * Kích thước chuẩn: `w-14 h-8` bo tròn `rounded-full`.
  * Dải màu kính: `bg-gradient-to-tr from-kraft-accent/12 to-kraft-accent/2 dark:from-kraft-accent/25 dark:to-kraft-accent/5`.
  * Viền kính mờ: `border border-kraft-accent/15 dark:border-kraft-accent/30`.
  * Hiệu ứng lò xo trượt: `motion.div` dùng `layoutId="navPill"` với `transition={{ type: 'spring', stiffness: 380, damping: 28 }}`.
* **Nhãn chữ vi mô (Micro Typography):**
  * Kích thước: `text-[9px]` hoặc `10px`.
  * Trọng lượng: `font-black` (Weight 900), `uppercase`, `tracking-widest` (`letter-spacing: 0.1em`).
  * Trạng thái Active: `text-kraft-accent scale-102`.
  * Trạng thái Inactive: `text-kraft-ink/45 dark:text-white/40`.

---

### 2. ⚡ Center Docked Action Button (Nút Hành Động Trung Tâm / Hero FAB)
*Dành riêng cho tác vụ quan trọng nhất (Thêm xe mới / Tạo giao dịch)*

* **Kích thước & Vị trí:**
  * Kích thước: `w-13 h-13` (khoảng $52\text{px} - 56\text{px}$) dạng `rounded-full`.
  * Vị trí: Nhô cao lơ lửng trên thanh dock: `relative -top-5`.
* **Viền kép & Phát sáng Neon (Glow & Border Ring):**
  * Viền ngăn cách: `border-[3px] border-white dark:border-[#161a23]/90`.
  * Nền: `bg-gradient-to-tr from-kraft-accent to-[#818cf8]` (`#4f46e5` $\rightarrow$ `#818cf8`).
  * Bóng phát quang: `shadow-[0_6px_24px_rgba(99,102,241,0.3),inset_0_1px_2px_rgba(255,255,255,0.45)]`.
* **Cử chỉ & Lò xo bấm (Touch Physics):**
  * Tap nhún: `whileTap={{ scale: 0.92 }}` với `transition={{ type: 'spring', stiffness: 500, damping: 14 }}`.
  * Phản hồi xúc giác: `await haptics.light()` ngay khi ngón tay vừa chạm.

---

### 3. 🔝 Header & Top Navigation Bar (Thanh Tiêu Đề Đỉnh)
*Tham chiếu: `src/modules/finance/presentation/components/DashboardHeader.tsx`*

* **Safe Area đỉnh (Notch & Dynamic Island):**
  * Bắt buộc lùi đỉnh: `pt-[env(safe-area-inset-top,44px)]` hoặc `top-[env(safe-area-inset-top,44px)]`.
  * Tuyệt đối không để text/icon dính sát StatusBar của thiết bị.
* **Cấu trúc phân tầng (Large Title Hierarchy):**
  * Tiêu đề chính: `text-2xl md:text-3xl font-black tracking-tight text-kraft-ink dark:text-white`.
  * Nút Back / Action góc: Kích thước chạm tối thiểu `40x40px` đến `44x44px`, bo góc `rounded-full` hoặc `rounded-[14px]` với `active:scale-95`.

---

### 4. 🎛️ Segmented Controls & Sub-Tab Switchers (Thanh Chuyển Tab Con)
*Dành cho bộ lọc trạng thái xe, phân loại chi phí, tab thông số chi tiết*

* **Cấu trúc bao bọc (Container):**
  * Bo góc cong lớn: `rounded-full` hoặc `rounded-[20px]`.
  * Nền kính: `bg-slate-100/80 dark:bg-white/5 p-1 backdrop-blur-md border border-black/5 dark:border-white/10`.
* **Tab con được chọn (Active Segment):**
  * Nền trắng nổi: `bg-white dark:bg-[#1e2330] shadow-sm rounded-full`.
  * Chữ: `font-bold text-xs uppercase tracking-wider text-kraft-ink dark:text-white`.
  * Chuyển động: Trượt mượt mà qua Framer Motion `layoutId="activeSegment"`.

---

### 5. 🖥️ Responsive Desktop Sidebar / Navigation Rail
*Khi mở rộng trên màn hình lớn ($\ge 1280\text{px}$)*

* Tự động ẩn thanh `MobileBottomNav` (`xl:hidden`) và hiển thị thanh `Sidebar` dọc cố định bên trái (`hidden xl:flex w-64`).
* Giữ nguyên token màu sắc, icon size 20px, font hierarchy và hiệu ứng chọn active pill đồng bộ.

---

## ═══ III. CHECKLIST KIỂM ĐỊNH NAVIGATION UI (10-POINT AUDIT MATRIX) ═══

| # | Tiêu chí thẩm định | Chuẩn yêu cầu | Trạng thái |
| :- | :--- | :--- | :--- |
| **1** | **Bottom Safe Area** | `pb-[env(safe-area-inset-bottom,12px)]` $\ge 34\text{px}$ trên iPhone tràn viền | BẮT BUỘC |
| **2** | **Top Safe Area** | `pt-[env(safe-area-inset-top,44px)]` không đè Notch / Dynamic Island | BẮT BUỘC |
| **3** | **Touch Target Size** | Mọi tab / nút điều hướng có vùng bấm $\ge 44 \times 44\text{px}$ | BẮT BUỘC |
| **4** | **Anti-Truncation** | Không rớt chữ nhãn tab xuống 2 hàng, không cắt `...` | BẮT BUỘC |
| **5** | **Center Action FAB** | Nhô cao `-top-5`, viền `border-[3px]`, bóng neon glow, icon rõ nét | BẮT BUỘC |
| **6** | **Active Indicator** | Sử dụng Active Pill bo tròn có dải màu kính và Spring Motion | BẮT BUỘC |
| **7** | **Haptic Feedback** | Tích hợp `haptics.light()` cho tất cả các tab và action button | BẮT BUỘC |
| **8** | **Spring Physics** | Có `active:scale-95` hoặc `whileTap={{ scale: 0.92 }}` với lò xo mượt | BẮT BUỘC |
| **9** | **Liquid Glass Material** | `backdrop-blur-[32px]` + `border-t border-black/5 dark:border-white/10` | BẮT BUỘC |
| **10**| **Content Occlusion** | Vùng cuộn danh sách (List/Grid) có `pb-28` để không bị Bottom Nav che | BẮT BUỘC |

---

## ═══ IV. CODE ANATOMY CHUẨN MẪU (REFERENCE TEMPLATE) ═══

```tsx
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { haptics } from '@/src/shared/utils/haptics';

export const StandardNavigationItem = ({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: { id: string; label: string; icon: any }; 
  isActive: boolean; 
  onClick: () => void; 
}) => {
  return (
    <button
      onClick={async () => {
        try { await haptics.light(); } catch {}
        onClick();
      }}
      className={cn(
        "relative flex-1 h-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 select-none outline-none z-10",
        isActive ? "text-kraft-accent" : "text-kraft-ink/65 dark:text-white/65"
      )}
    >
      <div className="relative flex flex-col items-center justify-center h-full w-full">
        {/* Active Pill */}
        <div className="relative w-14 h-8 flex items-center justify-center">
          {isActive && (
            <motion.div
              layoutId="navPill"
              className="absolute inset-0 bg-gradient-to-tr from-kraft-accent/12 to-kraft-accent/2 dark:from-kraft-accent/25 dark:to-kraft-accent/5 backdrop-blur-md rounded-full border border-kraft-accent/15 dark:border-kraft-accent/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_8px_rgba(99,102,241,0.06)]"
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            />
          )}
          <item.icon
            size={20}
            strokeWidth={2}
            className={cn(
              "relative z-10 transition-transform duration-300",
              isActive ? "scale-110 text-kraft-accent" : "text-kraft-ink/50 dark:text-white/50"
            )}
          />
        </div>

        {/* Micro-Typography Label */}
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-widest leading-none mt-1 transition-all duration-300 whitespace-nowrap",
            isActive ? "text-kraft-accent font-black scale-102" : "text-kraft-ink/45 dark:text-white/40 font-bold"
          )}
        >
          {item.label}
        </span>
      </div>
    </button>
  );
};
```
