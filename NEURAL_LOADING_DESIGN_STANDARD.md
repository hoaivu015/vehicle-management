# TIÊU CHUẨN THIẾT KẾ LOADING UX HỆ THỐNG (NEURAL LOADING UX STANDARD)
**Tài liệu Kết tinh từ Apple HIG & Google Material Design cho Hệ sinh thái Showroom Manager**

Tài liệu này định hình quy chuẩn kỹ thuật và triết lý thiết kế cho toàn bộ các trạng thái chờ tải dữ liệu (**Loading States**) trong Showroom Manager, được xây dựng trên sự giao thoa giữa hai triết lý thiết kế hàng đầu thế giới: **Tính Bền Bỉ & Sinh Học** của Apple Human Interface Guidelines (HIG) và **Tính Ổn Định Bố Cục (Shimmer Skeletal)** của Google Material Design.

---

## 1. Bản Đồ Giao Thoa Triết Lý (The Philosophy Matrix)

```
[Apple HIG: Tính Bền Bỉ (Deference & Fluidity)]  ───┐
                                                     ├─► [Showroom Manager: NEURAL LOADING]
[Google Material: Ổn Định Layout (Shimmer Skeleton)] ───┘
```

*   **Tôn trọng Nội dung (Deference - Apple)**: Giao diện tuyệt đối không được tranh chấp với nội dung. Spinner xoay tròn cổ điển hay Skeleton phẳng xám đặc quá thô thiển và làm gián đoạn dòng suy nghĩ của người dùng. Giao diện tải phải lùi về phía sau hậu cảnh đồ họa.
*   **Chống đóng băng (Unfrozen UI - Apple)**: Trình duyệt/Ứng dụng không bao giờ được rơi vào trạng thái "đơ". Khung Layout tĩnh và Header phải luôn hoạt động, cho phép người dùng cuộn trang hoặc nhấp chọn các bộ lọc khác ngay khi đang tải.
*   **Ổn định bố cục (Layout Stabilization - Google)**: Triệt tiêu hoàn toàn lỗi giật màn hình (Cumulative Layout Shift - CLS) bằng cách dùng placeholder có kích thước hình học tỷ lệ $1:1$ với nội dung thật.
*   **Nhịp thở Sinh học (Ambient Breathing - Neural Expressive)**: Giao diện biểu thị trạng thái "đang suy nghĩ" bằng nhịp co dãn lò xo và dải sáng Shimmer lỏng, thay vì chuyển động tuyến tính (linear) vô tri.

---

## 2. Mô Hình Tải Trang Đa Tầng (Multi-Tier Loading Model - SSOT)

Hệ thống phân chia hành vi tải trang thành 2 kịch bản trải nghiệm dựa trên bộ nhớ đệm dữ liệu (Caching Strategy):

```
                      [Yêu Cầu Tải Dữ Liệu]
                                │
                                ├─► Chưa có Cache? (Tải lần đầu) 
                                │     └─► [Liquid Glassmorphism Shimmer Skeleton]
                                │
                                └─► Đã có Cache? (Tải lại/Lọc dữ liệu)
                                      └─► [Stale-While-Revalidate Kính Thở Overlay]
```

### 💎 Kịch bản A: Khởi tạo lần đầu (Initial Load - Empty Cache)
*   **Trường hợp áp dụng**: Người dùng mới đăng nhập, chuyển tab lần đầu tiên ở menu hệ thống.
*   **Quy chuẩn thị giác**: Dựng ngay khung Layout tĩnh. Tại vị trí của các khối nội dung, render **Khung xương kính mờ lỏng (Liquid Glassmorphism Shimmer Skeleton)**.
*   **Thông số kỹ thuật Skeleton**:
    *   **Vật liệu**: Nền kính mờ `bg-white/[0.04] backdrop-blur-xl border border-white/[0.05]`.
    *   **Quét sáng**: Một dải sáng bạc mờ (`rgba(255,255,255,0.06)`) quét chéo từ góc trên-trái xuống dưới-phải bằng GPU (`transform: translateX()`).

### 💎 Kịch bản B: Tải lại dữ liệu động (Subsequent Load / Filter - Cache Exists)
*   **Trường hợp áp dụng**: Người dùng thay đổi Month Picker, lọc danh sách xe, tìm kiếm nhân sự, v.v.
*   **Quy chuẩn thị giác**: Áp dụng mô hình **SWR (Stale-While-Revalidate)** kết hợp **Lớp phủ Kính thở (Stale Glass Overlay)**:
    1.  **Neo thị giác**: Giữ nguyên dữ liệu của tháng/lọc cũ làm điểm tập trung cho mắt.
    2.  **Lớp phủ**: Phủ một lớp sương mù kính lỏng siêu mỏng (`bg-white/5 backdrop-blur-[6px]`) lên khu vực dữ liệu cũ để báo hiệu hệ thống đang cập nhật.
    3.  **Nhịp thở Ambient**: Kích hoạt hiệu ứng thở nhẹ cho bóng đổ `shadow-glass-glow` bằng lò xo.
    4.  **Morphing Reveal**: Khi dữ liệu mới về, các con số và thẻ card tự động "biến thái hình dạng" (Morphing) mượt mà trực tiếp từ giá trị cũ sang mới.

---

## 3. Hoạt Ảnh Kỹ Thuật (Motion & GPU Accel Specs)

### A. GPU Acceleration & Layer Isolation (will-change)
Để đảm bảo hiệu năng 120Hz mượt mà trên iPhone/Safari, toàn bộ các Skeleton và Lớp phủ kính mờ bắt buộc phải được đẩy lên Graphics Layer của GPU:

```css
.neural-loading-layer {
  will-change: transform, opacity;
  transform: translateZ(0); /* Kích hoạt tăng tốc phần cứng 3D Layer */
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### B. Thuật toán Stagger Delay Phân Tầng Nhận Thức
Khi chuyển đổi từ Skeleton/Lớp phủ sang Dữ liệu thật, các sub-component con bắt buộc phải bung nở nối đuôi nhau theo thứ tự từ trên xuống dưới:

$$\text{DelayTime}(i) = i \times 50\,\text{ms}$$

```tsx
// Lập trình Stagger Animation bằng Motion React
const revealVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 200,
      delay: i * 0.05 // Stagger 50ms cực kỳ mượt mà
    }
  })
};
```

---

## 4. Bảng Đối Chiếu Quy Chuẩn Thiết Kế Quốc Tế

| Tiêu chuẩn UX | Apple HIG (Fluidity) | Google Material (Skeletal) | Showroom Manager (Neural Expressive) |
| :--- | :--- | :--- | :--- |
| **Tính phản hồi khi loading** | 🟢 Luôn Navigation bình thường | 🟡 Chờ Skeleton load xong | 🟢 **Layout Shell & Tab luôn bấm được 100%** |
| **Vật liệu Placeholder** | 🟢 Tôn trọng nội dung, tối giản | 🟡 Dùng các khối màu xám đặc | 🟢 **Dùng Kính mờ lỏng (Glassmorphism)** |
| **Hiệu năng Render** | 🟢 Tối ưu hóa tải background | 🟡 Ưu tiên chống Layout Shift | 🟢 **will-change cô lập layer GPU 120Hz** |
| **Hoạt ảnh chuyển tiếp** | 🟢 Chuyển mượt mà, tự nhiên | 🟢 Shimmer quét sáng tuyến tính | 🟢 **Nhịp thở Ambient lò xo & Morphing** |

---

## 5. Hướng Dẫn Thực Thi Tái Cấu Trúc (Refactoring Blueprint)

### Bước 1: Khai báo Hook State phân tách pha Loading
```typescript
export const useDashboardState = (presenter: FinancePresenter) => {
  const [data, setData] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const handleMonthChange = async (month: string) => {
    setIsFiltering(true); // Bật lớp phủ kính thở cho dữ liệu cũ
    await presenter.loadData(month);
    setIsFiltering(false);
  };
  
  // ...
};
```

### Bước 2: Tích hợp Lớp Phủ Kính Thở vào Component di động/web
```tsx
export const DashboardMobileView: React.FC = () => {
  const { data, isInitialLoading, isFiltering, filterMonth, handleMonthChange } = useDashboardState();

  return (
    <NativePage>
      {/* 1. Header luôn bền bỉ và bấm được */}
      <NativeHeader>
        <LargeTitle>Báo cáo</LargeTitle>
        <MonthPicker value={filterMonth} onChange={handleMonthChange} disabled={false} />
      </NativeHeader>

      <div className="relative">
        {isInitialLoading ? (
          /* 2. Tải lần đầu: Hiện Shimmer Skeleton kính lỏng */
          <DashboardMobileSkeleton />
        ) : (
          /* 3. Tải lại/Lọc: Hiện dữ liệu cũ và phủ lớp kính thở mờ nhẹ */
          <div className="relative">
            <div className={cn("transition-all duration-300", isFiltering && "opacity-50 blur-[2px]")}>
              <ProfitCard data={data} />
              <StatsGrid data={data} />
            </div>

            {isFiltering && (
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[4px] rounded-[2.5rem] flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 rounded-full bg-kraft-accent shadow-neon-glow" />
              </div>
            )}
          </div>
        )}
      </div>
    </NativePage>
  );
};
```
