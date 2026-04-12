/**
 * Mock Data for AUTO 28
 */

export const MOCK_CARS = [
  { 
    id: 1, 
    code: 'AS-001',
    name: 'Toyota Camry 2.5Q', 
    year: 2021, 
    odo: 15000, 
    purchase_price: 950000000,
    sale_price: 1050000000, 
    total_cost: 20000000,
    received_amount: 0,
    receivable_payable: 0,
    profit: 80000000,
    status: 'IN_STOCK', 
    days: 12, 
    color: 'Trắng',
    purchase_date: '2026-02-16',
    sale_date: null,
    buyer: 'NV-NVA',
    seller: null,
    payment_history: [],
    cost_history: [
      { date: '2026-02-17', amount: 5000000, note: 'Dọn nội thất' },
      { date: '2026-02-18', amount: 15000000, note: 'Sơn dặm' }
    ],
    history: [
      { date: '2026-02-16', status: 'IN_STOCK', user: 'NV-NVA', note: 'Nhập kho mới' }
    ]
  },
  { 
    id: 2, 
    code: 'AS-002',
    name: 'Mazda CX-5 2.0 Premium', 
    year: 2022, 
    odo: 8000, 
    purchase_price: 750000000,
    sale_price: 820000000, 
    total_cost: 15000000,
    received_amount: 50000000,
    receivable_payable: 770000000,
    profit: 55000000,
    status: 'DEPOSIT', 
    days: 5, 
    color: 'Đỏ',
    purchase_date: '2026-02-23',
    sale_date: null,
    buyer: 'NV-TTB',
    seller: 'NV-NVA',
    payment_history: [
      { date: '2026-02-25', amount: 50000000, type: 'Cọc' }
    ],
    cost_history: [
      { date: '2026-02-24', amount: 15000000, note: 'Thay dầu, bảo dưỡng' }
    ],
    history: [
      { date: '2026-02-23', status: 'IN_STOCK', user: 'NV-TTB', note: 'Nhập kho mới' },
      { date: '2026-02-25', status: 'DEPOSIT', user: 'NV-NVA', note: 'Khách cọc 50tr' }
    ]
  },
  { 
    id: 3, 
    code: 'AS-003',
    name: 'Hyundai SantaFe 2.2 Dầu', 
    year: 2020, 
    odo: 45000, 
    purchase_price: 880000000,
    sale_price: 980000000, 
    total_cost: 30000000,
    receivable_payable: 0,
    profit: 70000000,
    status: 'IN_STOCK', 
    days: 28, 
    color: 'Đen',
    purchase_date: '2026-01-31',
    sale_date: null,
    buyer: 'NV-LVC',
    seller: null,
    history: [
      { date: '2026-01-31', status: 'IN_STOCK', user: 'NV-LVC', note: 'Nhập kho mới' }
    ]
  },
  { 
    id: 4, 
    code: 'AS-004',
    name: 'Honda CR-V L', 
    year: 2023, 
    odo: 2000, 
    purchase_price: 1020000000,
    sale_price: 1100000000, 
    total_cost: 10000000,
    receivable_payable: 900000000,
    profit: 70000000,
    status: 'BANK_DEPOSIT', 
    days: 3, 
    color: 'Xanh',
    purchase_date: '2026-02-25',
    sale_date: null,
    buyer: 'NV-NVA',
    seller: 'NV-TTB',
    history: [
      { date: '2026-02-25', status: 'IN_STOCK', user: 'NV-NVA', note: 'Nhập kho mới' },
      { date: '2026-02-26', status: 'BANK_DEPOSIT', user: 'NV-TTB', note: 'Khách cọc Bank' }
    ]
  },
  { 
    id: 5, 
    code: 'AS-005',
    name: 'Ford Ranger Wildtrak', 
    year: 2019, 
    odo: 60000, 
    purchase_price: 580000000,
    sale_price: 650000000, 
    total_cost: 25000000,
    received_amount: 0,
    receivable_payable: 0,
    profit: 45000000,
    status: 'SOLD', 
    days: 45, 
    color: 'Cam',
    purchase_date: '2026-01-14',
    sale_date: '2026-02-20',
    buyer: 'NV-TTB',
    seller: 'NV-LVC',
    commission: 5000000,
    history: [
      { date: '2026-01-14', status: 'IN_STOCK', user: 'NV-TTB', note: 'Nhập kho mới' },
      { date: '2026-02-15', status: 'DEPOSIT', user: 'NV-LVC', note: 'Khách cọc' },
      { date: '2026-02-20', status: 'SOLD', user: 'NV-LVC', note: 'Đã giao xe' }
    ]
  },
];

export const MOCK_STAFF = [
  { 
    id: 0, 
    code: 'ADMIN',
    name: 'Quản trị viên', 
    role: 'Admin', 
    department: 'Hành chính',
    email: 'admin@autostock.vn',
    phone: '0000000000',
    password: 'admin',
    status: 'ACTIVE',
    target: 0, 
    actual: 0, 
    revenue: 0, 
    target_revenue: 0, 
    target_profit: 0, 
    actual_profit: 0,
    base_salary: 0,
    commission_per_car: 0
  },
  { 
    id: 1, 
    code: 'NV-NVA',
    name: 'Nguyễn Văn A', 
    role: 'Trưởng nhóm Sales', 
    department: 'Kinh doanh 1',
    email: 'vana@autostock.vn',
    phone: '0901234567',
    password: 'password123',
    status: 'ACTIVE',
    target: 5, 
    actual: 3, 
    revenue: 2500000000, 
    target_revenue: 4000000000, 
    target_profit: 300000000, 
    actual_profit: 240000000,
    base_salary: 15000000,
    commission_per_car: 2000000
  },
  { 
    id: 2, 
    code: 'NV-TTB',
    name: 'Trần Thị B', 
    role: 'Nhân viên Sales', 
    department: 'Kinh doanh 1',
    email: 'thib@autostock.vn',
    phone: '0902345678',
    password: 'password123',
    status: 'ACTIVE',
    target: 4, 
    actual: 4, 
    revenue: 3200000000, 
    target_revenue: 3000000000, 
    target_profit: 250000000, 
    actual_profit: 280000000,
    base_salary: 10000000,
    commission_per_car: 1500000
  },
  { 
    id: 3, 
    code: 'NV-LVC',
    name: 'Lê Văn C', 
    role: 'Nhân viên Sales', 
    department: 'Kinh doanh 2',
    email: 'vanc@autostock.vn',
    phone: '0903456789',
    password: 'password123',
    status: 'ACTIVE',
    target: 6, 
    actual: 2, 
    revenue: 1800000000, 
    target_revenue: 5000000000, 
    target_profit: 400000000, 
    actual_profit: 150000000,
    base_salary: 10000000,
    commission_per_car: 1500000
  },
];

export const DEPARTMENTS = ['Kinh doanh 1', 'Kinh doanh 2', 'Kế toán', 'Kho', 'Hành chính', 'Quản lý'];
export const ROLES_LIST = ['Trưởng nhóm sale', 'Nhân viên sale', 'Kế toán', 'Nhân viên Kho', 'Admin'];
