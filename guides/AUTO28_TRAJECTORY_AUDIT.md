# 🧭 Auto 28 — Quỹ Đạo Quy Chuẩn (System Trajectory Audit)

> **Trạng thái:** Read-only. Không sửa bất cứ gì khi chưa được phép.  
> **Mục đích:** Nắm toàn bộ "DNA" của hệ thống trước khi tiếp tục bất kỳ task nào.

---

## I. APP LÀ GÌ?

**Auto 28** = Hệ thống quản lý showroom xe đã qua sử dụng (used car dealership management).

### Luồng nghiệp vụ cốt lõi:
```
Nhập xe (DEPOSIT_BUY) → Spa → Trong kho (IN_STOCK) → Cọc bán → Sold
                                      ↕ có thể có đối tác góp vốn
                                      ↕ hoa hồng nhập, bán riêng biệt
                                      ↕ trigger DB tự chốt trạng thái khi received_amount ≥ sale_price
```

---

## II. KIẾN TRÚC THỰC TẾ (Đã xác minh từ codebase)

### Cấu trúc thư mục:
```
src/
├── App.tsx                    ← Router chính
├── modules/
│   ├── auth/                  ← Xác thực người dùng
│   ├── dashboard/             ← Tổng quan
│   ├── finance/               ← Báo cáo tài chính công ty
│   │   ├── application/
│   │   ├── domain/
│   │   │   ├── FinanceService.ts        ← calculateTotalCashBalance, calculateMonthlySalesProfit
│   │   │   ├── ExpenseRepository.ts     ← Interface
│   │   │   └── ExpenseSchema.ts         ← Zod schema
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── inventory/             ← ⭐ MODULE TRUNG TÂM
│   │   ├── application/
│   │   │   ├── AddVehicle.ts
│   │   │   ├── AddSalePayment.ts
│   │   │   ├── AddPurchasePayment.ts
│   │   │   ├── CancelSale.ts
│   │   │   ├── DeleteVehicle.ts
│   │   │   ├── DeleteVehicleCost.ts
│   │   │   ├── GetInventoryList.ts
│   │   │   ├── GetNextVehicleCode.ts
│   │   │   ├── UpdateVehicle.ts
│   │   │   └── UpdateVehicleStatus.ts
│   │   │   └── VehicleService.ts
│   │   ├── domain/
│   │   │   ├── VehicleEntity.ts         ← Business: agingDays, profit
│   │   │   ├── VehicleRepository.ts     ← Interface Port
│   │   │   ├── VehicleSchema.ts         ← Zod schema
│   │   │   ├── VehicleStateMachine.ts   ← ⭐ Luật chuyển trạng thái
│   │   │   ├── VehicleStaffRepository.ts
│   │   │   ├── VehicleStorageRepository.ts
│   │   │   ├── interfaces/
│   │   │   └── services/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── payroll/               ← Module lương
│   ├── personal/              ← Góc nhìn cá nhân NV
│   ├── staff/
│   │   ├── domain/
│   │   │   ├── StaffSalaryService.ts    ← ⭐ calculateMonthlySalary
│   │   │   ├── StaffEntity.ts
│   │   │   ├── StaffRepository.ts
│   │   │   ├── StaffSchema.ts
│   │   │   └── StaffValidation.ts
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── user/
├── shared/
│   ├── domain/
│   │   ├── types.ts           ← ⭐ NGUỒN SỰ THẬT DUY NHẤT về Types
│   │   ├── constants.ts       ← VehicleStatus enum, VEHICLE_STATUS_CONFIG
│   │   ├── schemas.ts         ← Shared Zod schemas
│   │   ├── errors.ts
│   │   ├── Repository.ts      ← Base repository interface
│   │   └── NotificationService.ts
│   ├── utils/
│   │   ├── financial_formulas.ts  ← ⭐ SSoT math core
│   │   ├── vehicle_calculations.ts ← ⭐ calculateVehicleFinancials()
│   │   ├── finance.ts
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   ├── cn.ts
│   │   ├── haptics.ts
│   │   ├── numberFormatter.ts
│   │   ├── numberParser.ts
│   │   └── zod.ts
│   ├── design-system/         ← BaseCard, BaseInput, DataDisplay...
│   ├── presentation/
│   │   ├── hooks/             ← useActionResponse, useIsMobile
│   │   └── components/Layout/
│   ├── application/
│   ├── infrastructure/
│   └── ioc/
│       ├── DependencyContext.tsx  ← Dependency Injection container
│       └── ModuleRegistry.ts
└── constants.ts               ← Global constants
```

---

## III. 7 QUY TẮC BẤT BIẾN (Thuộc lòng)

| # | Luật | Cấm |
|---|------|-----|
| L1 | **Zero Any** | `any`, `as any`, `@ts-ignore` |
| L2 | **Dumb UI** | Logic nghiệp vụ hoặc Supabase call trong `.tsx` |
| L3 | **SSoT** | Duplicate data, update UI trước DB confirm |
| L4 | **Domain Purity** | Import `react`, `supabase` trong `domain/` |
| L5 | **State Machine Gateway** | Đổi `vehicle.status` không qua `VehicleStateMachine` |
| L6 | **Zod Boundary** | Nhận external data không `.parse()`/`.safeParse()` |
| L7 | **Dependency Direction** | `domain/` import từ `infrastructure/` hoặc `presentation/` |

---

## IV. FINANCIAL LOGIC — CỐT LÕI BẤT KHẢ XÂM PHẠM

### A. Tầng tính toán (3 tầng)

```
[Tier 1] financial_formulas.ts          ← Pure math functions
         calcGrossProfit, calcNetProfit, calcProfitShare,
         calcKPICompletion, calcKPIMultiplier, calcTotalSalary,
         calcCompanyMonthlyNetProfit

[Tier 2] vehicle_calculations.ts        ← Coordinator (xe)
         calculateVehicleFinancials()   ← ĐIỂM VÀO DUY NHẤT

[Tier 2] StaffSalaryService.ts          ← Coordinator (lương NV)
         calculateMonthlySalary()

[Tier 2] FinanceService.ts              ← Coordinator (báo cáo công ty)
         calculateTotalCashBalance()
         calculateMonthlySalesProfit()

[Tier 3] UI/Hooks                       ← Chỉ NHẬN kết quả, không tính toán
```

### B. Công thức tài chính xe

```
Tổng Vốn Xe     = purchase_price + total_cost (hoặc cost_history sum)
Lợi nhuận Gộp  = sale_price - Tổng Vốn Xe     (chỉ khi sale_price > 0)
Lợi nhuận Ròng = Lợi nhuận Gộp - buying_commission - buying_bonus - commission
```

### C. Chia lợi nhuận đối tác

```
Tỷ lệ đối tác  = coinvest_amount / totalInvestment
LN Đối tác     = LN Ròng × tỷ lệ đối tác       ← CHIA TRÊN LN RÒNG, không phải Gộp
LN Showroom    = LN Ròng - LN Đối tác
```

### D. Lương nhân viên

```
Total Salary = base_salary
             + (salesCommission × KPIMultiplier)  ← KPI chỉ ảnh hưởng hoa hồng BÁN
             + buying_commission
             + buying_bonus
             + coinvestProfitShare

Net Salary   = Total Salary + totalReimbursements  ← Hoàn ứng KHÔNG tính vào totalSalary
```

> **KPI Multiplier:** ≥100% chỉ tiêu → 1.0x | <100% → 0.7x

### E. Chống double-counting (Cash Balance)

Lương + hoa hồng sau khi chi trả → hạch toán vào Expenses ("Lương nhân sự")  
→ Trong công thức cash balance **KHÔNG** trừ hoa hồng từ xe riêng nữa.

---

## V. STATE MACHINE — VÒNG ĐỜI XE

```
DEPOSIT_BUY ──→ SPA ──→ IN_STOCK ──→ DEPOSIT_SALE ──→ SOLD
     └──────────────────────┘ └─────→ BANK_DEPOSIT ──→ SOLD
                                  └─→ BANK_CONFIRMED ──→ SOLD
SOLD ──→ IN_STOCK  (chỉ Admin/Manager - hủy giao dịch)
```

**File:** `src/modules/inventory/domain/VehicleStateMachine.ts`

**3 loại action:**
| Loại | Phương thức |
|------|-------------|
| Chuyển trạng thái đơn | `handleUpdateStatus()` → `UpdateVehicleStatus` use case |
| Giao dịch bán/cọc | `handleAddSalePayment()` → thẳng vào repository |
| Hủy giao dịch | `handleCancelSale()` → `CancelSale` use case |

**DB Trigger tự động:**  
Khi `received_amount >= sale_price && sale_price > 0` → DB tự set status = `SOLD`, `sale_date = NOW()`

---

## VI. PHÂN QUYỀN HIỂN THỊ

```typescript
const canSeeFullInfo =
  userRole === ADMIN || ACCOUNTANT || MANAGER ||
  (vehicle.is_coinvested && vehicle.coinvestor_code === userCode);
```

| Role | Kho tổng | Tài chính | Nhập xe | Xóa xe |
|------|----------|-----------|---------|--------|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| ACCOUNTANT | ✅ | ✅ | ✅ | ❌ |
| MANAGER | Phòng ban | ✅ | ✅ | ❌ |
| SALES_LEADER | ✅ kho, ❌ đã bán | ❌ | ❌ | ❌ |
| SALES_STAFF | ✅ kho, cá nhân đã bán | ❌ | ❌ | ❌ |

---

## VII. PATTERN BẮT BUỘC

### Unified Action Pattern (Luật 8)
```typescript
// ❌ SAI
setLoading(true);
try { await presenter.doSomething(); toast.success(); }
catch (e) { toast.error(e.message); }
finally { setLoading(false); }

// ✅ ĐÚNG
const { executeAction, isSubmitting } = useActionResponse();
const handleAction = (data) => executeAction(() => presenter.doSomething(data), {
  successMessage: 'Thành công!'
});
```

### Luồng Data chuẩn
```
UI Event → Presenter/Hook → Application UseCase 
→ Domain (Zod validate) → Repository → DB
```

### Sau mọi mutation bắt buộc:
```typescript
await this.reloadVehicle(id);      // Reload chi tiết xe
await this.refreshCurrentView();    // Refresh danh sách
this.view.onStatusUpdated();        // Notify UI
```

---

## VIII. IOC / DEPENDENCY INJECTION

- **File:** `src/shared/ioc/DependencyContext.tsx`  
- **Pattern:** React Context cung cấp tất cả repository implementations  
- Presenter nhận dependencies qua DI, không tự tạo instances

---

## IX. MÃ XE

**Định dạng:** `VH-YYMM-NN`  
**Ví dụ:** `VH-2604-03` = xe thứ 3, tháng 4/2026  
**Service:** `VehicleCodeGenerator` domain service → `SupabaseVehicleCodeGenerator` implementation

---

## X. DESIGN SYSTEM

**Bắt buộc dùng (không tự viết UI thô):**
- `BaseCard` — card container
- `BaseInput` / `BaseSelect` / `BaseTextArea` — form elements
- `DataDisplay` — hiển thị label/value
- `SectionHeader` — tiêu đề section
- `FinancialBox` — hiển thị số tài chính
- `StatusBadge` — badge trạng thái

**iPhone Native standards:**
- Safe Area: `env(safe-area-inset-top/bottom)`
- Touch targets: tối thiểu 44×44px
- Font: Mulish weight 900 cho title
- Golden margin: 20px (`px-5`)

---

## XI. DB TRIGGERS (Tự động hóa)

| Trigger | Sự kiện | Tác dụng |
|---------|---------|---------|
| `trigger_vehicle_status_sync` | BEFORE UPDATE vehicles | Auto set SOLD + sale_date khi received_amount ≥ sale_price |
| `trigger_salary_expense_sync` | AFTER INSERT salary_payouts | Auto mark expenses isReimbursed = true, thêm vào paid_months |

---

## XII. ĐIỂM KHÁC BIỆT QUAN TRỌNG vs. Hệ thống thông thường

1. **Không có `final_financials` tĩnh** → mọi con số tài chính tính động, realtime
2. **cost_history** tổng hợp dynamic (sum array) → không phải field total đơn lẻ
3. **Carry-over bonuses** → thưởng mua/lợi nhuận góp vốn từ tháng trước tự động gộp vào tháng hiện tại
4. **Double-counting prevention** → lương chi xong hạch toán thành Expenses, không trừ 2 lần
5. **KPI chỉ tác động hoa hồng BÁN** → buying_commission và buying_bonus không bị nhân hệ số KPI

---

## XIII. GUIDE PHẢI ĐỌC THEO DOMAIN

| Đang làm gì | Guide cần đọc |
|-------------|---------------|
| Tài chính xe, inventory | `INVENTORY_GUIDE.md` + `STATUS_UPDATE_GUIDE.md` |
| Lương, KPI nhân sự | `FINANCIAL_LOGIC_GUIDE.md` (Phần III) |
| Báo cáo tài chính công ty | `FINANCIAL_LOGIC_GUIDE.md` (Phần IV) |
| UI/UX | `DESIGN_GUIDE.md` + skill `design-system-guide` |
| Tạo module mới | skill `domain-driven-hexagon` |

---

*Audit thực hiện: 2026-05-18 | Đối chiếu từ: 0-master-reasoning.md, clean-surgical-nextjs SKILL.md, FINANCIAL_LOGIC_GUIDE.md, INVENTORY_GUIDE.md, STATUS_UPDATE_GUIDE.md + kiểm tra cấu trúc thư mục thực tế*
