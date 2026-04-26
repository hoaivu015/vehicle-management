import { supabase } from '../../../shared/infrastructure/supabase';
import { SupabaseRepository } from '../../../shared/infrastructure/SupabaseRepository';
import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';

export class SupabaseStaffRepository extends SupabaseRepository<Staff> implements StaffRepository {
  constructor() {
    super('employees');
  }

  async getByCode(code: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('code', code)
      .maybeSingle();
    
    if (error) throw error;
    return data as Staff | null;
  }

  async getByEmail(email: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error) throw error;
    return data as Staff | null;
  }

  async getAll(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('code', { ascending: true });
    
    if (error) throw error;
    return data as Staff[];
  }

  async registerUser(userData: { 
    name: string; 
    email: string; 
    password?: string; 
    role: string; 
    linkedfrom: string 
  }): Promise<void> {
    const { error } = await supabase
      .from('users')
      .insert([userData]);
    
    if (error) throw error;
  }

  async getCodesByDepartment(department: string): Promise<string[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('code')
      .eq('department', department);
    
    if (error) throw error;
    return (data || []).map(d => d.code);
  }

  async getAccounts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async updateAccountPassword(email: string, password: string): Promise<void> {
    try {
      // 1. Cập nhật mật khẩu "thật" qua Edge Function (yêu cầu đã deploy function update-password)
      const { data, error } = await supabase.functions.invoke('update-password', {
        body: { email, newPassword: password }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err) {
      console.warn("Edge Function 'update-password' call failed. Falling back to DB-only update.", err);
    }

    // 2. LUÔN Cập nhật bảng users để đồng bộ hiển thị (ghi nhớ/hiển thị)
    const { error: dbError } = await supabase
      .from('users')
      .update({ password })
      .eq('email', email);
    
    if (dbError) throw dbError;
  }

  async deleteAccountByCode(staffCode: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('linkedfrom', staffCode);
    
    if (error) throw error;
  }
}

