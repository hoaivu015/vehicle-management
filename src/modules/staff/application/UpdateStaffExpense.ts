import { Staff, StaffExpense } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { ExpenseRepository } from '../../finance/domain/ExpenseRepository';
import { StaffSalaryService } from '../domain/StaffSalaryService';
import { UpdateStaffExpenseSchema, UpdateStaffExpenseInput } from '../domain/StaffValidation';

export class UpdateStaffExpense {
  constructor(
    private readonly repository: StaffRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly expenseRepository?: ExpenseRepository
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

    // 0. Sync salary advance with operating_expenses
    if (existingExpense && StaffSalaryService.isSalaryAdvance(existingExpense) && this.expenseRepository) {
      const oldAdvanceName = `Tạm ứng lương: ${existingExpense.note} (${staff.name} - ${staff.code})`;
      await this.expenseRepository.deleteByNameAndCategory(oldAdvanceName, 'Tạm ứng lương');

      const isStillAdvance = updateData.category === 'Tạm ứng lương' || 
        updateData.type === 'advance' || 
        (updateData.note || '').toLowerCase().includes('tạm ứng') || 
        (updateData.note || '').toLowerCase().includes('ứng lương') ||
        existingExpense.category === 'Tạm ứng lương';

      if (isStillAdvance) {
        const newNote = updateData.note !== undefined ? updateData.note : existingExpense.note;
        const newAmount = updateData.amount !== undefined ? updateData.amount : existingExpense.amount;
        const newDate = updateData.date || existingExpense.date || new Date().toISOString().split('T')[0];
        
        await this.expenseRepository.add({
          name: `Tạm ứng lương: ${newNote} (${staff.name} - ${staff.code})`,
          amount: newAmount,
          category: 'Tạm ứng lương',
          date: newDate,
          created_at: new Date().toISOString()
        });
      }
    }

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

    const updatedExpenses: StaffExpense[] = (staff.expenses || []).map(exp => {
      if (exp.id === expenseId) {
        return { 
          ...exp, 
          ...updateData,
          vehicleId: updateData.vehicleId !== undefined ? (updateData.vehicleId ? Number(updateData.vehicleId) : undefined) : exp.vehicleId
        };
      }
      return exp;
    });

    return await this.repository.update(staffId, {
      expenses: updatedExpenses
    });
  }
}
