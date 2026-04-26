export enum VehicleStatus {
  DEPOSIT_BUY = 'DEPOSIT_BUY',
  SPA = 'SPA',
  IN_STOCK = 'IN_STOCK',
  DEPOSIT_SALE = 'DEPOSIT_SALE',
  BANK_DEPOSIT = 'BANK_DEPOSIT',
  BANK_CONFIRMED = 'BANK_CONFIRMED',
  SOLD = 'SOLD',
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  [VehicleStatus.DEPOSIT_BUY]: 'Cọc mua',
  [VehicleStatus.SPA]: 'Spa',
  [VehicleStatus.IN_STOCK]: 'Trong kho',
  [VehicleStatus.DEPOSIT_SALE]: 'Cọc bán',
  [VehicleStatus.BANK_DEPOSIT]: 'Cọc Bank',
  [VehicleStatus.BANK_CONFIRMED]: 'Thông báo cho vay',
  [VehicleStatus.SOLD]: 'Đã bán',
};

export const VEHICLE_STATUS_CONFIG: Record<VehicleStatus, { label: string; badgeClass: string }> = {
  [VehicleStatus.DEPOSIT_BUY]:    { label: 'Cọc mua',           badgeClass: 'glass-badge-orange' },
  [VehicleStatus.SPA]:            { label: 'Spa',               badgeClass: 'glass-badge-sky' },
  [VehicleStatus.IN_STOCK]:       { label: 'Trong kho',         badgeClass: 'glass-badge-emerald' },
  [VehicleStatus.DEPOSIT_SALE]:   { label: 'Cọc bán',           badgeClass: 'glass-badge-purple' },
  [VehicleStatus.BANK_DEPOSIT]:   { label: 'Cọc Bank',          badgeClass: 'glass-badge-orange' },
  [VehicleStatus.BANK_CONFIRMED]: { label: 'Thông báo cho vay', badgeClass: 'glass-badge-blue' },
  [VehicleStatus.SOLD]:           { label: 'Đã bán',            badgeClass: 'glass-badge-red' },
};

export const ADMIN_EMAILS = [
  "thuongpth24mba@uef.edu.vn",
  "admin@email.com",
  "abc@email.com",
  "hoaivu015@gmail.com",
  "admin@auto28.com"
];

export enum UserRole {
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER',
  SALES_LEADER = 'SALES_LEADER',
  SALES_STAFF = 'SALES_STAFF',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Quản trị viên',
  [UserRole.ACCOUNTANT]: 'Kế toán',
  [UserRole.STAFF]: 'Nhân viên kinh doanh',
  [UserRole.MANAGER]: 'Quản lý showroom',
  [UserRole.SALES_LEADER]: 'Trưởng nhóm sale',
  [UserRole.SALES_STAFF]: 'Nhân viên sale',
};

export enum Permission {
  VIEW_STAFF = 'view_staff',
  EDIT_STAFF = 'edit_staff',
  VIEW_FINANCE = 'view_finance',
  EDIT_CASHFLOW = 'edit_cashflow',
  VIEW_INVENTORY = 'view_inventory',
  EDIT_INVENTORY = 'edit_inventory',
}

export const STAFF_CONSTANTS = {
  BONUS_THRESHOLD_PERCENT: 100,
  BONUS_MULTIPLIER_FULL: 1.0,
  BONUS_MULTIPLIER_REDUCED: 0.7,
  DEFAULT_BUYING_COMMISSION: 0,
  DEFAULT_SALE_COMMISSION: 0,
};

export const INVENTORY_CONSTANTS = {
  AGING_THRESHOLD_DAYS: 30,
};
