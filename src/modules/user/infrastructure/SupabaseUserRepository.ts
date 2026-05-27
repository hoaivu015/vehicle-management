import { createValidatedRepository } from '@/src/shared/infrastructure/RepositoryFactory';
import { supabase } from '@/src/shared/infrastructure/supabase';
import { UserProfile, UserRepository } from '../domain/UserRepository';
import { UserProfileSchema, UserProfileDTO } from '../domain/UserSchema';

export class SupabaseUserRepository implements UserRepository {
  private readonly TABLE = 'employees';
  private readonly baseRepo = createValidatedRepository<UserProfile, UserProfileDTO>(this.TABLE, UserProfileSchema);

  async getAll(): Promise<UserProfile[]> {
    const users = await this.baseRepo.getAll();
    return users.map(u => ({ ...u, docId: u.id }));
  }

  async add(user: Partial<UserProfile>): Promise<void> {
    await this.baseRepo.create(user);
  }

  async update(id: string, user: Partial<UserProfile>): Promise<void> {
    await this.baseRepo.update(id, user);
  }

  async delete(id: string): Promise<void> {
    await this.baseRepo.delete(id);
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
