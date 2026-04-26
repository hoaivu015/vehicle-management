import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';

export class ReimburseStaffExpenses {
  constructor(private readonly repository: StaffRepository) {}

  async execute(staffId: string, expenseIds: string[]): Promise<Staff> {
    const staff = await this.repository.getById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const updatedExpenses = (staff.expenses || []).map(exp => {
      if (expenseIds.includes(exp.id)) {
        return { ...exp, is_reimbursed: true };
      }
      return exp;
    });

    return await this.repository.update(staffId, {
      expenses: updatedExpenses
    });
  }
}
