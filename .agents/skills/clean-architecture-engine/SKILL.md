---
name: clean-architecture-engine
description: Hub chuyên môn tối cao về Kiến trúc mã nguồn, Clean Architecture, Hexagonal Ports, Inversion of Control, Zod Schema Parity (Zero Any), React 19 State Lifecycle, SSoT Repository/Use Cases và Kiểm định chất lượng nhị phân.
---

# 🏗️ DOMAIN 1: CLEAN ARCHITECTURE & CODE INTEGRITY ENGINE

> **Mã kích hoạt:** `@arch` hoặc `clean-architecture-engine`  
> **Phạm vi hợp nhất:** `clean-surgical-nextjs`, `clean-architecture-nextjs`, `domain-driven-hexagon`, `explicit-architecture`, `industrial-standardization`, `zod-schema-sentinel`, `state-lifecycle-optimizer`, `standards-auditor`  
> **Tiêu chuẩn áp dụng:** ISO/IEC 25010 • Clean/Hexagonal Architecture • Twelve-Factor App • TypeScript Strictness

---

## 🏛️ 1. PHÂN TẦNG KIẾN TRÚC BẮT BUỘC (HEXAGONAL CLEAN ARCHITECTURE)

Mọi module trong `src/modules/*` bắt buộc tuân thủ nghiêm ngặt 4 tầng phân lập:

```
src/modules/[module_name]/
├── domain/                  ← TẦNG 1: THỰC THỂ & HỢP ĐỒNG (CORE BUSINESS)
│   ├── entities/            ← Domain Entities & Interfaces (Pure TypeScript)
│   ├── ports/               ← Repository Interfaces & Service Contracts
│   └── services/            ← Domain Calculation Services (SSoT Business Logic)
├── application/             ← TẦNG 2: USE CASES (ORCHESTRATION)
│   ├── use-cases/           ← Các Use Case cụ thể (1 UseCase = 1 Nhiệm vụ)
│   └── dtos/                ← Data Transfer Objects & Command Payloads
├── presentation/            ← TẦNG 3: GIAO DIỆN & PRESENTERS
│   ├── components/          ← Dumb UI Components (Chỉ nhận Props, không gọi DB)
│   ├── hooks/               ← Custom Hooks quản lý UI State & View Lifecycle
│   └── presenters/          ← Presenters chuyển đổi Domain Model thành ViewModel
└── infrastructure/          ← TẦNG 4: HẠ TẦNG NGOẠI VI
    ├── repositories/        ← Triển khai Repository (Supabase, LocalStorage, Fetch)
    └── mappers/             ← Chuyển đổi dữ liệu DB thô ◄► Domain Entities
```

### 🔹 Quy tắc Chiều Phụ Thuộc (Dependency Rule):
* **Tầng trong KHÔNG BIẾT tầng ngoài:** `Domain` hoàn toàn độc lập, không import từ `Application`, `Presentation` hay `Infrastructure`.
* **Inversion of Control (IoC):** Tầng `Application` và `Presentation` chỉ tương tác với `Domain Ports` (Interfaces), các Repository cụ thể được inject qua IoC Container (`src/shared/container.ts`).

---

## 🛡️ 2. TOÀN VẸN DỮ LIỆU & ZERO ANY (ZOD SCHEMA SENTINEL)

* **Zero Any Mandate:** Cấm 100% `any`, `as any`, `as unknown as`, `@ts-ignore`.
* **Hai Chiều Schema Parity (Anti-Data-Truncation):** Mọi trường dữ liệu nhận từ Supabase hoặc API ngoại vi bắt buộc phải được định nghĩa đầy đủ trong Zod Schema:
  ```typescript
  // Ví dụ: Không được bỏ sót các trường phụ trợ
  export const VehicleSchema = z.object({
    id: z.string().uuid(),
    code: z.string().min(1), // Mã xe SSoT, cấm dùng VIN
    name: z.string(),
    license_plate: z.string().nullable().optional(),
    purchase_price: z.number().nonnegative(),
    sale_price: z.number().nullable().optional(),
    cost_history: z.array(CostItemSchema).default([]),
    status: VehicleStatusSchema,
    created_at: z.string()
  });
  export type Vehicle = z.infer<typeof VehicleSchema>;
  ```

---

## ⚡ 3. TỐI ƯU HÓA VÒNG ĐỜI STATE REACT 19 (STATE LIFECYCLE)

* **Dispatcher Page Pattern:**
  * Toàn bộ state chung (`vehicles`, `selectedVehicle`, `filters`, `loading`) được khởi tạo tại Component Dispatcher cấp cao nhất (ví dụ: `InventoryPage.tsx`).
  * Truyền state và handlers xuống dưới các view con (`InventoryWebView`, `InventoryMobileView`) để chống mất dữ liệu khi resize màn hình hoặc xoay ngang điện thoại.
* **Khử Cascading Re-renders:**
  * Cấm tuyệt đối việc gọi `setState` đồng bộ trong `useEffect` khi phụ thuộc vào một state khác.
  * Sử dụng derived state (`useMemo`) hoặc gom cập nhật vào Event Handlers / State Machine.
* **Optimistic UI:** Cập nhật UI ngay lập tức với trạng thái giả định ($0\text{ms}$ latency), thực hiện sync nền với Supabase và rollback tự động nếu thất bại.

---

## 🚦 4. KIỂM ĐỊNH CHẤT LƯỢNG NHỊ PHÂN (STANDARDS AUDITOR GATE)

Trước khi xác nhận hoàn thành bất kỳ thay đổi nào liên quan đến Kiến trúc / Logic, phải kiểm tra 5 rào chắn chất lượng:

1. `npx tsc --noEmit` $\rightarrow$ Phải pass 100% không có lỗi type.
2. `npx eslint src` $\rightarrow$ Không có warning nghiêm trọng hoặc vi phạm `no-explicit-any`.
3. Kiểm tra RBAC: Đảm bảo quyền đổi trạng thái và sửa kho xe được bảo vệ qua `PermissionService` (chỉ `ACCOUNTANT` / `ADMIN`).
4. Kiểm tra SSoT Finance: Không có phép tính tiền trong UI components.
5. Kiểm tra Mã xe: 100% sử dụng `code`, không chứa trường `vin`.
