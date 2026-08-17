---
name: state-lifecycle-optimizer
description: >
  Hệ thống tối ưu hóa vòng đời State và hiệu năng kết xuất trong React 19. Nâng State Hook
  lên cấp Dispatcher Page Component, loại bỏ Cascading Re-renders trong useEffect,
  và tối ưu hóa Real-time Supabase Sync với Debounce và Selective Queries. Kích hoạt khi:
  "tối ưu render", "fix giật lag", "mất state khi resize", "tối ưu supabase sync", "cascading renders".
---

# ⚡ STATE LIFECYCLE OPTIMIZER — REACT 19 & SUPABASE ENGINE

> **Mục tiêu:** Ngăn ngừa hiện tượng mất trạng thái giao diện khi thay đổi kích thước màn hình (Responsive Flipping), triệt tiêu các lần render thừa (Cascading Renders), và giảm thiểu 80% tải truy vấn Real-time database.

---

## ═══ QUY TẮC BẤT BIẾN ═══

### 1. NÂNG STATE LÊN CẤP DISPATCHER (LIFT STATE TO DISPATCHER)

#### ❌ Anti-Pattern (Khởi tạo State trong View con):
```typescript
// Sai: Mỗi view con gọi hook riêng -> Khi đổi isMobile, toàn bộ state bị reset!
export const InventoryPage: React.FC<Props> = (props) => {
  const isMobile = useIsMobile();
  return isMobile ? <InventoryMobileView {...props} /> : <InventoryWebView {...props} />;
};

export const InventoryMobileView = () => {
  const state = useInventoryState(); // ❌ Bị unmount và reset khi màn hình mở rộng
  ...
};
```

#### ✅ Chuẩn Công Nghiệp (State khởi tạo ở Dispatcher):
```typescript
// Đúng: State sống ở Dispatcher Page, truyền props xuống các Views con
export const InventoryPage: React.FC<Props> = (props) => {
  const isMobile = useIsMobile();
  // Khởi tạo 1 lần duy nhất, giữ nguyên trạng thái dù xoay màn hình hay resize
  const inventoryState = useInventoryState(props);

  if (isMobile) {
    return <InventoryMobileView {...props} {...inventoryState} />;
  }
  return <InventoryWebView {...props} {...inventoryState} />;
};
```

---

### 2. TRIỆT TIÊU CASCADING RENDERS TRONG USEEFFECT

#### ❌ Anti-Pattern (Set State đồng bộ trong Effect):
```typescript
// Sai: Kích hoạt render lần 2 ngay sau khi render lần 1 hoàn tất
useEffect(() => {
  setFilterMonth(initialFilterMonth);
}, [initialFilterMonth]);
```

#### ✅ Chuẩn Công Nghiệp (Derived State hoặc Controlled Props):
```typescript
// Đúng 1: Dùng key trên component để reset state tự nhiên
<ExpenseTable key={initialFilterMonth} initialFilterMonth={initialFilterMonth} />

// Đúng 2: Dùng Derived State hoặc useMemo
const currentMonth = propMonth || fallbackMonth;
```

---

### 3. TỐI ƯU REAL-TIME SUPABASE SYNC

#### ❌ Anti-Pattern (Select * và fetch lại toàn bộ không kiểm soát):
```typescript
// Sai: Mỗi lần có 1 dòng thay đổi lại kéo toàn bộ bảng về
supabase.from(table).select('*')...
```

#### ✅ Chuẩn Công Nghiệp (Selective Columns + Debounced Event Handling):
```typescript
// Đúng: Chỉ lấy đúng cột cần hiển thị và debounce 300ms
let timeoutId: NodeJS.Timeout;
const debouncedFetch = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => fetchData(), 300);
};

const subscription = supabase
  .channel(`table_sync_${tableName}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
    debouncedFetch();
  })
  .subscribe();
```
