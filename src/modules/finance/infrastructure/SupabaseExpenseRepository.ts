import { createValidatedRepository } from '@/src/shared/infrastructure/RepositoryFactory';
import { supabase } from '@/src/shared/infrastructure/supabase';
import { ExpenseSchema, ExpenseDTO } from '@/src/modules/finance/domain/ExpenseSchema';
import { Expense, ExpenseRepository } from '@/src/modules/finance/domain/ExpenseRepository';

export class SupabaseExpenseRepository implements ExpenseRepository {
  private readonly TABLE = 'operating_expenses';
  private readonly baseRepo = createValidatedRepository<Expense, ExpenseDTO>(this.TABLE, ExpenseSchema);

  async getAll(): Promise<Expense[]> {
    return this.baseRepo.getAll();
  }

  async add(expense: Omit<Expense, 'id'>): Promise<void> {
    await this.baseRepo.create(expense);
  }

  async update(id: string | number, expense: Partial<Expense>): Promise<void> {
    await this.baseRepo.update(id, expense);
  }

  async delete(id: string | number): Promise<void> {
    await this.baseRepo.delete(id);
  }

  async deleteByNameAndCategory(name: string, category: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE)
      .delete()
      .eq('name', name)
      .eq('category', category);

    if (error) throw error;
  }

  async getCompanySettings(): Promise<{ total_capital: number }> {
    const { data, error } = await supabase
      .from('company_settings')
      .select('total_capital')
      .limit(1)
      .single();

    if (error) throw error;
    return data || { total_capital: 0 };
  }

  async updateCapital(amount: number): Promise<void> {
    const { data: settings } = await supabase
      .from('company_settings')
      .select('id')
      .limit(1)
      .single();

    const settingsId = settings?.id || 1;

    const { error } = await supabase
      .from('company_settings')
      .update({ total_capital: amount })
      .eq('id', settingsId);

    if (error) throw error;
  }
}
