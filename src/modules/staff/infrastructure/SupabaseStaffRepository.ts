import { supabase } from '../../../shared/infrastructure/supabase';
import { Staff, Account } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { createValidatedRepository } from '../../../shared/infrastructure/RepositoryFactory';
import { StaffSchema, StaffDTO } from '../domain/StaffSchema';

export class SupabaseStaffRepository implements StaffRepository {
  private readonly tableName = 'employees';
  private readonly baseRepo = createValidatedRepository<Staff, StaffDTO>(this.tableName, StaffSchema);

  private _sanitize(data: unknown): Staff {
    return StaffSchema.parse(data) as unknown as Staff;
  }

  async getAll(): Promise<Staff[]> {
    return this.baseRepo.getAll();
  }

  async getById(id: string | number): Promise<Staff | null> {
    return this.baseRepo.getById(id);
  }

  async create(item: Partial<Staff>): Promise<Staff> {
    return this.baseRepo.create(item);
  }

  async update(id: string | number, item: Partial<Staff>): Promise<Staff> {
    return this.baseRepo.update(id, item);
  }

  async delete(id: string | number): Promise<void> {
    await this.baseRepo.delete(id);
  }

  async getByCode(code: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('code', code)
      .maybeSingle();
    
    if (error) throw error;
    return data ? this._sanitize(data) : null;
  }

  async getByEmail(email: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error) throw error;
    return data ? this._sanitize(data) : null;
  }

  async getCodesByDepartment(department: string): Promise<string[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('code')
      .eq('department', department);
    
    if (error) throw error;
    return (data || []).map(d => d.code);
  }

  async getAccounts(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (data || []) as Account[];
  }

  async updateAccountPassword(email: string, password: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('update-password', {
        body: { email, newPassword: password }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Lỗi cập nhật mật khẩu: ${message}`);
    }
  }

  async deleteAccountByCode(staffCode: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('linkedfrom', staffCode);
    
    if (error) throw error;
  }

  async addSalaryPayout(payout: { employee_id: number; month: string; amount: number; target_expense_ids?: string[]; note?: string }): Promise<void> {
    const { error } = await supabase
      .from('salary_payouts')
      .insert([payout]);
    
    if (error) throw error;
  }

  async deleteSalaryPayout(employee_id: number, month: string): Promise<void> {
    const { error } = await supabase
      .from('salary_payouts')
      .delete()
      .eq('employee_id', employee_id)
      .eq('month', month);
    
    if (error) throw error;
  }

  async registerUser(user: { name: string; email: string; password?: string; role: string; linkedfrom: string }): Promise<void> {
    const { error } = await supabase
      .from('users')
      .insert([user]);
    
    if (error) throw error;
  }
}

