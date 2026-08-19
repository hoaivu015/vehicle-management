---
name: language-terminology-sentinel
description: >
  Hệ thống kiểm soát và thực thi tiêu chuẩn Ngôn ngữ Viết (Written Register), loại bỏ triệt để
  Ngôn ngữ nói / Khẩu ngữ / Teencode / Tiếng lóng buôn bán xe chợ trời, chuẩn hóa 100% Thuật ngữ
  chuyên ngành Showroom Ô tô (Domain Lexicon SSoT), và kiểm soát chất lượng UX Writing / Microcopy
  (Actionable Error Messages, Button CTAs, Placeholders, Empty States) cho Auto 28 Showroom Manager.
  Kích hoạt khi user yêu cầu: "kiểm tra ngôn ngữ", "audit thuật ngữ", "chuẩn hóa văn phong", "kiểm tra tiếng việt", "ux writing", hoặc trước khi commit/release.
---

# ✍️ LANGUAGE & TERMINOLOGY SENTINEL — AUTO 28 SHOWROOM MANAGER

> **Tiêu chuẩn áp dụng:** ISO 9241-110 (Dialogue Principles) / ISO/IEC 25010 / Apple HIG UX Writing / Google Material 3 Expressive Microcopy / Viện Ngôn Ngữ Học Việt Nam  
> **Script kiểm tra tự động:** `npm run audit:language` (`scripts/audit_language_terminology.js`)

---

## ═══ QUY TRÌNH KIỂM ĐỊNH NGÔN NGỮ 5 BƯỚC ═══

Khi được kích hoạt, Agent thực hiện chuỗi kiểm định ngôn ngữ toàn diện qua 5 lớp phòng thủ:

```
[BƯỚC 1: Anti-Colloquial & Slang] ──> [BƯỚC 2: Domain Lexicon SSoT] ──> [BƯỚC 3: Actionable UX Writing]
                                                                                   │
[BƯỚC 5: Automated Scanner 100/100] <── [BƯỚC 4: Vietnamese Grammar & Typography] <─┘
```

---

## 📋 CHI TIẾT BỘ TIÊU CHUẨN

### BƯỚC 1: Anti-Colloquial & Anti-Slang (Chống Khẩu Ngữ & Tiếng Lóng)
* **Khẩu ngữ & Trợ từ suồng sã:** Cấm tuyệt đối các từ cảm thán hoặc đệm văn nói trong UI/Notifications:
  * `nha`, `nè`, `nhé ạ`, `luôn`, `thôi`, `ok`, `hả`, `nhen`, `thoai`, `nhé`, `rồi nha`, `thôi nè`, `luôn nè`.
* **Tiếng lóng buôn bán ô tô dân gian:**
  * Cấm: `xe cọp`, `chất xe`, `xe keng`, `xe lướt chuẩn đét`, `đồ chơi miên man`, `bao đâm đụng ngập nước`, `cắt máu`, `bán tháo`, `gom xe`, `ôm xe`, `hốt xe`, `múc xe`, `tiền tươi`, `ứng nóng`, `chốt kèo`, `tiền lót tay`, `khách sộp`, `bãi xe`, `thủng lốp`.
* **Teencode & Viết tắt:**
  * Cấm: `ko`, `k`, `dc`, `đc`, `vs`, `ae`, `cx`, `thik`, `ntn`, `tg`, `mk`, `acc`.

---

### BƯỚC 2: Auto 28 Domain Lexicon SSoT (Bộ Từ Điển Thuật Ngữ Nghiệp Vụ)

#### 1. Phân hệ Kho xe & Định danh (Inventory):
* **Mã xe (`code`):** Luôn dùng "Mã xe" (hoặc "Mã quản lý xe"). Tuyệt đối **CẤM** dùng "Số khung" hay "VIN" làm định danh xe.
* **Số ODO:** Dùng "Số ODO" hoặc "Số km đã đi" (thay vì "công tơ mét", "km chạy", "đã đi").
* **Năm sản xuất:** Dùng "Năm sản xuất" (thay vì "đời xe", "năm sinh").
* **Phiên bản:** Dùng "Phiên bản" hoặc "Biến thể" (thay vì "loại xe", "dòng phụ").
* **Tình trạng pháp lý:** Dùng "Tình trạng pháp lý" / "Rút hồ sơ gốc" / "Sang tên đổi chủ" (thay vì "giấy tờ xe").

#### 2. Phân hệ Mua hàng & Chi phí (Purchasing & Reconditioning):
* **Giá nhập:** Dùng "Giá nhập" (Purchase Price) — thay vì "giá mua", "giá lấy", "giá gom".
* **Chi phí làm đẹp:** Dùng "Chi phí làm đẹp" / "Chi phí hoàn thiện xe" (Reconditioning Cost) — thay vì "tiền tút tát", "độ xe", "dọn dẹp".
* **Giá vốn:** Dùng "Giá vốn" (COGS = Giá nhập + Chi phí làm đẹp) — thay vì "tổng tiền xe", "giá gốc".

#### 3. Phân hệ Bán hàng & Doanh số (Sales & Deals):
* **Giá niêm yết:** Dùng "Giá niêm yết" / "Giá chào bán" (Listing Price) — thay vì "giá thách", "giá bán đại".
* **Giá chốt bán:** Dùng "Giá chốt bán" / "Giá bán thực tế" (Selling Price) — thay vì "giá bán thật", "tiền thu về".
* **Đặt cọc:** Dùng "Tiền đặt cọc" / "Xác nhận đặt cọc" (Deposit) — gắn liền trạng thái `DEPOSITED`.
* **Lợi nhuận gộp:** Dùng "Lợi nhuận gộp" (Gross Profit) — thay vì "tiền lời", "ăn chênh lệch".
* **Hoa hồng:** Dùng "Hoa hồng bán hàng" / "Thù lao kinh doanh" (Commission) — thay vì "tiền cắt phế", "tiền ngoài".

#### 4. Phân hệ Kế toán & Dòng tiền (Finance & Cashflow):
* **Phiếu thu:** "Phiếu thu" / "Thu tiền" (Cash In) — thay vì "tiền vào", "thu tiền ngoài".
* **Phiếu chi:** "Phiếu chi" / "Chi tiền" (Cash Out) — thay vì "tiền ra", "chi bừa".
* **Công nợ phải thu:** "Công nợ phải thu" (Receivables) — thay vì "khách nợ", "tiền thiếu".
* **Công nợ phải trả:** "Công nợ phải trả" (Payables) — thay vì "nợ tiền chủ xe".

#### 5. Phân hệ Nhân sự & Phân quyền (Staff & Roles):
* **Ban Giám Đốc:** `ADMIN`
* **Bộ phận Kế toán:** `ACCOUNTANT`
* **Chuyên viên tư vấn / Kinh doanh:** `STAFF`

---

### BƯỚC 3: Actionable UX Writing & Microcopy (Văn Phong Giao Diện)

#### 1. Nút bấm CTA (Button Text):
* Cấu trúc: `[Động từ hành động] + [Đối tượng cụ thể]`.
* ✅ Chuẩn: `Thêm xe mới`, `Lưu thông tin`, `Xác nhận đặt cọc`, `Tải hợp đồng PDF`, `Hủy thay đổi`.
* ❌ Cấm: `OK`, `Click vào đây`, `Lưu nè`, `Gửi`, `Submit`, `Yes`.

#### 2. Thông báo Lỗi (Actionable Error Messages):
* Cấu trúc 3 thành phần: **[Sự việc] + [Nguyên nhân] + [Hướng giải quyết]**.
* ✅ Chuẩn: `"Không thể hoàn tất giao dịch do Số tiền thanh toán vượt quá Công nợ còn lại. Vui lòng kiểm tra lại số tiền nhập."`
* ❌ Cấm: `"Có lỗi xảy ra!"`, `"Thao tác thất bại!"`, `"Lỗi mạng!"`.

#### 3. Trạng thái rỗng (Empty States):
* Cung cấp ngữ cảnh rõ ràng và nút bấm hướng dẫn hành động đầu tiên.

---

### BƯỚC 4: Vietnamese Grammar, Typography & Number Formatting

* **Quy chuẩn chính tả:** Đặt dấu thanh chuẩn hóa trên nguyên âm chính (`hòa`, `thủy`, `hoàn`, `toàn`).
* **Định dạng tiền tệ:** `1.250.000.000 ₫` (Dấu chấm hàng nghìn, ký hiệu `₫`).
* **Định dạng ngày tháng:** `DD/MM/YYYY` (VD: `18/08/2026`).
* **Định dạng ODO:** `45.000 km`.
* **Viết hoa (Capitalization):** Sentence case cho nhãn trường và thông báo; Title Case cho tiêu đề trang và modal.

---

### BƯỚC 5: Automated Scanner & Điểm Số Nghiệm Thu

Chạy lệnh kiểm định:
```bash
npm run audit:language
```

| Hạng mục kiểm tra | Điểm tối đa | Tiêu chí đạt chuẩn |
| :--- | :---: | :--- |
| **1. Anti-Colloquial & Anti-Slang** | 25 điểm | 0 khẩu ngữ, 0 từ cảm thán, 0 tiếng lóng, 0 teencode |
| **2. Domain Terminology SSoT** | 25 điểm | 100% khớp bộ từ điển nghiệp vụ Auto 28 (Mã xe, Giá vốn, ODO, v.v.) |
| **3. Actionable Microcopy & Error Messages** | 25 điểm | 0 thông báo lỗi mơ hồ, nút bấm có động từ dứt khoát |
| **4. Typography, Casing & Number Formatting** | 25 điểm | 100% đúng chuẩn chính tả tiếng Việt, định dạng tiền tệ `₫` và ngày tháng |
| **TỔNG CỘNG** | **100 điểm** | **Yêu cầu 100/100 để RELEASE** |
