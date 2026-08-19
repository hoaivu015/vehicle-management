import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleStateMachine } from './VehicleStateMachine';
import { 
  calculateVehicleFinancials, 
  VehicleFinancials,
  calculateAgingDays,
  calculateActiveSellingDays
} from '../../../shared/utils/vehicle_calculations';
import { VehicleDTO, VehicleSchema } from './VehicleSchema';
import { Vehicle } from '../../../shared/domain/types';

export class VehicleEntity {
  private readonly data: VehicleDTO;

  constructor(rawData: unknown) {
    // Parse dữ liệu ngay khi khởi tạo để đảm bảo tính toàn vẹn (Self-protecting)
    this.data = VehicleSchema.parse(rawData);
  }

  get id(): number { return this.data.id; }
  get code(): string { return this.data.code; }
  get status(): VehicleStatus { return this.data.status; }
  get purchaseDate(): string { return this.data.purchase_date; }
  get saleDate(): string | null | undefined { return this.data.sale_date; }
  get name(): string { return this.data.name; }
  get purchasePrice(): number { return this.data.purchase_price; }
  get salePrice(): number | null | undefined { return this.data.sale_price; }

  /**
   * 1. CHỈ SỐ TÀI CHÍNH: Tổng ngày nắm giữ (Financial Holding Days)
   */
  get holdingDays(): number {
    return calculateAgingDays(this.purchaseDate, this.saleDate);
  }

  /**
   * 2. CHỈ SỐ VẬN HÀNH & KPI: Số ngày mở bán thực tế (Active Selling Days)
   */
  get activeDays(): number {
    return calculateActiveSellingDays(this.data);
  }

  /**
   * Số ngày lưu kho dùng cho vận hành (tương thích ngược)
   */
  get agingDays(): number {
    return this.activeDays;
  }

  /**
   * Tính toán toàn bộ thông tin tài chính của xe dựa trên quy tắc Domain.
   */
  get financials(): VehicleFinancials {
    return calculateVehicleFinancials(this.data);
  }

  transitionTo(nextStatus: VehicleStatus): VehicleDTO {
    if (!VehicleStateMachine.canTransition(this.status, nextStatus)) {
      throw new Error(`Không thể chuyển từ ${this.status} sang ${nextStatus}`);
    }
    return { ...this.data, status: nextStatus };
  }

  /**
   * Trả về dữ liệu thô kèm theo các trường đã được tính toán (Flattened DTO).
   */
  toRaw(): Vehicle {
    const fin = this.financials;
    return {
      ...this.data,
      profit: fin.netProfit,
      total_cost: fin.totalCost,
      days: this.activeDays,
      holding_days: this.holdingDays
    } as Vehicle;
  }

  /**
   * Truy xuất dữ liệu DTO nguyên bản
   */
  getData(): VehicleDTO {
    return this.data;
  }
}

