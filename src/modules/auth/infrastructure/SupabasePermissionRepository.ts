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

  subscribe(callback: (permissions: RolePermission[]) => void): () => void {
    const channel = supabase
      .channel(`permissions_realtime_${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'role_permissions' },
        async () => {
          try {
            const perms = await this.getAllPermissions();
            callback(perms);
          } catch (err) {
            console.error('Error fetching permissions in realtime sync:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
