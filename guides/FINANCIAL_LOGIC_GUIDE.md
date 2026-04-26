# 📘 Auto28 — Financial & Salary Logic Guide v2.0

> **Mục đích**: Tài liệu này là **nguồn sự thật duy nhất (Single Source of Truth)** về logic tài chính và tính lương. Mọi thay đổi chính sách phải được cập nhật tại đây trước khi viết code.

---

## Mục lục
1. [Kiến trúc tổng quan](#kiến-trúc)
2. [Logic Tài chính Xe](#phần-i-logic-tài-chính-xe)
3. [Logic Chia sẻ Lợi nhuận Đối tác](#phần-ii-chia-sẻ-lợi-nhuận-đối-tác)
4. [Logic Tính lương & KPI](#phần-iii-logic-tính-lương--kpi)
5. [Logic Báo cáo Tài chính Công ty](#phần-iv-báo-cáo-tài-chính-công-ty)
6. [Quy tắc Bất biến (Golden Rules)](#phần-v-quy-tắc-bất-biến)
7. [Bảng tra cứu hàm](#phần-vi-bảng-tra-cứu-hàm)
8. [Lỗi phổ biến & Cách tránh](#phần-vii-lỗi-phổ-biến)

---

## Kiến Trúc

```
┌─────────────────────────────────────────────────────────┐
│              FINANCIAL MATH CORE                        │
│      src/shared/utils/financial_formulas.ts             │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │ Vehicle Math │ │  Salary Math │ │  Company Math   │ │
│  │ calcGross    │ │ calcKPI      │ │ calcMonthlyNet  │ │
│  │ calcNet      │ │ calcMultiply │ │                 │ │
│  │ calcShare    │ │ calcTotal    │ │                 │ │
│  └──────┬───────┘ └──────┬───────┘ └────────┬────────┘ │
└─────────┼────────────────┼──────────────────┼──────────┘
          ▼                ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│vehicle_calcula- │ │ StaffSalary     │ │ GetFinancial      │
│tions.ts         │ │ Service.ts      │ │ Overview.ts       │
│ (Coordinator)   │ │ (Coordinator)   │ │ (Coordinator)     │
└────────┬────────┘ └────────┬────────┘ └──────────────────┘
         ▼                   ▼
┌──────────────────────────────────┐
│   PRESENTATION LAYER (UI)        │
│  VehicleDetailModal / StaffModal │
│  ❌ Không được tính toán tại đây │
└──────────────────────────────────┘
```

---

## Phần I: Logic Tài chính Xe

### 1.1 Cơ chế Chốt Sổ (Snapshot)

Khi xe chuyển sang trạng thái **`SOLD`**, hệ thống tự động ghi lại toàn bộ số liệu vào trường `final_financials` (bất biến). Điều này ngăn dữ liệu bị thay đổi hồi tố.

**Thứ tự ưu tiên khi tính toán:**
```
Priority 1: vehicle.final_financials (đã chốt sổ, không thể thay đổi)
     ↓ (chỉ dùng nếu P1 không có)
Priority 2: Tính động từ dữ liệu xe hiện tại (isEstimated = true)
```

```typescript
// vehicle_calculations.ts — Coordinator Function
export function calculateVehicleFinancials(vehicle: Vehicle): VehicleFinancials {
  // ✅ Ưu tiên 1: Snapshot đã khóa
  if (vehicle.final_financials) {
    const s = vehicle.final_financials;
    return {
      ...
      partnerProfitShare: s.partnerProfitShare || (s.netProfit - s.showroomProfitShare),
      isEstimated: false // ← Số thật, không phải ước tính
    };
  }

  // ✅ Ưu tiên 2: Tính động
  const grossProfit = calcGrossProfit(salePrice, purchasePrice, totalCost);
  const netProfit = calcNetProfit(grossProfit, buyingCommission, sellingCommission);
  ...
  return { ..., isEstimated: vehicle.status !== VehicleStatus.SOLD };
}
```

### 1.2 Công thức Cơ bản

| Hạng mục | Công thức | File định nghĩa |
| :--- | :--- | :--- |
| **Lợi nhuận Gộp** | `Giá bán − (Giá nhập + Phí Spa)` | `financial_formulas.ts` → `calcGrossProfit` |
| **Lợi nhuận Ròng** | `Lợi nhuận Gộp − HH Mua − HH Bán` | `financial_formulas.ts` → `calcNetProfit` |
| **Tổng vốn đầu tư** | `Giá nhập + Phí Spa + HH Mua + (HH Bán nếu đã bán)` | `vehicle_calculations.ts` → `totalInvestment` |

```typescript
// ✅ financial_formulas.ts — Pure Math (không phụ thuộc Object)

export const calcGrossProfit = (
  salePrice: number, purchasePrice: number, totalCost: number
): number => {
  if (salePrice <= 0) return 0;
  return salePrice - (purchasePrice + totalCost);
};

export const calcNetProfit = (
  grossProfit: number, buyingComm: number, sellingComm: number
): number => {
  return grossProfit - (buyingComm + sellingComm);
};
```

> **⚠️ Lưu ý**: Nếu `salePrice <= 0` (xe chưa bán), `calcGrossProfit` trả về **0** — thiết kế có chủ đích để tránh hiển thị lợi nhuận âm tưởng tượng cho xe còn trong kho.

---

## Phần II: Chia sẻ Lợi nhuận Đối tác

### 2.1 Nguyên tắc

Lợi nhuận chia cho đối tác dựa trên **tỷ lệ vốn góp thực tế** so với **Tổng vốn đầu tư** (`Giá nhập + Phí Spa`).

> **🔴 QUAN TRỌNG**: Luôn tính tỷ lệ trên **Lợi nhuận Ròng** (đã trừ hết hoa hồng). Không bao giờ tính trên Lợi nhuận Gộp.

### 2.2 Công thức

```typescript
// ✅ financial_formulas.ts
export const calcProfitShare = (
  netProfit: number,
  capital: number,     // Vốn của bên cần tính (showroom hoặc đối tác)
  totalNeeded: number  // Tổng vốn = Giá nhập + Phí Spa
): number => {
  if (totalNeeded <= 0) return netProfit; // Tránh chia cho 0
  const ratio = capital / totalNeeded;
  return netProfit * ratio;
};

// ✅ Cách gọi trong vehicle_calculations.ts
const totalCapitalNeeded = purchasePrice + totalCost;           // Giá nhập + Spa
const showroomCapital = Math.max(0, totalCapitalNeeded - coinvestAmount);

const showroomProfitShare = calcProfitShare(netProfit, showroomCapital, totalCapitalNeeded);
const partnerProfitShare  = netProfit - showroomProfitShare;    // Phần còn lại cho đối tác
```

### 2.3 Ví dụ minh họa (VF6 PLUS)

```
Đầu vào:
  Giá nhập:        567.000.000đ
  Phí Spa:           6.220.000đ
  Vốn đối tác góp: 143.000.000đ
  Giá bán:         640.000.000đ
  Hoa hồng bán:     10.000.000đ

Tính toán:
  [1] Tổng vốn    = 567 + 6,22           = 573,22 Tr
  [2] LN Gộp      = 640 - 573,22         = 66,78 Tr
  [3] LN Ròng     = 66,78 - 10           = 56,78 Tr
  [4] Tỷ lệ ĐT    = 1 - (143 / 573,22)  = 75,06% (showroom)
                    143 / 573,22          = 24,94% (đối tác)
  [5] LN ĐT nhận  = 56,78 × 24,94%      = 14,16 Tr ✅
  [6] LN Showroom = 56,78 × 75,06%      = 42,62 Tr ✅
```

---

## Phần III: Logic Tính lương & KPI

### 3.1 Chỉ số KPI

```typescript
// ✅ financial_formulas.ts
export const calcKPICompletion = (actualSales: number, target: number): number => {
  if (target <= 0) return 100; // Nếu chỉ tiêu = 0 → mặc định đạt 100%
  return (actualSales / target) * 100;
};
```

### 3.2 Hệ số Thưởng KPI (từ STAFF_CONSTANTS trong constants.ts)

| Điều kiện | Hệ số | Hằng số trong code |
| :---: | :---: | :--- |
| Hoàn thành **≥ 100%** chỉ tiêu | **1.0x** | `BONUS_MULTIPLIER_FULL = 1.0` |
| Hoàn thành **< 100%** chỉ tiêu | **0.7x** | `BONUS_MULTIPLIER_REDUCED = 0.7` |
| Ngưỡng kích hoạt thưởng đầy đủ | **100%** | `BONUS_THRESHOLD_PERCENT = 100` |

```typescript
// ✅ financial_formulas.ts
export const calcKPIMultiplier = (
  completionRate: number,
  threshold = STAFF_CONSTANTS.BONUS_THRESHOLD_PERCENT, // 100
  full      = STAFF_CONSTANTS.BONUS_MULTIPLIER_FULL,   // 1.0
  reduced   = STAFF_CONSTANTS.BONUS_MULTIPLIER_REDUCED // 0.7
): number => {
  return completionRate >= threshold ? full : reduced;
};
```

### 3.3 Cấu trúc Thu nhập

```
Tổng thu nhập = Lương cứng
              + (HH Bán × Hệ số KPI)   ← HH Bán bị phạt nếu <100% chỉ tiêu
              + HH Mua                  ← KHÔNG bị ảnh hưởng bởi KPI
              + Lợi nhuận góp vốn       ← KHÔNG bị ảnh hưởng bởi KPI
```

```typescript
// ✅ financial_formulas.ts
export const calcTotalSalary = (
  baseSalary: number,
  salesCommissions: number, // ← sẽ bị nhân với kpiMultiplier
  kpiMultiplier: number,
  profitShare: number = 0   // buyingComm + coinvestProfit, không bị ảnh hưởng KPI
): number => {
  return baseSalary + (salesCommissions * kpiMultiplier) + profitShare;
};
```

---

## Phần IV: Báo cáo Tài chính Công ty

```
Lợi nhuận ròng cuối cùng = Tổng LN từ xe bán trong tháng
                          − Chi phí vận hành (điện, nước, mặt bằng...)
                          − Tổng lương cứng nhân sự
```

```typescript
// ✅ financial_formulas.ts
export const calcCompanyMonthlyNetProfit = (
  monthlySalesProfit: number,  // LN Showroom từ tất cả xe bán trong tháng
  operationalExpenses: number, // Chi phí cố định vận hành
  staffBaseSalaries: number    // Chỉ tính lương cứng (HH đã trừ trong LN xe)
): number => {
  return monthlySalesProfit - operationalExpenses - staffBaseSalaries;
};
```

> **📝 Lưu ý**: `monthlySalesProfit` = tổng `showroomProfitShare` của các xe bán trong tháng (không phải toàn bộ lợi nhuận ròng, vì phần đối tác không thuộc showroom).

---

## Phần V: Quy tắc Bất biến

### ✅ ĐÚNG
```typescript
// Luôn lấy dữ liệu từ calculateVehicleFinancials()
const fin = calculateVehicleFinancials(car);
displayProfit(fin.partnerProfitShare); // ← lấy giá trị đã tính sẵn
```

### ❌ SAI — Tuyệt đối không làm
```typescript
// ❌ Tính lại tỷ lệ trong UI
const ratio = car.coinvest_amount / car.purchase_price; // Sai công thức
const profit = car.profit * ratio;

// ❌ Dùng hoa hồng mặc định
const comm = car.commission ?? 5_000_000; // "Hoa hồng ma"

// ❌ Tính toán trực tiếp trong JSX
<span>{(car.sale_price - car.purchase_price) * 0.25}</span>
```

### Bảng Quy tắc

| # | Quy tắc | Lý do |
| :---: | :--- | :--- |
| **R1** | Mọi công thức PHẢI nằm trong `financial_formulas.ts` | Một chỗ thay đổi → toàn app cập nhật |
| **R2** | UI chỉ được **đọc** kết quả từ `calculateVehicleFinancials()` | Tránh tính sai ở lớp hiển thị |
| **R3** | Hoa hồng mặc định = **0**, không phải 3tr hay 5tr | Tránh "hoa hồng ma" gây sai số |
| **R4** | Khi xe `SOLD` → luôn có `final_financials` được chốt sổ | Đảm bảo tính lịch sử bất biến |
| **R5** | Chia lợi nhuận đối tác dựa trên **LN Ròng**, không phải LN Gộp | Đảm bảo công bằng cho showroom |

---

## Phần VI: Bảng tra cứu hàm

| Hàm | File | Input | Output | Dùng khi nào |
| :--- | :--- | :--- | :--- | :--- |
| `calcGrossProfit` | `financial_formulas.ts` | `sale, purchase, spa` | `number` | Tính LN trước hoa hồng |
| `calcNetProfit` | `financial_formulas.ts` | `gross, buyComm, sellComm` | `number` | Tính LN sau hoa hồng |
| `calcProfitShare` | `financial_formulas.ts` | `net, capital, total` | `number` | Chia LN theo tỷ lệ vốn |
| `calcKPICompletion` | `financial_formulas.ts` | `actual, target` | `number (%)` | Hiển thị % KPI |
| `calcKPIMultiplier` | `financial_formulas.ts` | `rate` | `1.0 or 0.7` | Tính hệ số thưởng |
| `calcTotalSalary` | `financial_formulas.ts` | `base, sales, kpi, share` | `number` | Tổng thu nhập nhân viên |
| `calcCompanyMonthlyNetProfit` | `financial_formulas.ts` | `sales, opex, salary` | `number` | Lợi nhuận ròng tháng |
| `calculateVehicleFinancials` | `vehicle_calculations.ts` | `Vehicle` | `VehicleFinancials` | **Điểm vào duy nhất cho UI** |

---

## Phần VII: Lỗi Phổ biến

| Triệu chứng | Nguyên nhân gốc rễ | Cách khắc phục |
| :--- | :--- | :--- |
| LN đối tác hiển thị khác nhau giữa hai màn hình | UI đang tự tính lại, không dùng `fin.partnerProfitShare` | Xóa logic tính trong UI, chỉ đọc `fin.partnerProfitShare` |
| Hoa hồng tự nhiên xuất hiện 3tr/5tr | Code dùng `?? DEFAULT_COMMISSION` khi field trống | Đổi fallback về `?? 0` |
| Snapshot cũ bị sai số | Xe chốt sổ trước khi logic mới áp dụng | Chạy script cập nhật lại `final_financials` cho xe đó |
| Lương nhân viên sai dù công thức đúng | `commission` hoặc `coinvest_amount` trên xe bị null | Đảm bảo DB chuẩn hóa trường này về `0` thay vì `null` |

---

*Phiên bản: 2.0 — Cập nhật ngày: 21/04/2026*
*Nguồn thật: `src/shared/utils/financial_formulas.ts` & `src/shared/utils/vehicle_calculations.ts`*
