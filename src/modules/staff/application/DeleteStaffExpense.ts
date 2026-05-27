import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';

export class DeleteStaffExpense {
  constructor(
    private readonly repository: StaffRepository,
    private readonly vehicleRepository: VehicleRepository
  ) {}

  async execute(staffId: string | number, expenseId: string): Promise<Staff> {
    const staff = await this.repository.getById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const expenseToDelete = (staff.expenses || []).find(exp => exp.id === expenseId);
    
    // If it's a vehicle expense, sync with vehicle record
    if (expenseToDelete?.type === 'vehicle' && expenseToDelete.vehicleId) {
      const vehicle = await this.vehicleRepository.getById(expenseToDelete.vehicleId.toString());
      if (vehicle && vehicle.cost_history) {
        const updatedCostHistory = vehicle.cost_history.filter(cost => cost.staff_expense_id !== expenseId);
        await this.vehicleRepository.update(vehicle.id.toString(), {
          cost_history: updatedCostHistory
        });
      }
    }

    const updatedExpenses = (staff.expenses || []).filter(exp => exp.id !== expenseId);

    return await this.repository.update(staffId, {
      expenses: updatedExpenses
    });
  }
}
