---
name: Industrial Color System & Accessibility Sentinel (Auto 28 Edition)
description: Hệ thống kiểm soát và thực thi Tiêu chuẩn Màu sắc Công nghiệp (WCAG 2.2 AA/AAA, APCA, Mật độ màu tổng hợp Composite Density, W3C DTCG Tokens, OKLCH/Display P3 Gamut, Tỷ lệ 60-30-10, Dark Mode Elevation và An toàn Mù màu) cho hệ sinh thái Auto 28 Showroom Manager.
---

# 🎨 INDUSTRIAL COLOR SYSTEM & ACCESSIBILITY SENTINEL — AUTO 28

> **Tôn chỉ tối thượng:** Màu sắc trong ứng dụng không đơn thuần là thẩm mỹ trang trí mà là một **Hệ thống Ngữ nghĩa Kỹ thuật (Semantic Engineering System)**. Mọi quyết định màu sắc phải thỏa mãn 5 tiêu chuẩn công nghiệp: **Độ tương phản tiếp cận thực tế (WCAG 2.2 / APCA)**, **Mật độ màu tổng hợp trên 1 Card (Composite Chromatic Density $\le 2$ Accents)**, **Cấu trúc phân bổ thị giác (Quy tắc 60-30-10)**, **Không gian màu chính xác (OKLCH)** và **Độ an toàn cho người khiếm thị / mù màu (Color Blindness Redundancy)**.

---

## ═══ I. 6 TRỤ CỘT MÀU SẮC CÔNG NGHIỆP (THE 6 COLOR PILLARS) ═══

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TRỤ CỘT 1: TIẾP CẬN & TƯƠNG PHẢN THỰC TẾ (WCAG 2.2 AA/AAA & APCA Perceptual Contrast)  │
│ TRỤ CỘT 2: MẬT ĐỘ MÀU TỔNG HỢP (Composite Chromatic Density: Max 2 Accents / 2 Pills)  │
│ TRỤ CỘT 3: PHÂN BỔ TỶ LỆ THỊ GIÁC (Nguyên tắc 60% Nền - 30% Cấu trúc - 10% CTA)        │
│ TRỤ CỘT 4: HỆ THỐNG TOKEN 3 TẦNG DTCG (Primitive ➔ Semantic ➔ Component Tokens)        │
│ TRỤ CỘT 5: PHÒNG CHỐNG XUNG ĐỘT KẾ THỪA GIAO DIỆN (Theme Cascade & Dark Mode Guard)    │
│ TRỤ CỘT 6: PHỔ 5 TRẠNG THÁI TƯƠNG TÁC (Default ➔ Hover ➔ Active ➔ Focus ➔ Disabled)   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ═══ II. MA TRẬN MẬT ĐỘ MÀU TỔNG HỢP TRÊN MỘT THẺ (COMPOSITE CHROMATIC DENSITY) ═══

> [!CAUTION]
> **Hiện tượng "Bảng Màu Cầu Vồng" (Christmas Tree / Chromatic Overload):** Khi một thẻ con (Card) bị nhồi nhét quá nhiều màu sắc khác nhau (Xanh lá + Tím + Đen + Xanh Cyan + Đỏ + Vàng), mắt người dùng sẽ bị phân mảnh nhận thức, không thể xác định đâu là thông tin trọng tâm.

### Quy Tắc Giới Hạn Cứng Trên Mỗi Khung Thẻ (Card Density Rules):
1. **Tối đa 2 màu Accent trên 1 Card:**
   * **Accent 1 (Trạng thái chính):** 1 Badge trạng thái xe (`TRONG KHO` / `CỌC MUA` / `ĐÃ BÁN`).
   * **Accent 2 (Hành động hoặc Tài chính):** 1 Chỉ số kết quả (`+Lợi nhuận` hoặc Nút bấm chính).
2. **Tối đa 2 Viên Thuốc (Pill Badges) trên 1 Card:**
   * 1 Hero Badge trên ảnh + 1 Action/Status Badge dưới chân.
   * **CẤM:** Biến mọi thông số phụ (Năm sản xuất, ODO, Dung lượng pin, Mã xe) thành các viên thuốc đen than nặng nề. Phải sử dụng **Dạng văn bản phụ thanh mảnh (Secondary Text)** có dấu chấm ngăn cách (`2024 • 60.000 km • #VH1407`).
3. **Đồng bộ bảng màu Neutral cho thông số phụ:**
   * 100% thông số kỹ thuật phụ phải dùng bảng màu trung tính (`text-slate-500`, `text-kraft-ink/60`), cấm dùng màu Tím/Hồng/Xanh ngọc tùy tiện cho các tag phụ.

---

## ═══ III. PHÒNG CHỐNG XUNG ĐỘT KẾ THỪA GIAO DIỆN (THEME CASCADE GUARD) ═══

> [!WARNING]
> **Lỗi Nuốt Chữ (Invisible Text Bug):** Xảy ra khi một component dùng `dark:text-white` nhưng lại nằm bên trong một Card có nền sáng (`bg-white` hoặc `bg-white/60`) do kế thừa class `.dark` hoặc style cha chưa đồng bộ.

### 3 Nguyên Tắc Chống Lỗi Kế Thừa Giao Diện:
1. **Explicit Surface-to-Text Binding:**
   * Nếu thẻ cha có nền sáng cố định (`bg-white` hoặc `bg-white/60`), màu chữ bắt buộc phải là màu tối cố định (`text-slate-900` / `text-kraft-ink`). Tuyệt đối không dùng `dark:text-white` khi thẻ cha không chuyển sang `dark:bg-slate-900`.
2. **Kính Lỏng Tương Phản An Toàn (Safe Glassmorphism):**
   * Các bề mặt kính `backdrop-blur-xl` phải có độ đục tối thiểu `bg-white/70` (Light) hoặc `bg-slate-950/75` (Dark) để ngăn không cho nội dung/hình ảnh cuộn bên dưới làm mất độ tương phản chữ.
3. **Kiểm Tra Rendered Contrast (Không chỉ quét AST):**
   * Đánh giá độ tương phản phải dựa trên màu sắc thực tế hiển thị trên màn hình người dùng, không chỉ dựa vào tên class CSS.

---

## ═══ IV. MA TRẬN TIÊU CHUẨN ĐỘ TƯƠNG PHẢN (CONTRAST MATRIX) ═══

### 1. Bảng Quy Chuẩn Tương Phản WCAG 2.2
Mọi văn bản, biểu tượng và thành phần tương tác trong ứng dụng phải vượt qua các ngưỡng tương phản tối thiểu sau:

| Đối tượng hiển thị | Kích thước / Thuộc tính | Chuẩn tối thiểu (WCAG AA) | Chuẩn nâng cao (WCAG AAA) |
| :--- | :--- | :---: | :---: |
| **Văn bản thường (Normal Text)** | Nhỏ hơn 18pt (24px) hoặc nhỏ hơn 14pt (18.5px) bold | **$\ge 4.5 : 1$** | **$\ge 7.0 : 1$** |
| **Tiêu đề / Số liệu lớn (Large Text)** | Từ 18pt (24px) hoặc 14pt (18.5px) bold trở lên | **$\ge 3.0 : 1$** | **$\ge 4.5 : 1$** |
| **Thành phần điều khiển UI (UI Controls)** | Đường viền Input, Nút bấm, Checkbox, Radio | **$\ge 3.0 : 1$** | **$\ge 4.5 : 1$** |
| **Biểu tượng đồ họa (Graphical Icons)** | Icons trạng thái, Icon hành động không có chữ đi kèm | **$\ge 3.0 : 1$** | **$\ge 4.5 : 1$** |

### 2. Nguyên Tắc An Toàn Người Mù Màu (WCAG 1.4.1 - Color As Secondary Cue)
* ❌ **CẤM:** Dùng duy nhất màu Đỏ/Xanh để biểu thị Thành công / Lỗi mà không có Icon hoặc Text.
* ✅ **BẮT BUỘC:** Đi kèm ký hiệu hình học hoặc nhãn văn bản:
  * **Success:** Màu Xanh lá (`oklch(70% 0.18 150)`) + Icon `CheckCircle2` + Text "Thành công / Đã duyệt".
  * **Error / Destructive:** Màu Đỏ (`oklch(60% 0.22 25)`) + Icon `AlertCircle` + Text "Lỗi / Đã hủy".
  * **Warning:** Màu Hổ phách (`oklch(80% 0.15 75)`) + Icon `AlertTriangle` + Text "Cảnh báo / Chờ duyệt".

---

## ═══ V. QUY TẮC PHÂN BỔ 60 - 30 - 10 TRONG GIAO DIỆN ═══

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 60% MÀU NỀN CHỦ ĐẠO (Canvas & Background): Off-white / Neutral-50 / Slate-950          │
│ ├─ Tạo không gian thở (White space), giảm tải thị giác và không gây mỏi mắt.          │
│                                                                                        │
│ 30% MÀU CẤU TRÚC (Cards, Modals, Dividers, Neutral Texts): Surface-100/200, Text-900  │
│ ├─ Định hình bố cục khối (Cards, Panels, Tables, Sidebar, Typography cấp 1 & 2).      │
│                                                                                        │
│ 10% MÀU ĐIỂM NHẤN (Accent / Primary CTA / Status Badges): Cobalt Blue, Coral, Emerald  │
│ └─ Dẫn mắt người dùng tới hành động quan trọng nhất (Save, Submit, Active Tab, Hot KPI).│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ═══ VI. HỆ THỐNG MÀU NGỮ NGHĨA SSoT (OKLCH TOKENS) ═══

```css
@theme {
  /* 🏷️ TẦNG 1: NỀN & BỀ MẶT (SURFACE & CANVAS) */
  --color-kraft-bg: oklch(100% 0 0);           /* Nền Canvas sáng */
  --color-kraft-folder: oklch(96.25% 0 0);      /* Nền thẻ phụ / Container */
  --color-kraft-ink: oklch(15% 0 0);            /* Chữ chính (Tránh Pure Black #000) */
  --color-surface-pure: oklch(98.5% 0 0);       /* Nền thẻ Card nổi */
  --color-hairline: oklch(90% 0 0);             /* Viền phân cách Divider */

  /* 🏷️ TẦNG 2: MÀU THƯƠNG HIỆU & HÀNH ĐỘNG (BRAND & ACCENT) */
  --color-kraft-accent: oklch(45% 0.18 260);    /* Cobalt Blue Primary */
  --color-accent-soft: oklch(45% 0.18 260 / 0.1); /* Nền nút phụ / Badge nền mờ */

  /* 🏷️ TẦNG 3: MÀU TÀI CHÍNH & TRẠNG THÁI (SSoT FINANCIAL & STATUS) */
  --color-income: oklch(70% 0.18 150);          /* Thu tiền / Lợi nhuận / Đã bán */
  --color-expense: oklch(60% 0.22 25);          /* Chi phí / Giá vốn / Đã hủy */
  --color-warning: oklch(80% 0.15 75);          /* Đang xử lý / Cọc xe / Tạm tính */
}
```

---

## ═══ VII. QUY CHUẨN 5 TRẠNG THÁI TƯƠNG TÁC (INTERACTIVE SPECTRUM) ═══

```
1. Default  : Sắc độ cơ sở (VD: bg-blue-600 / text-white)
2. Hover    : Tăng/giảm độ sáng 8-12% (VD: hover:bg-blue-700 hoặc hover:brightness-105)
3. Active   : Nén độ sáng 15-20% kèm hiệu ứng vật lý (VD: active:scale-95 active:bg-blue-800)
4. Focus    : Focus ring kép tương phản cao (VD: focus:ring-2 focus:ring-blue-500 focus:ring-offset-2)
5. Disabled : Giảm opacity còn 35-40%, cursor-not-allowed, loại bỏ hoàn toàn hover/click event
```

---

## ═══ VIII. 8 CẤM KỴ MÀU SẮC TUYỆT ĐỐI (ANTI-PATTERNS) ═══

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ❌ CẤM 1: Nhồi nhét quá 2 màu Accent hoặc quá 2 viên thuốc (Pill Badges) trên 1 Card.  │
│ ❌ CẤM 2: Dùng `dark:text-white` trên thẻ có nền sáng gây lỗi nuốt chữ (Invisible Text)│
│ ❌ CẤM 3: Biến thông số phụ (Năm, Odo) thành các khối viên thuốc đen than nặng nề.    │
│ ❌ CẤM 4: Dùng chữ màu xám nhạt trên nền trắng vi phạm WCAG AA (Contrast < 4.5:1).     │
│ ❌ CẤM 5: Dùng màu Pure Black #000000 tuyệt đối làm màu chữ hoặc màu nền Dark Mode.   │
│ ❌ CẤM 6: Dùng màu sắc làm tín hiệu duy nhất mà không có Icon hoặc Text hỗ trợ.        │
│ ❌ CẤM 7: Lạm dụng màu Accent > 15% diện tích hiển thị gây nhiễu loạn thị giác.       │
│ ❌ CẤM 8: Hardcode mã HEX tùy tiện (#ff0000, #3b82f6) thay vì dùng Semantic Token.     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
