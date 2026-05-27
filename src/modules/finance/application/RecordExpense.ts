import { StaffRepository } from '../../staff/domain/StaffRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { ExpenseRepository } from '../domain/ExpenseRepository';
import { UnifiedExpenseCommand } from '../../../shared/domain/schemas';
import { StaffExpense } from '../../../shared/domain/types';
import { generateUUID } from '../../../shared/utils/stringUtils';

/**
 * RecordExpense UseCase - Trạm điều phối tài chính trung tâm.
 * Phụ trách hạch toán chi phí và đồng bộ dữ liệu giữa các Module (Staff, Vehicle, Finance).
 * Tuân thủ Hợp đồng dữ liệu (Financial Protocol).
 */
export class RecordExpense {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly expenseRepository: ExpenseRepository
  ) {}

  async execute(dto: UnifiedExpenseCommand): Promise<void> {
    // 1. Dữ liệu đã được định kiểu chặt chẽ từ Presenter (Contract-First)

    // 2. Nếu là nhân viên ứng tiền, chuẩn bị bản ghi StaffExpense
    let staffExpenseId: string | undefined;
    if (dto.staffId) {
      staffExpenseId = generateUUID();
      const staff = await this.staffRepository.getById(dto.staffId);
      if (!staff) throw new Error('Không tìm thấy nhân viên');

      const staffExpense: StaffExpense = {
        id: staffExpenseId,
        amount: dto.amount,
        note: dto.name,
        date: dto.date,
        type: dto.type,
        vehicleId: dto.vehicleId ? Number(dto.vehicleId) : undefined,
        vehicle_code: dto.type === 'vehicle' && dto.vehicleId ? 
          (await this.vehicleRepository.getById(dto.vehicleId.toString()))?.code : undefined,
        category: dto.category,
        is_reimbursed: false
      };

      const updatedExpenses = [...(staff.expenses || []), staffExpense];
      await this.staffRepository.update(dto.staffId, { expenses: updatedExpenses });
    }

    // 3. Nếu chi cho Xe, cập nhật cost_history của xe
    if (dto.type === 'vehicle' && dto.vehicleId) {
      const vehicle = await this.vehicleRepository.getById(dto.vehicleId.toString());
      if (!vehicle) throw new Error('Không tìm thấy xe');

      const updatedCostHistory = [
        ...(vehicle.cost_history || []),
        {
          amount: dto.amount,
          note: dto.staffId ? `[NV ứng] ${dto.name}` : dto.name,
          date: dto.date,
          staff_expense_id: staffExpenseId || '',
          staff_id: dto.staffId?.toString() || ''
        }
      ];

      await this.vehicleRepository.update(dto.vehicleId.toString(), {
        cost_history: updatedCostHistory
      });
    }

    // 4. Nếu là chi phí vận hành Showroom, ghi vào bảng operating_expenses
    if (dto.type === 'operating') {
      await this.expenseRepository.add({
        name: dto.staffId ? `[NV ứng] ${dto.name}` : dto.name,
        amount: dto.amount,
        category: dto.category || 'Vận hành',
        date: dto.date,
        created_at: new Date().toISOString()
      });
    }
  }
}
