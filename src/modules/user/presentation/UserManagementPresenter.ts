import { BasePresenter, BaseView } from '@/src/shared/presentation/BasePresenter';
import { UserProfile } from '../domain/UserRepository';
import { GetUserList } from '../application/GetUserList';
import { CreateUser } from '../application/CreateUser';
import { UpdateUserRole } from '../application/UpdateUserRole';
import { DeleteUser } from '../application/DeleteUser';

export interface UserManagementView extends BaseView {
  updateUsers(users: UserProfile[]): void;
  setLoading(loading: boolean): void;
  showError(message: string): void;
}

export class UserManagementPresenter extends BasePresenter<UserManagementView> {
  private unsubscribe?: () => void;

  constructor(
    private readonly getUserListUseCase: GetUserList,
    private readonly createUserUseCase: CreateUser,
    private readonly updateUserRoleUseCase: UpdateUserRole,
    private readonly deleteUserUseCase: DeleteUser
  ) {
    super();
  }

  attach(view: UserManagementView) {
    this.attachView(view);
    this.loadUsers();
    this.unsubscribe = this.getUserListUseCase.subscribe(users => {
      this.view?.updateUsers(users);
    });
  }

  detach() {
    this.detachView();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  async loadUsers(): Promise<void> {
    if (!this.view) return;
    this.view.setLoading(true);
    try {
      const users = await this.getUserListUseCase.execute();
      this.view?.updateUsers(users);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tải danh sách người dùng';
      this.view?.showError(message);
    } finally {
      this.view?.setLoading(false);
    }
  }

  async addUser(input: Partial<UserProfile> & { password?: string }): Promise<void> {
    try {
      await this.createUserUseCase.execute({
        name: input.name || '',
        email: input.email || '',
        role: input.role || 'staff',
        password: input.password
      });
      await this.loadUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi thêm người dùng';
      this.view?.showError(message);
    }
  }

  async updateUser(id: string, input: Partial<UserProfile> & { password?: string }): Promise<void> {
    try {
      await this.updateUserRoleUseCase.execute({
        id,
        email: input.email,
        role: input.role,
        password: input.password,
        name: input.name
      });
      await this.loadUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật người dùng';
      this.view?.showError(message);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.deleteUserUseCase.execute(id);
      await this.loadUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xóa người dùng';
      this.view?.showError(message);
    }
  }
}
