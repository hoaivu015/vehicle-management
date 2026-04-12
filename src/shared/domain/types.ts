import { VehicleStatus, UserRole } from './constants';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  linkedStaffCode?: string;
}

export interface Staff {
  id: string;
  code: string;
  name: string;
  role: string;
  base_salary: number;
  target: number;
  commission_per_car: number;
  email?: string;
  status?: string;
  department?: string;
  tracked_cars?: string[];
}

export interface CostItem {
  amount: number;
  note: string;
  date: string;
}

export interface PaymentItem extends CostItem {
  receiver?: string;
}

export interface VehicleHistoryEntry {
  date: string;
  status: VehicleStatus;
  user: string;
  note?: string;
}

export interface Vehicle {
  id: number;
  code: string;
  name: string;
  year: number;
  status: VehicleStatus;
  purchase_price: number;
  purchase_date: string;
  buyer: string; // Staff code (mã NV nhập xe, e.g. NV01 — không dùng email)
  buyer_name?: string;
  
  sale_price?: number;
  sale_date?: string;
  seller?: string; // Staff code (mã NV bán xe, e.g. NV02 — không dùng email)
  seller_name?: string;
  commission?: number;
  buying_commission?: number;
  
  total_cost: number;
  cost_history: CostItem[];
  
  is_coinvested: boolean;
  coinvestor_code?: string;
  coinvest_amount: number;
  
  image_url?: string;
  images?: string[];
  notes?: string;
  
  // New fields for purchase lifecycle
  purchase_paid_amount?: number;
  purchase_payment_history?: PaymentItem[];
  
  // New fields for sale lifecycle
  received_amount?: number;
  sale_payment_history?: PaymentItem[];
  
  // History for status changes
  history?: VehicleHistoryEntry[];
  
  // Additional vehicle details
  odo?: number;
  color?: string;
  
  // Derived fields (Calculate in Domain Logic)
  profit?: number;
  days?: number;
  is_pinned?: boolean;
}

export interface OperatingExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
}
