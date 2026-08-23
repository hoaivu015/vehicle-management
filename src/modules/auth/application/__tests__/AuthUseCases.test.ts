import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPermissions } from '../GetPermissions';
import { UpdatePermissions } from '../UpdatePermissions';
import { PermissionRepository } from '../../domain/PermissionRepository';
import { RolePermission } from '../../domain/PermissionService';

describe('Auth Application Use Cases Suite', () => {
  let mockPermissionRepo: Partial<PermissionRepository>;

  const mockRolePerms: RolePermission[] = [
    { role: 'staff', module: 'inventory', can_access: true, can_view: true, can_edit: false, can_delete: false }
  ];

  beforeEach(() => {
    mockPermissionRepo = {
      getAllPermissions: vi.fn().mockResolvedValue(mockRolePerms),
      upsertPermissions: vi.fn().mockResolvedValue(undefined)
    };
  });

  describe('GetPermissions & UpdatePermissions', () => {
    it('GetPermissions lấy ma trận phân quyền và đồng bộ SSoT', async () => {
      const useCase = new GetPermissions(mockPermissionRepo as PermissionRepository);
      const perms = await useCase.execute();

      expect(perms).toHaveLength(1);
      expect(mockPermissionRepo.getAllPermissions).toHaveBeenCalledOnce();
    });

    it('UpdatePermissions cập nhật quyền và trả về danh sách mới nhất', async () => {
      const useCase = new UpdatePermissions(mockPermissionRepo as PermissionRepository);
      const updated = await useCase.execute('staff', [
        { role: 'staff', module: 'finance', can_access: false, can_view: false, can_edit: false, can_delete: false }
      ]);

      expect(mockPermissionRepo.upsertPermissions).toHaveBeenCalled();
      expect(mockPermissionRepo.getAllPermissions).toHaveBeenCalled();
      expect(updated).toHaveLength(1);
    });
  });
});
