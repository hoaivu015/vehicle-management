import { Expense } from '../domain/FinanceService';

export interface ExpenseRepository {
  getAll(): Promise<Expense[]>;
  add(expense: Omit<Expense, 'id'>): Promise<Expense>;
  update(id: string | number, expense: Partial<Expense>): Promise<void>;
  delete(id: string | number): Promise<void>;
}
