---
name: industrial-standardization
description: >
  Hệ thống chuẩn hóa mã nguồn đạt chuẩn công nghiệp (ISO/IEC 25010, Clean Architecture, 
  Twelve-Factor App). Cung cấp cẩm nang thực thi 5 giai đoạn: Dọn dẹp dependencies dư thừa,
  đồng bộ Zod Schemas & Zero Any, phân tầng kiến trúc IoC Ports, tối ưu state lifecycle
  và tự động hóa kiểm thử. Kích hoạt khi user yêu cầu: "chuẩn hóa dự án", "refactor chuẩn công nghiệp",
  "dọn nợ kỹ thuật", "đạt chuẩn enterprise".
---

# 🏭 INDUSTRIAL STANDARDIZATION PLAYBOOK — AUTO 28

> **Bộ khung áp dụng:** ISO/IEC 25010 Software Quality • Clean Architecture MVP • Twelve-Factor SaaS • OWASP ASVS Level 2  
> **Mục tiêu:** Chuyển đổi mã nguồn chắp vá thành hệ thống phần mềm doanh nghiệp ổn định, sạch sẽ, không lỗi runtime và mở rộng an toàn.

---

## ═══ 5 GIAI ĐOẠN CHUẨN HÓA CÔNG NGHIỆP ═══

### 🔹 GIAI ĐOẠN 1: DEPENDENCY & CODE HYGIENE (Vệ Sinh & Kỷ Luật)

#### 1. Quét và loại bỏ Dependencies rác:
* Kiểm tra danh sách package trong `package.json`. Nếu một package không có bất kỳ dòng `import` nào trong thư mục `src/`, loại bỏ ngay lập tức.
* Khử trùng lặp animation: Chỉ giữ `motion` (`import { motion } from 'motion/react'`), xóa bỏ `framer-motion`.

#### 2. Dọn sạch 100% Cảnh báo Linter:
* Thêm `displayName` cho tất cả các component bọc bởi `React.forwardRef`:
  ```typescript
  export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(...);
  BaseInput.displayName = 'BaseInput';
  ```
* Dọn dẹp các biến thừa `_unused` hoặc xóa bỏ các import không sử dụng.

---

### 🔹 GIAI ĐOẠN 2: DOMAIN PURITY & ZERO ANY (Toàn Vẹn Dữ Liệu SSoT)

#### 1. Chống lỗi Zod Field Dropping:
* Mọi trường dữ liệu có trong `types.ts` và database BẮT BUỘC phải được khai báo trong Zod Schema tương ứng.
* `VehicleSchema.ts` PHẢI chứa `license_plate: zString.optional()` và `expected_profit: zNumber.optional()`.
* `StaffSchema.ts` PHẢI chứa `phone: zString.optional()`, `password_hash: zString.optional()`, `auth_id: zString.optional()`.

#### 2. Xóa bỏ hoàn toàn `as any` & `@ts-ignore`:
* Thay vì `const fin = calculateVehicleFinancials(v as any);` $\rightarrow$ Định nghĩa đúng kiểu dữ liệu đầu vào hoặc parse qua Zod Schema.
* Khi gọi API ngoại vi không rõ type, dùng `unknown` sau đó lập tức parse bằng `Schema.safeParse()`.

---

### 🔹 GIAI ĐOẠN 3: CLEAN ARCHITECTURE & IOC DECOUPLING (Phân Tầng Kiến Trúc)

#### 1. Dependency Inversion trong IoC Container:
* Sửa `DependencyContext.tsx` để interface `Dependencies` khai báo theo Domain Ports (Interfaces) thay vì Concrete Classes:
  ```typescript
  // ❌ SAI: Phụ thuộc vào implementation cụ thể
  export interface Dependencies {
    vehicleRepo: SupabaseVehicleRepository;
  }

  // ✅ ĐÚNG: Phụ thuộc vào Domain Interface
  export interface Dependencies {
    vehicleRepo: VehicleRepository;
    staffRepo: StaffRepository;
  }
  ```

#### 2. Độc lập Presenter khỏi Infrastructure:
* Presenter không được phép nhận trực tiếp Repository để query dữ liệu. Mọi thao tác phải đi qua một UseCase chuyên trách (ví dụ: `GetStaffListUseCase`).

#### 3. Chuẩn hóa vị trí Module:
* Di chuyển `Dashboard` về thư mục `src/modules/dashboard/`.
* Hợp nhất `PersonalPresenter` và `PersonalView` vào cùng một module `src/modules/personal/`.

---

### 🔹 GIAI ĐOẠN 4: STATE MANAGEMENT & RENDERING (Vòng Đời & Hiệu Năng)

#### 1. Nâng State Hook lên Dispatcher Page:
* Tuyệt đối không gọi `useInventoryState()` hay `useCashflowState()` bên trong các view nhánh (`InventoryWebView` / `InventoryMobileView`).
* Gọi state hook tại component điều hướng (`InventoryPage.tsx`), sau đó truyền dữ liệu đã được tính toán xuống view tương ứng qua props.

#### 2. Loại bỏ Cascading Re-renders trong React Effects:
* Không gọi `setState` đồng bộ ngay trong thân hàm `useEffect`. Thay bằng derived state `useMemo` hoặc gọi callback khi có user interaction.

#### 3. Tối ưu Real-time Sync:
* Trong `useSupabaseSync.ts`, thay `select('*')` bằng danh sách các trường cụ thể và thêm debounce 300ms cho các event real-time liên tiếp.

---

### 🔹 GIAI ĐOẠN 5: AUTOMATION & CI/CD VERIFICATION (Kiểm Thử & Đóng Gói)

* Chạy đầy đủ bộ lệnh kiểm tra tự động trước khi hoàn thành bất kỳ task chuẩn hóa nào:
  ```bash
  npx eslint src && npx tsc --noEmit && npm run lint:arch && npm test && npm run audit:standards
  ```
