---
name: design-system-core
description: Hub chuyên môn tối cao về Design System SSoT, Neural Expressive 2.0, Liquid Glassmorphism, Squircle Geometry, Design Tokens OKLCH, 3-Tier Input Sizing, Bio-Morphology Iconography và Chống gãy dòng Anti-Truncation trên Card & Modal.
---

# 🎨 DOMAIN 2: DESIGN SYSTEM & VISUAL SEMANTICS CORE

> **Mã kích hoạt:** `@design` hoặc `design-system-core`  
> **Phạm vi hợp nhất:** `design-system-guide`, `pill-squircle-geometry`, `industrial-color-system`, `field-geometry-standardizer`, `bio-organic-iconography`, `card-modal-sentinel`  
> **Thư viện SSoT:** `src/shared/design-system/` (`BaseCard`, `BaseModal`, `FormElements`, `SmartAmountInput`, `DataDisplay`)  
> **Tiêu chuẩn áp dụng:** W3C Design Tokens (DTCG) • W3C WCAG 2.2 AA • Google Material 3 Expressive • ISO 9241-210

---

## 💎 1. DESIGN TOKENS & BẢNG MÀU CÔNG NGHIỆP (INDUSTRIAL COLOR SYSTEM)

Toàn bộ giao diện Auto 28 tuân thủ triết lý **Neural Expressive 2.0** với tỷ lệ phối màu công nghiệp **60 - 30 - 10**:

* **60% Nền tảng (Background Surface):** Kính mờ nhiều lớp `backdrop-blur-xl`, nền đen tuyền/xám sâu `bg-slate-950/80` hoặc nền sáng sương mù `bg-slate-50/90`.
* **30% Khung nâng đỡ (Cards & Containers):** Thẻ `BaseCard` với viền siêu mảnh Hairline Border (`border border-white/10` hoặc `border-black/5`), hiệu ứng tráng gương Liquid Glass.
* **10% Điểm nhấn Hành động (Accent & State Colors):**
  * **Brand Primary:** Xanh Dương Hoàng Gia / Cyan Gradient (`from-blue-600 to-indigo-600` hoặc `from-emerald-500 to-teal-600`).
  * **Success / Cash In:** `emerald-500` / `teal-400`
  * **Expense / Warning:** `rose-500` / `amber-500`
  * **Độ tương phản WCAG 2.2:** Văn bản thông số tài chính và nhãn luôn đạt tỷ lệ tương phản $\ge 4.5:1$ so với nền.

---

## 🧬 2. HÌNH HỌC SQUIRCLE & VIÊN THUỐC (GEOMETRY MATRIX)

Cấm tuyệt đối sử dụng bo góc nhọn hoặc góc bo tiêu chuẩn thiếu tính hữu cơ:

| Thành Phần Giao Diện | Chuẩn Bo Góc (CSS Class) | Quy Định Hình Học |
| :--- | :--- | :--- |
| **Thẻ lớn / Màn hình chính** | `rounded-[28px]` – `rounded-[32px]` | Góc siêu elip sinh học (Squircle), chống cụt góc khi bo lớn. |
| **Thẻ phụ / Modal Popup** | `rounded-[20px]` – `rounded-[24px]` | `BaseModal` chuẩn Apple Sheet, bo góc ôm khít viền màn hình di động. |
| **Ô nhập liệu (Input Fields)** | `rounded-2xl` (`rounded-[16px]`) | Khớp 1:1 với kích thước 3 tầng của trường dữ liệu. |
| **Chips / Badges / Action Pills** | `rounded-full` | Hình viên thuốc hoàn hảo (Pill Shape), padding cân xứng 2 đầu (`px-3 py-1` hoặc `px-4 py-1.5`). |

---

## 📏 3. CHUẨN HÓA 3 TẦNG KÍCH THƯỚC Ô NHẬP LIỆU (3-TIER INPUT SIZING)

Toàn bộ form nhập liệu phải tuân thủ chuẩn kích thước và hệ lưới 8pt:

1. **Tier 1 — Hero / Financial Input ($56\text{px}$ — `h-14`):**
   * Dùng cho: Nhập số tiền mua xe, giá bán, tiền cọc trong `SmartAmountInput`.
   * Cỡ chữ: `text-xl` hoặc `text-2xl` font đậm (`font-black tracking-tight`).
2. **Tier 2 — Standard Form Field ($48\text{px}$ — `h-12`):**
   * Dùng cho: Tên xe, hãng xe, biển số, họ tên khách hàng, số điện thoại trong `BaseInput`.
   * Vùng chạm đạt chuẩn tối thiểu Apple HIG và Android M3 ($\ge 48\times 48\text{px}$).
3. **Tier 3 — Compact / Filter Input ($40\text{px}$ — `h-10`):**
   * Dùng cho: Thanh tìm kiếm nhanh, bộ lọc năm sản xuất, phân trang.

---

## 🌿 4. NGỮ NGHĨA BIỂU TƯỢNG HỮU CƠ (BIO-ORGANIC ICONOGRAPHY)

* **Ánh xạ ngữ nghĩa 1:1 (Semantic Mapping):**
  * Doanh thu / Báo cáo $\rightarrow$ `BarChart3` hoặc `TrendingUp`
  * Dòng tiền / Chi phí xe $\rightarrow$ `DollarSign` hoặc `Wallet`
  * Bảo dưỡng / Spa xe $\rightarrow$ `Sparkles` hoặc `Wrench`
  * Quản lý xe $\rightarrow$ `Car`
* **Hiệu ứng Kén kính lỏng (Dewdrop Pill):** Biểu tượng được bọc trong khung kén mờ sinh học `w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center`.
* **Trọng số nét động (Dynamic Stroke):** Mặc định `strokeWidth={1.8}`, khi active hoặc hover tự động tăng lên `strokeWidth={2.2}`.

---

## 🛡️ 5. CHỐNG GÃY DÒNG & TRÀN NỘI DUNG (ANTI-TRUNCATION SENTINEL)

* **Số tiền & Mã xe không bao giờ bị cắt cụt:**
  * Dùng `whitespace-nowrap` cho toàn bộ cụm giá tiền (`formatCurrency`), mã xe (`vehicle.code`), biển số.
  * Khi màn hình quá hẹp ($375\text{px}$), tự động hạ cỡ chữ từ `text-lg` xuống `text-sm` bằng responsive font (`text-sm sm:text-base md:text-lg`).
* **Bảo vệ Vùng đáy (Bottom Clearance):**
  * Mọi Modal, Drawer, Bottom Sheet và trang cuộn phải có khoảng đệm an toàn `pb-28` hoặc `pb-[calc(env(safe-area-inset-bottom)+80px)]` để không bao giờ bị thanh điều hướng che khuất nút hành động.
