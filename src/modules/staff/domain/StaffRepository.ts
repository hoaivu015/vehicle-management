import { Staff, Account } from '../../../shared/domain/types';
import { Repository } from '../../../shared/domain/Repository';

export interface StaffRepository extends Repository<Staff> {
  getByCode(code: string): Promise<Staff | null>;
  getByEmail(email: string): Promise<Staff | null>;
  getAll(): Promise<Staff[]>;
  getCodesByDepartment(department: string): Promise<string[]>;
  getAccounts(): Promise<Account[]>;
  updateAccountPassword(email: string, password: string): Promise<void>;
  deleteAccountByCode(staffCode: string): Promise<void>;
  addSalaryPayout(payout: { employee_id: number; month: string; amount: number; target_expense_ids?: string[]; note?: string }): Promise<void>;
  deleteSalaryPayout(employee_id: number, month: string): Promise<void>;
  registerUser(user: { name: string; email: string; password?: string; role: string; linkedfrom: string }): Promise<void>;
}
