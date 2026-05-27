import { supabase } from './supabase';
import { Repository } from '../domain/Repository';

export abstract class SupabaseRepository<T extends { id: string | number }> implements Repository<T> {
  constructor(protected readonly tableName: string) {}

  async getAll(): Promise<T[]> {
    const { data, error } = await supabase.from(this.tableName).select('*');
    if (error) throw error;
    return data as T[];
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return data as T;
  }

  async create(item: T): Promise<T> {
    const { data, error } = await supabase.from(this.tableName).insert(item).select().single();
    if (error) throw error;
    return data as T;
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    const { data, error } = await supabase.from(this.tableName).update(item).eq('id', id).select().single();
    if (error) throw error;
    return data as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);
    if (error) throw error;
  }
}
