---
name: Thinking Protocol & Task Decomposition Engine
description: Hệ thống ép buộc tư duy kiến trúc trước khi code. Phân loại độ phức tạp, bắt buộc khối <thinking> cho task trung bình/phức tạp, và Task Decomposition Engine nguyên tử. Dùng kết hợp với Clean Surgical NextJS.
---

# 🧠 THINKING PROTOCOL & TASK DECOMPOSITION ENGINE

> **Mục tiêu:** Mô phỏng "Extended Thinking" của model cấp cao. Buộc AI phân tích rủi ro, phân loại task và lập kế hoạch nguyên tử TRƯỚC khi viết một dòng code.

---

## ═══ PHẦN 1: PHÂN LOẠI ĐỘ PHỨC TẠP ═══

Bước đầu tiên với MỌI yêu cầu là tự phân loại theo bảng sau:

| Mức | Điều kiện | Yêu cầu bổ sung |
|-----|-----------|-----------------|
| **ĐƠN GIẢN** | 1 file, không export ra ngoài, thay đổi cục bộ | Chỉ cần 4 pha Pre-flight |
| **TRUNG BÌNH** | 2-3 files, liên quan 1-2 tầng kiến trúc | 4 pha + `<thinking>` block + Task Breakdown |
| **PHỨC TẠP** | ≥4 files, xuyên suốt ≥3 tầng, hoặc thay đổi shared interface | 4 pha + `<thinking>` + Task Breakdown + Counterfactual |

### Ví dụ phân loại

| Yêu cầu | Mức | Lý do |
|---------|-----|-------|
| Sửa typo trong label của `StaffAddModal.tsx` | ĐƠN GIẢN | 1 file, không export |
| Thêm field `note` vào form thêm nhân viên | TRUNG BÌNH | `StaffAddModal.tsx` + `StaffSchema.ts` + types |
| Thêm module Permission mới cho Kế toán | PHỨC TẠP | ≥4 files, shared types, nhiều tầng |

---

## ═══ PHẦN 2: KHỐI `<thinking>` BẮT BUỘC ═══

Với task **TRUNG BÌNH** hoặc **PHỨC TẠP**, PHẢI bắt đầu bằng khối này TRƯỚC cả Pre-flight Analysis:

```
<thinking>
  BƯỚC 1 — ĐỌC YÊU CẦU THỰC SỰ:
  Điều User nói: [...]
  Điều User thực sự cần: [...]
  (Hai điều này có khác nhau không? Nếu có, phải làm rõ.)

  BƯỚC 2 — PHÂN LOẠI ĐỘ PHỨC TẠP:
  Số files bị ảnh hưởng (ước tính): [N]
  Số tầng kiến trúc liên quan: [N]
  → Kết luận: [ĐƠN GIẢN / TRUNG BÌNH / PHỨC TẠP]

  BƯỚC 3 — NHẬN DẠNG RỦI RO (liệt kê 3 điều có thể sai nhất):
  - Rủi ro 1: [...]
  - Rủi ro 2: [...]
  - Rủi ro 3: [...]

  BƯỚC 4 — QUYẾT ĐỊNH CHIẾN LƯỢC:
  Tôi sẽ tiếp cận theo hướng: [...]
  Lý do không dùng cách nhanh hơn: [...]
</thinking>
```

**Sau khối `<thinking>`, mới viết Pre-flight Analysis.**

---

## ═══ PHẦN 3: TASK DECOMPOSITION ENGINE ═══

### Khi nào bắt buộc dùng
- Task chạm đến **≥3 files**
- Có thứ tự thực hiện quan trọng (file A phải xong trước file B)
- Một bước fail không nên kéo theo các bước tiếp theo

### Cấu trúc chuẩn

```
━━━ TASK BREAKDOWN ━━━
Tổng số bước: N
Thứ tự phụ thuộc: [Bước X phải xong trước Bước Y]

[ ] Bước 1: [hành động cụ thể] → [file bị sửa] → [kết quả mong đợi]
[ ] Bước 2: [hành động cụ thể] → [file bị sửa] → [kết quả mong đợi]
[ ] Bước 3: [hành động cụ thể] → [file bị sửa] → [kết quả mong đợi]
[ ] Bước N: Chạy `npx tsc --noEmit` để xác minh toàn bộ

→ Nếu bất kỳ bước nào fail, DỪNG và báo cáo lỗi trước khi tiếp tục.
━━━━━━━━━━━━━━━━━━━━━
```

### Luật Atomic Execution
- Mỗi "bước" chỉ được thực hiện **một hành động tool duy nhất**.
- Sau mỗi bước, tự xác nhận kết quả trước khi sang bước tiếp.
- **CẤM "gộp bước"** để cho nhanh khi xử lý task phức tạp.

---

## ═══ PHẦN 4: VÍ DỤ THỰC TẾ AUTO 28 ═══

### Ví dụ: Task PHỨC TẠP — Thêm RBAC cho Kế toán

**Yêu cầu:** *"Kế toán cần xem được tab Inventory nhưng không được xóa xe."*

```
<thinking>
  BƯỚC 1 — ĐỌC YÊU CẦU THỰC SỰ:
  User nói: Kế toán xem Inventory.
  User cần: Phân quyền đọc (read-only) cho role Kế toán trên module Inventory.
  Cần làm rõ: Kế toán có thể xem chi tiết xe không? Có thể xem financial data không?

  BƯỚC 2 — PHÂN LOẠI:
  Files ảnh hưởng ước tính: PermissionService, useInventoryState, Inventory page, VehicleDetailModal, navigation config
  Số tầng: domain (permission types) + application (permission service) + presentation (UI gates)
  → PHỨC TẠP

  BƯỚC 3 — RỦI RO:
  - Rủi ro 1: Bỏ sót UI gate trong VehicleDetailModal → Kế toán vẫn thấy nút Delete
  - Rủi ro 2: Breaking change trong shared UserRole type → tất cả hooks bị lỗi TypeScript
  - Rủi ro 3: Navigation hiện không load Inventory tab cho Kế toán

  BƯỚC 4 — CHIẾN LƯỢC:
  Tiếp cận từ Domain ra ngoài: UserRole → PermissionService → UI gates.
  Không hard-code role check trong component — phải qua PermissionService.
</thinking>

━━━ TASK BREAKDOWN ━━━
Tổng số bước: 5
Thứ tự: Bước 1 phải xong trước Bước 2, 3, 4.

[ ] Bước 1: Verify UserRole type tại types.ts — đảm bảo 'accountant' đã có
[ ] Bước 2: Sửa PermissionService — thêm canViewInventory(role) method
[ ] Bước 3: Sửa navigation config — thêm Inventory tab cho role accountant
[ ] Bước 4: Sửa VehicleDetailModal — ẩn nút Delete/Edit khi !canEdit
[ ] Bước 5: npx tsc --noEmit để verify toàn bộ
━━━━━━━━━━━━━━━━━━━━━
```

---

## ═══ PHẦN 5: CONFIDENCE SCALE ═══

Trước khi bắt đầu code, khai báo mức độ chắc chắn:

| Mức | Ngưỡng | Hành động |
|-----|--------|-----------|
| 🟢 **HIGH** (>85%) | Đã đọc toàn bộ file liên quan | Tiến hành bình thường |
| 🟡 **MEDIUM** (60-85%) | Còn điểm mơ hồ | Gọi thêm `view_file`/`grep_search` trước |
| 🔴 **LOW** (<60%) | Yêu cầu không rõ ràng | **DỪNG. Hỏi lại User.** |

### Điều kiện BẮT BUỘC hỏi lại
1. Yêu cầu mơ hồ: "làm đẹp hơn", "tối ưu hơn" không có tiêu chí.
2. Thay đổi shared interface (`Vehicle`, `Staff`, `Expense`) không rõ scope.
3. "Xóa" hoặc "đổi tên" export — nguy cơ breaking change cao.
4. Hai cách hiểu → hai giải pháp kiến trúc khác nhau.

**Mẫu hỏi lại:**
```
Trước khi tiến hành, tôi cần làm rõ [điểm mơ hồ]:
→ Phương án A: [mô tả] — phù hợp nếu [điều kiện]
→ Phương án B: [mô tả] — phù hợp nếu [điều kiện]
Bạn muốn theo hướng nào?
```

---

> [!IMPORTANT]
> **Quy tắc vàng:** Một lượt phản hồi bị gián đoạn vì hỏi lại ít nguy hiểm hơn một lượt phản hồi làm hỏng 10 files mà không ai biết.
