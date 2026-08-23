import { RolePermission } from './PermissionService';

export interface PermissionRepository {
  /**
   * Lấy danh sách phân quyền của toàn bộ hệ thống
   */
  getAllPermissions(): Promise<RolePermission[]>;

  /**
   * Cập nhật danh sách quyền cho vai trò cụ thể
   */
  upsertPermissions(permissions: Omit<RolePermission, 'id' | 'updated_at'>[]): Promise<void>;

  /**
   * Đăng ký lắng nghe cập nhật phân quyền theo thời gian thực
   */
  subscribe?(callback: (permissions: RolePermission[]) => void): () => void;
}
