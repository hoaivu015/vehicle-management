import { PermissionRepository } from '../domain/PermissionRepository';
import { PermissionService, RolePermission } from '../domain/PermissionService';

export class GetPermissions {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(): Promise<RolePermission[]> {
    const permissions = await this.permissionRepository.getAllPermissions();
    // Đồng bộ vào cache PermissionService SSoT
    PermissionService.setDynamicPermissions(permissions);
    return permissions;
  }
}
