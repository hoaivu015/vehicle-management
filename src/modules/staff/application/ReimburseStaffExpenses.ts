import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { ExpenseRepository } from '../../finance/domain/ExpenseRepository';
import { StaffSalaryService } from '../domain/StaffSalaryService';
import { getTodayDateString } from '../../../shared/utils/date';

export class ReimburseStaffExpenses {
  constructor(
    private readonly repository: StaffRepository,
    private readonly expenseRepository?: ExpenseRepository
  ) {}

  async execute(staffId: string | number, expenseIds: string[]): Promise<Staff> {
    const staff = await this.repository.getById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const today = getTodayDateString();
    const newlyReimbursedExpenses = (staff.expenses || []).filter(
      exp => expenseIds.includes(exp.id) && !exp.is_reimbursed && !StaffSalaryService.isSalaryAdvance(exp)
    );

    const updatedExpenses = (staff.expenses || []).map(exp => {
      if (expenseIds.includes(exp.id)) {
        return { ...exp, is_reimbursed: true };
      }
      return exp;
    });

    const updated = await this.repository.update(staffId, {
      expenses: updatedExpenses
    });

    // Tạo phiếu chi thực tế vào Sổ quỹ (operating_expenses) cho các khoản chi hộ được hoàn ứng
    if (this.expenseRepository && newlyReimbursedExpenses.length > 0) {
      await Promise.all(
        newlyReimbursedExpenses.map(exp => {
          const expenseName = `Hoàn ứng: ${exp.note || 'Chi phí'} (${staff.name} - ${staff.code})`;
          const category = exp.type === 'vehicle' ? 'Chi phí xe' : (exp.category || 'Vận hành');
          return this.expenseRepository!.add({
            name: expenseName,
            amount: exp.amount,
            category,
            date: today,
            created_at: new Date().toISOString()
          });
        })
      );
    }

    return updated;
  }
}

