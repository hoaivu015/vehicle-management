import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { PermissionRepository } from '../domain/PermissionRepository';
import { RolePermission } from '../domain/PermissionService';
import { NotificationService } from '../../../shared/domain/NotificationService';

export interface PermissionsView extends BaseView {
  setPermissions(permissions: RolePermission[]): void;
  setSaving(saving: boolean): void;
}

export class PermissionsPresenter extends BasePresenter<PermissionsView> {
  constructor(
    private readonly permissionRepo: PermissionRepository,
    private readonly notification: NotificationService
  ) {
    super();
  }

  async loadPermissions(): Promise<void> {
    await this.perform(
      () => this.permissionRepo.getAllPermissions(),
      (data) => {
        if (this.view) {
          this.view.setPermissions(data);
        }
        // Update PermissionService cache
        import('../domain/PermissionService').then(({ PermissionService }) => {
          PermissionService.setDynamicPermissions(data);
        });
      },
      'Không thể tải dữ liệu phân quyền'
    );
  }

  async savePermissions(role: string, perms: RolePermission[]): Promise<void> {
    if (!this.view) return;
    this.view.setSaving(true);
    try {
      // Filter out permissions for the target role to update
      const rolePerms = perms.filter(p => p.role === role);
      
      const cleanPerms = rolePerms.map(({ ...rest }: any) => {
        const { id, updated_at, ...cleanRest } = rest;
        return cleanRest;
      });

      await this.permissionRepo.upsertPermissions(cleanPerms);
      this.notification.success(`Đã cập nhật quyền thành công`);
      await this.loadPermissions();
    } catch (err: unknown) {
      console.error('[PermissionsPresenter Error]:', err);
      const message = err instanceof Error ? err.message : 'Lỗi khi lưu phân quyền';
      this.view.showError(message);
    } finally {
      this.view.setSaving(false);
    }
  }
}
