import { supabase } from '@/src/shared/infrastructure/supabase';
import { UserProfile, UserRepository } from '../domain/UserRepository';

export class SupabaseUserRepository implements UserRepository {
  async getAll(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    return (data || []).map(u => ({ ...u, docId: u.id }));
  }

  async add(user: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase.from('employees').insert([user]);
    if (error) throw error;
  }

  async update(id: string, user: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase.from('employees').update(user).eq('id', id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  }

  subscribe(callback: (users: UserProfile[]) => void): () => void {
    const channel = supabase
      .channel('users_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        async () => {
          const users = await this.getAll();
          callback(users);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
