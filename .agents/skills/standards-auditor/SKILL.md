---
name: standards-auditor
description: >
  Hệ thống kiểm định tiêu chuẩn kỹ thuật, bảo mật tài chính và kiến trúc phần mềm
  dành riêng cho Auto 28 Showroom Manager. Tự động xác minh 6 tiêu chuẩn vàng:
  TypeScript Strictness (Zero Any), Clean Architecture Boundary, Mã xe thay vì VIN,
  Quyền kế toán/admin đổi trạng thái xe (Sale không có quyền), SSoT Financial Integrity,
  và iPhone Native UI. Kích hoạt khi user yêu cầu: "kiểm tra tiêu chuẩn", "audit standards",
  "đánh giá chất lượng dự án", hoặc trước khi commit/release.
---

# 🛡️ STANDARDS AUDITOR — AUTO 28 SHOWROOM MANAGER

> **Tiêu chuẩn kiểm định:** ISO 3779 / IEEE P3172 / Clean Architecture MVP / Neural Expressive 2.0  
> **Script tự động hóa:** `npm run audit:standards`

---

## ═══ QUY TRÌNH KIỂM ĐỊNH 6 BƯỚC ═══

Khi được kích hoạt, Agent sẽ chạy quy trình kiểm tra toàn diện 6 lớp:

```
[BƯỚC 1: Type Safety] ──> [BƯỚC 2: Clean Arch] ──> [BƯỚC 3: Vehicle Identity]
                                                          │
[BƯỚC 6: iPhone Native] <── [BƯỚC 5: Financial SSoT] <────┴──> [BƯỚC 4: RBAC Governance]
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

---

## ═══ CÂU LỆNH THỰC THI ═══

```bash
npm run audit:standards
```
