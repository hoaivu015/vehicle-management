---
name: standards-auditor
description: >
  Hệ thống kiểm định tiêu chuẩn kỹ thuật, bảo mật tài chính và kiến trúc phần mềm
  dành riêng cho Auto 28 Showroom Manager. Tự động xác minh 7 tiêu chuẩn vàng:
  TypeScript Strictness (Zero Any), Clean Architecture Boundary, Mã xe thay vì VIN,
  Quyền kế toán/admin đổi trạng thái xe (Sale không có quyền), SSoT Financial Integrity,
  iPhone Native UI và Pill & Squircle Geometry Compliance Scanner. Kích hoạt khi user yêu cầu: "kiểm tra tiêu chuẩn", "audit standards",
  "đánh giá chất lượng dự án", hoặc trước khi commit/release.
---

# 🛡️ STANDARDS AUDITOR — AUTO 28 SHOWROOM MANAGER

> **Tiêu chuẩn kiểm định:** ISO 3779 / IEEE P3172 / Clean Architecture MVP / Neural Expressive 2.0  
> **Script tự động hóa:** `npm run audit:standards`

---

## ═══ QUY TRÌNH KIỂM ĐỊNH 7 BƯỚC ═══

Khi được kích hoạt, Agent sẽ chạy quy trình kiểm tra toàn diện 7 lớp:

```
[BƯỚC 1: Type Safety] ──> [BƯỚC 2: Clean Arch] ──> [BƯỚC 3: Vehicle Identity]
                                                          │
[BƯỚC 7: Geometry Scanner] <── [BƯỚC 6: iPhone Native] <──┴──> [BƯỚC 4: RBAC Governance]
                                      │
                              [BƯỚC 5: Financial SSoT]
```

---

### BƯỚC 1: Type Safety & Zero Any Check
* Chạy `npx tsc --noEmit` để xác minh 100% không lỗi compile.
* Kiểm tra `strict: true` và không có `any`, `as any`, `@ts-ignore` trong Domain/Application.

### BƯỚC 2: Clean Architecture Layer Boundaries
* Chạy `npm run lint:arch` (.dependency-cruiser.cjs).
* Xác minh: Lõi `Domain` hoàn toàn độc lập với Framework/DB/UI.

### BƯỚC 3: Vehicle Identity Verification
* Kiểm tra `VehicleSchema.ts` và cơ sở dữ liệu:
  * Xe **BẮT BUỘC** dùng **Mã xe (`code`, `VHDDMM-XX`)**.
  * **CẤM** sử dụng trường `vin` (Số khung).

### BƯỚC 4: Permission & Status Governance
* Kiểm tra `PermissionService.ts`:
  * Quyền chuyển trạng thái xe (`EDIT_INVENTORY`) chỉ mở cho `ACCOUNTANT` và `ADMIN`.
  * `STAFF` (Sale) bị chặn 100% quyền sửa xe và đổi trạng thái.
* Kiểm tra giao diện `VehicleDetailModal.tsx` và `VehicleSidebar.tsx`:
  * Nút "Trạng Thái", "Lưu thay đổi", "Chỉnh sửa" chỉ hiển thị khi `isAdminOrAccountant === true`.

### BƯỚC 5: Financial SSoT Integrity
* Kiểm tra các thuật toán tính lợi nhuận, chi phí, dòng tiền tại `src/shared/utils/vehicle_calculations.ts` và `StaffSalaryService.ts`.
* Cấm viết logic tính tiền trong UI Components.

### BƯỚC 6: iPhone Native UI & Design System
* Vùng chạm tối thiểu $44 \times 44\text{px}$.
* An toàn Safe Area (`env(safe-area-inset-top/bottom)`).
* Không dùng thư viện UI bên ngoài, chỉ dùng `src/shared/design-system/`.

### BƯỚC 7: Pill & Squircle Geometry Compliance (Automated AST/Regex Scanner)
* Tự động quét toàn bộ cây mã nguồn các Component TSX trong `src/`.
* **CẤM** dùng các class `rounded` (4px), `rounded-sm` (2px), `rounded-md` (6px) ad-hoc trên các inline badge, status, chip hay button.
* **BẮT BUỘC** dùng chuẩn **Viên thuốc (`rounded-full`)** cho mọi badge, button, indicator và chuẩn **Squircle (`rounded-[20px] - rounded-[32px]`)** cho Card & Modal.

---

## ═══ BẢNG ĐÁNH GIÁ ĐIỂM SỐ ═══

| Hạng mục | Điểm tối đa | Tiêu chuẩn |
| :--- | :---: | :--- |
| **1. TypeScript Compile & Zero Any** | 15 điểm | 0 lỗi compile, 0 any bypass |
| **2. Clean Architecture Boundary** | 15 điểm | 0 vi phạm dependency giữa các tầng |
| **3. Vehicle Identity (Mã xe thay vì VIN)** | 15 điểm | 100% dùng `code`, không có `vin` |
| **4. Permission Governance (Kế toán/Admin)** | 15 điểm | Sale không có quyền đổi trạng thái xe |
| **5. Financial SSoT Integrity** | 15 điểm | 100% dùng hàm tính toán tập trung |
| **6. iPhone Native & Safe Area** | 10 điểm | Safe area insets, Touch Target $\ge 44\text{px}$ |
| **7. Pill & Squircle Geometry Scanner** | 15 điểm | 100% Badges là `rounded-full`, Cards là `rounded-t2` |
| **TỔNG CỘNG** | **100 điểm** | **Yêu cầu 100/100 để RELEASE** |
