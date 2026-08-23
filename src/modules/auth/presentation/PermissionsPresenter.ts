import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { RolePermission } from '../domain/PermissionService';
import { NotificationService } from '../../../shared/domain/NotificationService';
import { GetPermissions } from '../application/GetPermissions';
import { UpdatePermissions } from '../application/UpdatePermissions';

export interface PermissionsView extends BaseView {
  setPermissions(permissions: RolePermission[]): void;
  setSaving(saving: boolean): void;
}

export class PermissionsPresenter extends BasePresenter<PermissionsView> {
  constructor(
    private readonly getPermissionsUseCase: GetPermissions,
    private readonly updatePermissionsUseCase: UpdatePermissions,
    private readonly notification: NotificationService
  ) {
    super();
  }

  async loadPermissions(): Promise<void> {
    await this.perform(
      () => this.getPermissionsUseCase.execute(),
      (data) => {
        if (this.view) {
          this.view.setPermissions(data);
        }
      },
      'Không thể tải dữ liệu phân quyền'
    );
  }

  async savePermissions(role: string, perms: RolePermission[]): Promise<void> {
    if (!this.view) return;
    this.view.setSaving(true);
    try {
      await this.updatePermissionsUseCase.execute(role, perms);
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
