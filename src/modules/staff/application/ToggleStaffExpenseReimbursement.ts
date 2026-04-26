import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';

export class ToggleStaffExpenseReimbursement {
  constructor(private readonly repository: StaffRepository) {}

  async execute(staffId: string, expenseId: string): Promise<Staff> {
    const staff = await this.repository.getById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const updatedExpenses = (staff.expenses || []).map(exp => {
      if (exp.id === expenseId) {
        return { ...exp, is_reimbursed: !exp.is_reimbursed };
      }
      return exp;
    });

    return await this.repository.update(staffId, {
      expenses: updatedExpenses
    });
  }
}
