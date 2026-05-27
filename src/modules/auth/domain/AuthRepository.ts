export interface AuthUser {
  id: string;
  email: string;
  emailConfirmedAt?: string;
}

export interface AuthRepository {
  getSessionUserEmail(): Promise<string | null>;
  onAuthStateChange(callback: (email: string | null) => void): () => void;
  signIn(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  signUp(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  signOut(): Promise<void>;
  updatePassword(password: string): Promise<void>;
}
