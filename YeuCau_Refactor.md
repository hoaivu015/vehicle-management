# Yêu cầu Refactor Toàn diện Auto28 (Dành cho Gemini Flash)

**Bối cảnh (Context):** 
Ứng dụng Auto28 đang trong quá trình chuyển đổi kiến trúc từ monolith sang **Clean Architecture (Hexagonal)** và **MVP pattern** (nằm trong thư mục `src/modules/`). Tuy nhiên, do quá trình chuyển dịch diễn ra song song nên đang tồn tại một lượng lớn mã nguồn "chết", và cấu trúc Data Flow chưa được tối ưu, gây ra "nút thắt cổ chai" (bottleneck) về hiệu năng. Toàn bộ `STATUSES` và `ROLES` cũ đã được thay thế thành công bằng Enum chuẩn (`VehicleStatus`, `UserRole` trong `src/shared/domain/constants.ts`).

**Mục tiêu cốt lõi (Core Task cho Gemini Flash):** 
Thực hiện dọn dẹp (Cleanup) codebase, loại bỏ Data Flow toàn cục (Global State) và chuyển nốt 2 module còn lại sang kiến trúc MVP.

---

## 🛠 Hướng dẫn chi tiết từng giai đoạn (Execution Steps)

Tài liệu này đóng vai trò là `task.md`. Hãy check lần lượt từng đầu việc dưới đây:

### Giai đoạn 1: Dọn dẹp mã thừa (Dead Code Elimination) - Ưu tiên Cao nhất
Các component cũ trong thư mục `src/components/` đã hoàn toàn bị cắt đứt logic khỏi `App.tsx`. Nhiệm vụ của bạn là xóa bỏ chúng để giải phóng codebase (xóa gần 4.000 dòng code dư thừa).
- [ ] Xóa tệp `src/components/Inventory.tsx`
- [ ] Xóa tệp `src/components/Staff.tsx`
- [ ] Xóa tệp `src/components/Cashflow.tsx`
- [ ] *(Sau khi xóa)* Chạy lệnh `npm run lint` và `npm run build` để đảm bảo hệ thống không bị lỗi broken import nào.

### Giai đoạn 2: Tối ưu hóa Data Flow (Loại bỏ Global State Prop Drilling)
Hiện tại `App.tsx` sử dụng hook `useSupabaseSync` để tải toàn bộ `vehicles`, `staff`, `usersData` và truyền cục bộ (Prop Drilling) xuống các module. Điều này khiến toàn bộ app bị re-render không cần thiết mỗi khi có thay đổi nhỏ ở 1 bản ghi. Hãy chuyển Data Fetching về từng Module tương ứng theo đúng chuẩn Domain-Driven.

- [ ] Sửa `App.tsx`: Xóa logic `useSupabaseSync` đối với `vehicles`, `staff`, `usersData`. Khai tử việc truyền props này vào `DashboardPage`, `InventoryPage`, `StaffPage`, `CashflowPage`. Giữ lại luồng Auth (Authentication state) cho `currentUser`.
- [ ] Sửa `src/modules/finance/presentation/CashflowPage.tsx` và `DashboardPage.tsx`: Nhận dữ liệu tự động thay vì nhận `vehicles`, `staff` từ Props truyền xuống. 
- [ ] Sửa `src/modules/finance/presentation/FinancePresenter.ts`: Khởi tạo và gọi `VehicleRepository`, `StaffRepository` ngay bên trong lớp Presenter để fetch data tự động.
- [ ] Sửa `src/modules/staff/presentation/StaffPage.tsx`: Cập nhật logic để tự sử dụng `StaffPresenter` fetch số lượng tính toán KPI.

### Giai đoạn 3: Module hóa các mảnh ghép cuối cùng (MVP Refactor)
Vẫn còn 2 trang chức năng cũ nằm chơ vơ ngoài hệ thống Module:
- [ ] Chuyển đổi `src/components/PersonalView.tsx`: 
    - Tạo thư mục `src/modules/personal/`
    - Tách logic fetch dữ liệu cá nhân (doanh số, lương) ra `PersonalPresenter.ts`
    - Tách giao diện sang `PersonalPage.tsx`
    - Đảm bảo tuân thủ thiết kế Liquid Skeleton hiện có (giao diện bo mạch, kính trong suốt...).
- [ ] Chuyển đổi `src/components/UserManagement.tsx`:
    - Tạo thư mục `src/modules/users/`
    - Tách logic ra `UserManagementPresenter.ts`
    - Tách UI ra `UserManagementPage.tsx`
- [ ] *(Thành công)* Thay đổi import trong `src/App.tsx` trỏ về 2 trang mới sửa này thay vì components/..

---

## 🛑 Quy tắc bắt buộc (Mandatory Rules)
1. **Source of Truth:** Data Models duy nhất phải dùng là `VehicleStatus`, `UserRole`, `Permission` export từ tệp `src/shared/domain/constants.ts`. (Tuyệt đối không sử dụng lại kiểu String thường).
2. **Repository Pattern:** Không viết các câu lệnh gọi Data trực tiếp bằng `supabase` bên trong file `.tsx`. BẤT KỲ logic dữ liệu nào cũng phải đặt trong Presenter/UseCase thông qua file Repository.
3. **Thao tác An toàn (Safe Steps):** Hãy đọc kĩ Giai đoạn 2. Tính năng `FinancePresenter` đụng đến các tính toán doanh thu rất phức tạp. Hãy cẩn thận khi kết nối tự động Data Fetching cho chúng và đảm bảo Loading Skeleton hiển thị trơn tru.

Bạn (Gemini Flash) hãy lưu tài liệu này thành tệp Checklist cá nhân (hoặc làm file Tracking nhiệm vụ) để bắt tay vào thực hiện từng buớc một một cách nguyên tắc nhé! Đừng quên báo cáo lại sau khi xong mỗi Phase.
