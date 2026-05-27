import { Database } from '@/src/shared/domain/database.types';

type DBUser = Database['public']['Tables']['users']['Row'];

/**
 * UserProfile represents the domain model for a user, 
 * strictly synced with the database 'users' table.
 */
export interface UserProfile extends DBUser {
  docId?: string; // Legacy ID if needed
}

export interface UserRepository {
  getAll(): Promise<UserProfile[]>;
  add(user: Partial<UserProfile>): Promise<void>;
  update(id: string, user: Partial<UserProfile>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(callback: (users: UserProfile[]) => void): () => void;
}
