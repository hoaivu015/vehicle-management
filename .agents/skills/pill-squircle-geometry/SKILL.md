---
name: Pill & Squircle Geometry Sentinel (Auto 28 Edition)
description: Hệ thống kiểm soát và thực thi chuẩn hình học bo tròn viên thuốc (Pill Shape rounded-full) và góc bo siêu elip sinh học (Squircle rounded-[20px] - rounded-[32px]) cho toàn bộ Thẻ (Card), Khung ảnh (Image Section), Hộp nhập liệu (Input Field) và Cửa sổ bật lên (Modal/Bottom Sheet) trong hệ sinh thái Auto 28.
---

# 💊 PILL & SQUIRCLE GEOMETRY SENTINEL — AUTO 28 SHOWROOM MANAGER

> **Tôn chỉ tối thượng:** Triệt tiêu hoàn toàn cảm giác cơ khí thô cứng ($90^\circ$ Sharp Corners & Angular Grids). Toàn bộ hệ thống giao diện Auto 28 phải được định hình bởi **Hình thái Sinh học hữu cơ (Biophilic Morphology)** thông qua **Cấu trúc Viên thuốc (Full Pill `rounded-full`)** và **Góc bo siêu elip cực đại (Squircle `rounded-[20px]` đến `rounded-[32px]`)**.

---

## ═══ I. 5 PHÂN TẦNG HÌNH HỌC BO TRÒN (THE 5-TIER GEOMETRY MATRIX) ═══

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 1: VIÊN THUỐC HOÀN TOÀN (`rounded-full`) : Buttons, Pills, Chips, Search, Badges  │
│ TẦNG 2: THẺ SINH HỌC (`rounded-[20px] - [32px]`): CarCard, StaffCard, StatCard, Panels │
│ TẦNG 3: KHUNG ẢNH & MEDIA (`rounded-[20px] - [24px]`): Thumbnail, Car Photo, Upload    │
│ TẦNG 4: HỘP NHẬP LIỆU (`rounded-[16px] - [20px]`): Inputs, Select, Amount Input        │
│ TẦNG 5: POPUP & MODAL (`rounded-t-[40px]` / `[32px]`): Bottom Sheets, Dialogs, Overlays│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ═══ II. BẢNG QUY CHUẨN KỸ THUẬT CHI TIẾT THEO TỪNG THÀNH PHẦN ═══

### 1. 💊 Tầng 1: Viên Thuốc Hoàn Toàn (`rounded-full`)
*Áp dụng cho mọi nút bấm hành động, thẻ trạng thái, thanh chọn và thành phần điều hướng nhỏ:*

| Thành phần UI | Mã Tailwind Chuẩn | Kích thước & Quy chuẩn phụ |
| :--- | :--- | :--- |
| **Nút bấm chính / CTA** | `rounded-full` | Chiều cao `h-11` đến `h-14`, padding ngang `px-6` đến `px-8`. |
| **Active Nav Pill** | `rounded-full` | Kén kính mờ `w-[48px] h-[30px] rounded-full` trượt lò xo. |
| **Nút Hero FAB (+)** | `rounded-full` | Quả cầu `w-[52px] h-[52px] rounded-full` nhô cao `-top-5`. |
| **Thanh chọn Tab con (Segmented)**| `rounded-full` | Khung ngoài `rounded-full p-1`, tab con active `rounded-full`. |
| **Thẻ trạng thái (Status Badge)**| `rounded-full` | Padding `px-3 py-1 text-xs font-bold rounded-full`. |
| **Thanh tìm kiếm (Search Bar)** | `rounded-full` | Hộp tìm kiếm dài bo tròn 2 đầu `h-11 px-5 rounded-full`. |
| **Nút icon phụ / Đóng modal** | `rounded-full` | `w-8 h-8 rounded-full flex items-center justify-center`. |

---

### 2. 🎴 Tầng 2: Thẻ Sinh Học & Khung Chứa (Cards & Panels)
*Áp dụng cho toàn bộ các Card hiển thị danh sách, thống kê và bảng điều khiển:*

| Loại Card / Panel | Mã Tailwind Chuẩn | Quy tắc hiển thị |
| :--- | :--- | :--- |
| **Thẻ xe ngang (Mobile CarCard)** | `rounded-[20px]` | Khung kính mờ `bg-white/60 rounded-[20px] overflow-hidden`. |
| **Thẻ xe dọc (Desktop CarCard)** | `rounded-[32px]` | Khung 3D Squircle `p-6 rounded-[32px] border border-black/5`. |
| **Thẻ chỉ số (Dashboard StatCard)**| `rounded-[24px]` | Thẻ KPI tài chính `p-5 rounded-[24px] backdrop-blur-xl`. |
| **Thẻ nhân sự (StaffCard)** | `rounded-[20px]` đến `rounded-[24px]` | `p-4 rounded-[20px] shadow-sm`. |
| **Bảng lương / Chi phí (SalaryCard)**| `rounded-[20px]` | Khung chi tiết `p-4 rounded-[20px] border border-black/5`. |

---

### 3. 🖼️ Tầng 3: Khung Hình Ảnh & Media (Image & Photo Masking)
*Ngăn chặn hoàn toàn hiện tượng ảnh bị góc nhọn đâm thủng góc bo của thẻ:*

| Thành phần Media | Mã Tailwind Chuẩn | Quy tắc kỹ thuật |
| :--- | :--- | :--- |
| **Thumbnail ảnh xe Mobile** | `rounded-l-[20px]` hoặc `rounded-[16px]` | Khung ảnh `w-[110px] h-[110px] overflow-hidden` đồng bộ viền trái thẻ. |
| **Ảnh đại diện xe Desktop** | `rounded-[24px]` | Khung ảnh `aspect-[1.5/1] rounded-[24px] overflow-hidden`. |
| **Ảnh chi tiết (Modal Gallery)** | `rounded-[20px]` đến `rounded-[24px]` | Khung xem ảnh lớn `max-h-[320px] rounded-[24px]`. |
| **Khung tải ảnh (ImageUploader)** | `rounded-[20px]` | Vùng kéo thả file `border-2 border-dashed rounded-[20px]`. |

---

### 4. 📝 Tầng 4: Hộp Nhập Liệu & Form (Input Fields & Controls)
*Triệt tiêu các ô nhập liệu góc $90^\circ$ thô cứng:*

| Hộp nhập liệu | Mã Tailwind Chuẩn | Quy tắc bổ trợ |
| :--- | :--- | :--- |
| **Hộp số tiền (SmartAmountInput)**| `rounded-[20px]` | Chiều cao `h-14 px-5 bg-white/70 backdrop-blur-xl rounded-[20px]`. |
| **Ô nhập văn bản (BaseInput)** | `rounded-[16px]` đến `rounded-[20px]` | Chiều cao `h-12 px-4 rounded-[16px] border border-black/5`. |
| **Hộp chọn (Select / Dropdown)** | `rounded-[16px]` đến `rounded-[20px]` | `h-12 px-4 rounded-[16px] bg-white/70`. |
| **Ô nhập văn bản dài (Textarea)** | `rounded-[20px]` | `p-4 rounded-[20px] resize-none`. |

---

### 5. 🪟 Tầng 5: Popup, Modal & Bottom Sheet
*Chuẩn iPhone Native cong mềm tối đa:*

| Cửa sổ bật lên | Mã Tailwind Chuẩn | Quy tắc an toàn phần cứng |
| :--- | :--- | :--- |
| **Mobile Bottom Sheet** | `rounded-t-[40px]` | Đỉnh bo cong cực đại `rounded-t-[40px] border-t border-white/20`. |
| **Desktop Dialog Modal** | `rounded-[32px]` | Cửa sổ nổi giữa màn hình `rounded-[32px] p-6 shadow-2xl`. |
| **Thanh kéo (Drag Indicator)** | `w-12 h-1.5 rounded-full` | Thanh điều hướng kéo vuốt nằm trên đỉnh Bottom Sheet. |
| **Dropdown Menu nổi** | `rounded-[20px]` | Bảng menu tùy chọn nổi `p-2 rounded-[20px] backdrop-blur-2xl`. |

---

## ═══ III. 4 CẤM KỴ HÌNH HỌC (GEOMETRIC ANTI-PATTERNS) ═══

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ❌ CẤM 1: Dùng `rounded-none`, `rounded-sm`, `rounded-md` (4-6px) cho Cards & Modals.   │
│ ❌ CẤM 2: Ảnh (Image) có góc vuông 90° phá vỡ góc bo tròn của thẻ cha (bắt buộc         │
│           dùng `overflow-hidden` và đồng bộ `rounded-*`).                              │
│ ❌ CẤM 3: Ô nhập liệu (Input) hình chữ nhật thô cứng cạnh sắc.                          │
│ ❌ CẤM 4: Bottom Sheet di động có 2 góc đỉnh vuông vức.                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ═══ IV. CHECKLIST KIỂM ĐỊNH TỰ ĐỘNG (10-POINT GEOMETRY AUDIT) ═══

| # | Tiêu chí thẩm định | Chuẩn yêu cầu | Trạng thái |
| :- | :--- | :--- | :---: |
| **1** | **Mobile Bottom Sheet Top** | Đỉnh bo cong $\ge \text{rounded-t-[36px]}$ đến `rounded-t-[40px]` | BẮT BUỘC |
| **2** | **Desktop Modal Outer** | 4 góc bo cong $\ge \text{rounded-[28px]}$ đến `rounded-[32px]` | BẮT BUỘC |
| **3** | **Mobile CarCard Radius** | Khung thẻ bo cong `rounded-[20px]` với `overflow-hidden` | BẮT BUỘC |
| **4** | **Desktop CarCard Radius** | Khung thẻ bo cong `rounded-[32px]` với `p-6` đệm thoáng | BẮT BUỘC |
| **5** | **Action Buttons** | Toàn bộ nút bấm chính & phụ dùng `rounded-full` | BẮT BUỘC |
| **6** | **Active Navigation Pill** | Kén kính mờ điều hướng dùng `rounded-full` | BẮT BUỘC |
| **7** | **Smart Amount Input** | Hộp nhập tiền có `rounded-[20px]` và `h-14` | BẮT BUỘC |
| **8** | **Standard Form Inputs** | Ô nhập liệu thường dùng `rounded-[16px]` đến `rounded-[20px]` | BẮT BUỘC |
| **9** | **Image Masking** | Khung ảnh xe có `rounded-[20px] - rounded-[24px] overflow-hidden` | BẮT BUỘC |
| **10**| **No Angular Artifacts** | Triệt tiêu hoàn toàn góc vuông $90^\circ$ và bo thô $< 10\text{px}$ trên khối chính | BẮT BUỘC |
