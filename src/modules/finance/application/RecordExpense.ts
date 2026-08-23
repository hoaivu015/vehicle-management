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
    // 1. Xử lý Dòng Tiền Vào (Inflow - Thu nhập khác, thu phạt cọc, thu hoa hồng...)
    if (dto.flowType === 'inflow') {
      const inflowCategory = dto.category === 'Vận hành' ? 'Thu nhập khác' : (dto.category || 'Thu nhập khác');
      const inflowName = dto.name.startsWith('[Thu]') ? dto.name : `[Thu] ${dto.name}`;
      
      await this.expenseRepository.add({
        name: inflowName,
        amount: dto.amount,
        category: inflowCategory,
        date: dto.date,
        created_at: new Date().toISOString()
      });
      return;
    }

    // 2. Dòng Tiền Ra (Outflow) - Xử lý tạm ứng lương hoặc nhân viên ứng tiền chi hộ
    let staffExpenseId: string | undefined;
    if (dto.staffId) {
      staffExpenseId = generateUUID();
      const staff = await this.staffRepository.getById(dto.staffId);
      if (!staff) throw new Error('Không tìm thấy nhân viên');

      const isAdvance = dto.category === 'Tạm ứng lương' || 
        (dto.name || '').toLowerCase().includes('ứng lương') || 
        (dto.name || '').toLowerCase().startsWith('tạm ứng');

      const staffExpense: StaffExpense = {
        id: staffExpenseId,
        amount: dto.amount,
        note: dto.name,
        date: dto.date,
        type: dto.type,
        vehicleId: dto.vehicleId ? Number(dto.vehicleId) : undefined,
        vehicle_code: dto.type === 'vehicle' && dto.vehicleId ? 
          (await this.vehicleRepository.getById(dto.vehicleId.toString()))?.code : undefined,
        category: isAdvance ? 'Tạm ứng lương' : dto.category,
        is_reimbursed: false
      };

      const updatedExpenses = [...(staff.expenses || []), staffExpense];
      await this.staffRepository.update(dto.staffId, { expenses: updatedExpenses });

      // Nếu là Tạm ứng lương (Showroom xuất quỹ tiền mặt cho nhân viên ứng trước):
      // Ghi nhận ngay phiếu chi vào operating_expenses để trừ quỹ tiền mặt tại ngày tạm ứng
      if (isAdvance) {
        await this.expenseRepository.add({
          name: `Tạm ứng lương: ${dto.name} (${staff.name} - ${staff.code})`,
          amount: dto.amount,
          category: 'Tạm ứng lương',
          date: dto.date,
          created_at: new Date().toISOString()
        });
      }
    }

    // 3. Nếu chi cho Xe, cập nhật cost_history của xe
    if (dto.type === 'vehicle' && dto.vehicleId) {
      const vehicle = await this.vehicleRepository.getById(dto.vehicleId.toString());
      if (!vehicle) throw new Error('Không tìm thấy xe');

      const uniqueCostId = staffExpenseId || generateUUID();
      const updatedCostHistory = [
        ...(vehicle.cost_history || []),
        {
          amount: dto.amount,
          note: dto.staffId ? `[NV ứng] ${dto.name}` : dto.name,
          date: dto.date,
          staff_expense_id: uniqueCostId,
          staff_id: dto.staffId?.toString() || ''
        }
      ];

      await this.vehicleRepository.update(dto.vehicleId.toString(), {
        cost_history: updatedCostHistory
      });
    }

    // 4. Nếu là chi phí vận hành do Showroom trực tiếp chi tiền mặt (không phải NV ứng tiền túi), ghi nhận vào bảng operating_expenses
    if (dto.type === 'operating' && !dto.staffId) {
      await this.expenseRepository.add({
        name: dto.name,
        amount: dto.amount,
        category: dto.category || 'Vận hành',
        date: dto.date,
        created_at: new Date().toISOString()
      });
    }
  }
}
