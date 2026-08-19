# 🚨 AUTO 28 SHOWROOM MANAGER — CORE IMMUTABLE RULES (SSoT)

Tài liệu này định nghĩa 7 Nguyên Tắc Bất Biến (Hard Constraints) tối cao cho toàn bộ hệ thống Auto 28 Showroom Manager. Mọi Agent, Subagent, Skill và Lập trình viên bắt buộc phải tuân thủ 100% không ngoại lệ.

---

## 📋 7 NGUYÊN TẮC BẤT KHẢ XÂM PHẠM (HARD CONSTRAINTS)

| # | Mã Rule | Tên Quy Tắc | Rào Chắn & Hành Động Bắt Buộc |
|---|---|---|---|
| 1 | **RULE-1** | **READ-ONLY GUARD** | Khi yêu cầu của User có tính chất: *giải thích*, *tại sao*, *phân tích*, *kiểm tra*, *audit*, *review*, *vì sao*, *nguyên nhân* $\rightarrow$ **CHỈ ĐỌC** dữ liệu, xuất báo cáo phân tích. **CẤM TUYỆT ĐỐI** tự ý sửa code hoặc ghi đè file. |
| 2 | **RULE-2** | **APPROVAL GATE (HITL)** | Trước khi thực hiện thay đổi lớn (sửa kiến trúc, refactor nhiều file, sửa DB schema, build production) $\rightarrow$ **BẮT BUỘC** tạo Implementation Plan và chờ User phê duyệt (Approve) trước khi code. |
| 3 | **RULE-3** | **VEHICLE CODE SSoT** | Mọi nghiệp vụ định danh xe, tìm kiếm, liên kết chi phí, cọc và hoa hồng **BẮT BUỘC sử dụng Mã Xe (`code`)**, ví dụ: `VH1405-01`. **CẤM TUYỆT ĐỐI sử dụng Số khung (VIN)** trong bảng `vehicles` và `VehicleSchema`. |
| 4 | **RULE-4** | **RBAC FINANCIAL & STATUS** | **Chỉ Kế toán (`ACCOUNTANT`) và Quản trị (`ADMIN`)** mới có quyền chuyển trạng thái xe hoặc sửa kho xe (`EDIT_INVENTORY`). Nhân viên kinh doanh (`STAFF`) bị chặn 100% quyền sửa đổi trên cả UI và API. |
| 5 | **RULE-5** | **ZERO ANY & STRICT TYPES** | Toàn bộ codebase tuân thủ `strict: true`. **CẤM TUYỆT ĐỐI** `any`, `as any`, `as unknown as`, `@ts-ignore`. 100% dữ liệu ngoại vi phải parse qua Zod Schemas đồng bộ 2 chiều với Domain Types (Anti-Data-Truncation). |
| 6 | **RULE-6** | **DUMB UI & SSoT FINANCE** | Toàn bộ UI Components là Presentation thuần túy (Dumb UI). Cấm viết công thức tính tiền, lợi nhuận, hoa hồng trong UI. Mọi phép tính tài chính phải tập trung tại Domain Services / Use Cases. |
| 7 | **RULE-7** | **IPHONE NATIVE & SAFE AREA** | Mọi layout màn hình, Modal, Bottom Sheet và thanh điều hướng phải có `env(safe-area-inset-top)` và `env(safe-area-inset-bottom)`. Chống tràn chữ (Anti-Truncation), touch target $\ge 44 \times 44\text{px}$, haptic feedback trên thiết bị di động. |

---

## 🚦 MA TRẬN PHÂN LOẠI RỦI RO & PHÊ DUYỆT (HITL PROTOCOL)

* 🟢 **Rủi ro Thấp** (Đọc code, tra cứu, giải thích, lint check): Thực thi tự động và trả kết quả ngay.
* 🟡 **Rủi ro Trung bình** (Thêm UI component mới, sửa style, tối ưu hook nhỏ): Lập kế hoạch ngắn gọn, thực thi cẩn trọng.
* 🔴 **Rủi ro Cao** (Thay đổi Domain Model, sửa Zod Schemas, thay đổi State Machine, sửa nhiều file cùng lúc): **Bắt buộc có Implementation Plan được User Approve.**
