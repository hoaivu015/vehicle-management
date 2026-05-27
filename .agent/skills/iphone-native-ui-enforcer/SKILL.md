---
name: iPhone Native UI Enforcer (Auto 28 Edition)
description: Framework ép buộc tiêu chuẩn iPhone Native cao cấp dành riêng cho hệ sinh thái Auto 28. Kết hợp triết lý Apple với phong cách Liquid Glass UI.
---

# 🍎 iPhone Native UI Enforcer (V2.0 - Auto 28 Edition)

Tài liệu này là **Hệ điều hành thiết kế** (Design OS) bắt buộc cho mọi thao tác UI/UX trên phiên bản di động của dự án Auto 28.

## 1. Triết lý Thiết kế (The Kraft Philosophy)
Ứng dụng Auto 28 trên iPhone không chỉ là một công cụ quản lý, mà phải là một **Phụ kiện kỹ thuật số cao cấp**.
- **Integrity**: Nội dung không bao giờ bị hardware (Notch/Home Indicator) xâm phạm.
- **Deference**: UI nhường chỗ cho dữ liệu xe và tài chính tỏa sáng.
- **Vibrancy**: Sử dụng tối đa chất liệu kính (`backdrop-blur`) để tạo sự liên kết với nền ứng dụng.

## 2. Tiêu chuẩn Kỹ thuật "Cứng" (Hard Standards)

### 2.1 Safe Area & Hardware Protection
- **Top (Notch/Dynamic Island)**:
    - MANDATORY: `padding-top: env(safe-area-inset-top, 44px);` cho root container.
    - NEVER: Để văn bản dính sát StatusBar. Phải có thêm lề an toàn nội bộ ít nhất `mt-4` (16px).
- **Bottom (Home Indicator)**:
    - MANDATORY: Các nút thao tác chính hoặc Bottom Nav phải nằm trên `safe-area-inset-bottom`.
    - Fallback: Bắt buộc dùng **34px** nếu biến môi trường bị lỗi.

### 2.2 Typography & Hierarchy (Kraft Tokens)
- **Large Title**: Font `Mulish`, weight `900` (Black), size `32px-40px`.
- **Secondary Labels**: Font size `10px`, weight `900`, uppercase, tracking `widest` (0.2em). 
- **Accessibility**: Bắt buộc hỗ trợ Dynamic Type. Không sử dụng fixed height cho các container chứa văn bản dài. Tuyệt đối **KHÔNG để khuyết chữ (truncation)** trên các thành phần điều hướng và nút thao tác chính.

### 2.3 Spacing & Spreads
- **The Golden Margin**: Luôn sử dụng **20px** (`px-5` hoặc `px-6`) cho lề trái/phải trên mobile.
- **Card Spacing**: Các thẻ (`liquid-card`) phải có khoảng cách ít nhất **16px** (`space-y-4`) để tránh cảm giác bị nhồi nhét.

## 3. Quy trình Thẩm định 3 Lớp (Deep Audit Methodology)

AI phải "soi" giao diện qua 3 lớp lăng kính sau:

### 🟢 Lăng kính 1: Hardware Integrity (Trọng số 30%)
- **Immersive**: Nền ứng dụng có tràn ra tận mép màn hình không? Nếu có vạch trắng ở Notch -> **4 ĐIỂM**.
- **Breathing Space**: Nội dung có đang "trôi" nhẹ nhàng giữa màn hình không?

### 🔵 Lăng kính 2: Visual Sophistication (Trọng số 40%)
- **Z-Axis Hierarchy**: Các Modal (`glass-purity`) có đổ bóng mượt (`shadow-2xl`) và mờ nền không?
- **Icon Integrity**: Sử dụng icon đồng bộ (Lucide/SF Symbols) với nét vẽ mảnh, tinh tế.
- **Kraft Palette**: Sử dụng đúng các tokens: `kraft-accent` (Indigo), `kraft-ink` (Dark), `kraft-bg` (Light).

### 🔴 Lăng kính 3: The "Feel" (Trọng số 30%)
- **Instant Response**: Mọi tương tác phải có `active:scale-95`.
- **iOS Gestures**: Vuốt cạnh trái để Back, vuốt xuống để đóng Modal.
- **Micro-animations**: Chuyển tab phải có hiệu ứng trượt mượt mà (spring animation).

## 4. Thang điểm & Báo cáo (Scoring & Reporting)

### 📊 Thang điểm (1 - 10)
- **1-4 (Kém)**: Vi phạm Safe Area, che khuất nội dung, cảm giác "web wrapper" rẻ tiền.
- **5-6 (Khá)**: An toàn nhưng thiếu tinh tế, lề hẹp, font không có phân cấp.
- **7-8 (Cao cấp)**: Đạt chuẩn Native. Sử dụng tốt Large Titles và Glassmorphism.
- **9-10 (Đỉnh cao)**: Không thể phân biệt với app mặc định của Apple. Tích hợp rung (Haptics) và hiệu ứng "Wow".

### 📝 Mẫu báo cáo bắt buộc
AI phải gửi báo cáo theo cấu trúc này sau mỗi task UI:

**Kết quả đánh giá: [X]/10 ([Phân loại])**
- **Hardware**: [Mô tả trạng thái Safe Area]
- **Visual**: [Mô tả phân cấp chiều sâu và Typography]
- **The Feel**: [Mô tả độ trễ và cử chỉ]
- **Action Items**: [Các bước cụ thể để tiến tới 10 điểm]

## 5. Danh sách kiểm tra "Sống còn" (The Survival Checklist)
1. Tiêu đề có bị Notch đè không?
2. Bottom Nav có cách Home Indicator ít nhất 34px không?
3. Vùng chạm có đạt tối thiểu 44x44px không?
4. Đã thêm hiệu ứng `active:scale-95` cho tất cả các nút chưa?
5. Chữ có đọc được khi phóng to 200% không?
6. Các lớp nền (Primary, Secondary) đã phân cấp rõ chưa?

---
*GHI CHÚ: Mọi "Nợ kỹ thuật" liên quan đến UI Mobile sẽ bị AI tự động đánh giá thấp nếu vi phạm bản quy chuẩn này.*
