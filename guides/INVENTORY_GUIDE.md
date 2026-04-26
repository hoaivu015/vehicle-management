# Hướng Dẫn: Module Kho Xe (Inventory) — Auto28

> **Phiên bản:** 1.0 | **Ngày:** 2026-04-25  
> Tài liệu này mô tả toàn bộ kiến trúc, luồng dữ liệu, phân quyền và các quy tắc nghiệp vụ của module **Kho Xe** trong hệ thống Auto28.

---

## 1. Tổng Quan Module

Module Kho Xe là trung tâm của toàn bộ hệ thống Auto28. Mọi dòng tiền, hoa hồng, và báo cáo lợi nhuận đều bắt nguồn từ đây.

### Chức năng chính:
- **Nhập kho:** Khởi tạo hồ sơ xe mới (cọc mua)
- **Quản lý vòng đời xe:** Theo dõi trạng thái từ cọc mua → bán
- **Ghi nhận dòng tiền:** Thanh toán mua và bán theo từng đợt
- **Quản lý chi phí:** Spa, nội thất, và các chi phí phát sinh
- **Báo cáo tài chính:** Lợi nhuận gộp/ròng, phân chia cổ đông
- **Ghim xe:** Ưu tiên hiển thị xe quan trọng lên đầu

### Hai tab chính:
| Tab | Nội dung | Data Source |
|---|---|---|
| **Trong kho** | Xe chưa bán (status ≠ SOLD) | `getAvailableVehicles()` |
| **Đã bán** | Xe đã bán trong tháng được chọn | `getSoldVehiclesByMonth(month)` |

---

## 2. Kiến Trúc Tổng Quan

```
InventoryPage.tsx  (Presentation Layer - Orchestrator)
    ├── CarCard.tsx              ← Hiển thị mỗi xe trong lưới
    ├── VehicleDetailModal.tsx  ← Modal chi tiết + hành động
    │     ├── VehicleSidebar.tsx      ← Ảnh, số liệu, nút hành động
    │     ├── InfoTab.tsx             ← Thông tin xe + chỉnh sửa
    │     ├── FinancialsTab.tsx       ← Chi phí phát sinh (Spa...)
    │     ├── PaymentsBuyTab.tsx      ← Dòng tiền mua
    │     ├── PaymentsSaleTab.tsx     ← Dòng tiền bán
    │     ├── HistoryTab.tsx          ← Lịch sử trạng thái
    │     └── StatusUpdateOverlay.tsx ← Popup cập nhật trạng thái
    ├── AddVehicleModal.tsx      ← Form nhập xe mới
    └── InventoryPerformanceBar.tsx ← Thống kê tổng hợp
    
InventoryPresenter.ts  (Application - MVP Presenter)
    ↓ orchestrates
[Use Cases]
    ├── GetInventoryList.ts     ← Query danh sách xe
    ├── AddVehicle.ts           ← Nhập xe mới
    ├── UpdateVehicleStatus.ts  ← Cập nhật trạng thái
    ├── DeleteVehicle.ts        ← Xóa xe + dọn dẹp
    └── GetNextVehicleCode.ts   ← Tạo mã xe tiếp theo

[Domain]
    ├── VehicleEntity.ts        ← Business logic (lợi nhuận, aging)
    ├── VehicleStateMachine.ts  ← Luật chuyển trạng thái
    └── VehicleRepository.ts    ← Interface

[Infrastructure]
    └── SupabaseVehicleRepository.ts  ← Thực thi Supabase
```

---

## 3. Phân Quyền Hiển Thị

### 3.1 Quyền Xem Dữ Liệu Tài Chính

```ts
const canSeeFullInfo =
  userRole === UserRole.ADMIN ||
  userRole === UserRole.ACCOUNTANT ||
  userRole === UserRole.MANAGER ||
  (vehicle.is_coinvested && vehicle.coinvestor_code === userCode);
  // Đối tác góp vốn chỉ thấy xe mình góp
```

### 3.2 Bảng Phân Quyền Chi Tiết

| Chức năng | ADMIN | ACCOUNTANT | MANAGER | SALES_LEADER | SALES_STAFF |
|---|:---:|:---:|:---:|:---:|:---:|
| Xem kho (tab Trong kho) | ✅ Tất cả | ✅ Tất cả | ✅ Phòng ban | ✅ Tất cả | ✅ Tất cả |
| Xem tab Đã bán | ✅ Tất cả | ✅ Tất cả | ✅ Phòng ban | ❌ Chỉ cá nhân | ❌ Chỉ cá nhân |
| Xem giá nhập / lợi nhuận | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tab Chi phí (Spa) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tab Tiền mua | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tab Tiền bán | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cập nhật trạng thái | ✅ | ✅ | ✅ | ✅ | ❌ |
| Chỉnh sửa thông tin xe | ✅ | ✅ | ✅ | ❌ | ❌ |
| Nhập xe mới | ✅ | ✅ | ✅ | ❌ | ❌ |
| Xóa xe | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ghim xe | ✅ | ✅ | ✅ | ✅ | ✅ |

### 3.3 Logic Tải Dữ Liệu Theo Vai Trò

```ts
// InventoryPage.tsx — useEffect khi mount
if (isAdmin || isAccountant) {
  // Xem toàn bộ kho
  await presenter.loadAvailable();
  await presenter.loadSold(soldMonth);  // chỉ khi tab SOLD

} else if (isManager) {
  // Xem xe của phòng ban (cả Trong kho + Đã bán)
  const codes = await staffRepo.getCodesByDepartment(currentUser.department);
  await presenter.loadDepartment(codes, soldMonth);

} else {
  // Nhân viên: Thấy TẤT CẢ xe trong kho để bán,
  //            nhưng chỉ thấy xe ĐÃ BÁN của mình
  await presenter.loadPersonal(currentUser.code, soldMonth);
}
```

> **⚠️ Lưu ý quan trọng:** Nhân viên thường (`SALES_STAFF`) thấy **toàn bộ kho** ở tab "Trong kho" nhưng chỉ thấy xe của **cá nhân họ** ở tab "Đã bán". Đây là thiết kế cố ý để họ có thể bán cross-product.

---

## 4. Luồng Nhập Xe Mới

### 4.1 Giao Diện — AddVehicleModal

**Trigger:** Bấm nút `+` tròn góc trên phải (chỉ có `canSeeFullInfo`)

**Sections trong form:**
1. **Thông tin xe:** Tên model, năm SX, màu sắc, ODO, ảnh đại diện
2. **Thông tin mua vào:** Giá nhập, ngày cọc mua, nhân viên mua
3. **Hợp tác đầu tư:** Toggle on/off → xuất hiện form chọn đối tác + số tiền góp vốn
4. **Ghi chú:** Mô tả tình trạng xe

**Validation bắt buộc:**
- `name` ≠ rỗng
- `buyer` ≠ rỗng (chọn nhân viên mua)
- Nếu `is_coinvested = true` → `coinvestor_code` + `coinvest_amount > 0`

### 4.2 Use Case — AddVehicle

```ts
// src/modules/inventory/application/AddVehicle.ts
async execute(request: AddVehicleRequest): Promise<Vehicle> {
  // 1. Tạo mã xe tự động: VH-YYMM-NN
  //    Ví dụ: VH-2604-01  (tháng 4/2026, xe đầu tiên)
  const code = `VH-${yy}${mm}-${nextNN.padStart(2, '0')}`;

  // 2. Trạng thái ban đầu LUÔN là DEPOSIT_BUY
  status: VehicleStatus.DEPOSIT_BUY,

  // 3. Hoa hồng mua mặc định: 3,000,000đ (nếu không nhập)
  buying_commission: request.buying_commission ?? 3_000_000,

  // 4. Khởi tạo history log đầu tiên
  history: [{ date, status: DEPOSIT_BUY, user: 'Hệ thống', note: 'Khởi tạo xe mới' }]
}
```

### 4.3 Luồng Upload Ảnh

```
Người dùng chọn file
    ↓
CloudinaryVehicleStorageRepository.uploadImage(file)
    ↓
POST đến Cloudinary API
    ↓
Nhận publicUrl → lưu vào formData.image_url
    ↓
Lưu cùng với thông tin xe khi submit
```

---

## 5. Danh Sách Xe — CarCard

### 5.1 Thông Tin Hiển Thị

| Vùng | Nội dung | Điều kiện |
|---|---|---|
| Ảnh header | `image_url` hoặc `/default-car.jpg` | Luôn hiển thị |
| Badge trạng thái | Màu sắc theo `VEHICLE_STATUS_CONFIG` | Luôn hiển thị |
| Badge "Góp vốn" | 🟣 | `is_coinvested = true` |
| Icon đồng hồ 🔴 | Cảnh báo tồn lâu | `days > 25` |
| Nút ghim 📌 | Chỉ hiện khi hover (nếu chưa ghim) | Luôn có |
| Giá (đen pill) | `sale_price` (chào bán) hoặc giá bán thực | Luôn hiển thị |
| Tên xe | `car.name` | Luôn hiển thị |
| Mã xe, Năm SX, ODO | `#code`, `year`, `odo` km | Luôn hiển thị |
| Thời gian lưu kho | `days` ngày (đỏ nếu > 25) | Luôn hiển thị |
| Lợi nhuận dự tính | `financials.showroomProfitShare` | CHỈ `canSeeFullInfo` |
| "Chi tiết →" | Link dẫn đến modal | Nếu KHÔNG `canSeeFullInfo` |

### 5.2 Sắp Xếp Thẻ Xe

```ts
// Ưu tiên 1: Xe được ghim lên đầu
// Ưu tiên 2: Sắp xếp theo ngày nhập giảm dần (mới nhất lên trước)
const sorted = [...cars].sort((a, b) => {
  if (a.is_pinned && !b.is_pinned) return -1;
  if (!a.is_pinned && b.is_pinned) return 1;
  return new Date(b.purchase_date) - new Date(a.purchase_date);
});
```

### 5.3 Tính Toán `days` (Thời Gian Lưu Kho)

```ts
// VehicleEntity.ts
get agingDays(): number {
  const start = new Date(this.purchaseDate);
  const end = this.saleDate ? new Date(this.saleDate) : new Date(); // Nếu đã bán → dùng ngày bán
  return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
}
```

> **Chú ý:** Với xe đã bán (`SOLD`), `days` là số ngày từ nhập kho đến ngày bán. Với xe đang tồn, `days` tính đến ngày hôm nay.

---

## 6. Modal Chi Tiết Xe — VehicleDetailModal

### 6.1 Cấu Trúc Layout

```
┌─────────────────────────────────────────────────────────┐
│ [PIN] [X]                                               │
│ ┌──────────────┐  ┌───────────────────────────────────┐ │
│ │ VehicleSidebar│  │    Tab Bar (Toolbar)              │ │
│ │   ─────────  │  │ [Thông số][Chi phí][Tiền mua/bán] │ │
│ │   Ảnh xe     │  │ [Lịch sử]                         │ │
│ │   ─────────  │  │───────────────────────────────────│ │
│ │   LN ròng    │  │                                   │ │
│ │   Tổng vốn   │  │    Tab Content (Scrollable)       │ │
│ │   ─────────  │  │                                   │ │
│ │ [CẬP NHẬT TT]│  │                                   │ │
│ │ [EDIT]       │  │                                   │ │
│ └──────────────┘  └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Danh Sách Tab Và Điều Kiện Hiển Thị

| Tab | Label | Icon | Điều kiện hiển thị |
|---|---|---|---|
| `info` | Thông số | Calendar | Luôn hiển thị |
| `financials` | Chi phí | CircleDollarSign | `canSeeFullInfo` |
| `payments_buy` | Tiền mua | DollarSign | `canSeeFullInfo` **VÀ** (đang `DEPOSIT_BUY` **HOẶC** có lịch sử thanh toán mua) |
| `payments_sale` | Tiền bán | TrendingUp | `canSeeFullInfo` **VÀ** (đang ở giai đoạn bán: từ `DEPOSIT_SALE` trở đi **HOẶC** có lịch sử nhận tiền) |
| `history` | Lịch sử | Clock | Luôn hiển thị |

### 6.3 Đồng Bộ Dữ Liệu Realtime

Sau khi bất kỳ hành động nào được thực hiện, hệ thống tự động:
1. Reload dữ liệu xe đang mở (`reloadVehicle(id)`)
2. Cập nhật `selectedVehicle` trong `InventoryPage` để modal hiển thị đúng
3. Refresh danh sách (`refreshCurrentView()`)

```ts
// InventoryPage.tsx — Luôn đồng bộ selectedVehicle với data mới nhất
useEffect(() => {
  setSelectedVehicle(current => {
    if (!current) return current;
    const updated = [...availableCars, ...soldCars].find(c => c.id === current.id);
    return updated || current;
  });
}, [availableCars, soldCars]);
```

---

## 7. Tab Chi Tiết — Mô Tả Từng Tab

### Tab 1: Thông Số (`InfoTab`)

**View mode (xem):**
- Mã xe, Năm SX, Số ODO, Màu sắc
- Ngày nhập kho, NV nhập, NV bán (nếu có)
- Hoa hồng mua/bán (chỉ `canSeeFullInfo`)
- Giá nhập / Giá chào bán (chỉ `canSeeFullInfo`)
- Ghi chú nội bộ

**Edit mode (chỉnh sửa):**
- Cho phép sửa: tên xe, năm SX, màu sắc, ODO, giá nhập, giá chào bán, hoa hồng mua/bán, NV nhập/bán
- Nút "Xóa xe" chỉ hiện với `ADMIN` và yêu cầu xác nhận 2 bước

---

### Tab 2: Chi Phí (`FinancialsTab`)

Quản lý chi phí phát sinh trong quá trình giữ xe (Spa, nội thất, cứu hộ...):

**Hiển thị:**
- Bảng tóm tắt tài chính: Tổng vốn đầu tư, Lợi nhuận gộp/ròng
- Danh sách chi phí phát sinh theo ngày
- Nút xóa từng chi phí (chỉ `Admin/Accountant`)

**Thêm chi phí:**
```ts
// InventoryPresenter.addVehicleCost()
const newCost = { date: today, note: costName, amount: amount };
const updatedHistory = [...vehicle.cost_history, newCost];
await repository.update(vehicle.id, { cost_history: updatedHistory });
// Repository tự recalculate total_cost và profit
```

---

### Tab 3: Tiền Mua (`PaymentsBuyTab`)

Dành cho giai đoạn `DEPOSIT_BUY` — theo dõi tiến trình thanh toán cho người bán xe:

**Hiển thị:**
- Giá nhập `vs` Đã trả `vs` Còn nợ
- Lịch sử các đợt thanh toán

**Thêm đợt thanh toán:**
```ts
// InventoryPresenter.addPurchasePayment()
const payment = { amount, note, date: today, receiver };
await repository.addPurchasePayment(id, payment);
// Repository: purchase_paid_amount += amount, thêm vào purchase_payment_history
```

---

### Tab 4: Tiền Bán (`PaymentsSaleTab`)

Dành cho giai đoạn từ `DEPOSIT_SALE` trở đi — ghi nhận dòng tiền từ khách:

**Hiển thị:**
- Giá bán thỏa thuận `vs` Còn phải thu khách
- Form ghi nhận thanh toán
- Lịch sử nhận tiền từ khách

**Form ghi nhận dòng tiền:**

| Trường | Điều kiện hiển thị |
|---|---|
| Số tiền nhận | Luôn có |
| Tên khách hàng + Giá bán chốt + Hoa hồng | Chỉ khi: đang `IN_STOCK` hoặc `nextStatus = SOLD` |
| Nhân viên bán (Tư vấn) | Luôn có |
| Trạng thái tiếp theo | Dropdown chọn: giữ nguyên hoặc chuyển tiếp |
| Ghi chú giao dịch | Luôn có |

**Quyền sử dụng:** Chỉ `ADMIN` và `ACCOUNTANT`

**Hủy giao dịch (về kho):**
- Nút "Hủy giao dịch" → xác nhận 2 bước → gọi `handleCancelSale()`
- Tự động ghi âm khoản hoàn tiền cọc vào lịch sử

---

### Tab 5: Lịch Sử (`HistoryTab`)

Timeline dọc hiển thị toàn bộ lịch sử trạng thái:
- Ngày thay đổi
- Badge màu theo trạng thái
- Tên nhân viên thực hiện
- Ghi chú

---

## 8. Thanh Thống Kê — InventoryPerformanceBar

Hiển thị phía trên lưới xe (chỉ cho tab "Trong kho"):

| Chỉ số | Công thức | Màu |
|---|---|---|
| Tổng xe tồn | `vehicles.length` | 🟤 Kraft accent |
| Vốn tồn kho | `Σ (purchase_price + total_cost)` | 🟢 Emerald |
| Cảnh báo tồn lâu | Số xe có `purchase_date ≤ 25 ngày trước` | 🔴 Đỏ (nếu > 0) |

---

## 9. Bộ Lọc Và Tìm Kiếm

### Lọc xe tồn lâu (`AGING_25`)

```ts
// InventoryPresenter.filter('AGING_25')
filtered = cars.filter(car => {
  const purchaseDate = new Date(car.purchase_date);
  return purchaseDate <= twentyFiveDaysAgo; // 25 ngày trước
});
```

### Chọn tháng xem "Đã bán"

Input `<input type="month">` góc trên phải — chỉ xuất hiện khi tab **Đã bán** đang active.

---

## 10. Mã Xe — Định Dạng Và Quy Tắc

### Định dạng: `VH-YYMM-NN`

| Phần | Ý nghĩa | Ví dụ |
|---|---|---|
| `VH` | Tiền tố cố định (Vehicle) | `VH` |
| `YY` | 2 chữ số cuối của năm | `26` (2026) |
| `MM` | Tháng (2 chữ số) | `04` (tháng 4) |
| `NN` | Số thứ tự trong tháng | `01`, `02`... |

**Ví dụ:** `VH-2604-03` = xe thứ 3 nhập vào tháng 4/2026

### Quy tắc đánh số:
- Hệ thống tự động tìm số NN lớn nhất trong tháng hiện tại và tăng thêm 1
- Mã xe là **duy nhất** và **không thể thay đổi** sau khi tạo

---

## 11. Ghim Xe (Pin)

### Mục đích
Ghim xe lên đầu danh sách để ưu tiên hiển thị (xe VIP, xe cần bán gấp...).

### Cách hoạt động
```ts
// Nút ghim trong CarCard và VehicleDetailModal
await presenter.togglePin(id, !car.is_pinned);
// Repository: update({ is_pinned: isPinned })
// Toast: "Đã ghim xe lên đầu danh sách" / "Đã bỏ ghim xe"
```

### Hiển thị
- **Ghim:** Icon 📌 màu vàng (kraft-accent), nền đậm
- **Chưa ghim:** Icon mờ, chỉ xuất hiện khi hover vào thẻ

---

## 12. Xóa Xe

**Quyền:** Chỉ `ADMIN` mới có nút xóa (trong `InfoTab`)

**Quy trình xóa an toàn (3 bước):**

```
Bước 1: Bấm "Xóa xe khỏi kho" → hiển thị xác nhận
Bước 2: Bấm "Xác nhận xóa" → gọi DeleteVehicle use case
    ├── Xóa ảnh khỏi Cloudinary (nếu có)
    ├── Dọn sạch tracked_cars trong bảng employees
    └── Xóa bản ghi vehicles
Bước 3: Modal đóng, danh sách refresh
```

```ts
// DeleteVehicle use case
async execute(id: number): Promise<void> {
  await this.storageRepo.deleteImage(vehicle.image_url); // Cloudinary
  await this.repository.delete(id.toString());           // removeFromStaffTracking → DELETE vehicles
}
```

> **⚠️ Không thể hoàn tác.** Dữ liệu tài chính liên quan (lợi nhuận, hoa hồng) sẽ bị mất vĩnh viễn.

---

## 13. Cấu Trúc Dữ Liệu Xe

```ts
interface Vehicle {
  // Định danh
  id: number;
  code: string;             // "VH-2604-01"
  name: string;             // "Toyota Camry 2023"
  year: number;
  status: VehicleStatus;

  // Thông tin vật lý
  odo?: number;             // Số km (odometer)
  color?: string;           // Màu xe
  image_url?: string;       // URL ảnh đại diện
  images?: string[];        // Mảng ảnh bổ sung (tương lai)
  notes?: string;           // Ghi chú nội bộ

  // Tài chính nhập kho
  purchase_price: number;   // Giá nhập xe
  purchase_date: string;    // Ngày cọc mua (YYYY-MM-DD)
  buyer: string;            // Mã NV nhập (e.g. "NV01")
  buyer_name?: string;      // Tên NV nhập (auto-sync)
  buying_commission?: number; // Hoa hồng mua

  // Tài chính bán hàng
  sale_price?: number;      // Giá bán (chào hoặc chốt)
  sale_date?: string;       // Ngày bán (YYYY-MM-DD)
  seller?: string;          // Mã NV bán (e.g. "NV02")
  seller_name?: string;     // Tên NV bán (auto-sync)
  commission?: number;      // Hoa hồng bán

  // Chi phí phát sinh
  total_cost: number;       // Tổng chi phí (auto-calc)
  cost_history: CostItem[]; // Lịch sử chi phí chi tiết

  // Góp vốn
  is_coinvested: boolean;
  coinvestor_code?: string; // Mã đối tác
  coinvest_amount: number;  // Số tiền góp

  // Thanh toán mua
  purchase_paid_amount?: number;           // Đã trả tổng cộng
  purchase_payment_history?: PaymentItem[]; // Lịch sử từng đợt

  // Thanh toán bán
  received_amount?: number;                // Đã nhận từ khách
  sale_payment_history?: PaymentItem[];    // Lịch sử từng đợt

  // Meta
  history?: VehicleHistoryEntry[];  // Lịch sử trạng thái
  is_pinned?: boolean;              // Ghim lên đầu

  // Computed (tính trong Domain)
  profit?: number;          // Lợi nhuận tạm tính
  days?: number;            // Số ngày lưu kho
  final_financials?: VehicleFinancialSnapshot; // Khóa khi SOLD
}
```

---

## 14. Cấu Trúc File Module

```
src/modules/inventory/
├── application/
│   ├── AddVehicle.ts           ← Nhập xe mới (tạo mã, khởi tạo hồ sơ)
│   ├── DeleteVehicle.ts        ← Xóa xe + dọn tracking
│   ├── GetInventoryList.ts     ← Query danh sách (Available/Sold/Personal/Dept)
│   ├── GetNextVehicleCode.ts   ← Preview mã xe tiếp theo cho form
│   └── UpdateVehicleStatus.ts  ← Cập nhật trạng thái + ghi log
│
├── domain/
│   ├── VehicleEntity.ts        ← Business: agingDays, totalCost, profit
│   ├── VehicleRepository.ts    ← Interface (Port)
│   └── VehicleStateMachine.ts  ← Luật chuyển trạng thái hợp lệ
│
├── infrastructure/
│   ├── CloudinaryVehicleStorageRepository.ts ← Upload/xóa ảnh
│   ├── SupabaseVehicleRepository.ts          ← CRUD + Realtime Supabase
│   └── SupabaseVehicleStorageRepository.ts   ← (legacy - dùng Cloudinary thay thế)
│
└── presentation/
    ├── InventoryPage.tsx               ← Trang chính (Orchestrator)
    ├── InventoryPresenter.ts           ← MVP Presenter
    └── components/
        ├── AddVehicleModal.tsx         ← Form nhập xe mới
        ├── CarCard.tsx                 ← Thẻ hiển thị mỗi xe
        ├── InventoryPerformanceBar.tsx ← Thanh thống kê tổng hợp
        ├── InventorySkeleton.tsx       ← Loading skeleton
        ├── VehicleDetailModal.tsx      ← Modal chi tiết (Container)
        └── VehicleDetail/
            ├── VehicleSidebar.tsx          ← Sidebar trái (ảnh + số liệu)
            ├── StatusUpdateOverlay.tsx     ← Popup chọn trạng thái mới
            ├── InfoTab.tsx                 ← Tab thông số
            ├── FinancialsTab.tsx           ← Tab chi phí
            ├── PaymentsBuyTab.tsx          ← Tab tiền mua
            ├── PaymentsSaleTab.tsx         ← Tab tiền bán
            ├── HistoryTab.tsx              ← Tab lịch sử
            └── VehicleDetailModalShared.tsx ← Shared components (InfoBox, FinancialBox...)
```

---

## 15. Anti-Patterns Cần Tránh

### ❌ KHÔNG làm thế này
```tsx
// SAI: Gọi Supabase trực tiếp trong component
const { data } = await supabase.from('vehicles').select('*');

// SAI: Tính lợi nhuận trong component thay vì dùng calculateVehicleFinancials
const profit = car.sale_price - car.purchase_price - car.total_cost;

// SAI: Để selectedVehicle stale sau khi update
setSelectedVehicle(updatedData);  // Đúng phải để presenter.reloadVehicle() làm điều này
```

### ✅ Làm đúng cách này
```tsx
// ĐÚNG: Dùng presenter để load data
await presenter.loadAvailable();

// ĐÚNG: Luôn dùng calculateVehicleFinancials để nhất quán
const financials = calculateVehicleFinancials(vehicle);

// ĐÚNG: Đồng bộ selectedVehicle qua view.onVehicleUpdated callback
view: {
  onVehicleUpdated: (vehicle) => setSelectedVehicle(vehicle)
}
```

---

## 16. Checklist Khi Thêm Tính Năng Mới

- [ ] Thêm use case mới trong `application/`
- [ ] Cập nhật `VehicleRepository` interface nếu cần method mới
- [ ] Implement method mới trong `SupabaseVehicleRepository`
- [ ] Thêm method mới vào `InventoryPresenter`
- [ ] Cập nhật `InventoryView` interface nếu cần callback mới
- [ ] Triển khai UI trong component thích hợp
- [ ] Kiểm tra phân quyền — ai được phép dùng tính năng này?
- [ ] Đảm bảo `refetchVehicle` + `refreshCurrentView` được gọi sau khi mutation

---

*Tài liệu được tạo tự động từ phân tích codebase Auto28. Tham khảo thêm: `STATUS_UPDATE_GUIDE.md` cho chi tiết luồng cập nhật trạng thái.*
