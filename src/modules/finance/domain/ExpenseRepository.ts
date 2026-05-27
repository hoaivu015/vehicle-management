import { Database } from '../../../shared/domain/database.types';

type DBOperatingExpense = Database['public']['Tables']['operating_expenses']['Row'];

export interface Expense extends DBOperatingExpense {
  // Expense is a direct mapping of operating_expenses
}

export interface ExpenseRepository {
  getAll(): Promise<Expense[]>;
  add(expense: Omit<Expense, 'id'>): Promise<void>;
  update(id: string | number, expense: Partial<Expense>): Promise<void>;
  delete(id: string | number): Promise<void>;
  deleteByNameAndCategory(name: string, category: string): Promise<void>;
  getCompanySettings(): Promise<{ total_capital: number }>;
  updateCapital(amount: number): Promise<void>;
}
