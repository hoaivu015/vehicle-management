---
name: deep-diagnostic-engine
description: Hub chuyên môn tối cao về Quy trình Tư duy Sâu (Extended Thinking), Chẩn đoán Nguyên nhân Gốc rễ (5 Whys), Lập luận Phản thực (Counterfactual A/B), Karpathy Surgical Editing và Vòng lặp Kiểm thử TDD.
---

# 🔍 DOMAIN 4: DEEP DIAGNOSTIC & REASONING PROTOCOL

> **Mã kích hoạt:** `@diag` hoặc `deep-diagnostic-engine`  
> **Phạm vi hợp nhất:** `thinking-protocol`, `counterfactual-reasoning`, `deep-root-cause-analysis`, `andrej-karpathy`, `diagnose`, `tdd`  
> **Mục tiêu:** Ngăn chặn tuyệt đối "giải pháp đầu tiên lóe lên trong đầu" (First-thought fallacy) và giải pháp chắp vá (Band-aid fixes).

---

## 🧠 1. GIAO THỨC TƯ DUY MỞ RỘNG (EXTENDED THINKING PROTOCOL)

Trước khi thực hiện bất kỳ thay đổi nào từ mức Trung bình đến Phức tạp, bắt buộc thực hiện chuỗi 3 bước phân tích:

```
[Phân tích Rủi ro & Độ phức tạp] ──► [Chẩn đoán 5 Whys Root Cause] ──► [Lập luận Phản thực A/B] ──► [Kế hoạch Phẫu thuật (Surgical Plan)]
```

### 🔹 Phân loại Độ phức tạp:
1. **Đơn giản:** Sửa 1 dòng text, đổi 1 class màu, fix lỗi cú pháp $\rightarrow$ Thực thi trực tiếp.
2. **Trung bình:** Thêm field vào form, tạo component mới, sửa hook $\rightarrow$ Lập checklist 3-4 bước, kiểm tra tác dụng phụ.
3. **Phức tạp:** Sửa DB schema, thay đổi State Machine, refactor Module, tối ưu hóa Luồng tài chính $\rightarrow$ **Bắt buộc có Implementation Plan được User Approve.**

---

## 🔍 2. CHẨN ĐOÁN TẬN GỐC 5 WHYS (ROOT CAUSE ANALYSIS)

Tuyệt đối không sửa triệu chứng bên ngoài (Band-aid fix). Phải truy vết ngược dòng dữ liệu:

* **Tại sao 1 (Triệu chứng):** UI hiển thị `NaN ₫` hoặc bị crash?
  $\rightarrow$ Do hàm `formatCurrency` nhận giá trị `undefined`.
* **Tại sao 2:** Tại sao biến truyền vào lại `undefined`?
  $\rightarrow$ Do props từ component cha truyền xuống không có trường `purchase_price`.
* **Tại sao 3:** Tại sao cha không có trường đó?
  $\rightarrow$ Do mapper tầng Infrastructure không map trường từ Supabase sang Domain Entity.
* **Tại sao 4:** Tại sao mapper không map?
  $\rightarrow$ Do Zod Schema đã vô tình loại bỏ trường đó khi parse.
* **Tại sao 5 (Root Cause):** **Zod Schema thiếu trường và không có kiểm thử Schema Parity 2 chiều.**
  $\rightarrow$ **Giải pháp gốc rễ:** Bổ sung trường vào Zod Schema + viết Unit Test kiểm tra Schema Parity.

---

## ⚖️ 3. LẬP LUẬN PHẢN THỰC (COUNTERFACTUAL REASONING A/B)

Bắt buộc so sánh tối thiểu 2 phương án kiến trúc trước khi chốt giải pháp:

* **Phương án A (Giải pháp nhanh / Cục bộ):**
  * *Ưu điểm:* Nhanh, ít sửa file.
  * *Nhược điểm:* Phá vỡ Clean Architecture, nợ kỹ thuật tăng, khó mở rộng.
* **Phương án B (Giải pháp kiến trúc chuẩn / SSoT):**
  * *Ưu điểm:* Đồng bộ với IoC, type-safe 100%, bảo vệ dữ liệu lâu dài.
  * *Nhược điểm:* Cần sửa UseCase và Repository.
* **Quyết định:** Luôn chọn Phương án B trừ khi có ràng buộc khẩn cấp từ User.

---

## 🔬 4. TRIẾT LÝ SỬA ĐỔI PHẪU THUẬT (KARPATHY SURGICAL EDITING)

* **Sửa đúng chỗ bị đau (Surgical Precision):** Chỉ sửa các dòng code trực tiếp gây ra lỗi hoặc liên quan đến yêu cầu. Cấm format lại toàn bộ file hoặc đổi phong cách viết của các đoạn code không liên quan.
* **Bảo toàn bình luận và hợp đồng:** Giữ nguyên các comment nghiệp vụ, JSDoc và type interfaces hiện có.
* **Vòng lặp Kiểm thử TDD (Red $\rightarrow$ Green $\rightarrow$ Refactor):**
  1. Viết test case mô tả lỗi hoặc hành vi mong muốn (Test FAIL - Red).
  2. Viết mã tối giản nhất để test vượt qua (Test PASS - Green).
  3. Refactor mã nguồn cho sạch sẽ theo Clean Architecture mà vẫn giữ test pass.
