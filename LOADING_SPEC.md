# ĐẶC TẢ KỸ THUẬT: HIỆU ỨNG TẢI TRANG HỆ THỐNG (BIOLOGICAL LOADING SPEC)
**Tài liệu Quy chuẩn Thiết kế & Hướng dẫn Lập trình cho Hệ sinh thái Showroom Manager**

Tài liệu này quy chuẩn hóa toàn bộ các hành vi, thông số kỹ thuật và phương thức lập trình hiệu ứng chờ tải (Loading Effects & Skeletons) áp dụng cho cả hai phiên bản **Mobile App (iOS Native View)** và **Web App (Desktop View)** của hệ sinh thái Showroom Manager.

---

## 1. Triết Lý Thiết Kế Cốt Lõi: Tải Trang Sinh Học (Biological Loading)

Trong ngôn ngữ thiết kế **Neural Expressive**, hiệu ứng tải trang không đơn thuần là hiển thị trạng thái chờ máy móc, mà là một thực thể sống đang **"suy nghĩ và thở"**. 
Chúng ta triệt tiêu hoàn toàn trải nghiệm "chờ đợi thụ động" bằng các nguyên tắc:

*   **Không Đóng Băng Nhận Thức (Visual Anchor Preservation)**: Tuyệt đối không xóa sạch màn hình hoặc chặn tương tác của người dùng bằng một màn hình trống rỗng kèm Spinner xoay tròn. Các thành phần khung nền (Page Shell, Native Header) và bộ chọn (Date/Month Picker) bắt buộc phải xuất hiện tức thì và giữ nguyên trạng thái để người dùng duy trì định hướng không gian.
*   **Chuyển Động Vật Lý Lò Xo (Spring Dynamics)**: Loại bỏ các hoạt ảnh chuyển động tuyến tính (linear) phẳng lỳ. Khi dữ liệu tải xong, các thành phần thật phải "bung nở" mượt mà từ hậu cảnh lên tiền cảnh bằng hàm chuyển động lò xo đàn hồi.
*   **Phân Tầng Nhận Thức Nối Đuôi (Staggered Flow)**: Dữ liệu không xuất hiện đồng loạt mà tuân theo một "làn sóng" đổ xô từ trên xuống dưới, hỗ trợ mắt người dùng đọc quét thông tin tối ưu nhất.

---

## 2. Thông Số Kỹ Thuật Vi Mô (Micro Technical Tokens)

### A. Chỉ số trễ phân tầng (Stagger Delay)
Khi một danh sách gồm $N$ phần tử được tải xong, hiệu ứng xuất hiện của phần tử thứ $i$ phải được áp dụng một khoảng trễ lũy tiến tự động:

$$\text{DelayTime}(i) = i \times 60\,\text{ms}$$

*   **Giới hạn biên độ (Guardrail)**: Tổng thời gian trễ của phần tử cuối cùng $\text{DelayTime}(N)$ không được vượt quá **`360ms`** trên Desktop và **`300ms`** trên Thiết bị di động để tránh cảm giác giao diện phản hồi lười biếng. Nếu $N$ lớn, hãy nhóm các phần tử sau chỉ số $i = 5$ xuất hiện đồng loạt.

### B. Hàm Chuyển Động Lò Xo (Spring Physics Timing)
Các hoạt ảnh xuất hiện của Skeleton và Nội dung thật bắt buộc sử dụng đường cong lò xo nảy:

```css
/* Đường cong lò xo nảy tiêu chuẩn (Spring Curve) */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### C. Giai Đoạn Hoạt Ảnh (Chrono-Physics Stages)

```
[Giai đoạn 1: Chờ tải] ──> Shimmer Skeleton mờ kính lỏng (GPU transform: translateX)
          │
          ▼ (Dữ liệu trả về)
[Giai đoạn 2: Bung nở] ──> Fluid Reveal (450ms, translateY: 16px → 0px, opacity: 0 → 1)
```

---

## 3. Quy Chuẩn Thiết Kế Vật Liệu (Material & Shimmer Specs)

### A. Vật liệu Kính Lỏng Mờ (Liquid Glassmorphism Skeleton)
Tuyệt đối không sử dụng màu xám đặc (`bg-gray-200` hay `bg-slate-200`) làm Skeleton. Nó làm vỡ cấu trúc không gian đa tầng kính. Thay vào đó, Skeleton phải sử dụng:

*   **Nền (Base)**: Chất liệu kính mờ siêu nhẹ `bg-white/[0.04] backdrop-blur-xl`.
*   **Đường viền (Hairline border)**: `border border-white/[0.05]`.
*   **Bo góc (Radii)**: Tuân thủ nghiêm ngặt cấp độ bo góc:
    *   Thẻ card chính di động: `rounded-[2rem]` (32px).
    *   Thành phần con / Hình ảnh: `rounded-2xl` (16px).
    *   Nút bấm / Viên thuốc: `rounded-full` (9999px).

### B. Quét Sáng Shimmer Tăng Tốc Đồ Họa (GPU Shimmer Animation)
Để tránh hiện tượng giật màn hình (Jank/Lag) khi trình duyệt tính toán bộ lọc mờ kính, dải sáng bạc quét (`Shimmer Effect`) bắt buộc phải di chuyển bằng thuộc tính **`transform: translateX()`** thay vì thay đổi thuộc tính `background-position` (vốn ép CPU phải vẽ lại layout liên tục).

#### Định nghĩa CSS chuẩn (`src/index.css`):
```css
/* Vật liệu Shimmer Kính Lỏng */
.expressive-shimmer-card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  will-change: transform;
  transform: translateZ(0); /* Ép Safari/iOS kích hoạt 3D Layer */
}

/* Dải sáng bạc quét */
.expressive-shimmer-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-100%);
  animation: shimmer-gpu 1.5s infinite linear;
  will-change: transform;
}

@keyframes shimmer-gpu {
  0% { transform: translateX(-150%) translateZ(0); }
  100% { transform: translateX(150%) translateZ(0); }
}
```

---

## 4. Khuôn Mẫu Lập Trình React/TypeScript Chuẩn (Mobile View Template)

Dưới đây là cấu trúc lập trình chuẩn mực khi tích hợp hiệu ứng tải trang sinh học vào một Mobile View.

### A. Khai báo Skeleton riêng biệt cho di động
```tsx
import React from 'react';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

export const DashboardMobileSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Thẻ Lợi nhuận lớn lơ lửng */}
      <div className="expressive-shimmer-card p-8 min-h-[160px] flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" width="35%" height={12} className="opacity-10" />
          <Skeleton variant="text" width="60%" height={36} className="opacity-20" />
        </div>
        <Skeleton variant="rectangle" width={140} height={24} className="rounded-full opacity-10" />
      </div>

      {/* 2. Lưới 4 thẻ thống kê con */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-black/5 p-5 rounded-[2rem] space-y-4 shadow-sm">
            <Skeleton variant="circle" width={40} height={40} className="rounded-xl opacity-10" />
            <div className="space-y-2">
              <Skeleton variant="text" width="50%" height={10} className="opacity-10" />
              <Skeleton variant="text" width="80%" height={18} className="opacity-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### B. Tích hợp chuẩn vào render chính của View
```tsx
import React from 'react';
import { motion } from 'motion/react';
import { NativePage, NativeHeader } from '@/src/shared/design-system/native/NativePage';
import { LargeTitle, SecondaryLabel } from '@/src/shared/design-system/native/NativeTypography';
import { DashboardMobileSkeleton } from './DashboardMobileSkeleton';

export const DashboardMobileView: React.FC<any> = ({ loading, data, filterMonth, onMonthChange }) => {
  return (
    <NativePage className="bg-[#F8F9FA]">
      {/* 1. GIỮ NGUYÊN HEADER LÀM NEO THỊ GIÁC - Không bị ẩn khi loading */}
      <NativeHeader>
        <SecondaryLabel>Hệ thống quản trị</SecondaryLabel>
        <LargeTitle>Báo cáo</LargeTitle>
        
        {/* Bộ chọn tháng vẫn bấm được bình thường khi đang tải dữ liệu */}
        <div className="mt-4 relative inline-flex items-center gap-3 px-6 h-12 rounded-full border border-white/40 bg-white/70 backdrop-blur-md shadow-sm">
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="..."
          />
        </div>
      </NativeHeader>

      <div className="space-y-4">
        {loading ? (
          /* 2. HIỂN THỊ SKELETON MỜ KÍNH KHI LOADING */
          <DashboardMobileSkeleton />
        ) : (
          /* 3. BUNG NỞ DỮ LIỆU THẬT VỚI STAGGER & LÒ XO */
          <>
            {/* Thẻ Lợi nhuận chính */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-gradient-to-br from-kraft-accent to-indigo-700 p-8 text-white rounded-[2.5rem]"
            >
              {/* Nội dung thật */}
            </motion.div>

            {/* Danh sách thống kê con với Staggered Animation */}
            <div className="grid grid-cols-2 gap-4">
              {data.stats.map((stat: any, index: number) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 25, 
                    stiffness: 200, 
                    delay: index * 0.06 // Phân tầng 60ms chuẩn Neural Expressive
                  }}
                  className="..."
                >
                  {/* Nội dung thật */}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </NativePage>
  );
};
```

---

## 5. Rào Chắn Hiệu Năng & Tối Ưu Hóa Trình Duyệt

*   **Tách Nhỏ Route (Async Route Splitting)**: Toàn bộ các view trang con đều phải được nạp thông qua `React.lazy` kết hợp thẻ `<Suspense>` tại `MainContent.tsx` để giảm dung lượng bundle tải đầu xuống dưới **45 KB Gzipped**.
*   **Trì Hoãn Mờ Kính (FCP Blur Delay)**: Trong 150ms đầu tiên của quá trình tải trang đầu, hãy render thẻ với background màu đặc mỏng (`rgba(22, 26, 35, 0.95)`). Sau 200ms, mới kích hoạt hiệu ứng blur nặng thông qua CSS Animation `.card-fast-load` để tránh làm CPU/GPU di động bị khựng trong giai đoạn khởi tạo cây DOM.
*   **Cô lập cấu trúc (DOM Containment)**: Lớp Grid Container chứa các thẻ card bắt buộc phải khai báo thuộc tính `contain: layout style` để trình duyệt tính toán giới hạn cuộn trang mà không vẽ lại toàn bộ cây DOM chính.
