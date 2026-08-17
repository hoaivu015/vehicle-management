---
name: Counterfactual Reasoning (Auto 28 Edition)
description: Ép buộc AI so sánh ít nhất 2 phương án và loại bỏ có lý do trước khi cam kết với giải pháp. Ngăn chặn "giải pháp đầu tiên trong đầu" — sai sót phổ biến nhất của AI coding. Dùng kết hợp với Clean Surgical NextJS cho task phức tạp.
---

# ⚖️ COUNTERFACTUAL REASONING (AUTO 28 EDITION)

> **Mục tiêu:** Ngăn AI chọn giải pháp đầu tiên nghĩ ra mà không so sánh. Mọi task PHỨC TẠP (≥4 files) phải trải qua bước lập luận phản thực này trong `[P4 - Solution]`.

---

## ═══ PHẦN 1: KHI NÀO BẮT BUỘC DÙNG ═══

| Trigger | Bắt buộc? |
|---------|-----------|
| Task chạm ≥4 files | ✅ Bắt buộc |
| Thay đổi shared interface (Vehicle, Staff, Expense) | ✅ Bắt buộc |
| Thiết kế feature mới hoàn toàn | ✅ Bắt buộc |
| Refactor một module | ✅ Bắt buộc |
| Bugfix đơn giản, 1 file | ❌ Không cần |

---

## ═══ PHẦN 2: TEMPLATE BẮT BUỘC ═══

Trong `[P4 - Solution]` của Pre-flight Analysis, phải điền:

```
CÁC PHƯƠNG ÁN ĐÃ XEM XÉT:

❌ Phương án A (Bị loại): [mô tả ngắn gọn]
   → Vấn đề: [vi phạm luật nào HOẶC trade-off không chấp nhận được]

❌ Phương án B (Bị loại): [mô tả ngắn gọn]
   → Vấn đề: [lý do cụ thể]

✅ Phương án C (Được chọn): [mô tả đầy đủ]
   → Lý do chọn: [tại sao tối ưu nhất cho Auto 28 trong bối cảnh này]
   → Trade-off chấp nhận được: [nếu có — phải nêu rõ]
   → Luồng dữ liệu: UI → Presenter/Hook → Application Service → Domain (Zod) → Repository → DB

RỦI RO & GIẢM THIỂU:
- Rủi ro 1: [...] → Giảm thiểu bằng [...]
- Rủi ro 2: [...] → Giảm thiểu bằng [...]
```

---

## ═══ PHẦN 3: DANH SÁCH PHẢN THỰC CHUẨN AUTO 28 ═══

| Câu phản thực | Luật vi phạm | Trả lời chuẩn |
|--------------|-------------|---------------|
| "Tại sao không put logic thẳng vào component?" | **Luật 2** — Dumb UI | Component chỉ render. Logic phải ở Presenter/UseCase. |
| "Tại sao không tạo type mới thay vì dùng type cũ?" | **Luật 3** — SSoT | `src/shared/domain/types.ts` là nguồn sự thật duy nhất. |
| "Tại sao không skip Zod validation?" | **Luật 6** — Zod Boundary | Mọi data từ ngoài vào phải parse trước khi dùng. |
| "Tại sao không update DB thẳng từ Hook?" | **Luật 7** — Dependency Direction | Hook → Service → Repository. Hook không biết DB tồn tại. |
| "Tại sao không dùng `as any` cho nhanh?" | **Luật 1** — Zero Any | `as any` là nợ kỹ thuật lãi suất 100%/ngày. |
| "Tại sao không set `status = 'Sold'` trực tiếp?" | **Luật 5** — State Machine | `VehicleStateMachine.transition()` là gateway bắt buộc. |
| "Tại sao không SELECT * ?" | Performance + Security | Chỉ select columns cần thiết. RLS không thay thế column-level filtering. |
| "Tại sao không bỏ qua RLS check?" | Security | RLS là lớp bảo vệ cuối cùng. |

---

## ═══ PHẦN 4: VÍ DỤ THỰC TẾ — XỬ LÝ "CHI LƯƠNG" ═══

**Yêu cầu:** *"Thêm tính năng chi lương cho nhân viên, cần cập nhật số dư quỹ."*

```
CÁC PHƯƠNG ÁN ĐÃ XEM XÉT:

❌ Phương án A (Bị loại): Cập nhật số dư quỹ trực tiếp trong StaffSalaryPaymentModal.tsx
   → Vấn đề: Vi phạm Luật 2 (Dumb UI) và Luật 7 (Dependency Direction).
     Component gọi Supabase trực tiếp → không thể test, không thể reuse.

❌ Phương án B (Bị loại): Tạo Server Action riêng gọi 2 bảng riêng lẻ (salary + fund)
   → Vấn đề: Vi phạm SSoT. Salary payment và fund update phải là 1 atomic operation.
     Nếu một fail → data inconsistency không thể rollback.

✅ Phương án C (Được chọn): ProcessSalaryPayment UseCase xử lý cả hai trong 1 transaction
   → Lý do: Atomic, testable, tuân thủ Clean Architecture.
   → Trade-off: Cần thêm 1 UseCase file mới — chấp nhận, đây là domain logic.
   → Luồng: Modal → useSalaryPaymentHook → ProcessSalaryPayment → StaffRepository (Supabase RPC)

RỦI RO & GIẢM THIỂU:
- Rủi ro 1: Transaction fail → Dùng Supabase RPC (atomic stored procedure)
- Rủi ro 2: UI không biết kết quả → Return Result<T, E> từ UseCase
```

---

## ═══ PHẦN 5: ABORT CONDITION ═══

Nếu User nhất quyết yêu cầu phương án sai kiến trúc:

```
⛔ ABORT — Tôi không thể thực hiện yêu cầu này theo cách bạn mô tả.

Lý do kiến trúc: [tên Luật + giải thích ngắn]
Hậu quả nếu thực hiện: [mô tả rủi ro kỹ thuật cụ thể]

Thay vào đó, tôi đề xuất: [mô tả phương án đúng]
Bạn có muốn tôi thực hiện theo hướng này không?
```

> [!CAUTION]
> Không implement giải pháp sai kiến trúc chỉ vì User yêu cầu. Vai trò của Principal Engineer là bảo vệ hệ thống, không phải làm hài lòng mọi yêu cầu tức thời.
