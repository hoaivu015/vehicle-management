import { VehicleStatus } from '../../../shared/domain/constants';

export class VehicleStateMachine {
  /**
   * Định nghĩa các bước chuyển trạng thái hợp lệ.
   */
  private static readonly VALID_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
    [VehicleStatus.DEPOSIT_BUY]: [VehicleStatus.SPA, VehicleStatus.IN_STOCK],
    [VehicleStatus.SPA]: [VehicleStatus.IN_STOCK],
    [VehicleStatus.IN_STOCK]: [VehicleStatus.DEPOSIT_SALE, VehicleStatus.BANK_DEPOSIT, VehicleStatus.SOLD],
    [VehicleStatus.DEPOSIT_SALE]: [VehicleStatus.DEPOSIT_SALE, VehicleStatus.BANK_DEPOSIT, VehicleStatus.SOLD, VehicleStatus.IN_STOCK],
    [VehicleStatus.BANK_DEPOSIT]: [VehicleStatus.BANK_DEPOSIT, VehicleStatus.BANK_CONFIRMED, VehicleStatus.SOLD, VehicleStatus.IN_STOCK],
    [VehicleStatus.BANK_CONFIRMED]: [VehicleStatus.BANK_CONFIRMED, VehicleStatus.SOLD, VehicleStatus.IN_STOCK],
    [VehicleStatus.SOLD]: [VehicleStatus.IN_STOCK], // Chỉ hoàn kho nếu hủy giao dịch
  };

  /**
   * Kiểm tra xem việc chuyển từ trạng thái hiện tại sang trạng thái mới có hợp lệ hay không.
   */
  static canTransition(current: VehicleStatus, next: VehicleStatus): boolean {
    if (current === next) return true;
    const allowed = this.VALID_TRANSITIONS[current];
    return allowed ? allowed.includes(next) : false;
  }

  /**
   * Lấy danh sách các trạng thái kế tiếp có thể chuyển tới.
   */
  static getValidNextStatuses(current: VehicleStatus): VehicleStatus[] {
    return this.VALID_TRANSITIONS[current] || [];
  }

  /**
   * Trả về danh sách các trường cần xóa (null/0) khi chuyển đến trạng thái mới.
   */
  static getFieldsToReset(next: VehicleStatus): Partial<Record<string, any>> {
    const saleFields = {
      sale_date: null,
      seller: null,
      buyer_name: null, 
      commission: null,
      received_amount: 0,
      sale_payment_history: []
    };

    // Khi về kho (IN_STOCK) hoặc các trạng thái trước đó, cần xóa trắng thông tin lượt bán cũ
    if ([VehicleStatus.IN_STOCK, VehicleStatus.SPA, VehicleStatus.DEPOSIT_BUY].includes(next)) {
      return saleFields;
    }

    return {};
  }
}
