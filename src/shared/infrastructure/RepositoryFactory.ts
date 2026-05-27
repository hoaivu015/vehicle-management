import { z } from 'zod';
import { supabase } from './supabase';
import { Repository } from '../domain/Repository';

/**
 * RepositoryFactory
 * 
 * Provides a standardized way to create type-safe and validated repositories.
 * All data entering and leaving the infrastructure is validated against a Zod schema.
 */
export const createValidatedRepository = <Domain, DTO = Domain>(
  tableName: string,
  schema: z.ZodType<DTO>,
  mapper?: {
    toDomain: (dto: DTO) => Domain;
    toDTO: (domain: Partial<Domain>) => Partial<DTO>;
  }
): Repository<Domain> => {
  
  const sanitize = (data: unknown): Domain => {
    try {
      const dto = schema.parse(data);
      return mapper ? mapper.toDomain(dto) : (dto as unknown as Domain);
    } catch (error) {
      console.error(`[RepositoryFactory] Validation error in table "${tableName}":`, error);
      throw error;
    }
  };

  return {
    async getAll(): Promise<Domain[]> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('id', { ascending: false });
        
      if (error) throw error;
      return (data || []).map(sanitize);
    },

    async getById(id: string | number): Promise<Domain | null> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) throw error;
      return data ? sanitize(data) : null;
    },

    async create(item: Partial<Domain>): Promise<Domain> {
      const dtoInput = mapper ? mapper.toDTO(item) : (item as unknown as Partial<DTO>);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(dtoInput as never)
        .select()
        .single();
        
      if (error) throw error;
      return sanitize(data);
    },

    async update(id: string | number, item: Partial<Domain>): Promise<Domain> {
      const dtoInput = mapper ? mapper.toDTO(item) : (item as unknown as Partial<DTO>);

      const { data, error } = await supabase
        .from(tableName)
        .update(dtoInput as never)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return sanitize(data);
    },

    async delete(id: string | number): Promise<void> {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    }
  };
};
