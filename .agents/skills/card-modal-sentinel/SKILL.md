---
name: Card & Modal UI/UX Sentinel (Auto 28 Edition)
description: Hệ thống kiểm soát và thực thi tiêu chuẩn hiển thị, chống gãy dòng (Anti-Truncation), bảo vệ điểm chạm Fitts's Law, và tối ưu Bottom Sheet/Modal/Cards cho Auto 28 Showroom Manager.
---

# 🎴 Card & Modal UI/UX Sentinel (V1.0 - Auto 28 Standard)

Cẩm nang và quy chuẩn kỹ thuật bắt buộc cho toàn bộ **Thẻ thông tin (Cards)** và **Cửa sổ bật lên (Popups, Bottom Sheets, Overlays, Modals)** trong dự án Auto 28.

---

## 1. TIÊU CHUẨN CARD THÔNG TIN (VEHICLE & STAFF CARDS)

### 1.1 Chống Gãy Dòng Văn Bản (Anti-Truncation & Safe Line Breaks)
* **Quy tắc tuyệt đối:** Số tiền, đơn vị đo lường (`km`, `ngày`, `tr`, `đ`, `%`), và mã nhận diện (`#VH0606-01`) **KHÔNG ĐƯỢC PHÉP** rơi rớt chữ cái hoặc đơn vị xuống dòng riêng lẻ.
* **Code Implementation Pattern:**
  ```tsx
  {/* ĐÚNG: Gắn whitespace-nowrap và format rõ ràng */}
  <span className="text-xs font-black text-emerald-600 whitespace-nowrap">
    +{formatCurrency(financials.showroomProfitShare)}
  </span>

  {/* ĐÚNG: Cụm ngày lưu kho */}
  <span className="text-[11px] font-bold text-coral whitespace-nowrap">
    {car.days || 0} ngày lưu kho
  </span>
  ```

### 1.2 Định Danh Nhận Diện (Mã xe / Biển số)
* Mọi Card xe phải có mã xe (`vehicle.code`) hoặc biển số để phân biệt các xe cùng dòng.
* Đặt mã xe ở góc trên hoặc cạnh tên xe dạng badge nhỏ:
  ```tsx
  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
    #{car.code}
  </span>
  ```

### 1.3 Giới Hạn Badge Trên Thumbnail (Single Hero Badge Rule)
* **Tối đa 1 Badge trạng thái chính** đè lên ảnh xe (góc trên bên trái).
* Các chỉ số phụ (Lưu kho lâu, Góp vốn) đưa vào khu vực thông số bên dưới hoặc cạnh tiêu đề.
* Không gắn các ô icon vuông màu đỏ/tím che 2 góc dưới bánh xe.

### 1.4 Điểm Chạm & Phản Hồi Xúc Giác (Touch Target & Haptics)
* **Kích thước nút phụ (Pin, Favorite, More):** Vùng chạm tối thiểu $36 \times 36\text{px}$ đến $44 \times 44\text{px}$.
* Bắt buộc có `e.stopPropagation()` khi bấm nút phụ để không kích hoạt mở chi tiết card.
* Toàn bộ Card: Có `cursor-pointer active:scale-[0.98] transition-transform duration-150`.

---

## 2. TIÊU CHUẨN POPUP / BOTTOM SHEET / OVERLAY

### 2.1 Bố Cục Thông Số Chống Khuyết Chữ (Stacked Spec Grid)
* Trên Mobile (chiều rộng màn hình $375\text{px} - 430\text{px}$), **KHÔNG** chia cột hẹp chứa Icon + Label ngang + Value ngang vì sẽ gây gãy từ.
* **Pattern chuẩn:** Stacked Layout (Label trên, Value dưới):
  ```tsx
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
      Mã xe
    </span>
    <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight whitespace-nowrap">
      {vehicle.code}
    </span>
  </div>
  ```

### 2.2 Vùng Đệm An Toàn Đáy Cho Nội Dung Cuộn (Scroll Safe-Padding)
* Mọi modal có thanh nút bấm cố định ở đáy (`sticky bottom-0` hoặc `fixed bottom-0`) phải có khoảng đệm đáy trong container cuộn:
  ```tsx
  <div className="flex-1 overflow-y-auto custom-scrollbar pb-[calc(90px+env(safe-area-inset-bottom))]">
    {/* Nội dung chi tiết */}
  </div>
  ```
  *(Ngăn chặn hoàn toàn tình trạng phần tử cuối cùng bị che khuất dưới Bottom Bar).*

### 2.3 Thanh Điều Hướng Tab (Segmented Control Tabs)
* Tên tab phải là 1 dòng duy nhất, không xuống dòng:
  ```tsx
  <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
    <button className="py-2 text-xs font-semibold rounded-lg bg-white shadow-sm whitespace-nowrap">
      Thông số
    </button>
    <button className="py-2 text-xs font-medium text-slate-500 whitespace-nowrap">
      Tài chính
    </button>
    <button className="py-2 text-xs font-medium text-slate-500 whitespace-nowrap">
      Lịch sử
    </button>
  </div>
  ```

### 2.4 Thanh Thao Tác Đáy Chuẩn iPhone Native (Liquid Glass Bottom Bar)
* **Visual Layer:** Phải có lớp kính mờ `bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-t border-slate-200/50 shadow-2xl`.
* **Động từ rõ nghĩa:** Nút bấm phải chứa động từ hành động:
  - ❌ `TRẠNG THÁI` $\rightarrow$  `⚡ ĐỔI TRẠNG THÁI`
  - ❌ `LƯU` $\rightarrow$  `💾 LƯU CHI PHÍ`
* **Anti-Double-Submit Guard:** Luôn có `isSubmitting / isPending` state và spinner khi gửi dữ liệu.

---

## 3. CHECKLIST KIỂM ĐỊNH NHỊ PHÂN (PASS / FAIL)

| Hạng mục kiểm tra | Tiêu chuẩn đạt (PASS) | Lỗi cần sửa (FAIL) |
| :--- | :--- | :--- |
| **Gãy dòng tiền tệ/chữ** | Đơn vị gắn liền số, có `whitespace-nowrap` | Rớt chữ `KHO`, rớt chữ `Tr` xuống dòng |
| **Khoảng đệm Bottom Bar** | Cuộn thấy trọn vẹn card cuối cùng | Nội dung cuối bị nút đáy đè lên |
| **Vùng chạm ngón tay** | $\ge 44 \times 44\text{px}$ (hoặc $\ge 36\text{px}$ cho icon trong card) | Nút bấm nhỏ hơn $30\text{px}$ khó bấm trúng |
| **Nút bấm hành động** | Có động từ rõ nghĩa (Đổi, Thêm, Lưu, Duyệt) | Chỉ ghi danh từ cụt lủn (Trạng thái, Chi phí) |
| **Bảo vệ tài chính** | Có `isPending` disable nút khi đang submit | Bấm liên tục bị nhân đôi bút toán |
