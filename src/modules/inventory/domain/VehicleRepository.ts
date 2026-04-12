import { Vehicle, PaymentItem, VehicleHistoryEntry } from '../../../shared/domain/types';
import { Repository } from '../../../shared/domain/Repository';
import { VehicleStatus } from '../../../shared/domain/constants';

export interface VehicleRepository extends Repository<Vehicle> {
  getByCode(code: string): Promise<Vehicle | null>;
  getAvailableVehicles(): Promise<Vehicle[]>;
  getSoldVehiclesByMonth(monthStr: string): Promise<Vehicle[]>;
  getAll(): Promise<Vehicle[]>;
  updateStatus(id: number, status: VehicleStatus, historyEntry: VehicleHistoryEntry, updates?: Partial<Vehicle>): Promise<void>;
  
  // New transaction methods
  addPurchasePayment(id: number, payment: PaymentItem): Promise<void>;
  addSalePayment(id: number, payment: PaymentItem, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number): Promise<void>;
  cancelSale(id: number, historyEntry: VehicleHistoryEntry): Promise<void>;
  
  // Filtering methods for personal/department views
  getVehiclesByStaff(staffCode: string): Promise<Vehicle[]>;
  getVehiclesByCodes(codes: string[]): Promise<Vehicle[]>;
  
  subscribe(callback: (vehicles: Vehicle[]) => void): () => void;
}
