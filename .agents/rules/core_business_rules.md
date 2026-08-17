# 🛡️ CORE BUSINESS & VEHICLE MANAGEMENT RULES (AUTO 28 SHOWROOM)

Tài liệu này định nghĩa các quy tắc nghiệp vụ bất khả xâm phạm cho hệ thống quản trị showroom Auto 28. Mọi Agent và Lập trình viên bắt buộc phải tuân thủ 100%.

---

## 🚗 1. QUY TẮC ĐỊNH DANH XE: DÙNG MÃ XE (VEHICLE CODE), KHÔNG DÙNG SỐ KHUNG (VIN)

* **Single Source of Truth (SSoT):** Xe trong hệ thống được định danh và truy vết duy nhất thông qua **Mã Xe (`code`)**, ví dụ: `VH1405-01` (Tự động sinh bởi `VehicleCodeGenerator`).
* **Tuyệt đối không sử dụng Số khung (VIN):** 
  * Bảng `vehicles` và `VehicleSchema.ts` không sử dụng trường `vin`.
  * Mọi logic tìm kiếm, lọc, liên kết chi phí, giao dịch cọc và hoa hồng đều gắn liền với trường `code`.

---

## 🔐 2. QUY TẮC PHÂN QUYỀN: CHỈ KẾ TOÁN/ADMIN ĐƯỢC CHUYỂN TRẠNG THÁI XE (SALE KHÔNG CÓ QUYỀN)

* **Phân quyền Nghiệp vụ (RBAC):**
  * **Kế toán (`ACCOUNTANT`) & Admin (`ADMIN`):** Có toàn quyền thực hiện chuyển đổi trạng thái xe qua `VehicleStateMachine` (Cọc mua `DEPOSIT_BUY` $\rightarrow$ Trong kho `IN_STOCK` $\rightarrow$ Cọc bán `DEPOSIT_SALE` / `BANK_DEPOSIT` $\rightarrow$ Đã bán `SOLD` $\rightarrow$ Hủy cọc `IN_STOCK`).
  * **Sale / Nhân viên (`STAFF`):** **TUYỆT ĐỐI KHÔNG CÓ QUYỀN** chuyển trạng thái xe hoặc chỉnh sửa thông tin xe (`EDIT_INVENTORY = false`, `canManageVehicle = false`). Sale chỉ có quyền xem thông tin (`VIEW_INVENTORY`) và cổng cá nhân (`VIEW_PERSONAL`).
* **Bảo vệ Đa Tầng:**
  * **Tầng UI:** Ẩn toàn bộ nút "Trạng Thái", "Lưu thay đổi", và "Chỉnh sửa" đối với role `STAFF`.
  * **Tầng Domain & Application:** Kiểm tra `PermissionService.canManageVehicle(userRole)` trước khi thực thi Use Case `UpdateVehicleStatus`.
