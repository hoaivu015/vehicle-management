import { PermissionRepository } from '../domain/PermissionRepository';
import { PermissionService, RolePermission } from '../domain/PermissionService';

export class UpdatePermissions {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(role: string, permissions: RolePermission[]): Promise<RolePermission[]> {
    // 1. Lọc và chuẩn hóa dữ liệu phân quyền của role mục tiêu
    const rolePerms = permissions.filter(p => p.role === role);
    
    const cleanPerms = rolePerms.map((perm) => {
      const { id: _id, updated_at: _updated_at, ...cleanRest } = perm as RolePermission & { id?: string; updated_at?: string };
      return cleanRest;
    });

    // 2. Cập nhật vào DB qua Repository
    await this.permissionRepository.upsertPermissions(cleanPerms);

    // 3. Tải lại danh sách đầy đủ mới nhất và cập nhật cache SSoT
    const updatedAll = await this.permissionRepository.getAllPermissions();
    PermissionService.setDynamicPermissions(updatedAll);
    return updatedAll;
  }
}
