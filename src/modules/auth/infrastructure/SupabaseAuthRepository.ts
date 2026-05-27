import { supabase } from '../../../shared/infrastructure/supabase';
import { AuthRepository, AuthUser } from '../domain/AuthRepository';

export class SupabaseAuthRepository implements AuthRepository {
  async getSessionUserEmail(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.email || null;
  }

  onAuthStateChange(callback: (email: string | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      callback(session?.user?.email || null);
    });
    return () => subscription.unsubscribe();
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, error: error.message };
    
    return {
      success: true,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        emailConfirmedAt: data.user.email_confirmed_at
      } : undefined
    };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }
}
