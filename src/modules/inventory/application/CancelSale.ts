import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleRepository } from '../domain/VehicleRepository';
import { ExpenseRepository } from '../../finance/domain/ExpenseRepository';
import { StaffRepository } from '../../staff/domain/StaffRepository';
import { VehicleHistoryEntry } from '../../../shared/domain/types';
import { getTodayDateString } from '../../../shared/utils/date';

export interface CancelSaleRequest {
  vehicleId: number;
  userCode: string;
  cancelType?: 'REFUND' | 'FORFEIT';
}

export class CancelSale {
  constructor(
    private readonly repository: VehicleRepository,
    private readonly expenseRepository?: ExpenseRepository,
    private readonly staffRepository?: StaffRepository
  ) {}

  async execute(request: CancelSaleRequest): Promise<void> {
    const car = await this.repository.getById(request.vehicleId.toString());
    if (!car) throw new Error('Không tìm thấy xe');

    // Revert partner profit sharing if it was shared
    if (car.partner_profit_shared) {
      const profitNote = `Chia LN đối tác: ${car.name} (${car.code})`;
      if (this.expenseRepository) {
        await this.expenseRepository.deleteByNameAndCategory(profitNote, 'Đối tác');
      }
      if (this.staffRepository && car.coinvestor_code) {
        const staff = await this.staffRepository.getByCode(car.coinvestor_code);
        if (staff) {
          const updatedExpenses = (staff.expenses || []).filter(e => e.note !== profitNote);
          await this.staffRepository.update(staff.id, { expenses: updatedExpenses });
        }
      }
    }

    const today = getTodayDateString();
    const isForfeit = request.cancelType === 'FORFEIT';
    const totalCollected = (car.sale_payment_history || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    // Nếu là tịch thu cọc (Khách bỏ cọc), hạch toán vào Thu nhập khác của showroom
    if (isForfeit && totalCollected > 0 && this.expenseRepository) {
      await this.expenseRepository.add({
        name: `[Thu] Tịch thu cọc xe ${car.name} (${car.code})`,
        amount: totalCollected,
        category: 'Thu nhập khác',
        date: today,
        created_at: new Date().toISOString()
      });
    }

    const historyEntry: VehicleHistoryEntry = {
      date: today,
      status: VehicleStatus.IN_STOCK,
      user: request.userCode,
      note: isForfeit
        ? `Hủy giao dịch (Tịch thu cọc: ${totalCollected.toLocaleString('vi-VN')}đ) - Quay về kho`
        : 'Hủy giao dịch đặt cọc (Hoàn cọc) - Quay về trạng thái Trong kho'
    };

    if (request.cancelType) {
      await this.repository.cancelSale(request.vehicleId, historyEntry, request.cancelType);
    } else {
      await this.repository.cancelSale(request.vehicleId, historyEntry);
    }
    if (car.partner_profit_shared) {
      await this.repository.update(request.vehicleId.toString(), { partner_profit_shared: false });
    }
  }
}
