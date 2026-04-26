# Hướng Dẫn: Luồng Cập Nhật Trạng Thái Xe — Auto28

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-25  
> Tài liệu này mô tả toàn bộ luồng kỹ thuật cho chức năng **Cập nhật trạng thái xe** trong hệ thống Auto28, từ Domain Logic đến UI.

---

## 1. Tổng Quan Kiến Trúc

Chức năng cập nhật trạng thái được triển khai theo **Clean Architecture / MVP**, với luồng dữ liệu một chiều nghiêm ngặt:

```
UI (StatusUpdateOverlay / PaymentsSaleTab)
    ↓  gọi handler
InventoryPresenter  (Application Layer)
    ↓  gọi use case
UpdateVehicleStatus  (Use Case)
    ↓  gọi repository
SupabaseVehicleRepository  (Infrastructure)
    ↓  ghi vào DB
Supabase (PostgreSQL)
```

Nguyên tắc **tuyệt đối không được vi phạm:**
- UI **không được** gọi trực tiếp Supabase.
- Use Case **không được** import bất kỳ thứ gì từ `presentation/`.
- Mọi logic nghiệp vụ của trạng thái phải nằm trong `VehicleStateMachine.ts`.

---

## 2. Sơ Đồ Trạng Thái (State Machine)

### 2.1 Các Trạng Thái

| Enum Value | Nhãn UI | Badge |
|---|---|---|
| `DEPOSIT_BUY` | Cọc mua | 🟠 Orange |
| `SPA` | Spa | 🔵 Sky |
| `IN_STOCK` | Trong kho | 🟢 Emerald |
| `DEPOSIT_SALE` | Cọc bán | 🟣 Purple |
| `BANK_DEPOSIT` | Cọc Bank | 🟠 Orange |
| `BANK_CONFIRMED` | Thông báo cho vay | 🔵 Blue |
| `SOLD` | Đã bán | 🔴 Red |

### 2.2 Bảng Chuyển Trạng Thái Hợp Lệ

```
DEPOSIT_BUY ──→ SPA
             └─→ IN_STOCK

SPA ──→ IN_STOCK

IN_STOCK ──→ DEPOSIT_SALE
          ├─→ BANK_DEPOSIT
          └─→ SOLD

DEPOSIT_SALE ──→ DEPOSIT_SALE  (cập nhật thông tin)
              ├─→ BANK_DEPOSIT
              ├─→ SOLD
              └─→ IN_STOCK  (hủy cọc)

BANK_DEPOSIT ──→ BANK_DEPOSIT  (cập nhật thông tin)
              ├─→ BANK_CONFIRMED
              ├─→ SOLD
              └─→ IN_STOCK  (hủy cọc)

BANK_CONFIRMED ──→ BANK_CONFIRMED  (cập nhật thông tin)
                ├─→ SOLD
                └─→ IN_STOCK  (hủy cọc)

SOLD ──→ IN_STOCK  (hủy giao dịch - chỉ Admin/Manager)
```

**File xác thực:** [`src/modules/inventory/domain/VehicleStateMachine.ts`](./src/modules/inventory/domain/VehicleStateMachine.ts)

---

## 3. Phân Loại Hành Động Cập Nhật Trạng Thái

Hệ thống có **3 loại hành động** khác nhau, dùng các phương thức khác nhau:

| Loại | Điều kiện | Phương thức gọi | VD |
|---|---|---|---|
| **Chuyển trạng thái đơn** | Không phải giao dịch bán, không hủy | `handleUpdateStatus()` | `DEPOSIT_BUY → IN_STOCK` |
| **Giao dịch bán / thanh toán cọc** | Chuyển sang DEPOSIT_SALE, BANK_DEPOSIT, BANK_CONFIRMED, SOLD | `handleAddSalePayment()` | `IN_STOCK → DEPOSIT_SALE` |
| **Hủy giao dịch** | Từ trạng thái bán → IN_STOCK | `handleCancelSale()` | `DEPOSIT_SALE → IN_STOCK` |

---

## 4. Luồng Chi Tiết Theo Từng Lớp

### 4.1 UI Layer — Người Dùng Bấm "Cập Nhật Trạng Thái"

**File:** [`src/modules/inventory/presentation/components/VehicleDetail/VehicleSidebar.tsx`](./src/modules/inventory/presentation/components/VehicleDetail/VehicleSidebar.tsx)

```tsx
// Nút "Cập nhật trạng thái" trong VehicleSidebar
<button onClick={() => setIsUpdatingStatus(true)}>
  <TrendingUp size={14} /> Cập nhật trạng thái
</button>
```

Khi bấm → `isUpdatingStatus = true` → `StatusUpdateOverlay` xuất hiện.

---

### 4.2 StatusUpdateOverlay — Chọn Trạng Thái Tiếp Theo

**File:** [`src/modules/inventory/presentation/components/VehicleDetail/StatusUpdateOverlay.tsx`](./src/modules/inventory/presentation/components/VehicleDetail/StatusUpdateOverlay.tsx)

**Bước 1:** Lấy danh sách các trạng thái hợp lệ từ State Machine:
```ts
VehicleStateMachine.getValidNextStatuses(vehicle.status as VehicleStatus)
```

**Bước 2:** Phân nhánh xử lý theo loại hành động:

```ts
onClick={() => {
  const saleStatuses = [DEPOSIT_SALE, BANK_DEPOSIT, BANK_CONFIRMED, SOLD];
  const isSaleTransition = saleStatuses.includes(status);

  if (isSaleTransition) {
    // → Mở form nhập thông tin giao dịch (transitionStatus)
    setTransitionStatus(status);
    
  } else if (status === IN_STOCK && saleStatuses.includes(vehicle.status)) {
    // → Hủy giao dịch bán
    handleCancelSale(vehicle.id, userCode);
    
  } else {
    // → Chuyển trạng thái đơn (không cần form)
    handleUpdateStatus(vehicle.id, status);
  }
}}
```

**Bước 3 (nếu là giao dịch bán):** Hiển thị form thu thập thông tin:

| Trường | Điều kiện hiển thị | Bắt buộc |
|---|---|---|
| Giá bán chốt (`salePrice`) | Luôn hiển thị | Bắt buộc ≥ 0 |
| Số tiền đặt cọc / thanh toán (`amount`) | Không phải IN_STOCK | Khuyến nghị |
| Tên khách hàng (`buyerName`) | Không phải IN_STOCK | Không bắt buộc |
| Hoa hồng bán xe (`commission`) | Không phải IN_STOCK | Khuyến nghị |
| Nhân viên bán xe (`seller`) | Không phải IN_STOCK | Bắt buộc |
| Ghi chú (`note`) | Luôn hiển thị | Không bắt buộc |

**Bước 4:** Người dùng bấm "Xác nhận":
```ts
// Nếu là giao dịch bán/cọc:
await handleAddSalePayment(
  vehicle.id, amount, note, receiver,
  transitionStatus, seller, buyerName, salePrice, commission
);

// Nếu cập nhật giá bán khi về IN_STOCK:
await handleUpdateStatus(vehicle.id, VehicleStatus.IN_STOCK, {
  note, updates: { sale_price: salePrice }
});
```

---

### 4.3 Presenter Layer — Điều Phối Logic

**File:** [`src/modules/inventory/presentation/InventoryPresenter.ts`](./src/modules/inventory/presentation/InventoryPresenter.ts)

#### a) Chuyển trạng thái đơn — `updateVehicleStatus()`
```ts
async updateVehicleStatus(request: UpdateStatusRequest): Promise<void> {
  this.view.showLoading();
  await this.updateStatusUseCase.execute(request);  // → Use Case
  this.view.onStatusUpdated();
  await this.reloadVehicle(request.id);             // Reload detail card
  await this.refreshCurrentView();                   // Refresh danh sách
  this.view.hideLoading();
}
```

#### b) Thanh toán / Giao dịch bán — `addSalePayment()`
```ts
async addSalePayment(id, amount, note, receiver, nextStatus, seller, buyerName?, salePrice?, commission?) {
  const payment = { amount, note, date: today, receiver };
  await repository.addSalePayment(id, payment, nextStatus, seller, buyerName, salePrice, commission);
  // ↑ Repository tự xử lý: cộng received_amount, thêm lịch sử, chuyển trạng thái
  await this.reloadVehicle(id);
  await this.refreshCurrentView();
  this.view.onStatusUpdated();
}
```

#### c) Hủy giao dịch — `cancelSale()`
```ts
async cancelSale(id, userCode) {
  const historyEntry = {
    date: today, status: IN_STOCK, user: userCode,
    note: 'Hủy giao dịch đặt cọc - Quay về trạng thái Trong kho'
  };
  await repository.cancelSale(id, historyEntry);
  // ↑ Repository tự xử lý: ghi âm tiền hoàn cọc, reset thông tin bán
}
```

---

### 4.4 Use Case Layer — Kiểm Tra Nghiệp Vụ

**File:** [`src/modules/inventory/application/UpdateVehicleStatus.ts`](./src/modules/inventory/application/UpdateVehicleStatus.ts)

```ts
async execute(request: UpdateStatusRequest): Promise<void> {
  // 1. Lấy dữ liệu xe
  const carData = await this.repository.getById(request.id.toString());
  if (!carData) throw new Error('Không tìm thấy xe');
  
  // 2. Dùng Entity để kiểm tra nghiệp vụ
  const vehicle = new VehicleEntity(carData);
  
  // 3. ⚠️ Kiểm tra tính hợp lệ của bước chuyển (BẮT BUỘC)
  if (!VehicleStateMachine.canTransition(vehicle.status, request.nextStatus)) {
    throw new Error(`Chuyển đổi trạng thái không hợp lệ.`);
  }
  
  // 4. Tạo entry lịch sử
  const historyEntry = {
    date: today, status: request.nextStatus,
    user: request.user, note: request.note || `Chuyển sang ${request.nextStatus}`
  };
  
  // 5. Gọi repository thực hiện
  await this.repository.updateStatus(request.id, request.nextStatus, historyEntry, request.updates);
}
```

> **⚠️ Quan trọng:** Use case này CHỈ được dùng cho chuyển trạng thái đơn (không có thanh toán). Các giao dịch bán đi thẳng vào repository thông qua `addSalePayment()`.

---

### 4.5 Repository / Infrastructure Layer — Thực Thi Với Supabase

**File:** [`src/modules/inventory/infrastructure/SupabaseVehicleRepository.ts`](./src/modules/inventory/infrastructure/SupabaseVehicleRepository.ts)

Cốt lõi của toàn bộ hệ thống là phương thức private `_applyStatusTransition()`:

```ts
private async _applyStatusTransition(id, nextStatus, updates, historyEntry) {
  // B1: Fetch xe hiện tại từ DB
  const currentCar = await supabase.from('vehicles').select('*').eq('id', id).single();

  // B2: Lấy danh sách trường cần xóa khi về IN_STOCK / các bước trước
  const resets = VehicleStateMachine.getFieldsToReset(nextStatus);
  // Ví dụ khi về IN_STOCK: { sale_date: null, seller: null, commission: null, ... }

  // B3: Merge dữ liệu (merge order: currentCar → resets → updates)
  const mergedData = { ...currentCar, ...resets, ...updates, status: nextStatus };

  // B4: Tái tính tài chính từ dữ liệu đã merge
  const financials = calculateVehicleFinancials(mergedData);

  // B5: Đồng bộ tên nhân viên (buyer_name / seller_name) nếu có thay đổi mã
  if (updates.seller !== currentCar.seller) {
    finalUpdates.seller_name = await this._getStaffName(updates.seller);
  }

  // B6: Khóa snapshot tài chính khi xe chuyển sang SOLD
  if (nextStatus === VehicleStatus.SOLD) {
    updateData.final_financials = {
      grossProfit, netProfit, showroomProfitShare, partnerProfitShare,
      buyingCommission, sellingCommission, totalInvestment,
      lockedAt: new Date().toISOString()  // Timestamp khóa vĩnh viễn
    };
  }

  // B7: Ghi vào DB (gộp resets + updates + status + history + financials)
  await supabase.from('vehicles').update({
    ...resets, ...finalUpdates,
    status: nextStatus,
    total_cost: financials.totalCost,
    profit: financials.netProfit,
    history: [...currentCar.history, historyEntry]  // Thêm vào cuối mảng history
  }).eq('id', id);

  // B8: Side Effect — Gán mã xe cho tracked_cars của nhân viên bán
  if (finalSeller && finalSeller !== currentCar.seller && nextStatus !== IN_STOCK) {
    await this._assignVehicleToStaff(finalSeller, currentCar.code);
  }
}
```

---

## 5. Dữ Liệu Bị Reset Theo Trạng Thái

Khi xe về `IN_STOCK`, `SPA`, hoặc `DEPOSIT_BUY`, các trường bán hàng bị **xóa sạch**:

```ts
// VehicleStateMachine.getFieldsToReset()
{
  sale_date: null,
  seller: null,
  buyer_name: null,
  commission: null,
  received_amount: 0,
  sale_payment_history: []
}
```

> **⚠️ Lưu ý:** `received_amount` reset về `0`, không phải `null`. `sale_payment_history` reset về `[]` (mảng rỗng), không phải `null`.

---

## 6. Snapshot Tài Chính Khi Bán (Final Financials)

Khi xe chuyển sang `SOLD`, hệ thống **khóa vĩnh viễn** một snapshot tài chính tại thời điểm đó vào trường `final_financials` (JSONB):

```ts
interface VehicleFinancialSnapshot {
  grossProfit: number;          // Lãi gộp
  netProfit: number;            // Lãi ròng
  showroomProfitShare: number;  // Phần lợi nhuận showroom
  partnerProfitShare: number;   // Phần lợi nhuận đối tác
  buyingCommission: number;     // Hoa hồng mua
  sellingCommission: number;    // Hoa hồng bán
  totalInvestment: number;      // Tổng vốn đầu tư
  lockedAt: string;             // ISO timestamp khi khóa
}
```

Snapshot này được dùng bởi module Finance và Staff để báo cáo chính xác, không bị thay đổi kể cả khi admin sửa giá sau đó.

---

## 7. Ghi Lịch Sử (History Log)

Mỗi lần cập nhật trạng thái đều tạo ra một `VehicleHistoryEntry` được thêm vào cuối mảng `history`:

```ts
interface VehicleHistoryEntry {
  date: string;         // 'YYYY-MM-DD'
  status: VehicleStatus; // Trạng thái MỚI
  user: string;         // Mã nhân viên thực hiện (e.g. 'NV01')
  note?: string;        // Ghi chú tùy chọn
}
```

Hiển thị tại **Tab "Lịch sử"** trong `VehicleDetailModal`, theo thứ tự thời gian từ cũ đến mới, với timeline animation.

---

## 8. Phân Quyền

| Hành động | ADMIN | ACCOUNTANT | MANAGER | SALES_LEADER | SALES_STAFF |
|---|:---:|:---:|:---:|:---:|:---:|
| Xem nút "Cập nhật trạng thái" | ✅ | ✅ | ✅ | ✅ | ❌ |
| Chuyển trạng thái bán (DEPOSIT_SALE → SOLD) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Hủy giao dịch (→ IN_STOCK) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Xem tab Chi phí / Tài chính | ✅ | ✅ | ✅ | ❌ (trừ góp vốn) | ❌ |

Quyền xem nút được kiểm tra bởi `canSeeFullInfo` trong `VehicleDetailModal`:
```ts
const canSeeFullInfo =
  userRole === UserRole.ADMIN ||
  userRole === UserRole.ACCOUNTANT ||
  userRole === UserRole.MANAGER ||
  (vehicle.is_coinvested && vehicle.coinvestor_code === userCode); // Đối tác góp vốn
```

---

## 9. Anti-Patterns Cần Tránh

### ❌ KHÔNG làm thế này
```ts
// SAI: Cập nhật trạng thái trực tiếp từ UI
await supabase.from('vehicles').update({ status: 'SOLD' }).eq('id', id);

// SAI: Tự kiểm tra trạng thái trong UI thay vì dùng StateMachine
if (vehicle.status === 'IN_STOCK') { ... }

// SAI: Quên ghi lịch sử khi chuyển trạng thái
await repository.updateStatus(id, newStatus, undefined); // Thiếu historyEntry

// SAI: Sửa giá và trạng thái trong 2 lần gọi riêng biệt
await updateVehicle(id, { sale_price: newPrice });
await updateStatus(id, SOLD, historyEntry);  // Race condition!
```

### ✅ Làm đúng cách này
```ts
// ĐÚNG: Dùng addSalePayment để vừa cập nhật trạng thái vừa cập nhật giá trong 1 transaction
await presenter.addSalePayment(id, amount, note, receiver, SOLD, seller, buyerName, salePrice, commission);

// ĐÚNG: Luôn kiểm tra VehicleStateMachine trước khi cho phép hành động
const validNextStatuses = VehicleStateMachine.getValidNextStatuses(vehicle.status);
if (!validNextStatuses.includes(targetStatus)) return;
```

---

## 10. Sơ Đồ Tuần Tự (Sequence Diagram)

### Luồng: Chuyển xe từ `IN_STOCK` → `DEPOSIT_SALE`

```
Người dùng           UI                   Presenter              Repository          Supabase
    │                 │                       │                       │                  │
    │─ bấm "Cập nhật"→│                       │                       │                  │
    │                 │─ setIsUpdatingStatus──→│                       │                  │
    │                 │  (StatusUpdateOverlay) │                       │                  │
    │─ chọn "Cọc bán"→│                       │                       │                  │
    │                 │─ setTransitionStatus──→│                       │                  │
    │                 │  (hiện form nhập liệu) │                       │                  │
    │─ nhập dữ liệu──→│                       │                       │                  │
    │─ bấm "Xác nhận"→│                       │                       │                  │
    │                 │─ handleAddSalePayment─→│                       │                  │
    │                 │                       │─ addSalePayment()─────→│                  │
    │                 │                       │                       │─ SELECT vehicles──→│
    │                 │                       │                       │←─ currentCar──────│
    │                 │                       │                       │─ _applyStatus()   │
    │                 │                       │                       │  (merge + recalc) │
    │                 │                       │                       │─ UPDATE vehicles──→│
    │                 │                       │                       │─ _assignToStaff───→│
    │                 │                       │←─ success─────────────│                  │
    │                 │                       │─ reloadVehicle()──────→│                  │
    │                 │                       │─ refreshCurrentView() →│                  │
    │                 │                       │─ onStatusUpdated()────→│                  │
    │                 │←─ toast.success()─────│                       │                  │
    │←── toast hiển thị│                       │                       │                  │
```

---

## 11. Cấu Trúc File Liên Quan

```
src/
├── shared/
│   └── domain/
│       ├── constants.ts          ← VehicleStatus enum, VEHICLE_STATUS_LABELS
│       └── types.ts              ← Vehicle, VehicleHistoryEntry, VehicleFinancialSnapshot
│
└── modules/
    └── inventory/
        ├── domain/
        │   ├── VehicleStateMachine.ts   ← ⭐ Luật chuyển trạng thái
        │   ├── VehicleEntity.ts         ← Business logic (agingDays, profit)
        │   └── VehicleRepository.ts     ← Interface repository
        │
        ├── application/
        │   └── UpdateVehicleStatus.ts   ← Use Case (kiểm tra + gọi repo)
        │
        ├── infrastructure/
        │   └── SupabaseVehicleRepository.ts  ← ⭐ Thực thi với Supabase
        │
        └── presentation/
            ├── InventoryPresenter.ts        ← ⭐ Điều phối toàn bộ luồng
            └── components/VehicleDetail/
                ├── VehicleSidebar.tsx       ← Nút "Cập nhật trạng thái"
                ├── StatusUpdateOverlay.tsx  ← Form chọn trạng thái & nhập liệu
                ├── PaymentsSaleTab.tsx      ← Tab thanh toán bán (luồng thay thế)
                └── HistoryTab.tsx           ← Hiển thị lịch sử
```

---

## 12. Checklist Khi Thêm Trạng Thái Mới

Nếu cần thêm một trạng thái mới (ví dụ: `DELIVERING`), làm theo thứ tự sau:

- [ ] **1.** Thêm vào `VehicleStatus` enum trong `constants.ts`
- [ ] **2.** Thêm nhãn vào `VEHICLE_STATUS_LABELS` trong `constants.ts`
- [ ] **3.** Thêm badge config vào `VEHICLE_STATUS_CONFIG` trong `constants.ts`
- [ ] **4.** Cập nhật `VALID_TRANSITIONS` trong `VehicleStateMachine.ts`
- [ ] **5.** Kiểm tra `getFieldsToReset()` — có cần reset trường nào không?
- [ ] **6.** Kiểm tra điều kiện `isSaleTransition` trong `StatusUpdateOverlay.tsx`
- [ ] **7.** Kiểm tra điều kiện hiển thị tab "Tiền bán" trong `VehicleDetailModal.tsx`
- [ ] **8.** Kiểm tra điều kiện trong `_applyStatusTransition()` nếu cần snapshot đặc biệt
- [ ] **9.** Cập nhật tài liệu này

---

*Tài liệu được tạo tự động từ phân tích codebase Auto28. Cập nhật khi có thay đổi kiến trúc.*
