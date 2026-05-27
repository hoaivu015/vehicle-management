import { supabase } from '../../../shared/infrastructure/supabase';
import { RolePermission } from '../domain/PermissionService';
import { PermissionRepository } from '../domain/PermissionRepository';

export class SupabasePermissionRepository implements PermissionRepository {
  async getAllPermissions(): Promise<RolePermission[]> {
    const { data, error } = await supabase.from('role_permissions').select('*');
    if (error) throw error;
    return (data || []) as RolePermission[];
  }

  async upsertPermissions(permissions: Omit<RolePermission, 'id' | 'updated_at'>[]): Promise<void> {
    const { error } = await supabase.from('role_permissions').upsert(
      permissions,
      { onConflict: 'role,module' }
    );
    if (error) throw error;
  }
}
