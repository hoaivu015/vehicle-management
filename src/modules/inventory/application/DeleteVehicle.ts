import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleStorageRepository } from '../domain/VehicleStorageRepository';
import { StaffRepository } from '../../staff/domain/StaffRepository';

export class DeleteVehicle {
  constructor(
    private readonly repository: VehicleRepository,
    private readonly storageRepository: VehicleStorageRepository,
    private readonly staffRepository?: StaffRepository
  ) {}

  async execute(id: number): Promise<void> {
    // 1. Kiểm tra tồn tại và lấy URL ảnh
    const car = await this.repository.getById(id.toString());
    if (!car) throw new Error('Không tìm thấy xe để xóa');

    if (car.status === 'SOLD') {
      throw new Error('Không thể xóa xe đã bán. Vui lòng hủy trạng thái Đã bán trước khi thực hiện xóa xe.');
    }

    const paidPurchaseAmount = (car.purchase_payment_history || []).reduce((sum, p) => sum + (p.amount || 0), 0) || car.purchase_paid_amount || 0;
    if (paidPurchaseAmount > 0) {
      throw new Error('Không thể xóa xe đã phát sinh thanh toán tiền mua. Vui lòng đối soát và hoàn tiền mua xe trước khi xóa.');
    }

    // 2. Dọn dẹp chi phí tạm ứng mồ côi của nhân viên gắn với xe này
    if (this.staffRepository && car.cost_history && car.cost_history.length > 0) {
      for (const cost of car.cost_history) {
        if (cost.staff_id && cost.staff_expense_id) {
          try {
            const staff = await this.staffRepository.getById(cost.staff_id);
            if (staff && staff.expenses) {
              const updatedExpenses = staff.expenses.filter(e => e.id !== cost.staff_expense_id);
              await this.staffRepository.update(cost.staff_id, { expenses: updatedExpenses });
            }
          } catch (e) {
            console.error('Failed to unlink staff expense during car deletion:', e);
          }
        }
      }
    }

    // 3. Xóa ảnh nếu có
    if (car.image_url) {
      try {
        await this.storageRepository.deleteImage(car.image_url);
      } catch (e) {
        console.error('Failed to delete associated image:', e);
        // We continue deleting the record even if image deletion fails
      }
    }
    
    // 4. Thực hiện xóa thông qua Repository
    await this.repository.delete(id.toString());
  }
}
