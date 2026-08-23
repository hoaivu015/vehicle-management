import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { ExpenseRepository } from '../../finance/domain/ExpenseRepository';
import { StaffSalaryService } from '../domain/StaffSalaryService';
import { getTodayDateString } from '../../../shared/utils/date';

export class ToggleStaffExpenseReimbursement {
  constructor(
    private readonly repository: StaffRepository,
    private readonly expenseRepository?: ExpenseRepository
  ) {}

  async execute(staffId: string | number, expenseId: string): Promise<Staff> {
    const staff = await this.repository.getById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const targetExpense = (staff.expenses || []).find(exp => exp.id === expenseId);
    const willBeReimbursed = targetExpense ? !targetExpense.is_reimbursed : false;
    const today = getTodayDateString();

    const updatedExpenses = (staff.expenses || []).map(exp => {
      if (exp.id === expenseId) {
        return { ...exp, is_reimbursed: !exp.is_reimbursed };
      }
      return exp;
    });

    const updated = await this.repository.update(staffId, {
      expenses: updatedExpenses
    });

    if (this.expenseRepository && targetExpense && !StaffSalaryService.isSalaryAdvance(targetExpense)) {
      const expenseName = `Hoàn ứng: ${targetExpense.note || 'Chi phí'} (${staff.name} - ${staff.code})`;
      const category = targetExpense.type === 'vehicle' ? 'Chi phí xe' : (targetExpense.category || 'Vận hành');

      if (willBeReimbursed) {
        await this.expenseRepository.add({
          name: expenseName,
          amount: targetExpense.amount,
          category,
          date: today,
          created_at: new Date().toISOString()
        });
      } else {
        await this.expenseRepository.deleteByNameAndCategory(expenseName, category);
      }
    }

    return updated;
  }
}

