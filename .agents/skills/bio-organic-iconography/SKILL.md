---
name: Bio-Organic & Neural Iconography Semantics (Auto 28 Edition)
description: Hệ thống kiểm soát và thực thi tiêu chuẩn Ngữ nghĩa biểu tượng (Visual Semantics), Hình học sinh học hữu cơ (Bio-Morphology), Kén kính lỏng Liquid Glass 2.0, Ánh xạ 1:1 ISO/IEC 11581 và Google Material 3 Expressive cho hệ sinh thái Auto 28 Showroom Manager.
---

# 🧬 BIO-ORGANIC & NEURAL ICONOGRAPHY SEMANTICS — AUTO 28 SHOWROOM MANAGER

> **Tôn chỉ tối thượng:** Biểu tượng trong hệ sinh thái Auto 28 không phải là hình vẽ trang trí cơ học, mà là **thực thể thị giác sống động (Bio-Visual Entity)** phản ánh chính xác **1:1** bản chất dữ liệu showroom xe hơi. 
> 
> Hệ thống kết hợp giữa **Ký hiệu học quốc tế (ISO/IEC 11581 & Apple HIG)**, **Hình thái Sinh học hữu cơ (Bio-Morphology & Super-Ellipse Curves)**, **Vật liệu Kính lỏng (Liquid Glass 2.0)** và **Động lực học phản hồi đa giác quan (Spring Physics & Haptic Matrix)**.

---

## ═══ I. 5 TRỤ CỘT NGỮ NGHĨA SINH HỌC (THE 5 CORE PILLARS) ═══

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. 1:1 FUNCTIONAL AFFORDANCE : Hình thái icon phản ánh 100% bản chất dữ liệu showroom  │
│ 2. ORGANIC ROUNDED LINEWORK  : Bo tròn toàn bộ đầu mút và góc nối (Round Caps & Joins) │
│ 3. DYNAMIC STROKE MORPHING   : Biến thiên độ nét (1.8px ➔ 2.2px) theo trạng thái focus │
│ 4. DEWDROP PILL ENCLOSURE    : Nằm trong kén kính lỏng giọt sương (Liquid Dewdrop Pill)│
│ 5. MULTI-SENSORY BIO-FEEDBACK: Nhún lò xo (Spring Physics) + Rung xúc giác thần kinh   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ═══ II. QUY CHUẨN HÌNH HỌC QUANG HỌC & NÉT VẼ (OPTICAL MATRIX) ═══

Toàn bộ icon trong dự án bắt buộc sử dụng vector từ thư viện **`lucide-react`** và tuân thủ các thông số kỹ thuật bất biến:

```
                          KHUNG LƯỚI QUANG HỌC 24x24px
 ┌────────────────────────────────────────────────────────────────────────────────┐
 │ [Canvas 24x24px]                                                               │
 │   ┌────────────────────────────────────────────────────────────────────────┐   │
 │   │  [Live Area 20x20px]                                                   │   │
 │   │  • Base Stroke Weight (Inactive): 1.8px (Thanh mảnh, chìm nền kính)    │   │
 │   │  • Active Stroke Weight (Active) : 2.2px (Đậm nét, đón ánh sáng neon)  │   │
 │   │  • Hero FAB Stroke Weight        : 2.5px (Dấu + trung tâm nhô cao)     │   │
 │   │  • Linecap & Linejoin            : "round" (Triệt tiêu góc nhọn sắc)   │   │
 │   │  • Vector Color Mapping          : currentColor                        │   │
 │   └────────────────────────────────────────────────────────────────────────┘   │
 │   (Padding an toàn: 2px chống cắt viền trên màn hình Retina di động)           │
 └────────────────────────────────────────────────────────────────────────────────┘
```

---

## ═══ III. MA TRẬN ÁNH XẠ NGỮ NGHĨA CHUẨN HÓA (DOMAIN SEMANTIC MATRIX) ═══

### 1. 📱 Thanh Điều Hướng Đáy (Mobile Bottom Nav)

| Tab / Điểm đến | Nhãn Text | Icon Chuẩn | Tên Component Lucide | Bản chất Ngữ nghĩa Sinh học (Bio-Semantics) |
| :--- | :--- | :---: | :--- | :--- |
| **Báo cáo** | `BÁO CÁO` | 📊 | `BarChart3` | **Mầm sống sinh trưởng (Bio-Growth):** 3 cột số liệu bo đỉnh mềm mại thể hiện nhịp đập tăng trưởng doanh số showroom. *(Tuyệt đối không dùng `LayoutDashboard`)*. |
| **Kho xe** | `KHO XE` | 🚗 | `Car` | **Khí động học giọt nước (Teardrop Aerodynamics):** Đường nét thân xe vuốt cong mượt mà, đại diện 1:1 cho ô tô trong kho. |
| **Nút Thêm (+)** | *None* | ➕ | `Plus` | **Hạch nhân năng lượng (The Bio-Core):** Nằm trong Hero FAB nhô cao `-top-5` với quầng sáng phát quang đa tầng. |
| **Dòng tiền** | `DÒNG TIỀN` | 💳 | `CircleDollarSign` | **Vòng tuần hoàn thủy sinh (Circulatory Loop):** Dòng chảy vốn liên tục khép kín, màu sắc Bio-Mint tươi mát. |
| **Nhân sự** | `NHÂN SỰ` | 👥 | `Users` | **Cộng sinh tế bào (Symbiotic Clusters):** Hai hình bóng lồng lớp tạo chiều sâu tổ chức và phân quyền. |
| **Cá nhân** | `CÁ NHÂN` | 👤 | `User` | **Tâm điểm bản thể (Individual Core):** Hồ sơ, bảng tính hoa hồng và KPI riêng của nhân sự. |

---

### 2. 🚗 Quản Lý Xe & Thẻ Kho (Inventory & Vehicle Cards)

| Thuộc tính hiển thị | Icon Chuẩn | Component | Ý nghĩa nhận thức sinh thái |
| :--- | :---: | :--- | :--- |
| **Năm sản xuất** | 📅 | `Calendar` | Mốc thời gian xuất xưởng của dòng xe. |
| **Số ODO (Km đã đi)** | ⏱️ | `Gauge` | Đồng hồ đo vận tốc cơ học / vòng quay bánh xe. |
| **Tồn kho khẩn (>30 ngày)** | ⏳ | `Clock` | Cảnh báo ứ đọng vốn (Kết hợp nhịp thở cảnh báo `animate-pulse` màu Coral `#ef4444`). |
| **Ghim xe ưu tiên bán** | 📌 | `Pin` | Thao tác ghim xe lên vị trí đầu danh sách. |
| **Chi phí Spa / Làm đẹp** | 🔧 | `Wrench` | Nghiệp vụ chăm sóc, bảo dưỡng, tân trang xe trước khi lên sàn. |
| **Tiền cọc giữ xe** | 🤝 | `HandCoins` | Giao dịch nhận cọc từ khách hàng. |
| **Xe đã giao thành công** | ✅ | `CheckCircle2` | Xe hoàn tất thủ tục bàn giao và thanh toán đủ. |

---

### 3. 💰 Nghiệp Vụ Tài Chính & Kế Toán (Finance & Accounting SSoT)

| Chức năng tài chính | Icon Chuẩn | Component | Ý nghĩa nhận thức |
| :--- | :---: | :--- | :--- |
| **Lợi nhuận gộp dương** | 📈 | `TrendingUp` | Đồ thị xu hướng tài chính đi lên màu Mint (`#10b981`). |
| **Khoản chi phí / Lỗ** | 📉 | `TrendingDown` | Dòng tiền ra hoặc chi phí phát sinh màu Coral (`#ef4444`). |
| **Hoa hồng Sale chốt xe** | 🏷️ | `BadgePercent` | Tỷ lệ % trích thưởng trực tiếp cho nhân viên bán xe. |
| **Khóa sổ kế toán** | 🔒 | `Lock` | Bảo vệ toàn vẹn dữ liệu tài chính (Không cho sửa sau chốt). |
| **Xuất báo cáo Excel** | 📑 | `FileSpreadsheet` | Hành động trích xuất file bảng tính kế toán. |

---

## ═══ IV. MÃ NGUỒN CHUẨN MẪU TÍCH HỢP (CODE ANATOMY) ═══

Cấu trúc component Tab Bar áp dụng **100% chuẩn Sinh học hữu cơ & Kén kính lỏng**:

```tsx
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { haptics } from '@/src/shared/utils/haptics';

export const BioOrganicNavItem = ({
  item,
  isActive,
  onClick,
}: {
  item: { id: string; label: string; icon: any };
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={async () => {
        // 1. Phản hồi xúc giác thần kinh: Rung nhẹ dứt khoát
        try { await haptics.light(); } catch {}
        onClick();
      }}
      className={cn(
        "relative flex-1 min-h-[48px] h-full flex flex-col items-center justify-center transition-all duration-300 outline-none select-none z-10 cursor-pointer",
        isActive ? "text-kraft-accent dark:text-[#818cf8]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
      )}
    >
      <div className="relative flex flex-col items-center justify-center h-full w-full">
        {/* 2. Kén bào tương giọt nước (Organic Fluid Dewdrop) */}
        <div className="relative w-[48px] h-[30px] flex items-center justify-center">
          {isActive && (
            <motion.div
              layoutId="mobileNavPill"
              className="absolute inset-0 bg-gradient-to-tr from-kraft-accent/15 via-kraft-accent/5 to-transparent dark:from-kraft-accent/30 dark:via-kraft-accent/10 backdrop-blur-xl rounded-full border border-kraft-accent/20 dark:border-kraft-accent/35 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.7),0_4px_14px_rgba(99,102,241,0.1)]"
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            />
          )}

          {/* 3. Icon nét bo cong sinh học + Zoom quang học mượt */}
          <item.icon
            size={20}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={cn(
              "relative z-10 transition-transform duration-300",
              isActive ? "scale-[1.08] text-kraft-accent dark:text-[#818cf8]" : "text-slate-500 dark:text-slate-400"
            )}
          />
        </div>

        {/* 4. Nhãn chữ vi mô độ nét cao chống tràn */}
        <span
          className={cn(
            "text-[9.5px] font-black uppercase tracking-wider leading-none mt-1 transition-all duration-300 whitespace-nowrap",
            isActive ? "text-kraft-accent dark:text-[#818cf8] scale-[1.02]" : "text-slate-600 dark:text-slate-300 font-bold"
          )}
        >
          {item.label}
        </span>
      </div>
    </button>
  );
};
```

---

## ═══ V. CHECKLIST KIỂM ĐỊNH 10 ĐIỂM (10-POINT AUDIT MATRIX) ═══

| # | Tiêu chí thẩm định | Chuẩn yêu cầu | Trạng thái |
| :- | :--- | :--- | :--- |
| **1** | **1:1 Semantics Parity** | Tab "Báo cáo" dùng `BarChart3` (không dùng `LayoutDashboard` gây hiểu nhầm) | BẮT BUỘC |
| **2** | **Organic Linework** | Vector nét liền có `stroke-linecap="round"` và `stroke-linejoin="round"` | BẮT BUỘC |
| **3** | **Dynamic Stroke Weight** | `strokeWidth={1.8}` khi nghỉ $\rightarrow$ `strokeWidth={2.2}` khi kích hoạt | BẮT BUỘC |
| **4** | **Dewdrop Pill Container** | Có kén kính mờ `rounded-full` với viền siêu mờ và Spring Motion trượt | BẮT BUỘC |
| **5** | **Tactile Haptic** | Gọi `haptics.light()` ngay khi ngón tay vừa chạm vào tab | BẮT BUỘC |
| **6** | **Hero FAB Elevation** | Nút (+) nhô cao `-top-5`, viền kính lỏng kép, bóng đổ phát quang Neon | BẮT BUỘC |
| **7** | **No Metaphor Pollution** | Không dùng biểu tượng trừu tượng nhiều tầng nghĩa (như tên lửa, ngọn đuốc) | BẮT BUỘC |
| **8** | **Micro-Typography** | Nhãn chữ `text-[9.5px] font-black uppercase tracking-wider` không rớt dòng | BẮT BUỘC |
| **9** | **Domain Distinction** | Phân lập rõ ràng 4 miền: Xe hơi, Dòng tiền, Nhân sự, Báo cáo số liệu | BẮT BUỘC |
| **10**| **Retina Clarity** | Không bị nhòe pixel viền (Anti-aliasing) trên màn hình Retina di động | BẮT BUỘC |
