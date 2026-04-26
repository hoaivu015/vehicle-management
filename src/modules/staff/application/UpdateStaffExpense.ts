import { Staff, StaffExpense } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';

export class UpdateStaffExpense {
  constructor(
    private readonly repository: StaffRepository,
    private readonly vehicleRepository: VehicleRepository
  ) {}

  async execute(staffId: string, expenseId: string, data: any): Promise<Staff> {
    const staff = await this.repository.getById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const updateData = { ...data };
    if (updateData.vehicleId) {
      updateData.vehicle_id = updateData.vehicleId;
      delete updateData.vehicleId;
    }

    const existingExpense = (staff.expenses || []).find(exp => exp.id === expenseId);
    
    // 1. If vehicle changed or type switched to operating, remove from old vehicle
    if (existingExpense?.type === 'vehicle' && existingExpense.vehicle_id && 
       (updateData.type === 'operating' || (updateData.vehicle_id && updateData.vehicle_id !== existingExpense.vehicle_id))) {
      const oldVehicle = await this.vehicleRepository.getById(existingExpense.vehicle_id.toString());
      if (oldVehicle && oldVehicle.cost_history) {
        const updatedOldHistory = oldVehicle.cost_history.filter(cost => cost.staff_expense_id !== expenseId);
        await this.vehicleRepository.update(oldVehicle.id.toString(), { cost_history: updatedOldHistory });
      }
    }

    // 2. Sync with new/current vehicle if applicable
    const finalVehicleId = updateData.vehicle_id || existingExpense?.vehicle_id;
    if (updateData.type !== 'operating' && (updateData.type === 'vehicle' || existingExpense?.type === 'vehicle') && finalVehicleId) {
      const vehicle = await this.vehicleRepository.getById(finalVehicleId.toString());
      if (vehicle) {
        const costEntry = {
          amount: updateData.amount !== undefined ? updateData.amount : existingExpense?.amount,
          note: `[NV ${staff.name} ứng] ${updateData.note || existingExpense?.note}`,
          date: updateData.date || existingExpense?.date,
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
      updateData.vehicle_id = null;
      updateData.vehicle_code = null;
    }

    const updatedExpenses = (staff.expenses || []).map(exp => {
      if (exp.id === expenseId) {
        return { ...exp, ...updateData };
      }
      return exp;
    });

    return await this.repository.update(staffId, {
      expenses: updatedExpenses
    });
  }
}
