import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { UpdateStaffExpenseSchema, UpdateStaffExpenseInput } from '../domain/StaffValidation';

export class UpdateStaffExpense {
  constructor(
    private readonly repository: StaffRepository,
    private readonly vehicleRepository: VehicleRepository
  ) { }

  async execute(staffId: string | number, expenseId: string, input: UpdateStaffExpenseInput): Promise<Staff> {
    // L6: Zod Boundary Validation
    const validatedData = UpdateStaffExpenseSchema.parse(input);

    const staff = await this.repository.getById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const updateData = { ...validatedData };
    if (updateData.vehicleId && typeof updateData.vehicleId === 'string') {
      updateData.vehicleId = Number(updateData.vehicleId);
    }

    const existingExpense = (staff.expenses || []).find(exp => exp.id === expenseId);

    // 1. If vehicle changed or type switched to operating, remove from old vehicle
    if (existingExpense?.type === 'vehicle' && existingExpense.vehicleId &&
      (updateData.type === 'operating' || (updateData.vehicleId && updateData.vehicleId !== existingExpense.vehicleId))) {
      const oldVehicle = await this.vehicleRepository.getById(existingExpense.vehicleId.toString());
      if (oldVehicle && oldVehicle.cost_history) {
        const updatedOldHistory = oldVehicle.cost_history.filter(cost => cost.staff_expense_id !== expenseId);
        await this.vehicleRepository.update(oldVehicle.id.toString(), { cost_history: updatedOldHistory });
      }
    }

    // 2. Sync with new/current vehicle if applicable
    const finalVehicleId = updateData.vehicleId || existingExpense?.vehicleId;
    if (updateData.type !== 'operating' && (updateData.type === 'vehicle' || existingExpense?.type === 'vehicle') && finalVehicleId) {
      const vehicle = await this.vehicleRepository.getById(finalVehicleId.toString());
      if (vehicle) {
        const costEntry = {
          amount: (updateData.amount !== undefined ? updateData.amount : existingExpense?.amount) || 0,
          note: `[NV ${staff.name} ứng] ${updateData.note || existingExpense?.note || ''}`,
          date: updateData.date || existingExpense?.date || new Date().toISOString().split('T')[0],
          staff_id: String(staffId),
          staff_expense_id: expenseId
        };

        let updatedHistory = [...(vehicle.cost_history || [])];
        const existingIdx = updatedHistory.findIndex(c => c.staff_expense_id === expenseId);

        if (existingIdx >= 0) {
          updatedHistory[existingIdx] = costEntry;
        } else {
          updatedHistory.push(costEntry);
        }

        await this.vehicleRepository.update(vehicle.id.toString(), { cost_history: updatedHistory });
        updateData.vehicle_code = vehicle.code;
      }
    } else if (updateData.type === 'operating') {
      updateData.vehicleId = undefined;
      updateData.vehicle_code = undefined;
    }

    const updatedExpenses = (staff.expenses || []).map(exp => {
      if (exp.id === expenseId) {
        return { ...exp, ...updateData };
      }
      return exp;
    }) as any; // Temporary cast for nested mapping, will be fixed with full DTO mapping later

    return await this.repository.update(staffId, {
      expenses: updatedExpenses
    });
  }
}
