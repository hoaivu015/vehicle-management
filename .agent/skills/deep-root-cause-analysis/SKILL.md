---
name: Deep Root Cause Analysis & Fix Planning
description: Hệ thống kiểm soát chẩn đoán lỗi chuyên sâu và lập kế hoạch sửa chữa. Bắt buộc áp dụng kỹ thuật "5 Whys" để tìm nguyên nhân gốc rễ và lập Fix Plan chi tiết trước khi code.
---

# Deep Root Cause Analysis & Fix Planning (Auto 28 Edition)

## 🎯 Mục đích (Purpose)
Tuyệt đối ngăn chặn hành vi "chữa cháy bề mặt" (band-aid fixes) hoặc nhắm mắt sửa code khi chưa hiểu rõ toàn bộ luồng logic. Kỹ năng này ép buộc AI phải hành động như một Principal/Staff Engineer: **Tìm ra nguyên nhân tận gốc của tận gốc vấn đề, sau đó lập kế hoạch sửa chữa cực kỳ cẩn thận.**

## 🛑 QUY TẮC THÉP (IRONCLAD RULES)
1. **KHÔNG ĐƯỢC FIX LỖI NGAY:** Khi người dùng báo lỗi, tuyệt đối không được nhào vô viết code hoặc đề xuất code sửa lỗi ngay lập tức.
2. **BẮT BUỘC CHUẨN ĐOÁN (MANDATORY DIAGNOSIS):** Phải thực hiện quy trình "5 Whys" (Hỏi "Tại sao" 5 lần) để đào sâu từ triệu chứng bề mặt xuống lỗ hổng kiến trúc hoặc logic sâu nhất.
3. **BẮT BUỘC LẬP KẾ HOẠCH (MANDATORY FIX PLAN):** Phải đưa ra kế hoạch sửa lỗi rõ ràng từng bước.
4. **CHỜ DUYỆT (AWAIT APPROVAL):** Chỉ tiến hành viết code/sửa file sau khi người dùng đã đọc và đồng ý với "Root Cause" và "Fix Plan".

---

## ⚙️ QUY TRÌNH THỰC THI (EXECUTION PROTOCOL)

Khi được kích hoạt hoặc khi nhận được yêu cầu debug từ người dùng, hãy tuân thủ chính xác 4 Phase sau. Dùng thẻ `<thinking>` để suy luận ngầm nếu cần, sau đó xuất ra output theo format.

### Phase 1: Xác định Triệu Chứng (Symptoms Assessment)
- **Error/Bug là gì?** (Giao diện bị vỡ, Crash, Sai data, Infinite Loop, v.v.)
- **Nằm ở file nào / component nào?**
- *Hành động của AI:* Đọc file log, file code liên quan (dùng `view_file` hoặc `grep_search` nếu cần thiết) để thu thập đủ manh mối.

### Phase 2: Kỹ thuật "5 Whys" (Deep Root Cause Diagnostic)
Trình bày phân tích bằng cách đào sâu liên tục:
- **Why 1 (Bề mặt):** Tại sao lỗi này xảy ra? -> *Ví dụ: Biến `vehicle` bị undefined.*
- **Why 2:** Tại sao biến `vehicle` bị undefined? -> *Ví dụ: API trả về null nhưng component không check.*
- **Why 3:** Tại sao API lại trả về null? -> *Ví dụ: Query database thiếu điều kiện `is_active = true`.*
- **Why 4 (Nguyên nhân sâu xa):** Tại sao query lại thiếu điều kiện? -> *Ví dụ: Dùng sai Repository method (`findById` thay vì `findActiveById`).*
- **Why 5 (Lỗi hệ thống/Kiến trúc):** Tại sao lại có sự nhầm lẫn này? -> *Ví dụ: Domain interface không định nghĩa rõ ràng giữa active và inactive entities.*

*(Lưu ý: Không nhất thiết phải đúng 5 câu, nhưng phải đủ sâu để tìm ra nguyên nhân kiến trúc/logic cốt lõi, không chỉ dừng ở lỗi syntax).*

### Phase 3: Báo Cáo Nguyên Nhân Tận Gốc (The "Root Cause" Report)
Tóm tắt ngắn gọn và đanh thép nhất về nguyên nhân thực sự sau khi đã phân tích:
> **ROOT CAUSE:** [Trình bày nguyên nhân cốt lõi trong 1-2 câu]

### Phase 4: Kế Hoạch Sửa Lỗi (The "Fix Plan")
Liệt kê các bước sửa lỗi (Step-by-step). Nếu có thể, áp dụng **Counterfactual Reasoning** để so sánh 2 cách sửa (Cách nhanh vs Cách chuẩn Clean Architecture).
- **Step 1:** Sửa cái gì ở file nào? (VD: Cập nhật Repository interface ở `domain/`)
- **Step 2:** Sửa cái gì ở file nào? (VD: Update logic ở `application/usecases/`)
- **Step 3:** Sửa cái gì ở file nào? (VD: Xử lý UI fallback ở `presentation/`)

---

## 📋 FORMAT TRẢ LỜI MẪU (TEMPLATE)

Mỗi khi người dùng nhờ tìm/sửa lỗi, hãy dùng format Markdown sau để trả lời:

```markdown
🔍 **1. TRIỆU CHỨNG LỖI (SYMPTOMS)**
- ...

🧠 **2. CHẨN ĐOÁN CHUYÊN SÂU (5 WHYS DIAGNOSTIC)**
- **Why 1:** ...
- **Why 2:** ...
- ...

🎯 **3. NGUYÊN NHÂN TẬN GỐC (ROOT CAUSE)**
- ...

🛠️ **4. KẾ HOẠCH SỬA LỖI (FIX PLAN)**
- **Step 1:** ...
- **Step 2:** ...

👉 **Vui lòng xác nhận Kế hoạch sửa lỗi này để tôi bắt đầu tiến hành sửa code nhé!**
```
