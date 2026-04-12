import { UserRepository, UserProfile } from '../domain/UserRepository';

export interface UserManagementView {
  updateUsers(users: UserProfile[]): void;
  setLoading(loading: boolean): void;
  showError(message: string): void;
}

export class UserManagementPresenter {
  private view?: UserManagementView;
  private unsubscribe?: () => void;

  constructor(private readonly userRepository: UserRepository) {}

  attach(view: UserManagementView) {
    this.view = view;
    this.loadUsers();
    this.unsubscribe = this.userRepository.subscribe(users => {
      this.view?.updateUsers(users);
    });
  }

  detach() {
    this.view = undefined;
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private async loadUsers() {
    this.view?.setLoading(true);
    try {
      const users = await this.userRepository.getAll();
      this.view?.updateUsers(users);
    } catch (err: any) {
      this.view?.showError(err.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      this.view?.setLoading(false);
    }
  }

  async addUser(user: Partial<UserProfile>) {
    try {
      await this.userRepository.add(user);
    } catch (err: any) {
      this.view?.showError(err.message || 'Lỗi khi thêm người dùng');
    }
  }

  async updateUser(id: string, user: Partial<UserProfile>) {
    try {
      await this.userRepository.update(id, user);
    } catch (err: any) {
      this.view?.showError(err.message || 'Lỗi khi cập nhật người dùng');
    }
  }

  async deleteUser(id: string) {
    try {
      await this.userRepository.delete(id);
    } catch (err: any) {
      this.view?.showError(err.message || 'Lỗi khi xóa người dùng');
    }
  }
}
