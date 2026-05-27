# 🏆 Tiêu Chuẩn Chất Lượng & Nguyên Tắc Kỹ Thuật (QUALITY_STANDARDS)

Tài liệu này định nghĩa các tiêu chuẩn vàng về kỹ thuật, kiến trúc và thiết kế dành cho hệ thống **Auto 28**. Mọi thành viên và AI tham gia phát triển dự án bắt buộc phải tuân thủ.

---

## 🏗️ 1. Kiến Trúc & Cấu Trúc Code (Architecture)

Dự án áp dụng **Clean Architecture** kết hợp mô hình **MVP (Model-View-Presenter)**.

### 🧱 Phân Lớp (Layering)
- **Domain Layer (`src/modules/*/domain`):** Chứa thực thể (Entities), Logic nghiệp vụ lõi, và Interface cho Repository. Tuyệt đối không phụ thuộc vào framework (Next.js, Supabase).
- **Application Layer (`src/modules/*/application`):** Chứa các Use Case (Interactors). Điều phối dữ liệu từ Repository và thực hiện nghiệp vụ.
- **Presentation Layer (`src/modules/*/presentation`):** Chứa Presenter (Logic điều khiển UI) và ViewModel. Tách biệt hoàn toàn Logic khỏi React Component.
- **Infrastructure Layer (`src/modules/*/infrastructure`):** Triển khai Repository (kết nối Supabase, Prisma, API ngoài).
- **UI Layer (`src/modules/*/presentation/components`):** Chỉ chứa React Component (Markup & Styling).

### 📐 Nguyên Tắc Vàng
- **Strict Dependency Rule:** Các lớp bên trong không được biết về các lớp bên ngoài. `Domain` là trung tâm.
- **Single Responsibility (SRP):** Mỗi file, mỗi class, mỗi function chỉ làm một việc duy nhất.
- **Mapper Pattern:** Luôn sử dụng Mapper để chuyển đổi dữ liệu khi đi qua các ranh giới lớp (Layer Boundaries).
- **Dependency Injection (DI):** Tuyệt đối KHÔNG khởi tạo Repository hoặc Use Case thủ công bên trong các React Hook. Bắt buộc sử dụng `DependencyProvider` và `useDependencies()`.


---

## 💰 2. Tính Toàn Vẹn Tài Chính (Financial Integrity)

Hệ thống tài chính là trái tim của Auto 28. Sai sót về con số là không được chấp nhận.

### 💹 Luật Cash Flow (Dòng tiền thực)
- **Doanh thu:** Tính dựa trên `amount` thực tế từ `sale_payment_history`.
- **Chi phí:** Tính dựa trên `amount` thực tế từ `purchase_payment_history`.
- **Cấm:** Sử dụng giá niêm yết (Sale Price/Purchase Price) để tính toán dòng tiền tháng.

### 🛡️ Single Source of Truth (SSoT)
- **Lợi nhuận:** Phải sử dụng bộ hàm chuẩn tại `src/shared/utils/vehicle_calculations.ts`.
- **Lương thưởng:** Phải thông qua `StaffSalaryService.ts`.
- **UI Standard:** Mọi giao diện tổng hợp tài chính (Financial Summary) bắt buộc sử dụng pattern **Executive Financial Matrix** (2 cột: P&L Math + Cashflow Ledger).
- **Cấm:** Viết logic tính toán tiền bạc trực tiếp trong Component hoặc Presenter.

---

## 👤 3. Quản Lý Danh Tính (Identity)

- **Mã Nhân Viên (Staff Code):** Luôn dùng `code` (ví dụ: `NV01`) làm định danh duy nhất trong logic (thưởng, doanh số).
- **Cấm Email Fallback:** Không sử dụng email để so sánh danh tính nhân viên trong code.

---

## 🎨 4. Tiêu Chuẩn UI/UX & Thẩm Mỹ (Design Excellence)

Thiết kế phải mang lại cảm giác **Premium, Hiện đại và Tin cậy**.

### 🌟 Thẩm Mỹ (Aesthetics)
- **Phong cách:** Hiện đại, sạch sẽ. Sử dụng Glassmorphism, Dark Mode (nếu được yêu cầu), và bảng màu Slate/Zinc sang trọng.
- **Độ tương phản:** Đảm bảo tỉ lệ tương phản tối thiểu 4.5:1 (WCAG AA).
- **Khoảng cách (Spacing):** Tuân thủ hệ thống spacing của Tailwind (8px grid).
- **Trình bày:** Tuyệt đối **KHÔNG để khuyết chữ, thiếu chữ** (truncation) ở tiêu đề, nhãn và nút bấm. Layout phải linh hoạt để hiển thị toàn bộ nội dung quan trọng.
- **Căn lề (Alignment):** Mọi thành phần trong danh sách, form và bảng phải **thẳng hàng tuyệt đối**. Không chấp nhận bố cục so le (zigzag) giữa các hàng hoặc các khối thông tin liền kề. Sử dụng Grid/Flex chuẩn để duy trì trục dọc đồng nhất.

### 🖱️ Tương Tác (Interaction)
- **Feedback:** Mọi hành động click phải có phản hồi thị giác (hover, active states).
- **Cursor:** Luôn thêm `cursor-pointer` cho các phần tử có thể tương tác.
- **Icons:** Sử dụng bộ icon SVG đồng nhất (Lucide). **Tuyệt đối không dùng Emoji làm Icon UI.**
- **Animation:** Chuyển cảnh mượt mà (150ms-300ms), không gây giật lag hoặc xê dịch layout.

---

## 💻 5. Tiêu Chuẩn Kỹ Thuật (Technical Standards)

- **TypeScript:** Phải định nghĩa Type/Interface rõ ràng. Hạn chế tối đa sử dụng `any`.
- **Next.js:** Sử dụng App Router, tối ưu hóa Server Components cho hiệu năng.
- **Error Handling:** Luôn có `try-catch` và thông báo lỗi thân thiện qua `useNotification`.
- **Data Sync:** Luôn tính toán lại các trường tài chính tổng hợp (`total_profit`, `total_cost`) khi cập nhật dữ liệu để tránh dữ liệu cũ (Stale Data).

---

## 🛠️ 7. Kiểm Toán Nợ Kỹ Thuật (Technical Debt Audit - 29/04/2026)

- [x] **Inventory Module:** Đã refactor sang hệ thống DI tập trung.
- [x] **Staff Module:** Đã refactor sang `DependencyContext` và `createStaffPresenter`.
- [x] **Finance Module:** Đã tích hợp vào `DependencyContext`.
- [x] **Notification System:** Đã chuẩn hóa sử dụng `NotificationService` và `useNotification` abstraction.
- [x] **Type Integrity:** Đã đồng nhất hệ thống Type giữa Domain Interface và Infrastructure Schema (Zod).
- [x] **Unit Testing:** Đã bổ sung bộ test toàn diện cho `vehicle_calculations.ts` và `StaffSalaryService.ts`. Đã dọn dẹp mock data trong toàn bộ project.
- [x] **Zod Standardization:** Tất cả repository đã áp dụng triệt để `createValidatedRepository` và cơ chế `_sanitize` tập trung.

