---
name: ux-standards-enforcer
description: >
  Hệ thống kiểm soát và thực thi toàn diện Tiêu chuẩn Trải nghiệm Người dùng (UX/UI Standards)
  từ mức Tiêu chuẩn (ISO 9241, WCAG 2.2, Core Web Vitals, 10 Heuristics) đến Nâng cao (Neuro-UX,
  Zero-Latency, Optimistic UI, Fitts/Hick Laws) và Cao cấp Doanh nghiệp (Liquid Glass, Spring Physics,
  Haptic Matrix, SSoT Financial UX, DTCG Design Tokens). Kích hoạt khi user yêu cầu: "chuẩn UX",
  "tiêu chuẩn UX/UI", "tối ưu trải nghiệm", "audit UX", "review UI/UX".
---

# 🎨 UX/UI STANDARDS ENFORCER — TIÊU CHUẨN CÔNG NGHIỆP TRẢI NGHIỆM NGƯỜI DÙNG

> **Khung quy chuẩn:** ISO 9241-210 • ISO/IEC 25010 • W3C WCAG 2.2 • Google Core Web Vitals • Apple HIG & Liquid Glass 2.0 • W3C DTCG Tokens • SSoT Financial UX  
> **Mục tiêu:** Thiết lập, thẩm định và duy trì trải nghiệm người dùng đẳng cấp cao nhất — nhanh không độ trễ, tinh tế đa giác quan, rõ ràng nhận thức và an toàn tuyệt đối.

---

## ═══ I. MA TRẬN TIÊU CHUẨN 3 TẦNG THỰC THI ═══

### 🔹 TẦNG 1: STANDARD TIER (Tiêu Chuẩn Cơ Bản)
1. **WCAG 2.2 AA Accessibility:**
   * Độ tương phản màu chữ/nền $\ge 4.5:1$ (chữ đậm $\ge 3:1$).
   * Vùng chạm (*Touch Target*) $\ge 44 \times 44\text{px}$ trên iOS và $\ge 48 \times 48\text{px}$ trên Web/Android.
   * Duyệt phím hoàn chỉnh (`Tab`, `Shift+Tab`, `Enter`, `Escape`) và hiển thị viền Focus rõ ràng.
2. **Google Core Web Vitals (CWV):**
   * **LCP $\le 2.5\text{s}$:** Ưu tiên tải ảnh Hero (`fetchpriority="high"`), pre-connect font.
   * **INP $\le 200\text{ms}$:** Xử lý sự kiện bất đồng bộ, không khóa luồng chính (Main Thread).
   * **CLS $\le 0.1$:** Đặt kích thước cố định (`aspect-ratio`, `width`, `height`) cho hình ảnh và khung chứa.
3. **10 Nielsen Usability Heuristics:**
   * Luôn có Skeleton Loader khi tải dữ liệu, thông báo lỗi chỉ rõ cách khắc phục, cung cấp nút "Quay lại" hoặc "Đóng" trực quan.

---

### 🔹 TẦNG 2: ADVANCED TIER (Nâng Cao & Công Thái Học Nhận Thức)
1. **Công Thái Học Nhận Thức (Cognitive Ergonomics & Neuro-UX):**
   * **Định luật Hick-Hyman:** Không dàn trải quá $5 - 7$ tùy chọn trên 1 màn hình. Áp dụng *Progressive Disclosure* (chỉ hiển thị chi tiết khi người dùng nhấn mở rộng).
   * **Định luật Fitts:** Đặt các nút điều hướng và CTA quan trọng (Gọi điện, Đặt cọc, Gửi đơn) tại vùng thuận tiện nhất của ngón tay cái (*The Thumb Zone*).
   * **Quy tắc Gom Cụm Miller (Miller's Chunking):** Chia nhỏ các khối thông tin xe/tài chính thành các cụm $4 \pm 1$ thuộc tính kèm tiêu đề đậm nét (*Bold-First*).
   * **Sweller’s Cognitive Load Theory:** Giảm tải nhận thức thừa bằng cách lược bỏ các đường viền thô cứng, thay bằng khoảng đệm thoáng đãng (*8pt grid spacing*).
2. **Kỹ Thuật Không Độ Trễ (Zero-Latency Perceived Performance):**
   * **Optimistic UI:** Cập nhật trạng thái giao diện ngay lập tức trong $0\text{ms}$ khi người dùng thao tác (như ghim xe, lưu yêu thích, duyệt đơn), đồng thời chạy ngầm API. Nếu API thất bại, tự động rollback kèm thông báo tinh tế.
   * **Speculative Prefetching:** Lắng nghe sự kiện hover hoặc cuộn trang để nạp trước dữ liệu modal/trang tiếp theo.
   * **Skeleton Morphing:** Skeleton khớp chính xác 1:1 với kích thước thẻ thật, loại bỏ hoàn toàn hiện tượng nhảy bố cục khi dữ liệu xuất hiện.
3. **Thích Ứng Ngữ Cảnh (Context-Aware UX):**
   * Tự động điều chỉnh chất lượng đồ họa theo tình trạng mạng và pin (`Network Information API`, `Battery API`).
   * **Smart Amount Input:** Nhập số tiền đến đâu tự động hiển thị chữ diễn giải tiếng Việt tức thời đến đó.

---

### 🔹 TẦNG 3: ENTERPRISE & ELITE TIER (Cao Cấp Doanh Nghiệp)
1. **Vật Liệu Dạng Lỏng & Chiều Sâu Không Gian (Liquid Glass 2.0 & Spatial Depth):**
   * Xây dựng cấu trúc kính mờ đa tầng (`backdrop-blur-xl`, `bg-white/75` trên Light Mode, `rgba(22,26,35,0.65)` trên Dark Mode).
   * Viền siêu mảnh (*Hairline Border 1px*) với độ mờ $10\%$ phản chiếu ánh sáng môi trường.
2. **Động Lực Học Lò Xo & Bản Đồ Xúc Giác (Spring Physics & Haptic Matrix):**
   * Mọi chuyển động vi mô (Micro-interactions) sử dụng lò xo tự nhiên (`stiffness: 300`, `damping: 25`), gắn `active:scale-[0.96] transition-transform`.
   * Tích hợp phản hồi xúc giác qua Capacitor Haptics:
     * Chạm nút / Tab: `ImpactStyle.Light`
     * Nhập số / Thay đổi giá trị: `Haptics.selection()`
     * Hoàn thành giao dịch / Lưu cọc: `NotificationType.Success`
     * Cảnh báo / Tồn kho quá hạn: `NotificationType.Warning`
3. **Toàn Vẹn Dữ Liệu & Bảo Vệ Tài Chính (Enterprise Financial UX Integrity):**
   * **Grace-Period Undo:** Cung cấp thời gian ân hạn $5 - 10\text{s}$ cho phép người dùng bấm "Hoàn tác" thay vì dùng popup xác nhận gây tắc nghẽn trải nghiệm.
   * **SSoT Financial Display:** Định dạng tiền tệ bất biến, không làm tròn số lẻ gây sai lệch số liệu kế toán.
   * **Anti-Dark Patterns:** Quyền từ chối hoặc hủy bỏ phải trực quan, bình đẳng như quyền đồng ý.
4. **Kiến Trúc Design Tokens 3 Lớp (W3C DTCG Standard):**
   * `Global Tokens` (Màu gốc, Kích thước) $\rightarrow$ `Semantic Tokens` (Mục đích sử dụng) $\rightarrow$ `Component Tokens` (Thành phần cụ thể).

---

## ═══ II. CHECKLIST THẨM ĐỊNH UX/UI TRƯỚC KHI RELEASE ═══

### 🚀 Checklist Kỹ thuật & Hiệu năng
- [ ] LCP dưới $2.5\text{s}$, INP dưới $200\text{ms}$, CLS dưới $0.1$.
- [ ] Không có hiện tượng giật khung hình (Zero Frame Drop / 60-120 FPS).
- [ ] Các thành phần mờ kính/lò xo có `will-change: transform` để GPU xử lý riêng biệt.

### 📱 Checklist Công thái học Di động
- [ ] Đạt chuẩn Safe Area (`env(safe-area-inset-top)` và `env(safe-area-inset-bottom)`).
- [ ] Vùng chạm tối thiểu $44 \times 44\text{px}$, khoảng cách giữa các nút $\ge 8\text{px}$.
- [ ] Nút CTA then chốt nằm trong vùng ngón tay cái (*The Thumb Zone*).
- [ ] Không bị khuyết chữ (*No Text Truncation*) ở bất kỳ độ phân giải nào ($375\text{px} - 1920\text{px}$).

### 💎 Checklist Cảm giác & Thẩm mỹ
- [ ] Toàn bộ nút bấm có hiệu ứng phản hồi `active:scale-[0.96]`.
- [ ] Tích hợp đúng bản đồ rung Haptic tương ứng với từng loại hành vi.
- [ ] Form nhập số tiền có bộ giải nghĩa chữ tiếng Việt tức thời.
- [ ] Có tính năng Grace-Period Undo cho các thao tác xoá hoặc đổi trạng thái quan trọng.
