---
name: zod-schema-sentinel
description: >
  Hệ thống bảo vệ toàn vẹn dữ liệu và phòng chống mất mát thuộc tính khi parse qua Zod
  (Anti-Data-Truncation & Schema Parity). Đồng bộ 2 chiều giữa Database Schema, Domain Types
  và Zod DTOs. Loại bỏ hoàn toàn ép kiểu 'as any' và 'as unknown as'. Kích hoạt khi:
  "sửa schema", "thêm trường dữ liệu", "đồng bộ type", "fix zod", "zero any".
---

# 🛡️ ZOD SCHEMA SENTINEL — DATA INTEGRITY & PARITY GUARD

> **Mục tiêu:** Ngăn chặn việc Zod `.strip()` làm mất các trường quan trọng (như `license_plate`, `phone`, `password_hash`) và đảm bảo 100% dữ liệu từ Database được ánh xạ chính xác sang Domain Entity mà không cần ép kiểu mù quáng (`as any`).

---

## ═══ NGUYÊN TẮC BẤT KHẢ XÂM PHẠM ═══

### 1. NGUYÊN TẮC TAM GIÁC ĐỒNG BỘ (TRIPLE PARITY)
Mỗi thuộc tính dữ liệu của một thực thể (Entity) BẮT BUỘC phải tồn tại đồng thời ở 3 vị trí:
```
           [1. Database Table Column]
                   ▲         ▲
                  /           \
                 ▼             ▼
  [2. Domain Type Interface] ◄──► [3. Zod Schema Definition]
```
Nếu thiếu bất kỳ góc nào trong tam giác:
* Thiếu trong DB $\rightarrow$ **Migration Drift** (Lỗi truy vấn SQL).
* Thiếu trong Domain Type $\rightarrow$ **TypeScript Compile Error** (Không dùng được trong UI).
* Thiếu trong Zod Schema $\rightarrow$ **Silent Data Loss** (Zod tự động xóa trường khi parse).

---

### 2. CHECKLIST BẢO VỆ SCHEMA (SENTINEL CHECKLIST)

Mỗi khi chỉnh sửa hoặc thêm mới thuộc tính:

#### A. Đối với `VehicleSchema.ts` (Thực thể Xe):
- [ ] `id: zNumericId` (Tự động parse string/number sang integer).
- [ ] `code: zString` (Mã xe chuẩn Auto 28 `VHDDMM-XX`).
- [ ] `license_plate: zString.optional()` (Biển số xe - **BẮT BUỘC CÓ**).
- [ ] `expected_profit: zNumber.optional()` (Lợi nhuận kỳ vọng).
- [ ] `cost_history: zArray(CostItemSchema)` (Lịch sử chi phí).
- [ ] `purchase_payment_history: zArray(PaymentItemSchema)`.
- [ ] `sale_payment_history: zArray(PaymentItemSchema)`.
- [ ] `history: zArray(VehicleHistoryEntrySchema)`.

#### B. Đối với `StaffSchema.ts` (Thực thể Nhân sự):
- [ ] `id: zNumericId`.
- [ ] `code: zString`.
- [ ] `name: zString`.
- [ ] `phone: zString.optional()` (**BẮT BUỘC CÓ**).
- [ ] `email: zString`.
- [ ] `department: zString`.
- [ ] `base_salary: zNumber`.
- [ ] `commission_per_car: zNumber`.
- [ ] `target: zNumber`.
- [ ] `password_hash: zString.optional()`.
- [ ] `auth_id: zString.optional()`.

---

## ═══ QUY TẮC BÀI TRỪ "AS ANY" (ZERO-ANY REFACTORING) ═══

### ❌ Pattern Sai (Ép kiểu che giấu lỗi):
```typescript
// Sai: Ép kiểu as any làm mất toàn bộ khả năng kiểm tra type
const fin = calculateVehicleFinancials(v as any);
const staff = await staffRepo.create(formData as any);
```

### ✅ Pattern Đúng (Xác thực qua Schema hoặc DTO):
```typescript
// Đúng: Đảm bảo Input khớp với Schema trước khi tính toán
const parsedInput = FinancialInputSchema.parse(v);
const fin = calculateVehicleFinancials(parsedInput);

// Hoặc map rõ ràng qua DTO đã được xác thực:
const validStaffData = StaffSchema.parse(rawData);
const staff = await staffRepo.create(validStaffData);
```

---

## ═══ SCRIPT TỰ ĐỘNG KIỂM TRA DRIFT ═══

Chạy script kiểm tra lệch pha giữa Database Types và Domain Types:
```bash
node scripts/check-migration-drift.cjs
```
