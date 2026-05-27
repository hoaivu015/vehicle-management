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
  [VehicleStatus.SPA]: 'Dọn/Spa',
  [VehicleStatus.IN_STOCK]: 'Trong kho',
  [VehicleStatus.DEPOSIT_SALE]: 'Cọc trả thẳng',
  [VehicleStatus.BANK_DEPOSIT]: 'Cọc trả góp',
  [VehicleStatus.BANK_CONFIRMED]: 'Thông báo giải ngân',
  [VehicleStatus.SOLD]: 'Đã bán',
};

export const VEHICLE_STATUS_CONFIG: Record<VehicleStatus, { label: string; badgeClass: string }> = {
  [VehicleStatus.DEPOSIT_BUY]: { label: 'Cọc mua', badgeClass: 'glass-badge-orange' },
  [VehicleStatus.SPA]: { label: 'Dọn/Spa', badgeClass: 'glass-badge-sky' },
  [VehicleStatus.IN_STOCK]: { label: 'Trong kho', badgeClass: 'glass-badge-emerald' },
  [VehicleStatus.DEPOSIT_SALE]: { label: 'Cọc trả thẳng', badgeClass: 'glass-badge-purple' },
  [VehicleStatus.BANK_DEPOSIT]: { label: 'Cọc trả góp', badgeClass: 'glass-badge-orange' },
  [VehicleStatus.BANK_CONFIRMED]: { label: 'Thông báo giải ngân', badgeClass: 'glass-badge-blue' },
  [VehicleStatus.SOLD]: { label: 'Đã bán', badgeClass: 'glass-badge-red' },
};

export const ADMIN_EMAILS = [
  "thuongpth24mba@uef.edu.vn",
  "hoaivu015@gmail.com",
  "admin@auto28.com"
];

export enum UserRole {
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Quản trị viên',
  [UserRole.ACCOUNTANT]: 'Kế toán',
  [UserRole.STAFF]: 'Nhân viên tư vấn',
  [UserRole.MANAGER]: 'Quản lý showroom',
};




export const STAFF_CONSTANTS = {
  BONUS_THRESHOLD_PERCENT: 100,
  BONUS_MULTIPLIER_FULL: 1.0,
  BONUS_MULTIPLIER_REDUCED: 0.7,
  DEFAULT_BUYING_COMMISSION: 0,
  DEFAULT_SALE_COMMISSION: 0,
};

export const INVENTORY_CONSTANTS = {
  AGING_THRESHOLD_DAYS: 25,
};

export const USER_TAB_LABELS: Record<string, string> = {
  dashboard: 'Báo cáo tổng quan',
  inventory: 'Kho xe',
  staff: 'Nhân sự',
  cashflow: 'Dòng tiền',
  personal: 'Trang cá nhân',
  users: 'Quản lý tài khoản',
  sandbox: 'Thử nghiệm',
  landingpage: 'Quản lý Landing Page',
};
