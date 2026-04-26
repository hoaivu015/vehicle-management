# Auto28 Showroom Manager - Liquid Glass Edition

Hệ thống quản lý showroom ô tô chuyên nghiệp, tập trung vào hiệu suất kinh doanh, dòng tiền và quản lý nhân sự. Được xây dựng với kiến trúc Clean Architecture và giao diện Liquid Glass 2.0.

## 🚀 Công nghệ sử dụng

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 + Liquid Glass Design System
- **Backend/DB:** Supabase (PostgreSQL, Auth, Realtime)
- **State Management:** Clean Architecture (Presenter Pattern)
- **Testing:** Vitest
- **UI Components:** Mantine v9 + Lucide Icons + Framer Motion

## 🏗 Kiến trúc (Architecture)

Dự án tuân thủ nguyên lý **Clean Architecture / Hexagonal Architecture**:
- `domain/`: Chứa các quy tắc nghiệp vụ cốt lõi (Entities, Value Objects, State Machines). Không phụ thuộc vào bất kỳ library nào.
- `application/`: Chứa các Use Cases (ví dụ: `GetMonthlyFinance`, `AddStaff`).
- `infrastructure/`: Chứa các cài đặt kỹ thuật (Supabase Repositories, API Services).
- `presentation/`: Chứa UI Layer (React Components + Presenters).

## 🛠 Hướng dẫn thiết lập

### 1. Cài đặt môi trường
Đảm bảo bạn đã cài đặt Node.js (phiên bản >= 18).

```bash
git clone <repository-url>
cd auto-28
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` từ file `.env.example` và điền thông tin Supabase của bạn:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Chạy ứng dụng
- Chế độ phát triển: `npm run dev`
- Chạy Test: `npm test`
- Build sản phẩm: `npm run build`

## 📖 Tài liệu hướng dẫn (Guides)

Toàn bộ tiêu chuẩn và hướng dẫn nằm trong thư mục `/guides`:
- [Tiêu chuẩn đánh giá Codebase](./guides/CODEBASE_EVALUATION_CRITERIA.md)
- [Hướng dẫn thiết kế Liquid Glass](./guides/DESIGN_GUIDE.md)
- [Quy tắc logic tài chính](./guides/FINANCIAL_LOGIC_GUIDE.md)
- [Quy trình cập nhật trạng thái xe](./guides/STATUS_UPDATE_GUIDE.md)

## ⚖️ Tiêu chuẩn chất lượng
Dự án hướng tới mức độ **🟢 TỐT (Production-grade)** theo thang đánh giá nội bộ, đảm bảo tính bảo mật, hiệu năng và khả năng bảo trì lâu dài.
