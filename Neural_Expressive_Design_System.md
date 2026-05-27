# Cẩm Nang Hệ Thống Thiết Kế Neural Expressive (UI/UX Design System)
Tài liệu quy chuẩn kỹ thuật và khuôn mẫu trực quan giúp dịch chuyển từ giao diện tĩnh, hình khối sang cấu trúc **"Dạng lỏng" (Fluid)**, chú trọng vào chuyển động vật lý, phân tầng nhận thức và tương tác đa phương thức bản địa của kỷ nguyên AI.

---

## 1. Triết Lý Thiết Kế Cốt Lõi (Design Philosophy)
*   **Tính Đa Phương Thức Bản Địa (Native Multimodality)**: Giao diện xóa bỏ ranh giới của văn bản thô. Toàn bộ hệ thống được thiết lập để tiếp nhận và phản hồi song song bằng hình ảnh, âm thanh, video ngắn và phản hồi xúc giác.
*   **Bố Cục Dạng Lỏng (Fluid Layout)**: Triệt tiêu các khung lưới (Grid) cố định cứng nhắc. Các thành phần UI tự động co giãn, bung nở và dịch chuyển cấu trúc dựa trên khối lượng thông tin phản hồi từ mô hình AI.
*   **Thiết Kế Cảm Xúc & Sinh Học**: Giao diện mô phỏng các thực thể sống thông qua dải màu Gradient chuyển động chậm (Ambient) và các hiệu ứng diễn hoạt mềm mại, tạo cảm giác hệ thống đang "suy nghĩ" hoặc "biết thở".

---

## 2. Bố Cục & Khoảng Cách (Layout & Spacing)
Hệ thống khoảng cách tuân thủ nghiêm ngặt **Hệ lưới động mềm (Fluid Soft Grid)** dựa trên bội số của `8px`. Các khoảng thở (Breathing space) lớn được ưu tiên để giảm tải áp lực thị giác.
*   **Độ bo góc thẻ (Border Radius)**: Sử dụng các góc bo cực đại để triệt tiêu cảm giác sắc nhọn của máy móc.
    *   Khung thẻ lớn (Main Cards): `rounded-[32px]` (`32px` hoặc đường cong Super Ellipse).
    *   Thành phần con bên trong (Internal Elements/Images): `rounded-[20px]` đến `rounded-[24px]`.
    *   Thanh điều khiển/Nút bấm (Pills/Buttons): `rounded-full` (`9999px` hình viên thuốc).
*   **Khoảng đệm nội dung (Padding)**:
    *   Đệm viền tổng thể của thẻ: Tối thiểu `p-6 (24px)`, lý tưởng là `p-8 (32px)`.
    *   Khoảng cách giữa các thẻ trong lưới (Grid Gap): `gap-6 (24px)` hoặc `gap-8 (32px)`.
*   **Khoảng cách thành phần con (Gap Spacing)**:
    *   Giữa Tiêu đề và Mô tả ngắn: `gap-1 (4px)` hoặc `gap-2 (8px)`.
    *   Giữa khối chữ và khối hình ảnh/biểu đồ nhúng: `gap-4 (16px)` hoặc `gap-6 (24px)`.

---

## 3. Hệ Thống Kiểu Chữ (Typography Scale)
Hệ thống chữ áp dụng **Quy tắc 2 Giây (Bold-First)**: Đẩy toàn bộ độ tương phản vào tiêu đề chính để hỗ trợ người dùng đọc lướt, xóa bỏ hoàn toàn các "bức tường văn bản" dài dằng dặc.

*   **Phông chữ đề xuất**: `Plus Jakarta Sans`, `Google Sans Text`, hoặc `Inter`.

| Thành phần chữ | Kích thước (Pixel) | Độ dày chữ (Weight) | Khoảng cách chữ (Letter Spacing) | Mã Tailwind ứng dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Số liệu lớn (Metrics)** | `32px` - `40px` | `Black (900)` | Thắt chặt (`-0.05em`) | `text-4xl font-black tracking-tighter` |
| **Tiêu đề Thẻ (Card Title)**| `20px` - `24px` | `Black (900)` | Thu hẹp (`-0.025em`) | `text-xl font-black tracking-tight` |
| **Văn bản phụ (Subtitle)** | `14px` - `15px` | `Medium (500)` | Bình thường | `text-sm font-medium text-gray-500` |
| **Đoạn văn phản hồi (Body)**| `16px` | `Regular (400)` | Bình thường (Dòng thoáng) | `text-base text-gray-600 leading-relaxed` |
| **Nhãn viên thuốc (Tag/Pill)**| `12px` | `Bold (700)` | Mở rộng (`0.1em`) | `text-xs font-bold tracking-widest uppercase` |

---

## 4. Hệ Thống Màu Sắc & Chiều Sâu UI (Color & Depth)
Neural Expressive phân rã không gian ứng dụng thành 4 tầng phân lớp dựa trên vật liệu **Mờ kính (Translucency)** và các đường viền phản chiếu ánh sáng siêu mảnh (`Hairline borders`).

```
[Layer 3: Overlays / AI Spark] --> Màu Gradient rực rỡ, Bóng đổ rất dày (shadow-2xl)
↓
[Layer 2: Sub-elements / Pills] --> Nền đặc hoặc mờ nhẹ, border trong suốt
↓
[Layer 1: Surface / Cards] --> Nền trong suốt 70%, hiệu ứng blur-xl, shadow-sm
↓
[Layer 0: Canvas / Base Background] --> Nền Off-white/Midnight phối Ambient Gradient
```

### Thông số kỹ thuật CSS (Tailwind):
*   **Lớp 0 (Nền cơ sở)**: `bg-[#F8FAF4]` (Giao diện sáng) | `bg-[#0B0E14]` (Giao diện tối).
*   **Lớp 1 (Mặt thẻ)**: `bg-white/70 backdrop-blur-xl border border-black/5 shadow-sm`.
*   **Lớp 2 (Phần tử tương tác)**: `bg-gray-50/50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100`.
*   **Lớp 3 (Tiêu điểm tối cao)**: `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/10`.

---

## 5. Hoạt Ảnh Tương Tác & Hiệu Ứng (Animations & Micro-interactions)

Tuyệt đối tránh các hiệu ứng chuyển động tuyến tính (Linear) phẳng và khô cứng. Toàn bộ diễn hoạt phải tuân theo lực lượng vật lý lò xo để tạo độ nảy.

*   **Hàm chuyển động lò xo tiêu chuẩn (Spring Timing Function)**:
    ```css
    transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1)
    ```
*   **Hiệu ứng Phản hồi lực nén (Press Compression)**: Khi người dùng hover hoặc bấm vào thẻ card, thẻ sẽ hơi lún xuống nhẹ và tự nảy lên khi thả tay:
    ```css
    .card-interact:hover { transform: translateY(-4px) scale(1.01); }
    .card-interact:active { transform: scale(0.98); }
    ```
*   **Diễn hoạt dòng chảy ngầm (Ambient Gradient Animation)**: Lớp nền dưới cùng tự chuyển dịch sắc độ chậm để tạo cảm giác giao diện "biết thở":
    ```css
    @keyframes ambient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    ```

---

## 6. Thiết Kế Đáp Ứng Toàn Diện (Fluid Responsive Template)

Để các thẻ tự cấu trúc lại kích thước hoàn hảo trên cả Mobile, Tablet và Desktop mà không cần viết quá nhiều dòng mã `@media`, áp dụng công thức **CSS Grid Auto-fit** kết hợp khóa tỷ lệ hình học (`aspect-ratio`):

```css
/* Container chứa các thẻ card */
.expressive-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

/* Cấu trúc khóa tỷ lệ vàng hình học cho Card dọc */
.expressive-vertical-card {
    width: 100%;
    max-width: 420px;
    aspect-ratio: 1 / 1.414; /* Khóa tỷ lệ căn bậc hai thanh lịch */
}
```

Dưới đây là mã nguồn của một file HTML hoàn chỉnh (index.html). File này được xây dựng như một Cẩm nang Thiết kế trực quan (Design System Guide), tích hợp sẵn framework Tailwind CSS và phông chữ Plus Jakarta Sans.
Nó vừa giải nghĩa chi tiết các thông số kỹ thuật (Kích thước, Khoảng cách, Kiểu chữ, Màu sắc), vừa áp dụng trực tiếp các thuộc tính mã nguồn đó để tạo nên các cấu trúc thẻ card "dạng lỏng" có hiệu ứng chuyển động lò xo chuẩn phong cách Neural Expressive.
Bạn hãy sao chép toàn bộ đoạn mã dưới đây, lưu thành file index.html và mở trực tiếp trên trình duyệt web:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cẩm Nang Thiết Kế Neural Expressive</title>
    <!-- Tích hợp Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Tích hợp Phông chữ Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        /* Hiệu ứng chuyển động ngầm cho lớp nền Canvas */
        @keyframes ambientGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-ambient {
            background: linear-gradient(-45deg, #f8fafc, #f1f5f9, #e0e7ff, #f8fafc);
            background-size: 400% 400%;
            animation: ambientGradient 20s ease infinite;
        }
    </style>
</head>
<body class="animate-ambient min-h-screen text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">

    <!-- THANH DIỀU HƯỚNG / TIÊU ĐỀ CHÍNH -->
    <header class="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <div class="inline-flex items-center gap-2 bg-indigo-50/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-indigo-100/50 mb-4">
            <span class="text-xs font-black tracking-wider text-indigo-600 uppercase">Hệ Thống Quy Chuẩn UI/UX</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-4 leading-none">
            Ngôn Ngữ Thiết Kế Neural Expressive
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Tài liệu kỹ thuật và khuôn mẫu trực quan giúp đưa ADN giao diện động, lỏng và đa phương thức của kỷ nguyên AI vào ứng dụng web của bạn.
        </p>
    </header>

    <!-- KHÔNG GIAN TRIỂN LÃM / NỘI DUNG CHÍNH -->
    <main class="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- 1. TRIẾT LÝ THIẾT KẾ & HOẠT ẢNH TƯƠNG TÁC -->
        <section class="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[32px] p-8 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:shadow-md hover:scale-[1.01] group">
            <div class="flex items-center gap-3 mb-6">
                <span class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">1</span>
                <h2 class="text-2xl font-black tracking-tight text-gray-900">Triết Lý & Tương Tác Lò Xo</h2>
            </div>
            
            <p class="text-base font-bold text-gray-900 mb-2">ADN "Dạng lỏng" (Fluid Entity)</p>
            <p class="text-sm text-gray-600 leading-relaxed mb-6">
                Giao diện không đứng yên. Các thẻ card sử dụng đường cong siêu mềm <code class="bg-black/5 px-1.5 py-0.5 rounded text-xs">rounded-[32px]</code> để triệt tiêu góc nhọn, phản hồi lực nén vật lý khi người dùng tương tác.
            </p>

            <!-- Khối demo hoạt ảnh tương tác -->
            <div class="bg-gray-50/50 border border-gray-100 p-6 rounded-[24px] text-center">
                <p class="text-xs font-medium text-gray-400 mb-4">Rê chuột hoặc chạm thử vào nút dưới đây</p>
                <button class="bg-black text-white px-8 py-4 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:bg-indigo-600 active:scale-95">
                    Nút bấm Đàn hồi (Spring Button)
                </button>
            </div>
        </section>

        <!-- 2. BỐ CỤC, KÍCH THƯỚC & KHOẢNG CÁCH THÀNH PHẦN -->
        <section class="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[32px] p-8 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:shadow-md hover:scale-[1.01]">
            <div class="flex items-center gap-3 mb-6">
                <span class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">2</span>
                <h2 class="text-2xl font-black tracking-tight text-gray-900">Bố Cục & Khoảng Cách</h2>
            </div>

            <p class="text-base font-bold text-gray-900 mb-2">Quy tắc Khoảng thở (Breathing Space)</p>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
                Sử dụng hệ lưới động mềm dựa trên bội số của 8px. Khoảng đệm tổng của thẻ tối thiểu đạt <code class="bg-black/5 px-1.5 py-0.5 rounded text-xs">p-8 (32px)</code> để tạo không gian thoáng đạt cho AI hiển thị dữ liệu.
            </p>

            <!-- Minh họa tỷ lệ bên trong thẻ -->
            <div class="border border-dashed border-indigo-300/60 bg-indigo-50/30 p-6 rounded-[24px] flex flex-col gap-4">
                <div class="bg-indigo-600 text-white text-center py-2 rounded-full text-xs font-bold">
                    Tiêu đề (Khoảng cách dưới: Gap 8px)
                </div>
                <div class="bg-indigo-400 text-white text-center py-4 rounded-[16px] text-xs font-bold">
                    Nội dung phương thức lồng ghép (Gap 16px)
                </div>
                <div class="bg-indigo-200 text-indigo-800 text-center py-2 rounded-full text-xs font-bold">
                    Thanh viên thuốc hành động
                </div>
            </div>
        </section>

        <!-- 3. HỆ THỐNG KIỂU CHỮ PHÂN TẦNG VÀ TỐC ĐỘ NHẬN THỨC -->
        <section class="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[32px] p-8 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:shadow-md hover:scale-[1.01]">
            <div class="flex items-center gap-3 mb-6">
                <span class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">3</span>
                <h2 class="text-2xl font-black tracking-tight text-gray-900">Kiểu Chữ Phân Tầng (Typography)</h2>
            </div>

            <p class="text-base font-bold text-gray-900 mb-2">Quy tắc 2 Giây (Bold-First)</p>
            <p class="text-sm text-gray-600 leading-relaxed mb-6">
                Chống quá tải thông tin. Ý chính quan trọng nhất luôn được in đậm hết cỡ, cỡ chữ lớn và ép sát khoảng cách ký tự (<code class="bg-black/5 px-1.5 py-0.5 rounded text-xs">tracking-tight</code>) nằm ở trên cùng để người dùng đọc lướt nhanh.
            </p>

            <!-- Khối demo kiểu chữ -->
            <div class="bg-white border border-gray-100 p-6 rounded-[24px] shadow-inner">
                <span class="text-xs font-bold tracking-widest text-indigo-600 uppercase block mb-1">Mẫu cấu trúc</span>
                <h3 class="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                    Tiêu đề cực đậm, khít chữ để đọc lướt nhanh
                </h3>
                <p class="text-base text-gray-600 leading-relaxed">
                    Đoạn văn mô tả chi tiết sử dụng độ dày chữ thường (Regular 400) kết hợp chiều cao dòng thoáng đạt để mắt không bị mỏi khi đọc chuỗi dữ liệu dài.
                </p>
            </div>
        </section>

        <!-- 4. HỆ THỐNG MÀU SẮC, HIỆU ỨNG VÀ CHIỀU SÂU UI -->
        <section class="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[32px] p-8 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:shadow-md hover:scale-[1.01]">
            <div class="flex items-center gap-3 mb-6">
                <span class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">4</span>
                <h2 class="text-2xl font-black tracking-tight text-gray-900">Màu Sắc & Chiều Sâu UI</h2>
            </div>

            <p class="text-base font-bold text-gray-900 mb-2">Cấu trúc đa tầng kính (Translucency Layout)</p>
            <p class="text-sm text-gray-600 leading-relaxed mb-6">
                Không dùng mảng xám đặc. Thay vào đó dùng độ trong suốt của hiệu ứng mờ kính (<code class="bg-black/5 px-1.5 py-0.5 rounded text-xs">backdrop-blur</code>) kết hợp viền mờ siêu mảnh để tạo chiều sâu lơ lửng cho vật thể.
            </p>

            <!-- Demo 3 lớp chiều sâu lồng nhau trực quan -->
            <div class="bg-gray-100/80 p-4 rounded-[24px] space-y-3">
                <div class="bg-white/90 border border-black/5 p-3 rounded-[18px] text-xs font-semibold text-gray-700 shadow-sm">
                    Lớp 1: Mặt thẻ chính (Surface) - Độ mờ nền 80%
                </div>
                <div class="bg-white border border-black/10 p-3 rounded-[18px] text-xs font-semibold text-gray-800 shadow-md">
                    Lớp 2: Thành phần tương tác (Pills/Input) - Đổ bóng rõ nét hơn
                </div>
                <div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-3 rounded-[18px] text-xs font-black text-white shadow-lg animate-pulse">
                    Lớp 3: Tiêu điểm tối cao (Overlay/AI Spark) - Rực rỡ sinh học
                </div>
            </div>
        </section>

        <!-- 5. THIẾT KẾ ĐÁP ỨNG TOÀN DIỆN (FLUID RESPONSIVE PREVIEW) -->
        <section class="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[32px] p-8 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:shadow-md hover:scale-[1.01] md:col-span-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">5</span>
                    <h2 class="text-2xl font-black tracking-tight text-gray-900">Thiết Kế Đáp Ứng Thực Tế (Responsive Product Grid)</h2>
                </div>
                <span class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 self-start">
                    Tự động co giãn theo Tỷ Lệ Vàng
                </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-6">
                Dưới đây là lưới thẻ sản phẩm được thiết lập tự động co giãn bằng CSS Grid. Kích thước thẻ sẽ tự động thích ứng mượt mà từ màn hình di động nhỏ gọn cho tới màn hình máy tính cỡ lớn mà không bị vỡ bố cục.
            </p>

            <!-- LƯỚI ĐÁP ỨNG MẪU (RESPONSIVE GRID) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <!-- THẺ SẢN PHẨM MẪU 1 -->
                <div class="bg-white/90 border border-black/5 rounded-[28px] p-5 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md group">
                    <div class="w-full aspect-[4/3] bg-gradient-to-tr from-sky-100 to-indigo-100 rounded-[20px] overflow-hidden relative mb-4">
                        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop" alt="Sản phẩm" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-600">Mới</span>
                    </div>
                    <h3 class="text-xl font-black text-gray-900 tracking-tight mb-1">Giày Chạy Bộ Neural</h3>
                    <p class="text-xs text-gray-500 mb-4 leading-normal">Đế đệm khí tự thích ứng lực chân thông minh.</p>
                    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span class="text-lg font-black text-gray-900">2.450.000đ</span>
                        <button class="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-indigo-600 transition-colors">Mua ngay</button>
                    </div>
                </div>

                <!-- THẺ SẢN PHẨM MẪU 2 -->
                <div class="bg-white/90 border border-black/5 rounded-[28px] p-5 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md group">
                    <div class="w-full aspect-[4/3] bg-gradient-to-tr from-purple-100 to-pink-100 rounded-[20px] overflow-hidden relative mb-4">
                        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop" alt="Sản phẩm" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-purple-600">Hot</span>
                    </div>
                    <h3 class="text-xl font-black text-gray-900 tracking-tight mb-1">Tai Nghe Expressive Studio</h3>
                    <p class="text-xs text-gray-500 mb-4 leading-normal">Âm thanh đa hướng, khử tiếng ồn bằng AI.</p>
                    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span class="text-lg font-black text-gray-900">4.890.000đ</span>
                        <button class="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-purple-600 transition-colors">Mua ngay</button>
                    </div>
                </div>

                <!-- THẺ SẢN PHẨM MẪU 3 -->
                <div class="bg-white/90 border border-black/5 rounded-[28px] p-5 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md group sm:col-span-2 lg:col-span-1">
                    <div class="w-full aspect-[4/3] bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-[20px] overflow-hidden relative mb-4">
                        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop" alt="Sản phẩm" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h3 class="text-xl font-black text-gray-900 tracking-tight mb-1">Đồng Hồ Thông Minh Aura</h3>
                    <p class="text-xs text-gray-500 mb-4 leading-normal">Đo chỉ số sinh học và phản hồi xúc giác động.</p>
                    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span class="text-lg font-black text-gray-900">6.200.000đ</span>
                        <button class="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-600 transition-colors">Mua ngay</button>
                    </div>
                </div>

            </div>
        </section>

    </main>

    <!-- FOOTER CHÚ THÍCH KỸ THUẬT -->
    <footer class="border-t border-black/5 bg-white/40 backdrop-blur-md py-8 text-center text-xs text-gray-400">
        <p>Cẩm nang mẫu được tối ưu hóa dựa trên tài nguyên công bố tại sự kiện Google I/O 2026.</p>
    </footer>

</body>
</html>
```


---

## 7. Quy Chuẩn Kỹ Thuật Vi Mô Cho Thẻ Card (Advanced Card Components Spec)
Mọi cấu trúc thẻ card trong hệ thống phải tuân thủ nghiêm ngặt các giới hạn biên độ vật lý để không làm mất đi tính chân thực của vật liệu kính dạng lỏng [9to5Google]:
*   **Quy tắc khóa biên độ co dãn (Width Guardrails)**:
    *   *Biên độ tối thiểu (Min-Width)*: `280px`. Nếu màn hình co nhỏ hơn mức này, thẻ bắt buộc phải tràn viền (`width: 100%`) và triệt tiêu khoảng lề để bảo toàn không gian hiển thị chữ bên trong.
    *   *Biên độ tối đa (Max-Width)*: `420px` đối với thẻ dọc và `760px` đối với thẻ dashboard ngang. Nếu màn hình mở rộng hơn, hệ thống lưới bắt buộc phải tự động sinh thêm cột (`Grid Columns`) thay vì kéo dãn chiều rộng của thẻ hiện tại.
*   **Quy chuẩn khoảng thở biên (Aspect-Ratio Constraints)**: Để duy trì tỷ lệ hình học cân đối theo đúng Quy luật sinh học của Neural Expressive, các thẻ dọc hiển thị nội dung nên được khóa cứng tỷ lệ bằng thuộc tính CSS:
    ```css
    .card-fluid-vertical {
      width: 100%;
      aspect-ratio: 1 / 1.414; /* Tỷ lệ trang sách chuẩn hình học */
    }
    ```

---

## 8. Quy Chuẩn Tối Ưu Hóa Phần Cứng & Hiệu Năng Cuộn (Hardware Acceleration Spec)
Để đảm bảo luồng giao diện mờ kính `Liquid Glassmorphic` đạt hiệu năng vận hành mượt mà tuyệt đối 120Hz trên các thiết bị di động cấu hình trung bình, toàn bộ hệ thống thẻ card bắt buộc phải tuân theo quy chuẩn phần cứng sau [9to5Google]:

### A. Tầng Graphics Layer (GPU Acceleration)
Mọi thẻ card có sử dụng thuộc tính `backdrop-filter: blur()` kết hợp diễn hoạt lò xo nảy bắt buộc phải được khai báo thuộc tính `will-change: transform`. Quy định này ép buộc trình duyệt cô lập phần tử ra một Graphics Layer riêng, triệt tiêu hoàn toàn tiến trình `Repaint` (vẽ lại đồ họa) trên CPU khi người dùng thực hiện thao tác cuộn trang [c55199639.epi].

Để tương thích ngược và kích hoạt 3D Layer trên các trình duyệt Safari/iOS cũ, hãy bổ sung thuộc tính `transform: translateZ(0)` đi kèm:
```css
.expressive-hardware-card {
  will-change: transform; 
  transform: translateZ(0);
}
```

### B. Thuật toán tối ưu bộ nhớ ẩn (Containment Rule)
Để hỗ trợ trình duyệt tính toán ranh giới của thẻ card nhanh hơn trên màn hình di động, hãy bổ sung thuộc tính cô lập layout vào cấu trúc CSS của lớp chứa danh sách thẻ (Grid Container):
```css
.card-grid-container {
  contain: layout style; /* Ngăn chặn sự thay đổi của thẻ card bên trong làm ảnh hưởng đến toàn bộ cấu trúc cây DOM bên ngoài */
}
```

### C. ⚠️ 3 Cảnh báo khi sử dụng will-change
1. **Tuyệt đối không áp dụng will-change lên toàn bộ phần tử**: Tránh code dạng `* { will-change: transform; }` vì việc ép hàng ngàn phần tử lên Graphics Layer cùng lúc sẽ gây tràn bộ nhớ RAM và làm sập hoặc treo trình duyệt.
2. **Chỉ áp dụng cho phần tử có hoạt ảnh động**: Chỉ gán cho các thẻ card có hover/active hoặc nằm trong list cuộn phức tạp.
3. **Bỏ kích hoạt khi không cần thiết**: Dùng JavaScript để thêm/xóa class chứa `will-change` khi cuộn trang đối với danh sách cực lớn.


---

## 9. Đặc Tả Hiệu Ứng Khởi Tạo & Load Trang (Biological Loading Spec)
Mọi hiệu ứng chờ tải dữ liệu trong hệ thống tuyệt đối không được làm đóng băng màn hình, bắt buộc phải duy trì chuyển động liên tục để giữ tương tác nhận thức với người dùng [c55199639.epi].

*   **Chỉ số trễ phân tầng (Stagger Delay Calculation)**: Khi kết quả trả về dưới dạng danh sách mảng ($N$ phần tử), hiệu ứng xuất hiện của phần tử thứ $i$ phải được gán công thức tính toán thời gian trễ tự động:
    $$\text{DelayTime}(i) = i \times 60\,\text{ms}$$
    *Giới hạn biên độ*: Tổng thời gian trễ của phần tử cuối cùng không được vượt quá `360ms` để tránh cảm giác giao diện bị trễ lười trên màn hình Desktop lớn.
*   **Thiết lập tối ưu CSS cho Shimmer Animation**: Để tránh hiện tượng giật giật (Jank) khi trình duyệt tính toán hiệu ứng quét sáng Shimmer trên nền kính mờ, thuộc tính dịch chuyển bắt buộc phải sử dụng `transform: translateX()` (nhờ GPU xử lý lớp riêng) thay vì thay đổi thuộc tính `background-position` (bị ép CPU repaint lại vật liệu kính) [9to5Google].
*   **Giai Đoạn Chuyển Động & Động Lực Học (Chrono-Physics Spec)**:
    1.  *Giai đoạn 1: Quét xương (Shimmer Skeleton)* - Chạy lặp vô hạn, linear (Tuyến tính), dịch chuyển vị trí sáng bằng `transform: translateX()`.
    2.  *Giai đoạn 2: Bung nở nội dung (Fluid Reveal)* - 450ms, `cubic-bezier(0.34, 1.56, 0.64, 1)`, opacity (`0 → 1`) kết hợp `translateY` (`24px → 0px`) nảy lò xo.
*   **Quy chuẩn Thiết kế Vi mô (Micro Visual Guidelines)**:
    1.  *Quy tắc phân rã nối đuôi (Staggered Animation)*: Các phần tử trên trang không được xuất hiện đồng loạt. Chúng phải tuân theo thứ tự phân tầng nhận thức: Khung nền ứng dụng -> Tiêu đề chữ (Header) -> Thẻ Card thứ nhất -> Thẻ Card thứ hai -> Thanh viên thuốc hành động. Mỗi thành phần con xuất hiện cách nhau một khoảng trễ (Delay) cố định đúng 60ms để tạo hiệu ứng "sóng chảy" đổ xô từ trên xuống dưới.
    2.  *Vật liệu Shimmer Kính Lỏng (Liquid Glassmorphism Skeleton)*: Khung xương giả lập (Skeleton) của thẻ card khi đang chờ dữ liệu không được dùng màu xám đặc (`bg-gray-200`). Nó phải sử dụng chính chất liệu kính mờ `bg-white/[0.04]` `backdrop-blur-xl`, bên trong chứa một dải sáng bạc mờ (`rgba(255,255,255,0.06)`) quét liên tục từ trái sang phải [9to5Google].


---

## 10. Đặc Tả Dòng Chảy Không Gian Chuyển Trang (Spatial Flow Page Transition Spec)
Mọi hành vi điều hướng chuyển đổi trang (Page Navigation) trong ứng dụng bắt buộc phải sử dụng kiến trúc chuyển dịch đa tầng lơ lửng, triệt tiêu việc tải lại (Reload) toàn bộ bố cục phẳng [c55199639.epi].

*   **Thông số chuyển trang (Transition Tokens)**:
    1.  *Trang cũ rời đi (Leave)* - 250ms, `cubic-bezier(0.4, 0, 1, 1)` (Gia tốc nhanh), thay đổi `opacity` (`1 → 0`) và `scale` (`1 → 0.96`).
    2.  *Trang mới tiến vào (Enter)* - 450ms, `cubic-bezier(0.34, 1.56, 0.64, 1)` (Lò xo nảy), thay đổi `opacity` (`0 → 1`) và `scale` (`0.95 → 1`).
*   **Quy tắc bảo toàn neo thị giác (Visual Anchor Rule)**: Thanh nhập liệu `Prompt Pill` hoặc thanh Tab điều hướng hình viên thuốc cố định ở đáy trang bắt buộc phải nằm ngoài phạm vi tác động của hiệu ứng `<Transition>` [9to5Google]. Tuyệt đối không cho phép các linh kiện này dịch chuyển hoặc mờ đi (`opacity < 1`) trong suốt quá trình chuyển trang nhằm giữ vững điểm tập trung nhận thức của mắt người dùng [9to5Google].
*   **Kiểm soát hiệu năng chuyển đổi (Transition Hardware Block)**: Để loại bỏ hiện tượng giật vỡ khung hình (Layout Shift / Jank) khi trang cũ và trang mới hoán đổi vị trí cho nhau, thuộc tính `mode="out-in"` của Vue bắt buộc phải được kích hoạt. Trình duyệt phải hoàn tất việc đóng và co nén trang cũ về hậu cảnh đồ họa rồi mới được cấp phép bung nảy lò xo hiển thị trang mới. Đồng thời bật chế độ tăng tốc đồ họa tối đa bằng GPU thông qua thuộc tính `will-change: transform, opacity`.


---

## 11. Đặc Tả Tối Ưu Hóa Tốc Độ Tải Trang Đầu (First Contentful Paint - FCP Spec)
Để đưa tốc độ phản hồi trang web đạt chuẩn tức thì dưới 1 giây đối với các giao diện nặng đồ họa và kính mờ Liquid Glassmorphism, mọi quy trình đóng gói phần mềm bắt buộc phải tuân thủ nghiêm ngặt rào chắn hiệu năng (Performance Gateways) [9to5Google].

*   **Tách nhỏ mã nguồn và Tải lười Trang (Async Component Route Splitting)**:
    1.  *Vue 3*: Sử dụng `defineAsyncComponent(() => import(...))` để chỉ nạp mã nguồn trang khi thực sự chuyển tab.
    2.  *React*: Sử dụng `React.lazy` và `<Suspense>` để hoãn nạp bundle của trang chưa xuất hiện.
*   **Trì hoãn phân tách CSS (Purge & Minify Glassmorphism Filters)**: Đặt một lớp nền màu đặc mỏng (`background: rgba(22, 26, 35, 0.95)`) ở 150ms đầu tiên, sau đó mới kích hoạt bộ lọc mờ kính nặng bằng hiệu ứng CSS Animation (`backdrop-filter: blur(24px)`) để giải phóng GPU trong giai đoạn render ban đầu. Lớp CSS tương thích là `.card-fast-load`.
*   **Rào chắn hiệu năng (Performance Gateways)**:
    1.  *JS Lõi chính (Main Entrypoint)*: Dung lượng sau khi nén (`Gzipped`) tuyệt đối không được vượt quá **`45 KB`**.
    2.  *Thành phần trang tải lười (Async Page Chunks)*: Mỗi trang băm nhỏ phải dưới **`15 KB`**.
    3.  *Phông chữ ưu tiên (Preload)*: Tệp phông chữ tiếng Việt thay thế `Plus Jakarta Sans` và `Be Vietnam Pro` phải được nạp ưu tiên cao nhất bằng thuộc tính `rel="preload"` trong thẻ `<link>`.

---

## Cách kiểm tra các yếu tố đáp ứng trong file:

1. **Hoạt ảnh tương tác**: Rê chuột vào các khối thẻ lớn, bạn sẽ thấy chúng nảy lên rất nhẹ nhờ hàm lò xo `cubic-bezier(0.34, 1.56, 0.64, 1)`.
2. **Thiết kế đáp ứng (Responsive)**: Bạn hãy thử bấm F12 trên trình duyệt và thu nhỏ cửa sổ lại. Khối lưới ở phần số 5 sẽ tự động nhảy từ 3 cột (Màn hình máy tính) sang 2 cột (Màn hình Tablet) rồi về 1 cột dọc (Màn hình Điện thoại di động) một cách mượt mà.
3. **Hiệu ứng chuyển trang (Spatial Flow)**: Bấm chuyển đổi qua lại giữa các tab trong thanh điều hướng hình viên thuốc. Bạn sẽ thấy thẻ card cũ mờ dần và thu nhỏ nhẹ lên trên, trong khi thẻ card mới bung nở mượt mà từ tâm dưới lên với hiệu ứng nảy lò xo nịnh mắt.
4. **Hiệu ứng tải nhanh trì hoãn mờ kính (FCP Blur Delay)**: Khi mở trang chứa thẻ card `.card-fast-load`, bạn sẽ thấy thẻ card hiện hình ngay lập tức dưới dạng màu nền sẫm đặc, sau đó hiệu ứng kính mờ (blur) sẽ được kích hoạt mượt mà sau 200ms giúp trang không bị khựng CPU khi tải trang đầu.



