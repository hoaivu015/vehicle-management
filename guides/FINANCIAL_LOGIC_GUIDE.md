# 📘 Auto28 — Financial & Salary Logic Guide v2.3

> **Mục đích**: Tài liệu này là **nguồn sự thật duy nhất (Single Source of Truth - SSoT)** về logic tài chính, tính lương, và quản lý dòng tiền của hệ sinh thái Auto-28. Mọi thay đổi nghiệp vụ phải được phản ánh tại đây trước khi thực hiện viết mã nguồn.

---

## Mục lục
1. [Kiến trúc Tổng quan & SSoT](#kiến-trúc)
2. [Phần I: Logic Tài chính Xe](#phần-i-logic-tài-chính-xe)
3. [Phần II: Chia sẻ Lợi nhuận Đối tác (Co-investment)](#phần-ii-chia-sẻ-lợi-nhuận-đối-tác)
4. [Phần III: Logic Tính lương & KPI Nhân sự](#phần-iii-logic-tính-lương--kpi-nhân-sự)
5. [Phần IV: Báo cáo Tài chính Công ty (GetFinancialOverview)](#phần-iv-báo-cáo-tài-chính-công-ty)
6. [Phần V: Quy tắc Bất biến (Golden Rules)](#phần-v-quy-tắc-bất-biến)
7. [Phần VI: Bảng Tra cứu Hàm Core](#phần-vi-bảng-tra-cứu-hàm-core)
8. [Phần VIII: Cơ chế Tự động hóa ở Tầng Database Triggers](#phần-viii-cơ-chế-tự-động-hóa-ở-tầng-database-triggers)
9. [Phần IX: Lỗi Phổ biến & Cách Khắc phục](#phần-ix-lỗi-phổ-biến--cách-khắc-phục)

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

### 1.1 Cơ chế Tính toán Động (Dynamic Calculations)

> [!NOTE]
> Hệ thống Auto-28 **không** lưu trữ trạng thái tài chính tĩnh của xe (không dùng trường `final_financials` cũ). Mọi chỉ số tài chính của xe đều được tính toán **động và nhất quán** theo thời gian thực (Real-time Dynamic Calculation) tại [vehicle_calculations.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/vehicle_calculations.ts).

Hệ thống tính toán chi phí dọn dẹp xe (`totalCost`) tự động bằng cách cộng dồn lịch sử các khoản chi trong mảng `cost_history`. Nếu mảng này trống, hệ thống sẽ tự động sử dụng trường dự phòng `total_cost` được đồng bộ từ cơ sở dữ liệu.

```typescript
// Trích xuất từ src/shared/utils/vehicle_calculations.ts
const costHistory = vehicle.cost_history || [];
const totalCost = costHistory.length > 0
  ? costHistory.reduce((sum, item) => sum + (item.amount || 0), 0)
  : (vehicle.total_cost || 0);
```

### 1.2 Công thức Tài chính Xe

| Chỉ số | Công thức Toán học | File Định nghĩa | Database Field |
| :--- | :--- | :--- | :--- |
| **Tổng Vốn Xe** | `Giá nhập + Phí Spa/Dọn` | [vehicle_calculations.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/vehicle_calculations.ts) | `purchase_price` + `total_cost` (hoặc `cost_history` sum) |
| **Lợi nhuận Gộp** (Gross) | Nếu xe đã bán (`salePrice > 0`): `Giá bán − Tổng Vốn Xe`<br>Nếu xe chưa bán (`salePrice <= 0`): `0` | [financial_formulas.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/financial_formulas.ts) → `calcGrossProfit` | `sale_price` - (`purchase_price` + `total_cost`) |
| **Lợi nhuận Ròng** (Net) | Nếu xe đã bán (`salePrice > 0`): `Lợi nhuận Gộp − HH Mua − Thưởng Mua − HH Bán`<br>Nếu xe chưa bán: `0` | [financial_formulas.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/financial_formulas.ts) → `calcNetProfit` | `grossProfit` - (`buying_commission` + `buying_bonus` + `commission`) |

```typescript
// ✅ financial_formulas.ts — Pure Math Core (không phụ thuộc Object phức tạp)
export const calcGrossProfit = (salePrice: number, purchasePrice: number, totalCost: number): number => {
  if (salePrice <= 0) return 0;
  return Math.round(salePrice - (purchasePrice + totalCost));
};

export const calcNetProfit = (grossProfit: number, buyingComm: number, buyingBonus: number, sellingComm: number): number => {
  return Math.round(grossProfit - (buyingComm + buyingBonus + sellingComm));
};
```

> [!WARNING]
> Mọi hoa hồng và thưởng mua (`buying_commission`, `buying_bonus`) cũng như hoa hồng bán (`commission` của xe) phải được trừ hoàn toàn khỏi Lợi nhuận Gộp trước khi tính Lợi nhuận Ròng để phục vụ việc chia sẻ lợi nhuận cho đối tác. Điều này đảm bảo showroom không bị gánh chịu chi phí hoa hồng một mình.

### 1.3 Logic Xe Tồn Kho Lâu Ngày (Aging Days)

Mỗi xe trong kho được tính số ngày tồn kho (`Aging Days`) dựa trên ngày nhập xe (`purchase_date`) so với ngày hiện tại.

```typescript
export const calculateAgingDays = (purchaseDate: string | null | undefined): number => {
  if (!purchaseDate) return 0;
  const start = new Date(purchaseDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
};
```
*   **Ngưỡng Xe Tồn Kho Lâu (Aging Threshold)**: **25 ngày** (định nghĩa tại `INVENTORY_CONSTANTS.AGING_THRESHOLD_DAYS` trong [constants.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/domain/constants.ts)).
*   Nếu `calculateAgingDays(purchase_date) >= 25`, xe sẽ được gắn cờ cảnh báo tồn kho lâu ngày trên giao diện quản trị.

---

## Phần II: Chia sẻ Lợi nhuận Đối tác

### 2.1 Nguyên tắc

Showroom và Đối tác góp vốn đầu tư chung cho một chiếc xe dựa trên cơ chế đồng đầu tư (`is_coinvested = true`).

*   **Tổng Vốn Đầu Tư Cần Thiết**: `Giá nhập + Phí Spa/Dọn` (`totalInvestment`).
*   **Vốn Góp Của Showroom**: `Tổng Vốn - Vốn Đối Tác Góp` (`totalInvestment - coinvestAmount`).
*   **Chia sẻ Lợi nhuận**: Dựa trên **tỷ lệ góp vốn thực tế** nhân với **Lợi nhuận Ròng** (Lợi nhuận sau khi đã trừ hết hoa hồng mua, bán và thưởng).

### 2.2 Công thức Toán học

```typescript
// Trích xuất từ src/shared/utils/financial_formulas.ts
export const calcProfitShare = (netProfit: number, capital: number, totalNeeded: number): number => {
  if (totalNeeded <= 0) return Math.round(netProfit);
  const ratio = capital / totalNeeded;
  return Math.round(netProfit * ratio);
};

// Điều phối tính toán trong vehicle_calculations.ts
if (isCoinvested && totalInvestment > 0) {
  showroomCapital = totalInvestment - coinvestAmount;
  partnerProfitShare = calcProfitShare(netProfit, coinvestAmount, totalInvestment);
  showroomProfitShare = netProfit - partnerProfitShare;
}
```

### 2.3 Ví dụ Thực tế Minh họa (VF6 PLUS)

```
[ĐẦU VÀO]
  Giá nhập xe:     567.000.000 đ
  Chi phí Spa/Dọn:   6.220.000 đ
  Vốn đối tác góp: 143.000.000 đ (coinvest_amount)
  Giá bán xe:      640.000.000 đ (sale_price)
  Hoa hồng bán:     10.000.000 đ (commission)

[TÍNH TOÁN]
  1. Tổng vốn xe   = 567.000.000 + 6.220.000 = 573.220.000 đ
  2. LN Gộp        = 640.000.000 - 573.220.000 = 66.780.000 đ
  3. LN Ròng       = 66.780.000 - 10.000.000 = 56.780.000 đ (Đã trừ hoa hồng bán)
  4. Tỷ lệ Đối tác = 143.000.000 / 573.220.000 = 24.9471%
  5. Tỷ lệ Showroom= 1 - 24.9471% = 75.0529%
  
  6. LN Đối tác nhận = 56.780.000 * 24.9471% = 14.164.981 đ ✅
  7. LN Showroom nhận= 56.780.000 * 75.0529% = 42.615.019 đ ✅
```

---

## Phần III: Logic Tính lương & KPI Nhân sự

Hệ thống quản lý lương nhân viên sử dụng một cơ chế tính toán tập trung tại [StaffSalaryService.ts](file:///Users/phanvu/Desktop/auto-28/src/modules/staff/domain/StaffSalaryService.ts) để đảm bảo tính nhất quán trên cả Web và Mobile.

### 3.1 Chỉ số Hoàn thành KPI

Mỗi nhân viên tư vấn có một chỉ tiêu bán hàng tháng (`target` - ví dụ: 3 xe/tháng). Tỷ lệ hoàn thành KPI được tính dựa trên số xe đã bán thực tế trong tháng so với chỉ tiêu.

```typescript
export const calcKPICompletion = (actualSales: number, target: number): number => {
  if (target <= 0) return 100;
  return Math.round((actualSales / target) * 100);
};
```

### 3.2 Hệ số Thưởng KPI (STAFF_CONSTANTS)

Hệ số KPI được áp dụng **trực tiếp và duy nhất** lên Hoa hồng Bán xe (`salesCommission`). Các khoản hoa hồng mua xe hay góp vốn không bị ảnh hưởng bởi hệ số này.

*   **Hoàn thành ≥ 100% chỉ tiêu**: Hệ số **1.0x** (`STAFF_CONSTANTS.BONUS_MULTIPLIER_FULL`)
*   **Hoàn thành < 100% chỉ tiêu**: Phạt hệ số còn **0.7x** (`STAFF_CONSTANTS.BONUS_MULTIPLIER_REDUCED`)

```typescript
export const calcKPIMultiplier = (
  completionRate: number, 
  threshold = STAFF_CONSTANTS.BONUS_THRESHOLD_PERCENT, // 100
  full = STAFF_CONSTANTS.BONUS_MULTIPLIER_FULL,       // 1.0
  reduced = STAFF_CONSTANTS.BONUS_MULTIPLIER_REDUCED  // 0.7
): number => {
  return completionRate >= threshold ? full : reduced;
};
```

### 3.3 Cấu trúc Thu nhập Chi tiết

```
Tổng Thu Nhập Lương (totalSalary) = Lương cứng (base_salary)
                                  + (Tổng Hoa hồng Bán xe × Hệ số Thưởng KPI)
                                  + Tổng Hoa hồng Nhập xe (buying_commission)
                                  + Tổng Thưởng Mua xe (buying_bonus)
                                  + Tổng Chia sẻ Lợi nhuận Góp vốn (coinvestProfitShare)
```

```typescript
// ✅ financial_formulas.ts
export const calcTotalSalary = (
  baseSalary: number, 
  salesCommissions: number, 
  kpiMultiplier: number, 
  otherCommissions: number = 0 // buyingComm + buyingBonus + profitShare
): number => {
  return Math.round(baseSalary + (salesCommissions * kpiMultiplier) + otherCommissions);
};
```

### 3.4 Cơ chế Chi hộ & Hoàn ứng (Reimbursements)

Nhân viên có thể chi hộ công ty các khoản phí ngoài (chi phí spa, đi lại...) thông qua việc tạo phiếu chi trong danh sách `expenses`.

*   **Khoản hoàn ứng hợp lệ**: Các khoản chi chưa được hoàn tiền (`is_reimbursed = false`) phát sinh trong tháng hiện tại hoặc dồn tích từ các tháng trước (`carryOverExpenses`).
*   **Tổng Hoàn ứng**: `totalReimbursements = currentMonthExpenses + carryOverExpenses`.
*   **Thực nhận (Net Salary)**: `netSalary = totalSalary + totalReimbursements`.

### 3.5 Cơ chế Chuyển tiếp Số liệu Chưa chi (Carry-Over Bonuses)

Để tránh thất thoát dòng tiền của nhân viên khi các giao dịch được thanh toán muộn:
1.  **Thưởng mua xe chưa chi từ tháng trước**: Các xe do nhân viên thu mua nhưng chưa được thanh toán thưởng (`buying_bonus_paid = false`) ở các tháng trước sẽ tự động được gom và chi trả trong bảng lương tháng hiện tại.
2.  **Lợi nhuận góp vốn chưa chi từ tháng trước**: Các xe nhân viên tham gia góp vốn đã bán ở tháng trước nhưng chưa được showroom tất toán (`partner_profit_shared = false`) sẽ được cộng dồn vào bảng lương tháng này.

---

## Phần IV: Báo cáo Tài chính Công ty

Tầng điều phối báo cáo tài chính nằm tại [GetFinancialOverview.ts](file:///Users/phanvu/Desktop/auto-28/src/modules/finance/application/GetFinancialOverview.ts), sử dụng các phương thức xử lý tĩnh trong [FinanceService.ts](file:///Users/phanvu/Desktop/auto-28/src/modules/finance/domain/FinanceService.ts).

### 4.1 Doanh thu Bán hàng Công ty (Monthly Sales Profit)

Doanh thu thực tế của showroom từ hoạt động kinh doanh xe được tính bằng tổng chênh lệch lợi nhuận gộp của showroom sau khi trừ đi phần chia cho đối tác góp vốn (Realized Showroom's Gross Profit).

```typescript
// FinanceService.ts
static calculateMonthlySalesProfit(vehicles: Vehicle[], month: string): number {
  return vehicles
    .filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(month))
    .reduce((acc, v) => {
      const fin = calculateVehicleFinancials(v as any);
      return acc + (fin.grossProfit - (fin.partnerProfitShare || 0));
    }, 0);
}
```

### 4.2 Lợi nhuận Ròng Công ty (Company Net Profit)

Lợi nhuận ròng cuối cùng của công ty trong tháng được tính bằng cách khấu trừ các chi phí vận hành showroom và tổng quỹ lương thực tế đã thanh toán cho nhân viên.

```typescript
Lợi nhuận Ròng Tháng = Doanh thu Bán hàng Tháng (monthlySalesProfit)
                      - Chi phí Vận hành Showroom (operationalExpenses)
                      - Tổng Quỹ lương Nhân sự đã chi (totalStaffSalaries)
```

```typescript
// financial_formulas.ts
export const calcCompanyMonthlyNetProfit = (
  monthlySalesProfit: number, 
  operationalExpenses: number, 
  totalStaffSalaries: number
): number => {
  return Math.round(monthlySalesProfit - operationalExpenses - totalStaffSalaries);
};
```

### 4.3 Quản lý Số dư Tiền mặt Thực tế (Cash Balance / Available Cash)

Để đảm bảo số dư tiền hiển thị trên Dashboard khớp chính xác 100% với số dư tài khoản ngân hàng, hệ thống sử dụng phương pháp hạch toán dòng tiền thực thu/thực chi (Cash-basis cumulative calculations):

```
Số dư Tiền mặt = Vốn Điều lệ Ban đầu (totalCapital)
                + Tổng Tiền bán xe thực thu từ khách (All-time Sale Payments)
                - Tổng Tiền thực chi mua xe cho chủ cũ (All-time Purchase Payments)
                - Tổng Tiền thực chi Spa/Dọn xe (All-time Car Costs)
                - Tổng Chi phí Vận hành & Lương đã chi trả (All-time Operating Expenses)
```

```typescript
// Trích xuất từ FinanceService.ts
static calculateTotalCashBalance(
  totalCapital: number,
  vehicles: Vehicle[],
  allExpenses: Expense[]
): number {
  const totalIncomes = vehicles.reduce((acc, v) => {
    return acc + (v.sale_payment_history || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  }, 0);

  const totalPurchaseOutflow = vehicles.reduce((acc, v) => {
    return acc + (v.purchase_payment_history || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  }, 0);

  const totalCarCosts = vehicles.reduce((acc, v) => {
    return acc + (v.cost_history || []).reduce((sum, c) => sum + (c.amount || 0), 0);
  }, 0);

  const totalOpExpenses = allExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  
  return Math.round(totalCapital + totalIncomes - totalPurchaseOutflow - totalCarCosts - totalOpExpenses);
}
```

> [!IMPORTANT]
> **Nguyên tắc Chống Khấu trừ Trùng lặp (Double-Counting Prevention)**:
> Lương nhân viên và hoa hồng bán xe sau khi chi trả sẽ được hạch toán trực tiếp vào mục Chi phí Vận hành (`Expenses` thuộc danh mục "Lương nhân sự"). Vì vậy, trong công thức tính số dư tiền mặt thực tế, hệ thống **không** trừ hoa hồng trực tiếp từ xe để tránh việc khấu trừ hai lần làm thâm hụt số dư tiền mặt công ty.

---

## Phần V: Quy tắc Bất biến (Golden Rules)

| # | Quy tắc Vàng | Lý do kỹ thuật |
| :---: | :--- | :--- |
| **R1** | Mọi công thức tính toán toán học PHẢI nằm tập trung trong [financial_formulas.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/financial_formulas.ts) | Tránh phân mảnh logic; đảm bảo khi sửa đổi quy định tài chính chỉ cần sửa tại một nơi duy nhất. |
| **R2** | Các thành phần giao diện (UI Components) tuyệt đối không được tự ý thực hiện tính toán. | Phải gọi qua hook điều phối [useVehicleFinancials.ts](file:///Users/phanvu/Desktop/auto-28/src/modules/inventory/presentation/components/VehicleDetail/useVehicleFinancials.ts) hoặc [calculateVehicleFinancials](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/vehicle_calculations.ts). |
| **R3** | Giá trị mặc định của hoa hồng và thưởng khi nhập xe mới luôn luôn là **0**. | Loại bỏ hoàn toàn sai số từ "hoa hồng ma" do fallback giá trị mặc định gây ra. |
| **R4** | Hoa hồng đối tác chỉ được trích xuất từ **Lợi nhuận Ròng (Net)** của xe, không bao giờ được trích xuất từ Lợi nhuận Gộp. | Bảo vệ lợi ích kinh tế tối đa cho showroom Auto28. |
| **R5** | Hoàn ứng chi phí cho nhân viên (`Reimbursements`) **phải** được cộng vào thực nhận (`netSalary`) nhưng **không** được tính vào lương chi phí gốc (`totalSalary`) để tránh sai lệch quỹ lương. | Đảm bảo tính minh bạch và công bằng cho chi phí vận hành showroom. |
| **R6** | Tuyệt đối không sử dụng các kiểu dữ liệu `any`, `as any` hoặc `@ts-ignore` trong bất kỳ mã nguồn tài chính nào. | Bảo vệ tính toàn vẹn của kiểu dữ liệu, ngăn ngừa lỗi runtime sập hệ thống. |
| **R7** | Toàn bộ dữ liệu bên ngoài từ Database hoặc API phải được xác thực qua **Zod Schemas** trước khi đưa vào các hàm tài chính. | Đảm bảo dữ liệu đầu vào luôn sạch sẽ, không chứa giá trị `null` hoặc `undefined` gây lỗi tính toán. |

---

## Phần VI: Bảng Tra cứu Hàm Core

| Tên hàm | File định nghĩa | Vai trò nghiệp vụ | Đầu vào / Đầu ra |
| :--- | :--- | :--- | :--- |
| `calculateVehicleFinancials` | [vehicle_calculations.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/vehicle_calculations.ts) | Điểm truy cập duy nhất để lấy thông tin tài chính của xe | In: `FinancialInput` <br>Out: `VehicleFinancials` |
| `calculateMonthlySalary` | [StaffSalaryService.ts](file:///Users/phanvu/Desktop/auto-28/src/modules/staff/domain/StaffSalaryService.ts) | Tính toán chi tiết bảng lương nhân sự trong tháng | In: `Staff`, `Vehicle[]`, `monthStr` <br>Out: `SalaryDetails` |
| `calculateTotalCashBalance` | [FinanceService.ts](file:///Users/phanvu/Desktop/auto-28/src/modules/finance/domain/FinanceService.ts) | Tính toán số dư tiền mặt thực tế dồn tích của showroom | In: `totalCapital`, `Vehicle[]`, `Expense[]`<br>Out: `number` |
| `calculateMonthlySalesProfit` | [FinanceService.ts](file:///Users/phanvu/Desktop/auto-28/src/modules/finance/domain/FinanceService.ts) | Tính lợi nhuận gộp từ bán xe của showroom trong tháng | In: `Vehicle[]`, `monthStr` <br>Out: `number` |
| `calcCompanyMonthlyNetProfit` | [financial_formulas.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/financial_formulas.ts) | Tính lợi nhuận ròng cuối cùng của công ty trong tháng | In: `salesProfit`, `opExpenses`, `salaries`<br>Out: `number` |

---

## Phần VIII: Cơ chế Tự động hóa ở Tầng Database Triggers

Hệ thống Auto-28 tích hợp các **PostgreSQL Triggers** ở mức cơ sở dữ liệu làm chốt chặn cuối cùng bảo vệ tính toàn vẹn của dữ liệu tài chính.

### 8.1 Tự động chuyển trạng thái Đã bán & Lợi nhuận (`trigger_vehicle_status_sync`)
*   **Sự kiện**: Chạy trước khi dòng dữ liệu trong bảng `vehicles` được cập nhật (`BEFORE UPDATE`).
*   **Logic xử lý**:
    1.  Tự động cập nhật trường `profit = sale_price - purchase_price - total_cost` trực tiếp trong database.
    2.  Nếu số tiền khách thanh toán thực tế đạt hoặc vượt giá chốt bán (`received_amount >= sale_price` với điều kiện `sale_price > 0`), trigger sẽ tự động cập nhật trạng thái xe thành **`SOLD`** và ghi nhận ngày bán `sale_date = NOW()`.
*   **Vai trò**: Đảm bảo báo cáo lợi nhuận xe luôn chính xác tuyệt đối ngay cả khi dữ liệu được sửa trực tiếp bằng các công cụ quản trị database (như Table Editor).

### 8.2 Tự động đồng bộ hoàn ứng chi phí (`trigger_salary_expense_sync`)
*   **Sự kiện**: Chạy sau khi bản ghi lương mới được tạo trong bảng `salary_payouts` (`AFTER INSERT`).
*   **Logic xử lý**:
    1.  Tự động quét cột chứa mảng chi phí `expenses` (được lưu dạng JSONB) của nhân viên tương ứng.
    2.  Tự động cập nhật trạng thái `isReimbursed = true` cho tất cả các khoản chi có tháng trùng với tháng thanh toán lương.
    3.  Tự động đẩy tháng vừa thanh toán vào mảng `paid_months` của nhân viên để khóa dữ liệu lương của tháng đó.
*   **Vai trò**: Đơn giản hóa mã nguồn Frontend (chỉ cần tạo một bản ghi payout duy nhất), database sẽ tự động thực hiện các side-effects đồng bộ phức tạp để đảm bảo tính toàn vẹn giao dịch.

---

## Phần IX: Lỗi Phổ biến & Cách Khắc phục

### 9.1 Sai lệch số liệu lợi nhuận giữa màn hình Web và Mobile
*   **Nguyên nhân gốc rễ**: Từng có hiện tượng màn hình Mobile tự viết công thức tính tay thô (ví dụ: hiển thị lợi nhuận đối tác bằng `(c.commission || 0) * 0.1`) thay vì gọi qua hàm dùng chung [calculateVehicleFinancials](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/vehicle_calculations.ts).
*   **Cách khắc phục**: Đã chuẩn hóa mã nguồn trên Mobile tại [PersonalMobileView.tsx](file:///Users/phanvu/Desktop/auto-28/src/modules/personal/presentation/PersonalMobileView.tsx) bằng cách import và sử dụng trực tiếp hàm `calculateVehicleFinancials(c).partnerProfitShare`. 
*   **Nguyên tắc**: Luôn sử dụng hàm dùng chung để đảm bảo tính nhất quán hiển thị.

### 9.2 Xuất hiện "Hoa hồng ma" 3.000.000đ hoặc 5.000.000đ khi tạo xe mới
*   **Nguyên nhân gốc rễ**: Code cũ sử dụng toán tử fallback mặc định `?? DEFAULT_COMMISSION` khi các trường hoa hồng trống.
*   **Cách khắc phục**: Thay đổi toàn bộ giá trị mặc định trong `STAFF_CONSTANTS` và các hàm sang `?? 0`. Nếu không nhập hoa hồng, giá trị bắt buộc phải bằng **0**.

### 9.3 Lương thực nhận của nhân viên bị sai lệch khi có xe đối tác góp vốn
*   **Nguyên nhân gốc rễ**: Các cột `commission`, `coinvest_amount` bị lưu giá trị `null` thay vì `0` trong database khiến các phép toán cộng dồn bị lỗi trả về `NaN` hoặc `null`.
*   **Cách khắc phục**: Đã cấu hình giá trị mặc định là `0` và thuộc tính `NOT NULL` cho tất cả các cột tài chính trong PostgreSQL, đồng thời sử dụng toán tử `|| 0` trong mã nguồn TypeScript làm lớp phòng ngự thứ hai.

---

*Phiên bản hướng dẫn: 2.3 — Cập nhật ngày: 18/05/2026*
*Tác giả: AI Architect & Auto28 Principal Engineering Team*
*Nguồn kiểm chứng thực tế: [financial_formulas.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/financial_formulas.ts) & [vehicle_calculations.ts](file:///Users/phanvu/Desktop/auto-28/src/shared/utils/vehicle_calculations.ts)*
