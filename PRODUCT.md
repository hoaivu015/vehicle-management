# 🛡️ PRODUCT STRATEGY & DESIGN MANIFESTO: AUTO 28

## 0. THE GROUND RULES (Nền tảng kỹ thuật cơ bản)
- **Tech Stack (Ngăn nắp công nghệ)**: Bắt buộc dùng React 18+, TypeScript (Strict Mode), Tailwind CSS, Framer Motion (`motion/react`) và Lucide Icons. **TUYỆT ĐỐI CẤM** tự ý cài thêm các thư viện UI bên thứ 3 (như MUI, Ant Design, hay Bootstrap).
- **Language (Ngôn ngữ giao diện)**: Tiếng Việt là ngôn ngữ hiển thị duy nhất. Không được trộn lẫn tiếng Anh vào các nút bấm hay thông báo lỗi (Trừ các thuật ngữ chuyên ngành đã Việt hóa như "Odo", "Sale", "Stock").
- **Responsive Baseline (Nguyên tắc đa màn hình)**: 
  - Ưu tiên số 1 (Mobile-First): Thiết kế mặc định dựa trên màn hình iPhone (390px chiều ngang).
  - Ưu tiên số 2 (Tablet/Desktop): Bắt buộc phải có breakpoint `md:` và `lg:` cho các màn hình lớn. Không bao giờ để giao diện Desktop trông như một cái app di động bị kéo giãn.
- **Code Conventions (Chuẩn mực viết code)**: 
  - Component: `PascalCase` (VD: `CarCard`). 
  - Biến/Hàm: `camelCase` (VD: `calculateProfit`). 
  - Cấm sử dụng CSS inline `style={{}}` trừ khi cần gán giá trị động học thuật. Mọi style phải dùng Tailwind classes thông qua hàm `cn()`.

## 1. STRATEGIC POSITIONING (Định vị chiến lược)
- **Register**: `product` (Công cụ quản trị lõi, không phải trang landing page phô trương).
- **Core Users**: Đội ngũ tinh nhuệ của Auto 28 (Quản lý cấp cao, Kế toán, Sales, Kỹ thuật).
- **North Star Metrics (Chỉ số tối thượng)**: 
  - **Time-to-Insight (Tốc độ nhận thức)**: Mất bao lâu để quản lý biết một chiếc xe đang lỗ hay lãi?
  - **Time-to-Action (Tốc độ thao tác)**: Mất bao lâu để Sales nhập xong một khoản chi phí?
  > Mọi quyết định thiết kế (thêm 1 icon, thêm 1 màu sắc, chia layout) đều phải phục vụ việc tối ưu 2 chỉ số này.

## 2. BRAND PERSONALITY: "THE SWISS WATCH"
- **Precision (Độ chính xác tuyệt đối)**: Dữ liệu tài chính không được làm tròn sai lệch. Giao diện sắc nét đến từng hairline (0.5px).
- **Reliability (Độ tin cậy)**: Không bao giờ có trạng thái "đơ" hay giật lag. Mọi tương tác đều có phản hồi tức thì.
- **Fluidity (Tinh lưu)**: Chuyển động mượt mà, trơn tru như hệ sinh thái phần mềm nguyên bản của Apple.

## 3. ABSOLUTE ANTI-PATTERNS (Vùng cấm tuyệt đối - AI Slop Defense)
- 🚫 **Cognitive Overload**: Nhồi nhét quá nhiều thông tin cùng một cỡ chữ. Mọi màn hình phải có 1 (và chỉ 1) điểm nhấn thị giác (Focal Point).
- 🚫 **SaaS Clichés**: Dùng gradient tím/xanh vô nghĩa, shadow khổng lồ lơ lửng, icon 3D bóng bẩy kiểu đồ chơi.
- 🚫 **Modal Inception (Modal lồng Modal)**: Tuyệt đối cấm. Phải chuyển sang Bottom Sheet hoặc Slide-over panel để giữ ngữ cảnh.
- 🚫 **Dumb Skeletons**: Cấm dùng các khối xám nhấp nháy vô hồn. Bắt buộc dùng **Content-aware Skeletons** (Skeleton có hình dáng y hệt dữ liệu thực tế sẽ hiển thị).
- 🚫 **Logic in UI (Luật Clean Architecture)**: View components tuyệt đối không được tự thực hiện phép tính (VD: Lợi nhuận = Bán - Mua). Phải nhận dữ liệu (ViewModel) đã được Presenter xử lý.

## 4. THE "IPHONE NATIVE" PHILOSOPHY (Triết lý thực thi gốc)
- **Haptic & Touch Discipline**: 
  - Mọi vùng tương tác (Hit box) tối thiểu `44x44px`. 
  - Phản hồi vật lý: `active:scale-95` kết hợp với transition 150ms. Không dùng các giá trị scale ngẫu nhiên.
- **Safe Area Sovereignty**: Tuân thủ nghiêm ngặt `env(safe-area-inset-*)`. Nội dung không bao giờ bị "tai thỏ" hay "home indicator" che khuất.
- **Motion Choreography (Vũ đạo chuyển động)**:
  - Bắt buộc dùng Spring Physics (không dùng ease-in-out tuyến tính).
  - Danh sách xuất hiện phải theo kiểu Staggered (từng item hiện lên trễ nhau 30-50ms) để tạo dòng chảy thị giác.

## 5. ZERO-NOISE DENSITY & VISUAL LANGUAGE
- **Liquid Glass 2.0**: Giao diện nổi lên nhờ độ mờ (`backdrop-blur-md`, nền trắng 40%) và viền hairline (0.5px), tạo cảm giác có chiều sâu đa tầng mà không dùng shadow đen đặc.
- **Typographic Scale > Color**: Phân cấp thông tin bằng kích thước và độ đậm của chữ (Major Third scale) thay vì dùng hàng tá màu sắc khác nhau gây nhiễu.
- **Label Eradication (Triệt tiêu nhãn mác)**: Xóa bỏ các nhãn thừa. Nếu số tiền có màu xanh lá (Emerald) cạnh một icon `+`, người dùng tự hiểu đó là thu nhập. Cấm ghi chú dông dài: "Thu nhập của xe này là:".

## 6. SIGNATURE UX PATTERNS (Mẫu thiết kế độc bản Auto 28)
- **Financial Authority**: 
  - Đỏ (`Red-500`) = Tiền ra / Rủi ro. 
  - Lục (`Emerald-600`) = Tiền vào / An toàn. 
  - Không thỏa hiệp với các tone màu pastel yếu ớt cho dữ liệu sống còn.
- **Car-First Framing**: Trong màn hình chi tiết, hình ảnh xe phải chiếm trọn spotlight (≥40% khung hình mobile). Áp dụng hiệu ứng Ken Burns nhẹ (`scale-105`) khi hover/focus.
- **Unit Economy**: Tối ưu diện tích chữ trên không gian hẹp: Dùng `B` (Tỷ), `M` (Triệu), `k` (Nghìn) cho các UI elements trên mobile.

## 7. PRODUCTIVE FRICTION (Ma sát hiệu quả & Chống rủi ro)
- **Seamless is for Viewing, Friction is for Mutating**: Thao tác xem dữ liệu phải trơn tru tuyệt đối (0 ma sát). Nhưng thao tác thay đổi dữ liệu (Xóa, Chốt giá, Chi tiền) BẮT BUỘC phải có "Gờ giảm tốc" (Speed bumps).
- **Intentional Speed Bumps**: 
  - Các hành động phá hủy (Destructive) không bao giờ được đặt ở vị trí dễ bấm nhầm trên màn hình cảm ứng.
  - Sử dụng màn hình xác nhận với nút Action chính mang màu cảnh báo (`Red-500`) thay vì các hộp thoại Alert mặc định của trình duyệt.
- **Undo Windows**: Đối với các thao tác không phá hủy nhưng quan trọng, ưu tiên hiển thị Toast thông báo kèm nút "Hoàn tác (Undo)" trong 5 giây, thay vì làm phiền bằng câu hỏi "Bạn có chắc chắn?" trước khi thực hiện.

## 8. ERROR RESILIENCE & UX WRITING
- **Premium Empty States**: Khi chưa có dữ liệu, hiển thị thông điệp mang tính kích hoạt (Call to Action) kèm typography tinh xảo. Không để màn hình trống hoác gây hoang mang.
- **No-Panic Recovery**: Lỗi hệ thống phải đi kèm nút "Thử lại" hoặc cách khắc phục. Không ném mã lỗi HTTP vào mặt người dùng.
- **Expert Tone**: Dùng động từ mạnh, dứt khoát, mang tính nghiệp vụ: "Chốt xe", "Chi lương", "Giải ngân". Tránh ngôn ngữ robot: "Dữ liệu đã được cập nhật thành công".

## 9. ACCESSIBILITY CORE
- Đạt chuẩn tương phản WCAG AA.
- Tương thích 100% với Dynamic Type (kích thước chữ hệ thống iOS).
