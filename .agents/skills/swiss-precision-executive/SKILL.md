---
name: Swiss Precision Executive (Auto 28 Edition)
description: Hệ thống kiểm soát và thực thi Tiêu chuẩn Thiết kế & Màu sắc Đỉnh cao "Geneva-Meta Executive" (Sự kết hợp giữa Cơ khí Thụy Sĩ & Hệ sinh thái Meta, Tỷ lệ 60-30-10, Mật độ màu Card ≤2 Accents, WCAG 2.2 AAA, Liquid Glass 2.0, Spring Touch & Haptic Matrix) cho hệ sinh thái Auto 28 Showroom Manager.
---

# 🇨🇭 GENEVA-META EXECUTIVE — MASTER DESIGN SYSTEM & VISUAL SENTINEL
### *Sự Giao Thoa Đỉnh Cao Giữa Chuẩn Mực Cơ Khí Thụy Sĩ & Sự Thân Thuộc Toàn Cầu Của Meta*

> **Tôn chỉ Tối thượng:** Giao diện Auto 28 được xây dựng trên sự giao thoa hoàn hảo: **Chất liệu kính mờ Liquid Glass 2.0 & Viền siêu mảnh 0.5px của Đồng hồ Thụy Sĩ** kết hợp cùng **Bảng màu thân thuộc, dễ dùng $100\%$ không cần học lại của Meta (Facebook Blue, Online Green, Alert Red, Geneva Wash)**.

---

## ═══ I. KIẾN TRÚC 4 TẦNG MÀU HỢP NHẤT (GENEVA-META MASTER PALETTE) ═══

Toàn bộ ứng dụng sử dụng bảng màu Hợp Nhất được định chuẩn trong `src/index.css` và `tokens.ts`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏛️ TẦNG 1: NỀN TẢNG & MẶT KÍNH SƯƠNG MÙ (60% CANVAS & SURFACES)                        │
│ ├─ Canvas Nền Tổng: #F0F2F6 (Geneva Wash: Xám sương mù dịu mắt, chống mỏi mắt)        │
│ ├─ Thẻ BaseCard   : #FFFFFF / 85% + backdrop-blur-xl + border-[#E4E6EB]/80 (Liquid Glass)│
│ ├─ Hộp Phụ Sub-box: #E4E6EB (Nền thanh tìm kiếm, container lọc dữ liệu)               │
│ └─ Viền Hairline  : #E4E6EB (Viền siêu mảnh 0.5px ngăn cách dữ liệu)                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ✒️ TẦNG 2: MỰC IN & PHÂN CẤP CHỮ (30% TYPOGRAPHY & INK)                                │
│ ├─ Mực Chữ Chính  : #050505 (Deep Charcoal Ink: Tương phản cực cao ≥ 15.5:1 WCAG AAA) │
│ ├─ Mực Chữ Phụ    : #65676B (Meta Gray: Năm sản xuất, ODO, Dung lượng pin, Mã xe)     │
│ └─ Chữ Gợi Ý      : #8A8D91 (Placeholder ô nhập liệu, Icon phụ)                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🎯 TẦNG 3: THƯƠNG HIỆU & HÀNH ĐỘNG (10% BRAND & CTAs)                                  │
│ ├─ Meta Royal Blue: #1877F2 (Nút bấm chính "Lưu", "Thêm xe", "Xác nhận", Tab Active)   │
│ ├─ Soft Tint Pill : #E7F3FF (Nền mờ cho Badge trạng thái TRONG KHO)                    │
│ └─ Hero FAB '+'   : Gradient from-[#1877F2] to-[#1D4ED8] + shadow-lg shadow-blue-500/30│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 💰 TẦNG 4: NGỮ NGHĨA TÀI CHÍNH & VÒNG ĐỜI XE (SSoT FINANCIAL SEMANTICS)                │
│ ├─ Dòng Tiền Vào  : #31A24C (Online Emerald: Thu tiền (+), Lợi nhuận, Đã bán)         │
│ ├─ Dòng Tiền Ra   : #FA383E (Alert Crimson: Chi tiền (-), Giá vốn, Hủy cọc, Xóa)      │
│ ├─ Cọc / Tồn Kho  : #F7B125 (Sunburst Amber: Cọc mua/bán, Chờ duyệt bank, Tồn >30d)   │
│ └─ Kiểm Định/Spa  : #0099FF (Messenger Cyan: Xe đang dọn dẹp Spa, Xe đang kiểm định)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ═══ II. KỶ LUẬT MẬT ĐỘ MÀU TỔNG HỢP TRÊN THẺ (CARD DENSITY GATE) ═══

> [!CAUTION]
> **Anti-Pattern "Bảng màu Cây thông Noel":** Cấm nhồi nhét quá 2 màu rực rỡ hoặc bọc kín các thông số phụ trong các khối pill đen đặc.

### Quy Tắc Giới Hạn Cứng Trên Mỗi Card:
1. **Tối đa 2 màu Accent trên 1 Thẻ:**
   * **Accent 1 (Trạng thái xe):** Badge trạng thái ở góc ảnh (`TRONG KHO` - Xanh Meta `#1877F2` hoặc `CỌC MUA` - Hổ phách `#F7B125`).
   * **Accent 2 (Tài chính):** 1 Chỉ số kết quả (`+Lợi nhuận` hoặc `Giá bán`).
2. **Tối đa 2 Viên Thuốc (Pill Badges) trên 1 Thẻ:**
   * 1 Hero Badge nổi trên ảnh xe + 1 Badge trạng thái/hành động dưới chân.
3. **Quy chuẩn Thông số Phụ (Secondary Metadata):**
   * Toàn bộ: Năm sản xuất, ODO, Dung lượng pin, Mã xe, Biển số phải chuyển về **Dạng văn bản phụ thanh mảnh (Secondary Text)** màu `#65676B` có dấu chấm ngăn cách:
     $$\text{2024 • 45.000 km • Tự động • \#VH1407}$$

---

## ═══ III. TIÊU CHUẨN TIẾP CẬN & TƯƠNG PHẢN THỰC TẾ (WCAG 2.2 & APCA) ═══

1. **Độ tương phản thực tế (Rendered Contrast):**
   * Văn bản thường ($< 18\text{pt}$ / $< 24\text{px}$): **$\ge 4.5:1$** (Chuẩn AA) và khuyến khích **$\ge 7.0:1$** (Chuẩn AAA).
   * Mực chữ chính `#050505` trên nền sương `#F0F2F6`: **$\ge 15.5:1$**.
2. **Bảo đảm An toàn Mù Màu (Color Blindness Redundancy - WCAG 1.4.1):**
   * CẤM dùng màu sắc làm tín hiệu nhận thức duy nhất.
   * **Công thức 3 lớp:** $\text{Màu Sắc} + \text{Biểu Tượng Hình Học} + \text{Văn Bản Rõ Nghĩa}$.
   * *Ví dụ:* Số tiền thu nhập luôn có màu Xanh Emerald `#31A24C` + Dấu `+` + Icon `TrendingUp` + Định dạng `₫`.

---

## ═══ IV. KÍNH LỎNG AN TOÀN & XUNG ĐỘT KẾ THỪA (THEME CASCADE GUARD) ═══

1. **Safe Glassmorphism:**
   * Mọi panel kính mờ `backdrop-blur-xl` bắt buộc có độ đục $\ge 75\%$ (`bg-white/85` trên nền sương `#F0F2F6`). Không để ảnh xe cuộn bên dưới làm biến mất chữ.
2. **Explicit Surface-to-Text Binding:**
   * Thẻ cha có nền sáng cố định $\rightarrow$ Chữ bắt buộc là `#050505` / `text-kraft-ink`.

---

## ═══ V. PHẢN HỒI VẬT LÝ & XÚC GIÁC (SPRING TOUCH & CAPACITOR HAPTICS) ═══

```
1. Default  : bg-[#1877F2] text-white shadow-sm
2. Hover    : translateY(-2px) scale-[1.01] brightness-105 transition-all duration-200
3. Press    : translateY(0) scale-[0.96] brightness-90 + Haptics.impact(Light)
4. Focus    : ring-2 ring-[#1877F2] ring-offset-2
5. Disabled : opacity-40 cursor-not-allowed pointer-events-none
```

* **Xúc giác nghiệp vụ:**
  * Thao tác chọn Tab / Filter $\rightarrow$ `Haptics.impact({ style: ImpactStyle.Light })`
  * Thu cọc / Bán xe thành công $\rightarrow$ `Haptics.notification({ type: NotificationType.Success })`
  * Tồn kho >30 ngày / Xóa giao dịch $\rightarrow$ `Haptics.notification({ type: NotificationType.Warning })`
