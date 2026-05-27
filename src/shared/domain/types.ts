import { VehicleStatus, UserRole } from './constants';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  linkedStaffCode?: string;
  linkedfrom?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Account extends User {
  // Account is used for authentication and user management
}

export interface Staff {
  id: number;
  code: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  status: string;
  department: string;
  base_salary: number;
  commission_per_car: number;
  target: number;
  expenses: StaffExpense[] | null;
  paid_months: string[] | null;
  password_hash?: string | null;
  auth_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StaffExpense {
  id: string;
  amount: number;
  note: string;
  date: string;
  type: 'vehicle' | 'operating';
  vehicleId?: number;
  vehicle_code?: string;
  category?: string;
  is_reimbursed: boolean;
}

export interface CostItem {
  amount: number;
  note: string;
  date: string;
  staff_id: string;
  staff_expense_id: string;
}

export interface PaymentItem extends CostItem {
  receiver: string;
}

export interface VehicleHistoryEntry {
  date: string;
  status: VehicleStatus;
  user: string;
  note: string;
}

export interface Vehicle {
  id: number;
  name: string;
  code: string;
  license_plate?: string;
  battery_type?: string;
  show_on_landing?: boolean;
  status: VehicleStatus;
  year: string;
  odo?: number;
  color?: string;
  image_url: string;
  images: string[] | null;
  purchase_price: number;
  purchase_date: string;
  sale_price: number;
  sale_date?: string;
  expected_profit?: number;
  profit?: number;
  total_cost?: number;
  days?: number;
  is_pinned: boolean;
  is_coinvested: boolean;
  coinvestor_code?: string;
  coinvest_amount?: number;
  
  cost_history: CostItem[] | null;
  purchase_paid_amount?: number;
  purchase_payment_history: PaymentItem[] | null;
  received_amount?: number;
  sale_payment_history: PaymentItem[] | null;
  history: VehicleHistoryEntry[] | null;
  notes?: string;
  
  buyer?: string;
  buyer_name?: string;
  customer_name?: string;
  seller?: string;
  seller_name?: string;
  commission?: number;
  buying_commission?: number;
  buying_bonus?: number;
  buying_bonus_paid?: boolean;

  partner_capital_repaid?: boolean;
  partner_profit_shared?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface OperatingExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
}

export interface SalaryDetails {
  base: number;
  salesCommission: number;
  buyingCommission: number;
  buyingBonus: number;
  coinvestProfitShare: number;
  kpiBonusMultiplier: number;
  totalCommission: number;
  totalSalary: number;
  soldCount: number;
  boughtCount: number;
  completionRate: number;
  soldCars: Vehicle[];
  boughtCars: Vehicle[];
  coinvestedCars: Vehicle[];
  totalReimbursements: number;
  carryOverAdvances: number;
  netSalary: number;
  isPaid: boolean;
  targetExpenseIds: string[];
  targetVehicleIds: number[];
}

export interface StaffWithSalary extends Staff {
  salaryDetails: SalaryDetails;
}
