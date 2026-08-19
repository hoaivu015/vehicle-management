---
name: mobile-ux-sentinel
description: Hub chuyên môn tối cao về Trải nghiệm Di động Chuẩn iPhone Native, Safe Area, Dynamic Bottom Navigation, Capacitor Haptic Matrix, Chuẩn hóa Ngôn ngữ viết Showroom và Công thái học nhận thức Fitts/WCAG 2.2.
---

# 📱 DOMAIN 3: MOBILE & NATIVE UX SENTINEL

> **Mã kích hoạt:** `@mobile` hoặc `mobile-ux-sentinel`  
> **Phạm vi hợp nhất:** `iphone-native-ui-enforcer`, `navigation-ui-sentinel`, `ux-standards-enforcer`, `language-terminology-sentinel`  
> **Tiêu chuẩn áp dụng:** Apple Human Interface Guidelines (HIG) • Google Material 3 • W3C WCAG 2.2 AA • ISO 9241-210

---

## 🍎 1. TIÊU CHUẨN IPHONE NATIVE & KHÔNG GIAN AN TOÀN (SAFE AREA)

Mọi layout màn hình, Header, Drawer, và Bottom Bar bắt buộc tích hợp Safe Area native của iOS và Android:

* **Top Bar / Header:**
  ```css
  padding-top: max(16px, env(safe-area-inset-top));
  ```
  Tránh 100% va chạm với Dynamic Island và Notch tai thỏ.
* **Bottom Navigation & Docked FAB:**
  ```css
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  ```
  Tránh va chạm với Home Indicator (Thanh gạt đáy màn hình iOS).
* **Vùng Chạm Công Thái Học (Fitts's Law):**
  * Nút bấm chính (Thêm xe, Ghi nhận chi phí, Lưu cọc) đặt tại **Thumb Zone** (vùng 1/3 dưới màn hình).
  * Kích thước vùng bấm tối thiểu: $44 \times 44\text{px}$ (iOS) hoặc $48 \times 48\text{px}$ (Android/Web).
  * Khoảng cách tối thiểu giữa 2 điểm chạm cạnh nhau $\ge 8\text{px}$.

---

## 🧭 2. THANH ĐIỀU HƯỚNG DI ĐỘNG & NÚT TRUNG TÂM (DYNAMIC BOTTOM NAVIGATION)

* **Cấu trúc Tiêu Chuẩn:**
  * Giới hạn từ **3 đến 5 Tabs** điều hướng chính (ví dụ: *Kho xe*, *Dòng tiền*, *Báo cáo*, *Cài đặt*).
  * **Nút trung tâm Hero Action FAB (`+`):** Nhô cao so với thanh bar, gradient nổi bật, kích hoạt nhanh tác vụ thêm xe / thêm chi phí.
* **Viên Thuốc Hoạt Động (Active Spring Pill):**
  * Tab đang active được bọc bởi viên thuốc tráng gương lỏng (`bg-blue-600/15 text-blue-500 font-bold`).
  * Chuyển động nảy lò xo tự nhiên (`type: "spring", stiffness: 350, damping: 30`).

---

## 📳 3. MA TRẬN PHẢN HỒI XÚC GIÁC (CAPACITOR HAPTIC MATRIX)

Mọi tương tác trên màn hình cảm ứng phải gắn liền với phản hồi xúc giác qua module `haptics` (`src/shared/utils/haptics.ts`):

| Hành Động Người Dùng | Kiểu Haptic Gọi | Mục Đích Trải Nghiệm |
| :--- | :--- | :--- |
| **Chuyển Tab / Bấm nút thường** | `haptics.light()` | Xác nhận điểm chạm nhẹ nhàng |
| **Chọn Preset tiền / Chọn Chip lọc** | `haptics.selection()` | Cảm giác khấc xoay cơ học mượt mà |
| **Thêm chi phí / Thêm xe / Lưu cọc thành công** | `haptics.success()` | Tăng cảm giác thỏa mãn và tin cậy |
| **Xóa chi phí / Hủy giao dịch / Lỗi validation** | `haptics.warning()` / `haptics.error()` | Cảnh báo rõ ràng cho người dùng |

---

## ✍️ 4. CHUẨN HÓA NGÔN NGỮ VIẾT & THUẬT NGỮ SHOWROOM (DOMAIN LEXICON SSoT)

Cấm 100% việc sử dụng khẩu ngữ, tiếng lóng buôn bán chợ trời, teencode hoặc câu từ thiếu tính nghiệp vụ:

| ❌ Từ Cấm / Tiếng Lóng | ✅ Thuật Ngữ Nghiệp Vụ Chuẩn (SSoT) | Ngữ Cảnh Sử Dụng |
| :--- | :--- | :--- |
| *VIN / Số khung* | **Mã xe** (vd: `VH1405-01`) | Định danh và quản lý xe |
| *Tiền gom vào / Giá nhập* | **Giá mua / Giá vốn (COGS)** | Quản trị tài chính xe |
| *Đã bán xong / Đẩy xe đi* | **Đã bàn giao xe / Đã hoàn tất bán** | Trạng thái giao dịch |
| *Spa xe / Dọn nội thất qua loa* | **Làm đẹp & Bảo dưỡng định kỳ** | Danh mục chi phí xe |
| *Kiếm được / Lời lãi* | **Lợi nhuận gộp / Lợi nhuận ròng** | Báo cáo kinh doanh |

* **Thông Báo Lỗi Có Chỉ Dẫn Hành Động (Actionable Error Messages):**
  * ❌ *"Lỗi nhập liệu!"*
  * ✅ *"Vui lòng nhập số tiền chi phí lớn hơn 0 ₫ để tiếp tục."*
