# Bộ Tiêu Chuẩn Chất Lượng — Auto28

> **Phạm vi áp dụng:** Toàn bộ codebase Auto28 (Next.js · TailwindCSS · Mantine · Supabase · Liquid Glass 2.0)
> **Sử dụng:** Checklist cá nhân trước khi mở Pull Request, tiêu chuẩn Code Review, và thang đo audit định kỳ.

---

## Mục lục

1. [Logic & Chức Năng](#1-logic--chức-năng-functional-quality)
2. [Kiến Trúc & Maintainability](#2-kiến-trúc--maintainability)
3. [Code Quality & Style](#3-code-quality--style)
4. [Semantic HTML & SEO](#4-semantic-html--seo)
5. [Accessibility (A11y)](#5-accessibility-a11y)
6. [UI/UX & Visual Consistency](#6-uiux--visual-consistency)
7. [Component Quality](#7-component-quality)
8. [State & UI Logic](#8-state--ui-logic)
9. [Interaction & UX Feedback](#9-interaction--ux-feedback)
10. [Performance](#10-performance)
11. [Security](#11-security)
12. [Testing & Reliability](#12-testing--reliability)
13. [Process & Developer Experience](#13-process--developer-experience)
14. [Thang Điểm Đánh Giá Tổng Thể](#14-thang-điểm-đánh-giá-tổng-thể)

---

## 1. Logic & Chức Năng (Functional Quality)

- [ ] **Đúng yêu cầu:** Tính năng hoạt động đúng spec, xử lý đúng flow. Dữ liệu cập nhật chính xác, không lỗi business logic.
- [ ] **Đủ edge cases:** Xử lý concurrency, race condition, validation, rollback khi có lỗi.
- [ ] **Toàn vẹn runtime:** Không có lỗi crash, exception, unhandled promise, console error.
- [ ] **Không dead code:** Không chứa logic thừa hoặc tính năng "một nửa" (half-feature).
- [ ] **Financial Logic:** Mọi tính toán tài chính PHẢI đi qua `calculateVehicleFinancials()`. Tuyệt đối không tính lại trong UI (tham chiếu `FINANCIAL_LOGIC_GUIDE.md`).

---

## 2. Kiến Trúc & Maintainability

- [ ] **Clean Architecture:** Frontend áp dụng Clean Architecture / MVP. Không tồn tại "God component" hay "God file".
- [ ] **Phân tách lớp rõ ràng:** UI layer → Presenter → Use Case → Repository → Infrastructure. Không import chéo layer.
- [ ] **Single Responsibility:** Component nhỏ gọn, đảm nhận một và chỉ một mục đích.
- [ ] **Không circular dependency:** Kiểm tra `import graph` không có vòng tròn.
- [ ] **Tái sử dụng:** Component, hook, utility được định nghĩa rõ ràng, dễ tái sử dụng. Không copy-paste style bừa bãi.
- [ ] **Design tokens:** UI/UX, spacing, màu sắc, border-radius tuân thủ `DESIGN_GUIDE.md`.

---

## 3. Code Quality & Style

- [ ] **Tên có ý nghĩa:** Biến, hàm, component, service mô tả chính xác hành vi. Code tự mô tả (self-documenting).
- [ ] **Conventions nhất quán:** Tuân thủ ESLint, Prettier, TS config, Mantine rules, folder naming.
- [ ] **Linter sạch:** ESLint, TypeScript compiler, Prettier chạy không có lỗi. Hướng tới zero warning, không lạm dụng `// eslint-disable`.
- [ ] **TypeScript strict:** Không sử dụng `any` không có lý do. Không tắt TS checks tùy tiện.

---

## 4. Semantic HTML & SEO

- [ ] **Duy nhất 1 `<h1>` trên mỗi trang.** Trong Modal và Widget, chỉ dùng từ `<h2>` đến `<h6>`. Không dùng heading để style chữ to — dùng class Typography (Tailwind).
- [ ] **Phân cấp Heading logic:** `<h3>` chỉ đặt trong `<h2>`, không nhảy cóc (vd: `<h2>` → `<h4>`).
- [ ] **Không lạm dụng `<div>/<span>`:** Dùng đúng thẻ ngữ nghĩa HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<aside>`).
- [ ] **Metadata đầy đủ:** Mỗi page route có `title`, `meta description`, canonical URL, Open Graph (Next.js Metadata API).
- [ ] **Cấu trúc DOM an toàn:** Không lồng `<a>` trong `<a>`, không `<div>` trong `<p>`. Không broken links.
- [ ] **Alt text:** Hình ảnh có `alt` mô tả đầy đủ. Icon trang trí có `aria-hidden="true"`.

---

## 5. Accessibility (A11y)

- [ ] **Keyboard Navigation:** Hỗ trợ tabbing đầy đủ. Không ẩn `:focus-visible` trừ khi có style thay thế tương đương.
- [ ] **ARIA hợp lý:** Ưu tiên HTML Semantic tự nhiên. Chỉ dùng ARIA khi HTML không thể mô tả được state.
- [ ] **Độ tương phản:** Đạt chuẩn WCAG AA (≥ 4.5:1). Font size body text ≥ 14px.
- [ ] **Hit area:** Vùng bấm tối thiểu 44×44px (quan trọng trên mobile/touch).
- [ ] **Screen Reader:** Phân cấp Heading chính xác, `aria-*` attributes đúng ngữ cảnh, role phù hợp cho element tương tác.
- [ ] **Không thiết kế chỉ dựa vào `hover`:** Mọi tính năng phải thao tác được bằng bàn phím.

---

## 6. UI/UX & Visual Consistency

### Liquid Glass 2.0 — Component Rules

- [ ] **Tuân thủ Design System:** Sử dụng chung bộ token màu sắc, typography, spacing, border-radius từ `DESIGN_GUIDE.md`. Không tự "chế" inline-css hay ad-hoc css.
- [ ] **Border-Radius Hierarchy (Golden Rule #7):**
  - Container ngoài cùng tối đa T1 (`rounded-[3rem]`).
  - Thẻ con không được vượt quá bán kính container. Không bao giờ để component con có `rounded` lớn hơn container.
  - Khi padding nhỏ, đảm bảo container có `overflow-hidden`.
- [ ] **Layer Hierarchy:** Tôn trọng 4-Layer (L1→L4). Nội dung cấp dưới không sáng hơn cấp trên nếu không có shadow phù hợp.
- [ ] **`.liquid-card` đúng nơi:** Chỉ dùng trong Modal/Contained Tab, KHÔNG dùng cho panel độc lập trên Dashboard (dùng `.glass-l2-hero`, `.highlight-card` thay thế).
- [ ] **Semantic Color chính xác:**
  - Lợi nhuận dương / Đạt chỉ tiêu: `text-emerald-600`
  - Cảnh báo / Thua lỗ: `text-red-500` hoặc `text-red-600`
  - Accent/Link: `text-kraft-accent` (#6366f1 - Indigo)
  - **Tăng trưởng 0.0% → màu Xám (`text-kraft-ink/40`) + icon Minus/ArrowRight** (Neutral, không tô Xanh/Đỏ)
- [ ] **Visual Clarity:** Dễ phân biệt Title, Subtitle, Body text, CTA qua size/weight/màu sắc.
- [ ] **Motion & Micro-interaction:** Hover lift (`y: -12`), `active:scale-[0.98]` cho nút bấm, `transition-all duration-300` tối thiểu trên mọi element tương tác.
- [ ] **Luồng thao tác minh bạch:** Người dùng biết "mình đang ở đâu, bước tiếp theo là gì".
- [ ] **Responsive:** Không vỡ layout, không overflow-x trên màn hình nhỏ. Test tối thiểu 3 breakpoint: Mobile, Tablet, Desktop.

---

## 7. Component Quality

- [ ] **Không tạo "God Component":** Tách Container Component (logic) và Presentational Component (render UI).
- [ ] **Shared Primitives:** Pattern UI lặp lại nhiều lần phải được tách thành Shared Component dùng chung.
- [ ] **Module Boundaries:** Không import chéo làm phá vỡ ranh giới module/feature. Coupling giữa component phải thấp.
- [ ] **Component Pattern nhất quán:** Cùng chức năng thì diện mạo giống nhau ở mọi màn hình.
- [ ] **Microcopy đồng nhất:** Thông báo lỗi, placeholder, label nhất quán về phong cách và cách xưng hô.

---

## 8. State & UI Logic

- [ ] **Không State-space explosion:** Tránh hàng tá boolean độc lập (`isLoading`, `isError`, `isSuccess`...). Gom state hoặc dùng State Machine cho UI logic phức tạp.
- [ ] **Domain Logic tách khỏi UI:** Tính toán phức tạp (như `calculateVehicleFinancials`) phải ở Application/Domain layer, không trong JSX.
- [ ] **Logic UI chặt chẽ:** Badge, màu sắc, icon phải map đúng với semantic của data.
- [ ] **Role-based Visibility:** Phân quyền hiển thị tài chính phải tuân thủ bảng phân quyền trong `DESIGN_GUIDE.md` (Section 13).

---

## 9. Interaction & UX Feedback

- [ ] **Visual Feedback mọi action:** Submit form, Delete, Fetch async ĐỀU phải có loading spinner, toast notification, hoặc thay đổi UI rõ ràng. Tuyệt đối không "im lặng" sau khi click.
- [ ] **Affordance rõ ràng:** Element click được phải có cursor pointer và hover effect.
- [ ] **Empty State:** Có thông báo thân thiện (kèm CTA) khi danh sách trống.
- [ ] **Loading State:** Hiển thị Skeleton hoặc Spinner khi chờ dữ liệu.
- [ ] **Error State:** Hiển thị nguyên nhân lỗi kèm hướng giải quyết — không văng ra "Error 500" vô hồn.
- [ ] **Chống double-submit:** Overlay hoặc disabled button khi đang xử lý async.

---

## 10. Performance

### Core Web Vitals Targets

| Metric | 🟢 Tốt | 🟡 Ổn | 🔴 Kém |
|:---|:---:|:---:|:---:|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5–4s | > 4s |
| **FCP** (First Contentful Paint) | ≤ 1.8s | 1.8–3s | > 3s |
| **FID** (First Input Delay) | ≤ 100ms | 100–300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| **TTFB** | ≤ 400ms | 400–800ms | > 800ms |
| **Lighthouse Score** | ≥ 90 | 70–89 | < 70 |

### Checklist

- [ ] **Bundle size tối ưu:** Code splitting và lazy loading cho dialog, route ít dùng.
- [ ] **Image optimization:** Dùng `next/image`. Không dùng ảnh thô không resize.
- [ ] **Data Fetching:** Không over-fetching. Có cơ chế caching và invalidation hợp lý.
- [ ] **React Rendering:** Dùng `useMemo`/`useCallback` ở điểm thắt cổ chai. Tránh re-render thừa.
- [ ] **GPU Acceleration:** Mọi phần tử dùng `backdrop-filter` phải có `transform: translateZ(0)` và `will-change`.
- [ ] **Animation performance:** Không làm giật lag trên máy yếu (dùng `transform` và `opacity`, không dùng thuộc tính gây layout thrashing).

---

## 11. Security

### 🟢 Production-grade Secure
- [ ] **HTTPS bắt buộc** trên toàn bộ site. HSTS được bật, không có Mixed Content.
- [ ] **OWASP Top 10:** Không tồn tại SQL Injection, XSS, CSRF, IDOR.
- [ ] **Input Validation:** Frontend escape string trước khi render HTML dynamic. Tránh `dangerouslySetInnerHTML`; nếu bắt buộc, phải qua DOMPurify.
- [ ] **Auth & Session:** Không lưu Access Token dài hạn hoặc Password plaintext trong localStorage. Dùng HTTP-only + Secure Cookie.
- [ ] **API Protection:** Rate Limiting, phân quyền (Authorization/Scopes) chặt chẽ. User A không thể request data của User B.
- [ ] **Không hardcode secrets:** Tuyệt đối không commit API key, secret, password vào git.
- [ ] **Dependency audit:** `npm audit` sạch. Không dùng package có CVE chưa được patch.
- [ ] **Security Headers:** CSP, `X-Content-Type-Options`, `X-Frame-Options`, HSTS được cấu hình.
- [ ] **RLS (Row Level Security) trên Supabase:** Mọi table nhạy cảm phải có RLS policy.

---

## 12. Testing & Reliability

- [ ] **Happy Path & Beyond:** Unit/E2E test cover luồng thanh toán, tính toán tài chính, phân quyền, error handling.
- [ ] **Corner Cases:** Test khi: rớt mạng, loading chậm, mảng rỗng, user nhập dữ liệu rác, 401, timeout.
- [ ] **Financial Logic Tests:** `financial_formulas.ts` và `vehicle_calculations.ts` PHẢI có unit test đầy đủ.
- [ ] **Error Boundary:** Frontend lỗi được catch bởi React Error Boundary. Không crash toàn trang khi một component lỗi.
- [ ] **Monitoring:** Console không để lộ thông tin nhạy cảm. Core Web Vitals được theo dõi liên tục.
- [ ] **Automated Checks:** ESLint, Prettier, TypeScript Type Check chạy tự động để bắt bug sớm.

---

## 13. Process & Developer Experience

- [ ] **Pull Request chất lượng:** PR gọn gàng, chia nhỏ tính năng. Commit message rõ "Why" chứ không chỉ "What".
- [ ] **CI/CD tự động:** Build, lint, test, audit chạy tự động. Không "merge thẳng vào main".
- [ ] **Dependency kiểm soát:** Thận trọng khi thêm thư viện mới. Kiểm tra size, security, popularity.
- [ ] **Documentation cập nhật:** Mọi thay đổi business logic phải cập nhật guide tương ứng trong `guides/`.
- [ ] **README đầy đủ:** Hướng dẫn setup môi trường local, diagram kiến trúc được cập nhật.
- [ ] **Format/Lint Auto:** IDE auto-format khi lưu file.

---

## 14. Thang Điểm Đánh Giá Tổng Thể

### Codebase Quality

| Mức Độ | Dấu Hiệu Nhận Biết | Hành Động |
|:---|:---|:---|
| **🟢 TỐT** *(Production-grade)* | Kiến trúc rõ, module hóa tốt. Code dễ đọc, test đầy đủ, linter sạch. Security chuẩn. CI/CD + Review chặt chẽ. | Duy trì và nâng cấp automation. |
| **🟡 ỔN** *(Cần cải thiện)* | Đa số feature đúng. Kiến trúc cơ bản. Vẫn còn God component, test chưa đủ, style bất đồng nhất. | Refactor dần God component, bổ sung test critical path. |
| **🔴 KÉM** *(Tech debt cao)* | Business logic lộn xộn, dính UI. Code khó đọc, thường xuyên bug runtime. Thiếu test, linter tắt. | Stop-the-line, trả tech debt, chuẩn hóa quy trình. |

### UI/UX Quality

| Mức Độ | Biểu Hiện |
|:---|:---|
| **🟢 TỐT** | Luồng thao tác mượt, trực quan. Không lỗi layout. Tuân thủ 100% Liquid Glass. A11y + Responsive chuẩn. Đủ trạng thái feedback. |
| **🟡 ỔN** | Đa số dễ hiểu. Một số layout còn rối, bất đồng nhất nhỏ về style. Mobile dùng được nhưng chưa tối ưu. |
| **🔴 KÉM** | Người dùng bối rối. Nút bấm ẩn/dễ nhầm. Lỗi layout nghiêm trọng. Không có loading/empty/error state. |

### Performance & Security

| Mức Độ | Performance | Security |
|:---|:---|:---|
| **🟢 TỐT** | LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1, Lighthouse ≥ 90 | OWASP Top 10 tuân thủ, WAF, HTTPS+HSTS, CSP, Rate-limit, Pentest định kỳ |
| **🟡 ỔN** | Metrics trong ngưỡng bình thường, một vài thông số chưa hoàn hảo | HTTPS toàn diện, Auth tốt, không lỗ hổng rõ ràng nhưng chưa có WAF/CSP chặt |
| **🔴 KÉM** | LCP > 4s hoặc Lighthouse < 70 | Endpoint HTTP, thiếu CSRF, không validate input, dùng thư viện có CVE |

---

*Tài liệu này tổng hợp và thay thế: `CODEBASE_EVALUATION_CRITERIA.md`, `FRONTEND_QUALITY_CHECKLIST.md`, `PERFORMANCE_SECURITY_CRITERIA.md`, `UI_UX_EVALUATION_CRITERIA.md`, `UI_COMPONENT_CHECKLIST.md`.*  
*Phiên bản: 1.0 — Tổng hợp ngày 25/04/2026 | Áp dụng: Auto28 Dev Team*
