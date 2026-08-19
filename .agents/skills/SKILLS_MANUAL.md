# 🛡️ CẨM NĂNG SỬ DỤNG HỆ THỐNG 4 DOMAIN HUBS & MASTER ROUTER — AUTO 28

Chào mừng bạn đến với **Cẩm nang Vận hành Kỹ thuật & Chuẩn hóa Hệ thống** phiên bản mới của **Auto 28 Showroom Manager**. Hệ thống đã được nâng cấp toàn diện lên **Mô hình Hợp nhất Phân tầng (Hierarchical Domain Consolidation & Router Pattern)**, tinh giản từ hơn 35 kỹ năng phân mảnh thành **1 Bộ Điều Phối Trung Tâm (Master Router)** và **4 Domain Hubs Chuyên Môn Tối Cao**.

---

## 🧭 CƠ CHẾ ĐỊNH TUYẾN TỰ ĐỘNG (MASTER ROUTER)

Bạn có thể ra lệnh bằng tiếng Việt tự nhiên hoặc sử dụng các tiền tố kích hoạt nhanh (**Quick Triggers**):

```mermaid
graph TD
    User["👤 Người dùng ra lệnh"] --> Router["🧭 Master Router (.agents/ROUTER.md)"]
    
    Router -->|@arch / Kiến trúc / Type / State / DB| D1["🏗️ @arch (clean-architecture-engine)"]
    Router -->|@design / UI / Màu / Bo góc / Icon / Input| D2["🎨 @design (design-system-core)"]
    Router -->|@mobile / iOS / Safe Area / Haptic / Văn phong| D3["📱 @mobile (mobile-ux-sentinel)"]
    Router -->|@diag / Bug / 5 Whys / So sánh / Lập plan| D4["🔍 @diag (deep-diagnostic-engine)"]
```

---

## 🛠️ CHI TIẾT 4 DOMAIN HUBS & CÚ PHÁP KÍCH HOẠT

### 1. 🏗️ DOMAIN 1: `@arch` — Clean Architecture & Code Integrity Hub
* **File Skill:** [clean-architecture-engine](file:///.agents/skills/clean-architecture-engine/SKILL.md)
* **Nhiệm vụ:**
  * Phân tầng 4 lớp: `Domain` $\leftarrow$ `Application` $\leftarrow$ `Presentation` $\rightarrow$ `Infrastructure`.
  * Quản trị Inversion of Control (IoC Container) và Dependency Inversion.
  * Đảm bảo **Zero Any (Strict 100%)** và **Zod Schema Parity 2 chiều** (không rớt trường dữ liệu).
  * Tối ưu hóa vòng đời State React 19 (Dispatcher Hook, triệt tiêu cascading re-renders).
  * Bảo vệ SSoT Tài chính & Phân quyền RBAC (Chỉ Kế toán/Admin sửa xe, Sale chỉ đọc).
* **Cú pháp kích hoạt:**
  * `@arch: Phân tầng Clean Architecture cho tính năng [Tên tính năng]`
  * `@arch: Fix lỗi type TypeScript và kiểm tra Zod Schema`
  * `@arch: Tối ưu state React 19 và sync Supabase`

---

### 2. 🎨 DOMAIN 2: `@design` — Design System & Visual Semantics Hub
* **File Skill:** [design-system-core](file:///.agents/skills/design-system-core/SKILL.md)
* **Nhiệm vụ:**
  * Quản trị và tái sử dụng bộ component SSoT tại `src/shared/design-system/` (`BaseCard`, `BaseModal`, `FormElements`, `SmartAmountInput`, `DataDisplay`).
  * Thực thi bảng màu công nghiệp 60-30-10, kính mờ nhiều lớp Liquid Glass 2.0.
  * Bo góc siêu elip sinh học Squircle (`rounded-[20px]` đến `rounded-[32px]`) và Pill Shapes (`rounded-full`).
  * Chuẩn hóa 3 tầng kích thước ô nhập liệu ($56\text{px}$ / $48\text{px}$ / $40\text{px}$) theo hệ lưới 8pt.
  * Ngữ nghĩa biểu tượng sinh học hữu cơ (Bio-Morphology Iconography).
  * Chống cắt cụt số tiền và gãy dòng văn bản (Anti-Truncation).
* **Cú pháp kích hoạt:**
  * `@design: Thiết kế component thẻ xe mới chuẩn Liquid Glass`
  * `@design: Chuẩn hóa lại ô nhập liệu và bảng màu theo Design Tokens`
  * `@design: Audit chống tràn chữ và kiểm tra độ tương phản WCAG 2.2`

---

### 3. 📱 DOMAIN 3: `@mobile` — Mobile & Native UX Sentinel Hub
* **File Skill:** [mobile-ux-sentinel](file:///.agents/skills/mobile-ux-sentinel/SKILL.md)
* **Nhiệm vụ:**
  * Bảo vệ không gian an toàn iPhone Native: `env(safe-area-inset-top)` và `env(safe-area-inset-bottom)`.
  * Thiết kế thanh điều hướng chuẩn 3–5 tabs, nút trung tâm Hero FAB (`+`) nảy lò xo.
  * Tích hợp phản hồi xúc giác Capacitor Haptic Matrix (`light`, `selection`, `success`, `warning`).
  * Chuẩn hóa 100% Ngôn ngữ viết & Từ điển nghiệp vụ Showroom ô tô (Mã xe SSoT, Giá vốn COGS, Lợi nhuận gộp).
  * Bảo đảm vùng chạm Fitts's Law ($\ge 44\text{px} \times 44\text{px}$) và công thái học ngón tay cái.
* **Cú pháp kích hoạt:**
  * `@mobile: Kiểm tra Safe Area và tối ưu hiển thị cho iPhone`
  * `@mobile: Tích hợp haptic feedback cho luồng ghi nhận chi phí xe`
  * `@mobile: Audit văn phong và chuẩn hóa thuật ngữ chuyên ngành ô tô`

---

### 4. 🔍 DOMAIN 4: `@diag` — Deep Diagnostic & Reasoning Protocol Hub
* **File Skill:** [deep-diagnostic-engine](file:///.agents/skills/deep-diagnostic-engine/SKILL.md)
* **Nhiệm vụ:**
  * Phân tích nguyên nhân gốc rễ bằng phương pháp **5 Whys**, truy vết tận nguồn dữ liệu.
  * Lập luận phản thực (**Counterfactual Reasoning A/B**), so sánh tối thiểu 2 phương án trước khi chốt giải pháp.
  * Phân rã công việc nguyên tử (**Thinking Protocol**) theo 3 cấp độ phức tạp.
  * Nguyên tắc phẫu thuật Karpathy (**Surgical Edits**): sửa đúng điểm gây lỗi, bảo toàn code và comment không liên quan.
  * Vòng lặp phát triển hướng kiểm thử (**TDD** Red $\rightarrow$ Green $\rightarrow$ Refactor).
* **Cú pháp kích hoạt:**
  * `@diag: Chẩn đoán 5 Whys và lập Fix Plan cho lỗi này`
  * `@diag: So sánh phản thực các phương án kiến trúc giúp tôi`
  * `/0: Chuyển sang chế độ Siêu tư duy sâu toàn diện`
