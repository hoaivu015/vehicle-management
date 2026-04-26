import { supabase } from '@/src/shared/infrastructure/supabase';
import { Expense } from '../domain/FinanceService';
import { ExpenseRepository } from './ExpenseRepository';

export class SupabaseExpenseRepository implements ExpenseRepository {
  private readonly TABLE = 'operating_expenses';

  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async add(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabase
      .from(this.TABLE)
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string | number, expense: Partial<Expense>): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE)
      .update(expense)
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: string | number): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE)
      .delete()
      .eq('id', id);

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
    // 1. Fetch current settings to get the actual ID
    const { data: settings } = await supabase
      .from('company_settings')
      .select('id')
      .limit(1)
      .single();

    const settingsId = settings?.id || 1;

    // 2. Perform update
    const { error } = await supabase
      .from('company_settings')
      .update({ total_capital: amount })
      .eq('id', settingsId);

    if (error) throw error;
  }
}
