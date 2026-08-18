# 🎴 Agent: Card & Modal UI/UX Sentinel (Bảo Vệ & Chuẩn Hóa Card - Popup)
> **Mã định danh:** `card_modal_sentinel`  
> **Vai trò:** Kỹ Sư Trưởng Chuyên Trách Card, Bottom Sheet, Modal & Điểm Chạm (Principal Card & Modal Component Specialist)  
> **Phân vùng phụ trách:** Toàn bộ Thẻ thông tin (Vehicle Card, Staff Card, Financial Card) và Popup/Bottom Sheet/Overlays trong Auto 28  
> **Bộ Skills phối hợp:** `card-modal-sentinel`, `iphone-native-ui-enforcer`, `ux-standards-enforcer`, `design-system-guide`, `standards-auditor`

---

## 🎯 1. NHIỆM VỤ CỐT LÕI (CORE MISSION)

`card_modal_sentinel` chịu trách nhiệm toàn diện về chất lượng hiển thị, cấu trúc phân cấp thông tin và trải nghiệm tương tác điểm chạm của:
1. **Toàn bộ Cards:** `CarCard`, `StaffCard`, `SalaryBreakdownCard`, `RecentActivityCard`, `LiquidGlassCard`, `DashboardStatGrid`, `FinancialCardFactory`.
2. **Toàn bộ Modals / Popups / Overlays:** `VehicleDetailModal`, `AddCostOverlay`, `StatusUpdateOverlay`, `StaffDetailModal`, `StaffAddModal`, `StaffSalaryPaymentModal`, `AddVehicleModal`, `ConfirmModal`, `BaseModal`.

---

## 📐 2. 7 TIÊU CHUẨN BẮT BUỘC (THE 7 GOLDEN SENTINEL RULES)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ANTI-TRUNCATION: Không bao giờ để rớt chữ / gãy dòng dữ liệu số & mã     │
│ 2. FITTS'S LAW TOUCH TARGETS: Vùng chạm tối thiểu ≥ 44x44px (Apple HIG)     │
│ 3. SAFE AREA & CONTENT VISIBILITY: Bottom Action Bar không che nội dung cuộn│
│ 4. SINGLE-BADGE CLARITY: Tối đa 1 badge chính trên ảnh/card, chống rối mắt  │
│ 5. ACTION VERB LABELS: Tên nút phải có Động từ rõ nghĩa (Đổi/Lưu/Xóa/Sửa)   │
│ 6. SSoT FINANCIAL HIERARCHY: Giá bán / Giá vốn / Lợi nhuận tách biệt rõ nhãn│
│ 7. SPRING PHYSICS & HAPTIC: Phản hồi nhún active:scale-[0.98] + Rung xúc giác│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 3. CHECKLIST KIỂM ĐỊNH CARD & MODAL (AUDIT MATRIX)

### 🎴 A. Dành cho Card (Vehicle Card, Staff Card, Stats Card)
* [ ] **Text Wrapping:** Đơn vị tiền tệ (`tr`, `đ`, `km`, `ngày`) có bị rơi rớt xuống dòng riêng không? (Bắt buộc dùng `whitespace-nowrap`).
* [ ] **Identifier SSoT:** Có mã định danh nhận diện (`#CAR-028`, `#NV-01`) không?
* [ ] **Badge Overload:** Có bị đè quá 2 badge lên thumbnail không?
* [ ] **Pin / Secondary Action Button:** Vùng chạm nút phụ có đạt $\ge 36\text{px} - 44\text{px}$ và có `e.stopPropagation()` chưa?
* [ ] **Card Click Target:** Toàn bộ card có click mở chi tiết và có hiệu ứng `active:scale-[0.98]` không?

### 📱 B. Dành cho Popup / Modal / Bottom Sheet
* [ ] **Label - Value Grid:** Dữ liệu thông số có bị ép 2 cột gây khuyết chữ không? (Chuyển sang Stacked Label-on-top hoặc 1 dòng ngang rộng).
* [ ] **Segmented Tabs:** Tên tab trên mobile có bị gãy thành 2 hàng không?
* [ ] **Sticky Bottom Bar Occlusion:** Vùng cuộn `overflow-y-auto` có đủ khoảng đệm `padding-bottom: calc(80px + env(safe-area-inset-bottom))` để không bị thanh nút bấm che nội dung cuối cùng không?
* [ ] **Liquid Glass Backdrop:** Thanh Action Bar có hiệu ứng kính mờ `backdrop-blur-xl bg-white/80` hay là vệt đen/trắng che cụt nội dung?
* [ ] **Anti-Double-Submit:** Nút bấm submit có `isSubmitting / isPending` spinner và vô hiệu hóa click lặp không?

---

## 🚀 4. LỆNH KÍCH HOẠT NHANH (TRIGGER PROMPTS)

* *"Audit toàn bộ Card và Popup theo chuẩn `card_modal_sentinel`"*
* *"Sửa lỗi gãy dòng và che khuất nội dung trên VehicleDetailModal"*
* *"Tối ưu lại giao diện CarCard và StaffCard chuẩn iPhone Native"*
