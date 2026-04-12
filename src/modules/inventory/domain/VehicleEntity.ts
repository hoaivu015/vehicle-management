import { Vehicle, CostItem } from '../../../shared/domain/types';
import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleStateMachine } from './VehicleStateMachine';

export class VehicleEntity {
  constructor(private readonly data: Vehicle) {}

  get id(): number { return this.data.id; }
  get code(): string { return this.data.code; }
  get status(): VehicleStatus { return this.data.status as VehicleStatus; }
  get purchaseDate(): string { return this.data.purchase_date; }
  get saleDate(): string | undefined { return this.data.sale_date; }

  /**
   * Tính toán số ngày lưu kho.
   */
  get agingDays(): number {
    const start = new Date(this.purchaseDate);
    const end = this.saleDate ? new Date(this.saleDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Tính toán tổng chi phí (Bao gồm phí nhập và các chi phí phát sinh).
   */
  get totalCost(): number {
    const costs = this.data.cost_history || [];
    return costs.reduce((sum, item) => sum + item.amount, 0);
  }

  /**
   * Tính toán lợi nhuận dự kiến hoặc thực tế.
   */
  get profit(): number {
    const salePrice = this.data.sale_price || 0;
    const purchasePrice = this.data.purchase_price || 0;
    return salePrice - purchasePrice - this.totalCost;
  }

  /**
   * Thay đổi trạng thái xe một cách an toàn.
   */
  transitionTo(nextStatus: VehicleStatus): Vehicle {
    if (!VehicleStateMachine.canTransition(this.status, nextStatus)) {
      throw new Error(`Không thể chuyển từ ${this.status} sang ${nextStatus}`);
    }

    return {
      ...this.data,
      status: nextStatus
    };
  }

  /**
   * Trả về dữ liệu thuần túy để lưu trữ hoặc hiển thị.
   */
  toRaw(): Vehicle {
    return {
      ...this.data,
      profit: this.profit,
      total_cost: this.totalCost,
      days: this.agingDays
    };
  }
}
