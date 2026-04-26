import { Staff, StaffExpense } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { ExpenseRepository } from '../../finance/infrastructure/ExpenseRepository';

export interface AddStaffExpenseRequest {
  staffId: string;
  amount: number;
  note: string;
  date: string;
  type: 'vehicle' | 'operating';
  vehicleId?: number;
  category?: string;
}

export class AddStaffExpense {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly expenseRepository: ExpenseRepository
  ) {}

  async execute(request: AddStaffExpenseRequest): Promise<Staff> {
    const staff = await this.staffRepository.getById(request.staffId);
    if (!staff) throw new Error('Staff member not found');

    if (request.amount <= 0) throw new Error('Số tiền chi phí phải lớn hơn 0');

    const newExpense: StaffExpense = {
      id: crypto.randomUUID(),
      amount: request.amount,
      note: request.note,
      date: request.date,
      type: request.type,
      vehicle_id: request.vehicleId,
      category: request.category,
      is_reimbursed: false
    };

    // 1. Sync with Vehicle if type is vehicle
    if (request.type === 'vehicle' && request.vehicleId) {
      const vehicle = await this.vehicleRepository.getById(request.vehicleId.toString());
      if (vehicle) {
        newExpense.vehicle_code = vehicle.code; // Store code for easier display
        const updatedCostHistory = [
          ...(vehicle.cost_history || []),
          {
            amount: request.amount,
            note: `[NV ${staff.name} ứng] ${request.note}`,
            date: request.date,
            staff_expense_id: newExpense.id,
            staff_id: staff.id
          }
        ];
        await this.vehicleRepository.update(request.vehicleId.toString(), {
          cost_history: updatedCostHistory
        });
      }
    }

    // 2. Sync with Operating Expenses if type is operating
    if (request.type === 'operating') {
      await this.expenseRepository.add({
        name: `[NV ${staff.name} ứng] ${request.note}`,
        amount: request.amount,
        category: request.category || 'Vận hành',
        date: request.date
      });
    }

    // 3. Update Staff record
    const updatedExpenses = [...(staff.expenses || []), newExpense];
    return await this.staffRepository.update(request.staffId, {
      expenses: updatedExpenses
    });
  }
}
