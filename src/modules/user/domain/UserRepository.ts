export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  code: string;
  phone?: string;
  join_date?: string;
  department?: string;
}

export interface UserRepository {
  getAll(): Promise<UserProfile[]>;
  add(user: Partial<UserProfile>): Promise<void>;
  update(id: string, user: Partial<UserProfile>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(callback: (users: UserProfile[]) => void): () => void;
}
