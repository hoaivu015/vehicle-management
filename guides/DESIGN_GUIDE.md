# LIQUID GLASS DESIGN SYSTEM — Auto 28 Standard V2.0

> **"Hiến pháp" thiết kế** dành cho mọi Developer khi phát triển tính năng mới tại Auto 28.
> Tài liệu này được đồng bộ trực tiếp từ codebase (`index.css`, `constants.ts`, và các component thực tế).

---

## 1. Triết lý Thiết kế (Design Philosophy)

Liquid Glass 2.0 xây dựng trên **3 trụ cột** cốt lõi:

| Trụ cột | Mô tả | Biểu hiện trong UI |
|:---|:---|:---|
| **Purity (Tinh khiết)** | Nền sáng, không gian thở, nội dung là trung tâm | Panel trắng #FFFFFF, padding rộng |
| **Depth (Chiều sâu)** | Phân lớp thị giác rõ ràng thay vì border đậm | 4-Layer hierarchy + Industrial Shadow |
| **Motion (Chuyển động)** | UI phải sống động và phản hồi vật lý | Hover lift, scale press, shimmer loader |

---

## 2. Hệ thống Phân lớp (4-Layer Hierarchy)

Toàn bộ UI được tổ chức theo **4 lớp độ sâu**, từ xa nhất (nền) đến gần nhất (nội dung):

| Layer | Tên | CSS Variable | Màu sắc | Radius | Công dụng thực tế |
|:---:|:---|:---|:---|:---|:---|
| **L1** | **SNAPSHOT** | `--meta-step-1` | `#F0F2F5` | N/A | Nền trang toàn cục (`body` background) |
| **L2** | **INACTIVE** | `--meta-step-2` | `#F0F2F5` | T2 (2rem) | Tab chưa active (`.ctab`), bề mặt phụ |
| **L3** | **CANVAS** | `--meta-step-3` | `#F7F8F9` | T1 (3rem) | Panel nội dung chính (`.ctab-panel`, `.liquid-card`) |
| **L4** | **PURITY** | `--meta-step-4` | `#FFFFFF` | T1 (3rem) | `CarCard`, `StaffCard`, Modal — nội dung nổi bật |

> **Ghi chú quan trọng**: L1 và L2 **sử dụng cùng màu** `#F0F2F5` để tab inactive "chìm" vào nền, tạo cảm giác tab active nhô lên một cách tự nhiên.

### 2.1 Body Background — Gradient Ambient

`body` không phải là màu phẳng — nó có **4 gradient hào quang góc** tạo depth vật lý:

```css
radial-gradient(circle at 100%   0%, rgba(223, 239, 248, 0.7) ...)  /* ↗ Xanh biển nhạt */
radial-gradient(circle at 100% 100%, rgba(234, 247, 240, 0.4) ...)  /* ↘ Xanh bạc hà */
radial-gradient(circle at   0% 100%, rgba(229, 240, 250, 0.4) ...)  /* ↙ Sky sâu lắng */
radial-gradient(circle at   0%   0%, rgba(249, 240, 241, 0.6) ...)  /* ↖ Hồng kem */
```

Animation `bgPulse` (30s) dịch chuyển nhẹ background để tạo cảm giác "thở".

---

## 3. Design Tokens — Bộ biến CSS

> **Nguồn chính xác**: `/src/index.css` — `@theme` block

### 3.1 Font System

| Token | Giá trị | Dùng cho |
|:---|:---|:---|
| `--font-sans` | `"Mulish"`, hệ sans-serif | Body text, labels, số liệu |
| `--font-heading` | `"Mulish"`, sans-serif | `h1`-`h6`, tiêu đề trang |
| `--font-mono` | `ui-monospace`, Menlo... | Code, số kỹ thuật |

**Quy tắc chung cho tất cả heading**: `font-black`, `tracking-tight`, font-family là `Mulish`.

### 3.2 Color Palette

| Token | Giá trị | Công dụng |
|:---|:---|:---|
| `--color-kraft-bg` | `#F9F0F1` | Fallback background (hồng kem) |
| `--color-kraft-ink` | `#0f172a` | Màu chữ chính (Navy đậm) |
| `--color-kraft-accent` | `#6366f1` | Indigo — màu chủ đạo accent |
| `--color-kraft-blue` | `#3b82f6` | Xanh dương phụ |
| `--color-kraft-red` | `#ef4444` | Cảnh báo, trạng thái nguy hiểm |
| `--color-kraft-folder` | `rgba(255,255,255,0.4)` | Glass tờ giấy nhạt |
| `--color-kraft-paper` | `rgba(255,255,255,0.6)` | Glass bề mặt sáng hơn |

### 3.3 Shadow System (Industrial)

| Token | Giá trị | Khi nào dùng |
|:---|:---|:---|
| `--shadow-kraft` | `0 10px 40px -10px rgba(15,23,42,0.1)` | Bóng nhẹ, panel nhỏ |
| `--shadow-kraft-deep` | `0 40px 80px -20px rgba(15,23,42,0.2)` | Modal, overlay lớn |
| `--shadow-glass-glow` | `0 0 30px rgba(99,102,241,0.15)` | Glow accent cho focus states |
| `--shadow-card-industrial` | Multi-layer, tối đa `0 10px 40px -10px rgba(0,0,0,0.05)` | Trạng thái bình thường của Card |
| `--shadow-card-hover` | Multi-layer, tối đa `0 30px 60px -12px rgba(0,0,0,0.12)` | Khi hover vào Card |

### 3.4 Border Radius Tiers (T1-T4)

| Token | Giá trị | px | Áp dụng cho |
|:---:|:---|:---:|:---|
| `--radius-t1` | `3rem` | 48px | `CarCard`, `StaffCard`, Modal, `.liquid-card`, `.ctab-panel` |
| `--radius-t2` | `2rem` | 32px | Section cards, `.highlight-card`, Avatar lớn, Khung metric |
| `--radius-t3` | `1rem` | 16px | Button, Input field, Badge trung bình |
| `--radius-t4` | `0.5rem` | 8px | Chips, Code badge, Icon wrapper nhỏ |

**Class Tailwind tương ứng thực tế**:
- T1 → `rounded-[3rem]` hoặc `rounded-t1`
- T2 → `rounded-[2rem]` hoặc `rounded-t2`  
- T3 → `rounded-2xl` (= 1rem)
- T4 → `rounded-xl` (= 0.75rem) hoặc `rounded-lg`

### 3.5 Accent Glow (Hào quang điểm nhấn)

Hào quang Indigo là chữ ký thị giác của Auto 28, dùng để tạo điểm nhấn cho các số liệu tài chính quan trọng hoặc các thẻ nội dung cấp L4.

| Thuộc tính | Giá trị Tailwind | Công dụng |
|:---|:---|:---|
| **Kích thước** | `w-32 h-32` (hoặc `w-48` cho khối lớn) | Độ phủ của hào quang |
| **Màu sắc** | `bg-kraft-accent/20` | Indigo với độ mờ 20% |
| **Hiệu ứng** | `blur-3xl` | Tạo độ tỏa mịn màng |
| **Vị trí** | `absolute -top-10 -right-10` | Nằm lệch ở góc trên bên phải |

**Mẫu mã thực tế (JSX):**
```tsx
<div className="relative overflow-hidden ...">
  {/* Lớp hào quang nằm dưới cùng */}
  <div className="absolute -top-10 -right-10 w-32 h-32 bg-kraft-accent/20 rounded-full blur-3xl pointer-events-none" />
  
  {/* Nội dung phải có relative z-10 để nổi lên trên hào quang */}
  <div className="relative z-10">
     {/* Content here */}
  </div>
</div>
```

---

## 4. Component Library — Thư viện Thành phần

### 4.1 Glass Core (`.liquid-glass-core`)

**Lớp glass nền** — áp dụng cho Card chính (`CarCard`, `StaffCard`):

```css
backdrop-filter: blur(24px) saturate(150%);
background: rgba(255, 255, 255, 0.65);
border: 1px solid rgba(255, 255, 255, 1);
```

> ⚠️ **Luôn kết hợp** với `will-change: transform, backdrop-filter` và `transform: translateZ(0)` để GPU acceleration. Class `.gpu-accelerated` đã bao gồm điều này.

### 4.2 Liquid Card (`.liquid-card`)

Panel nội dung chính của mỗi tab:

```css
.liquid-card {
  rounded-[3rem] p-6 md:p-10 z-20;
  margin-top: -1px;  /* Merge seamlessly với tab bar phía trên */
  backdrop-filter: blur(24px) saturate(150%);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 40px 80px -20px rgba(15,23,42,0.15),
              inset 0 1px 2px rgba(255,255,255,1);
}
```

### 4.3 Highlight Card (`.highlight-card`)

Card nội dung phụ trong panel (section con, metric box):

```css
.highlight-card {
  bg-white/70 rounded-[2rem] border border-white/100 p-6 md:p-8;
  hover:bg-white/80;
  box-shadow: 0 10px 30px -10px rgba(15,23,42,0.08);
}
```

### 4.4 Button System

#### Primary Button (`.liquid-button-primary`)
Màu **Indigo (`bg-kraft-accent`)** là màu chữ ký cho mọi hành động mang tính chất **Khởi tạo**, **Thêm mới**, hoặc **Xác nhận giao dịch**. Tuyệt đối không dùng màu đen/navy (`bg-kraft-ink`) cho các nút hành động chính này.

```css
bg-kraft-accent text-white font-black
px-8 py-4 rounded-2xl                    /* T3 radius */
shadow-xl shadow-kraft-accent/30
hover:brightness-110 hover:scale-[1.02]
active:scale-[0.98]                       /* Cảm giác vật lý khi click */
uppercase tracking-widest text-xs
transition-all duration-300
```

#### Secondary Button (`.liquid-button-secondary`)  
```css
bg-white/70 backdrop-blur-md text-kraft-ink font-black
px-8 py-4 rounded-2xl
border border-white
hover:bg-white/90 active:scale-[0.98]
uppercase tracking-widest text-xs shadow-md
```

#### Action Icon Button (pattern từ `StaffCard`, `CarCard`)
```css
w-14 h-14 rounded-2xl bg-white shadow-sm border border-black/5
hover:text-kraft-accent hover:bg-kraft-accent/5 hover:border-kraft-accent/20
/* Destructive variant: hover:text-red-500 hover:bg-red-50 hover:border-red-100 */
```

### 4.5 Input Field (`.liquid-input`)
```css
w-full bg-white/60 border border-white/80 rounded-2xl  /* T3 */
px-6 py-4 text-kraft-ink
placeholder:text-kraft-ink/40
focus:border-kraft-accent
focus:bg-white/80
focus:ring-8 focus:ring-kraft-accent/10
font-bold shadow-inner
transition-all duration-300 outline-none
```

### 4.6 Month Picker (`input type="month"`)
Bộ chọn tháng/năm phải đồng nhất về kích thước để không bị cắt chữ trong tiếng Việt ("THÁNG 12 NĂM 2024").

| Thuộc tính | Quy chuẩn |
|:---|:---|
| **Chiều rộng** | `min-w-[220px] md:w-60` (240px) |
| **Typography** | `text-[11px] font-black uppercase tracking-widest` |
| **Padding** | `pl-12 pr-6` (vừa đủ cho icon lịch bên trái) |
| **Layout** | Nằm trong div `relative group` với icon `Calendar` tuyệt đối bên trái |

### 4.7 Badge System (`.glass-badge`)

Base badge:
```css
px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest
border border-white/20 shadow-lg backdrop-blur-md
background: rgba(15, 23, 42, 0.8); color: white;
```

**Màu badge theo trạng thái xe** (từ `VEHICLE_STATUS_CONFIG`):

| Badge Class | Màu | Trạng thái xe |
|:---|:---|:---|
| `.glass-badge-orange` | `rgba(245,158,11,0.85)` | Cọc mua, Cọc Bank |
| `.glass-badge-sky` | `rgba(14,165,233,0.85)` | Spa |
| `.glass-badge-emerald` | `rgba(16,185,129,0.85)` | Trong kho |
| `.glass-badge-purple` | `rgba(139,92,246,0.85)` | Cọc bán, Góp vốn |
| `.glass-badge-blue` | `rgba(59,130,246,0.85)` | Thông báo cho vay |
| `.glass-badge-red` | `rgba(239,68,68,0.85)` | Đã bán |
| `.glass-badge-dark` | `rgba(15,23,42,0.9)` | Default/fallback |

Mỗi badge có `box-shadow` tương ứng màu: `0 4px 15px rgba([màu], 0.3)`.

### 4.8 Text Gradient (`.text-liquid-gradient`)
```css
bg-clip-text text-transparent
bg-gradient-to-r from-kraft-ink to-kraft-accent
font-black
```
Dùng cho tiêu đề trang chính, số liệu nổi bật.

---

## 5. Tab System — Hệ thống Tab

Auto 28 sử dụng **2 loại tab** riêng biệt:

### 5.1 Navigation Tabs (Header — `.folder-tab`)

Dùng trong `Header.tsx` cho main navigation ở desktop. Có hình dạng "folder tab" với bo góc trên:

```css
.folder-tab {
  height: 48px; px-6 md:px-8;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  font-black uppercase tracking-widest text-[11px];
}

.folder-tab-inactive {
  text-kraft-ink/40; bg-white/30; border border-white/40;
  transform: translateY(4px);  /* Tab inactive thấp hơn 4px */
}

.folder-tab-active {
  text-kraft-accent; height: 52px;
  transform: translateY(1px);  /* Nhô lên so với inactive */
  border-bottom: 2px solid rgba(255,255,255,0.7);
  box-shadow: 0 -15px 30px -10px rgba(99,102,241,0.15);
}
```

### 5.2 Contained Tabs (Detail View — `.ctab`)

Dùng trong `VehicleDetailModal`, `StaffDetailModal` cho tab nội dung bên trong card/modal. Dùng CSS class tách biệt hoàn toàn:

```css
.ctab-bar { display: flex; align-items: flex-end; gap: 4px; padding: 0 6px; }

.ctab {
  height: 40px; padding: 10px 20px;
  border-radius: 12px 12px 0 0;
  background: var(--meta-step-2);   /* L2 — Inactive = Nền */
  border: 1px solid #E5E7EB; border-bottom: none;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(15,23,42,0.45);
}

.ctab.ctab-active {
  height: 48px;                      /* Cao hơn inactive 8px */
  padding-bottom: 16px;
  background: var(--meta-step-3);    /* L3 — Canvas = active */
  color: #0f172a;
  border-bottom: 4px solid var(--meta-step-3);
  margin-bottom: -4px;               /* Overlap với panel panel bên dưới */
}

.ctab-panel {
  background: var(--meta-step-3);    /* L3 — Cùng màu với active tab (seamless) */
  border: 1px solid #E5E7EB;
  border-radius: 0 3rem 3rem 3rem;   /* T1 — 3 góc dưới bo tròn */
  box-shadow: 0 15px 35px -5px rgba(0,0,0,0.08),
              0 5px 15px -3px rgba(0,0,0,0.03);
}
```

---

## 6. Animation & Motion

### 6.1 Card Hover (Framer Motion)
```tsx
whileHover={{ y: -12, transition: { duration: 0.5, ease: "easeOut" } }}
```
Dùng nhất quán cho `CarCard` và `StaffCard`. Kết hợp với CSS:
```css
hover:shadow-[var(--shadow-card-hover)]  /* Shadow đổ sâu hơn */
transition-all duration-700              /* Smooth 700ms */
```

### 6.2 Card Entry Animation
```tsx
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
```

### 6.3 Progress Bar Animation (KPI Bar trong `StaffCard`)
```tsx
initial={{ width: 0 }}
animate={{ width: `${Math.min(completionRate, 100)}%` }}
transition={{ duration: 1.5, ease: "circOut" }}
```

### 6.4 Shimmer Loading Effect
```css
.shimmer-wrapper {
  position: relative; overflow: hidden;
  background: rgba(0,0,0,0.03);
  border-radius: 12px;
}
.shimmer-effect {
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```
> **Quy tắc Vàng cho Skeleton**: Skeleton phải mô phỏng chính xác 1:1 layout của trang thật (grid columns, card height, gaps) để triệt tiêu hiện tượng **Layout Shift (CLS)**.

### 6.5 Background Pulse (`bgPulse` — 30s)
Subtle ngay trên body, tạo cảm giác môi trường "thở".

### 6.6 Aging Indicator Animation
Xe lưu kho > 25 ngày hiển thị `w-2 h-2 rounded-full bg-red-500 animate-ping` để cảnh báo.

### 6.7 Liquid Cross-fade (Centralized Transition)
Auto 28 sử dụng cơ chế chuyển cảnh tập trung qua component `PageTransition` để đảm bảo sự mượt mà tuyệt đối giữa các Tab và từ trạng thái Loading sang hiển thị Dữ liệu.

**Thông số vàng cho Motion:**
- **Initial**: `{ opacity: 0, y: 20, scale: 0.98, blur: 10px }` — Cảm giác nội dung "mọc" lên từ nền.
- **Animate**: `{ opacity: 1, y: 0, scale: 1, blur: 0px }` — Trạng thái ổn định sắc nét.
- **Exit**: `{ opacity: 0, y: -15, scale: 1.02, blur: 10px }` — Bay về phía người dùng khi biến mất.
- **Spring**: `damping: 30, stiffness: 200` — Chuyển động vật lý, không giật cục.

**Cách áp dụng:**
Mọi trang nội dung và Skeleton phải được bao bọc bởi `AnimatePresence` và `PageTransition` tại `MainContent.tsx`. Không tự ý cài đặt animation thủ công ở cấp trang để tránh xung đột.

---

## 7. Typography System

### 7.1 Tiêu đề Trang (Main Page Titles)
```
Kích thước:    text-5xl → text-7xl (tùy ngữ cảnh)
Font-weight:   font-black
Transform:     uppercase
Letter-spacing: tracking-tighter
Font-family:   "Mulish" (tự động qua heading rule)
```

### 7.2 Sub-labels & Micro-data (Nhãn danh mục)
```
Kích thước:    text-[10px]
Font-weight:   font-black
Transform:     uppercase
Letter-spacing: tracking-[0.2em]
Color:         text-kraft-ink/60 (đảm bảo độ sắc nét trên nền Glass)
```
**Ví dụ thực tế**: "Thời gian lưu kho", "Thu nhập dự tính", "Giá chào bán"

### 7.3 Số liệu Chính (Primary Data Numbers)
```
Kích thước:    text-2xl → text-4xl (tùy card size)
Font-weight:   font-black
Letter-spacing: tracking-tighter
Color:         text-kraft-ink (đen đậm) hoặc màu semantic
```

### 7.4 Số liệu Phụ (Secondary Info)
```
Kích thước:    text-[10px] → text-xs
Font-weight:   font-bold → font-black
Color:         text-kraft-ink/40 → /60
```

### 7.5 Màu Semantic cho Số liệu Tài chính
```
Lợi nhuận dương:  text-emerald-600
Cảnh báo (aging): text-red-500
Accent/Link:      text-kraft-accent (#6366f1)
```

---

## 8. CarCard — Specification Đầy đủ

`/src/modules/inventory/presentation/components/CarCard.tsx`

### 8.1 Cấu trúc 4 Zone

```
┌─────────────────────────────────────────────────────────┐
│  Zone 1: IMAGE HEADER (aspect-[2/1])                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  [Status Badge]      [Aging Clock]  [Pin Button]   │ │
│  │                                                    │ │
│  │            ┌─────────────────────┐                 │ │
│  │            │  Giá chào bán       │ (floating pill) │ │
│  │            │  450,000,000 ₫      │                 │ │
│  │            └─────────────────────┘                 │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Zone 2: PRIMARY DATA (p-8)                             │
│  Car Name (text-2xl, uppercase, line-clamp-2)           │
│  #CODE | 2021 | 50,000 km                              │
│                                                         │
│  Zone 3: FOOTER (mt-auto, border-t)                     │
│  Thời gian lưu kho: X ngày    | Lợi nhuận ròng         │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Specs
- **Kích thước fixed**: `w-full h-[450px]` (variant standard)
- **Container class**: `liquid-glass-core overflow-hidden cursor-pointer flex flex-col bg-white rounded-t1`
- **Shadow**: `shadow-[var(--shadow-card-industrial)]` → `hover:shadow-[var(--shadow-card-hover)]`
- **Hover lift**: `whileHover={{ y: -12 }}` (Framer Motion)
- **Image gradient overlay**: `bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-60`
- **Price pill**: `bg-kraft-ink text-white rounded-full backdrop-blur-xl px-10 py-3`

### 8.3 Role-based Data Visibility
Chỉ các role `ADMIN`, `ACCOUNTANT`, `MANAGER`, hoặc coinvestor mới thấy số lợi nhuận:
```tsx
const canSeeFullInfo = userRole === UserRole.ADMIN || userRole === UserRole.ACCOUNTANT
  || userRole === UserRole.MANAGER
  || (car.is_coinvested && car.coinvestor_code === userCode);
```

---

## 9. StaffCard — Specification Đầy đủ

`/src/modules/staff/presentation/components/StaffCard.tsx`

### 9.1 Cấu trúc 5 Zone

```
┌────────────────────────────────────────┐
│  Zone 1: DECORATIVE BG (blur sparkle)  │
│           -top-10 -right-10            │
│                                        │
│  Zone 2: IDENTITY HEADER               │
│  [Avatar T2]  [code / role / name]     │
│  [HighPerformer badge nếu ≥100% KPI]   │
│                                        │
│  Zone 3: PERFORMANCE METRICS           │
│  [Completion Rate %] [Actual/Target]   │
│  [Progress Bar animated]               │
│                                        │
│  Zone 4: FINANCIAL SNAPSHOT            │
│  [Thu nhập dự tính] [Lương cứng]       │
│  (bg-kraft-bg/40 rounded-t2)           │
│                                        │
│  Zone 5: FOOTER ACTIONS                │
│  [Edit] [Delete] ── [Báo cáo chi tiết →]│
└────────────────────────────────────────┘
```

### 9.2 Specs
- **Kích thước fixed**: `w-[360px] h-full`
- **Container**: `liquid-glass-core rounded-t1 bg-white p-8 flex flex-col`
- **Avatar**: `w-16 h-16 rounded-t2 bg-kraft-accent` — hiển thị chữ cái đầu
- **Progress bar height**: `h-4` — màu `bg-emerald-500` nếu KPI ≥ 100%, `bg-kraft-accent` nếu chưa đạt
- **Financial box**: `bg-kraft-bg/40 backdrop-blur-md rounded-t2 p-6 border border-white/80`
- **Admin card**: Hiển thị placeholder mờ, không tính lương

---

## 10. Modal & Overlay

### 10.1 Backdrop
```css
fixed inset-0 bg-kraft-ink/20 backdrop-blur-sm z-[60]
```

### 10.2 Modal Container
```css
rounded-[3rem]  /* T1 */
bg-white/90 backdrop-blur-3xl
border border-white/50
shadow-[var(--shadow-kraft-deep)]
```

### 10.3 Mobile Sidebar (Header Mobile Menu)
```css
fixed top-0 left-0 bottom-0 w-72
bg-white/90 backdrop-blur-3xl
border-r border-white/50
p-6
```
Entry animation: `initial={{ x: '-100%' }} animate={{ x: 0 }}` (Spring, damping 25, stiffness 200).

---

## 11. Mobile Navigation

### 11.1 Bottom Nav Bar
```css
/* Được render qua createPortal vào document.body */
fixed inset-x-0 bottom-6 mx-6
bg-white/90 backdrop-blur-3xl border border-white/50
px-2 py-2 rounded-full
flex justify-around items-center
shadow-2xl z-[9999]
```

Active indicator: `motion.div` với `layoutId="bottomNavIndicator"` và `bg-kraft-accent/5 rounded-full`.

### 11.2 Breakpoint
- **Desktop tabs**: Hiển thị từ `xl:` (1280px+) — class `hidden xl:flex` 
- **Mobile bottom nav**: Hiển thị dưới `xl:` — class `xl:hidden`

---

## 12. Scrollbar

```css
::-webkit-scrollbar       { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { bg-kraft-accent/20 rounded-full; }
::-webkit-scrollbar-thumb:hover { bg-kraft-accent/40; }
```

---

## 13. Financial Data Visibility Rules

Dựa trên `UserRole` (từ `constants.ts`):

| Role | Xem lợi nhuận xe | Xem lương nhân viên | Xem Cashflow |
|:---|:---:|:---:|:---:|
| `ADMIN` | ✅ Full | ✅ Full | ✅ Full |
| `ACCOUNTANT` | ✅ Full | ✅ Full | ✅ Full |
| `MANAGER` | ✅ Full | ✅ Full | ✅ Full |
| `SALES_LEADER` | ❌ (Chỉ xe của mình) | ❌ | ❌ |
| `STAFF` / `SALES_STAFF` | ❌ (Chỉ xe coinvest) | Chỉ của mình | ❌ |

---

## 14. Quy tắc Vàng (Golden Rules)

1. **Glass Saturation**: Luôn dùng `saturate(150%)` trở lên cho các lớp Glass — không được dùng backdrop-filter thiếu saturate.
2. **Breathable Spacing**: Padding tối thiểu cho Card chính là `p-8`, cho section con là `p-6`. **Không tiết kiệm whitespace**.
3. **Border-less Depth**: Sử dụng Shadow và Layer chênh màu để phân tách khối. **Hạn chế dùng border đậm** — border chỉ được dùng với opacity thấp (`border-white/40`, `border-black/5`).
4. **Semantic Color**: Không dùng màu thô (`red`, `blue`). Luôn dùng token (`kraft-red`, `kraft-accent`) hoặc Tailwind semantically (`emerald-500` cho profit, `red-500` cho warning).
5. **Physical Motion**: Nút bấm phải có `active:scale-[0.98]`. Card hover phải lift lên `y: -12`. **Không có element tĩnh hoàn toàn**.
6. **GPU-first**: Mọi phần tử dùng `backdrop-filter` phải có `transform: translateZ(0)` và `will-change` để tránh repaint.
7. **T1 cho container, T2 cho section, T3 cho action**: Không được đảo ngược thứ tự radius trong cùng một component.
8. **Text contrast**: Sub-label sử dụng `opacity-60`, không được thấp hơn để đảm bảo độ sắc nét khi dùng font Mulish.
9. **Purity Sharpness**: Mọi văn bản nằm trên lớp L4 (PURITY) phải có nền đủ đặc (`bg-white/80` trở lên) để tránh hiện tượng mờ chữ do hiệu ứng blur xuyên thấu.

---

## 15. Anti-Patterns (Không được làm)

| ❌ Sai | ✅ Đúng |
|:---|:---|
| `border-2 border-gray-300` | `border border-black/5` hoặc shadow |
| `background: #ffffff` phẳng không blur | `bg-white/65 backdrop-blur-2xl` |
| `font-bold` cho số liệu chính | `font-black tracking-tighter` |
| `rounded-lg` cho Card chính | `rounded-[3rem]` (T1) |
| `text-[9px]` cho sub-label | `text-[10px]` (Minimum Sharpness) |
| `text-kraft-ink/30` cho nhãn | `text-kraft-ink/60` (Minimum Contrast) |
| Màu `green` thô cho lợi nhuận | `text-emerald-600` |
| Thiếu `transition-all` trên interactive element | `transition-all duration-300` (tối thiểu) |
| Hardcode shadow `box-shadow: 0 4px 6px #000` | `shadow-[var(--shadow-card-industrial)]` |

---

*Cập nhật lần cuối: Đồng bộ từ codebase Auto28 — tháng 4/2026*
*Phiên bản: Liquid Glass 2.0 | Tác giả: Auto28 Dev Team*
