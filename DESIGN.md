# 🎨 DESIGN SYSTEM SPECIFICATION: NEURAL EXPRESSIVE 2.0 (AUTO 28)

*Tài liệu này là Nguồn Chân Lý Duy Nhất (Single Source of Truth - SSOT) cho mọi token thiết kế, tỷ lệ hình học, spring physics, và xúc giác (haptics) của hệ sinh thái Auto 28. Bắt buộc phải tuân thủ nghiêm ngặt trong mọi tác vụ phát triển UI.*

---

## 1. COLOR TOKENS & DEPTH (Hệ màu sắc & Chiều sâu đa tầng)

Hệ màu của Neural Expressive 2.0 từ bỏ tư duy phẳng, áp dụng tính chất **Mờ kính (Liquid Glassmorphism)** kết hợp viền phản chiếu ánh sáng siêu mảnh (`Hairline border`) để tối ưu độ tương phản sinh học:

### 🏛️ Canvas & Surface (Nền tảng lơ lửng)
*   **Layer 0 (Canvas Background)**: `#F8FAF4` (Giao diện Sáng) | `#0B0E14` (Giao diện Tối).
    *   *Hiệu ứng ngầm*: Tích hợp lớp nền động chuyển sắc chậm (`animate-ambient` xoay chu kỳ 20 giây) giúp giao diện "biết thở".
*   **Layer 1 (Surface/Card)**: `rgba(255,255,255,0.75)` (Sáng) | `rgba(22,26,35,0.65)` (Tối).
    *   *Đặc tính*: `backdrop-blur-xl`, viền mảnh `border-black/5` hoặc `border-white/10`, đổ bóng mềm `shadow-sm`.
*   **Layer 2 (Phần tử con / Pills / Inputs)**: `rgba(0,0,0,0.03)` (Sáng) | `rgba(255,255,255,0.05)` (Tối).
    *   *Đặc tính*: Không mờ kính, tăng độ bão hòa nhẹ khi tương tác hover (`bg-gray-50/50 hover:bg-indigo-50` / `bg-white/5 hover:bg-white/10`).
*   **Layer 3 (Overlay / AI State / Toast)**: Dải màu gradient sáng phát sáng.
    *   *Đặc tính*: Bóng đổ diện rộng chống lóa: `shadow-xl shadow-indigo-500/10` hoặc `shadow-2xl shadow-indigo-500/10`.

### 💰 Semantic Financial Glow (Màu nghiệp vụ phát sáng)
*   **Ổn định / Tích cực (Dòng tiền dương)**: `#00F2FE` $\rightarrow$ `#4FACFE` (Neon Blue/Mint) - Phát sáng nhẹ biên độ thấp (`Breathe`).
*   **Cảnh báo / Khóa vốn (Lưu kho >30 ngày, Cọc mua)**: `#FF0844` $\rightarrow$ `#FFB199` (Vibrant Coral/Amber) - Xung động nhẹ (`Pulse`).
*   **Trung tính / Nhãn phụ**: `#FDFCFB` $\rightarrow$ `#E2DCD5` (Warm Bone) - Bề mặt nhám mờ, hấp thụ ánh sáng.

---

## 2. FLUID SOFT GRID & SPACING (Hệ thống lưới động mềm)

Mọi khoảng cách và góc bo tuân thủ nghiêm ngặt hệ lưới động dựa trên bội số của **`8px`**:

*   **⭕ Radii (Squircle / Super Ellipse)**:
    *   `radius-t1` (`rounded-[32px]` / `2.0rem`): Khung thẻ lớn (Main Cards), Top-corners của Bottom Sheet Modals.
    *   `radius-t2` (`rounded-[20px]` - `rounded-[24px]`): Thành phần con bên trong (Ảnh sản phẩm, Highlight Box).
    *   `radius-t3` (`rounded-full` / `9999px`): Thanh điều khiển, Nút bấm dạng viên thuốc (Pill Button).
*   **📦 Padding & Gaps**:
    *   Đệm viền tổng thể của thẻ: Tối thiểu `p-6` (24px), lý tưởng là `p-8` (32px) để tạo khoảng thở tối ưu.
    *   Khoảng cách giữa các thẻ trong lưới: `gap-6` (24px) hoặc `gap-8` (32px).
    *   Khoảng cách tiêu đề và mô tả con: `gap-1` (4px) hoặc `gap-2` (8px).
    *   Khoảng cách khối chữ và khối đồ thị/hình ảnh: `gap-4` (16px) hoặc `gap-6` (24px).

---

## 3. BOLD-FIRST TYPOGRAPHY (Quy tắc nhận thức 2 Giây)

Áp dụng quy tắc tương phản cực hạn cho tiêu đề và các chỉ số tài chính chính để hỗ trợ đọc lướt, loại bỏ bức tường chữ dày đặc:

*   **Số liệu lớn (Metrics)**: `32px` - `40px` | `Black (900)` | Thắt chặt (`-0.05em`) | `text-4xl font-black tracking-tighter leading-[1.1]` | Hiển thị số dư tiền mặt, doanh thu.
*   **Tiêu đề Thẻ (Card Title)**: `20px` - `24px` | `Black (900)` | Thu hẹp (`-0.025em`) | `text-xl font-black tracking-tight leading-[1.25]` | Tên xe, tiêu đề phân khu chính.
*   **Tiêu đề phụ (Subtitle)**: `18px` | `Bold (700)` | Hơi thu hẹp (`-0.01em`) | `text-lg font-bold tracking-tight leading-[1.3]` | Tiêu đề thẻ con.
*   **Văn bản phụ (Subtitle Sm)**: `14px` - `15px` | `Medium (500)` | Bình thường | `text-sm font-medium text-gray-500 leading-[1.4]` | Ghi chú, chú thích mốc thời gian.
*   **Nhãn viên thuốc (Tag/Pill)**: **`12px` (hoặc `11pt`)** | `Bold (700)` | Mở rộng (`0.1em`) | `text-xs font-bold tracking-widest uppercase leading-[1]` | Nhãn trạng thái `TRONG KHO`, `CỌC MUA`.

---

## 4. SHAPE, ELEVATION & SPRING (Kiến trúc lò xo 3D)

Toàn bộ diễn hoạt và chuyển động trong ứng dụng được tính toán bằng các hàm lực lượng vật lý lò xo, loại bỏ chuyển động tuyến tính cơ học:

### 🌀 Hoạt ảnh lò xo chuẩn (Spring physics)
*   **Hàm nảy lò xo (Hover card, pop-in modal)**:
    ```css
    transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
    ```
*   **Hàm trượt mượt (Chuyển tab, dịch chuyển khung chứa)**:
    ```css
    transition: all 200ms cubic-bezier(0.25, 1, 0.5, 1);
    ```

### 🎯 Lực nén tương tác (Press Compression)
*   **Hover (Rê chuột/Tiếp cận)**: Vật thể nổi lên nhẹ, dịch chuyển trục Y (`translateY(-4px)` hoặc `-6px`), phóng to nhẹ `scale-[1.02]`, tăng bóng đổ mịn màng.
*   **Active/Press (Nhấn/Chạm)**: Vật thể lún xuống sát bề mặt `scale-[0.96]` đến `scale-[0.98]`, triệt tiêu toàn bộ bóng đổ để giả lập hành vi cơ học nảy đàn hồi.

---

## 5. BẢN ĐỒ PHẢN HỒI XÚC GIÁC DI ĐỘNG (MOBILE HAPTICS MATRIX)

Đảm bảo trải nghiệm vật lý gắn kết sâu sắc khi chạy thông qua Capacitor iOS/Android:

1.  **Chạm Tab / Click Nút bấm**: `Haptics.impact({ style: ImpactStyle.Light })` $\rightarrow$ Rung cực nhẹ, dứt khoát.
2.  **Nhập liệu gõ phím / Ký tự tiền**: `Haptics.selection()` $\rightarrow$ Rung siêu mịn theo nhịp gõ phím cơ học.
3.  **Giao dịch thành công (Lưu cọc, thanh toán)**: `Haptics.notification({ type: NotificationType.Success })` $\rightarrow$ Rung kép nhịp điệu nhanh dần.
4.  **Cảnh báo lỗi / Lưu kho lâu (>30 ngày)**: `Haptics.notification({ type: NotificationType.Warning })` $\rightarrow$ Rung 3 nhịp mạnh cách quãng.

---

## 6. QUY CHUẨN TỐI ƯU HÓA HIỆU NĂNG PHẦN CỨNG (GPU ACCELERATION)

Để đảm bảo hiệu ứng mờ kính lỏng `backdrop-filter` hoạt động mượt mà 120Hz trên thiết bị di động:

1.  **GPU Promotion**: Thêm `will-change: transform` và `transform: translateZ(0)` trên các thẻ card phức tạp hoặc modal để trình duyệt cô lập Graphics Layer riêng, tránh repaint lại CPU khi cuộn.
2.  **Giới hạn Blur**: Không dùng quá `backdrop-filter: blur(20px)` và giới hạn dưới 8 phần tử mờ kính hiển thị đồng thời trên một view.
3.  **Tối ưu Shimmer**: Hoạt ảnh tải dữ liệu Shimmer phải được dịch chuyển thông qua thuộc tính GPU `transform: translateX()` thay vì `background-position` để triệt tiêu hiện tượng lag giật khung hình.
