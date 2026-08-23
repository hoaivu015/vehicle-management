import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserManagementPresenter, UserManagementView } from '../UserManagementPresenter';
import { GetUserList } from '../../application/GetUserList';
import { CreateUser } from '../../application/CreateUser';
import { UpdateUserRole } from '../../application/UpdateUserRole';
import { DeleteUser } from '../../application/DeleteUser';
import { UserProfile } from '../../domain/UserRepository';

describe('UserManagementPresenter', () => {
  let presenter: UserManagementPresenter;
  let mockGetUserList: Partial<GetUserList>;
  let mockCreateUser: Partial<CreateUser>;
  let mockUpdateUserRole: Partial<UpdateUserRole>;
  let mockDeleteUser: Partial<DeleteUser>;
  let mockView: Partial<UserManagementView>;

  const mockUsers: UserProfile[] = [
    { id: '1', name: 'User A', email: 'a@auto28.vn', role: 'admin', created_at: '2026-01-01', linkedfrom: null, password: null }
  ];

  beforeEach(() => {
    mockGetUserList = {
      execute: vi.fn().mockResolvedValue(mockUsers),
      subscribe: vi.fn().mockReturnValue(() => {})
    };

    mockCreateUser = {
      execute: vi.fn().mockResolvedValue(undefined)
    };

    mockUpdateUserRole = {
      execute: vi.fn().mockResolvedValue(undefined)
    };

    mockDeleteUser = {
      execute: vi.fn().mockResolvedValue(undefined)
    };

    mockView = {
      updateUsers: vi.fn(),
      setLoading: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showError: vi.fn()
    };

    presenter = new UserManagementPresenter(
      mockGetUserList as GetUserList,
      mockCreateUser as CreateUser,
      mockUpdateUserRole as UpdateUserRole,
      mockDeleteUser as DeleteUser
    );
  });

  it('attach view tự động load danh sách user và đăng ký subscribe', async () => {
    presenter.attach(mockView as UserManagementView);

    expect(mockView.setLoading).toHaveBeenCalledWith(true);
    expect(mockGetUserList.execute).toHaveBeenCalled();
    expect(mockGetUserList.subscribe).toHaveBeenCalled();
  });

  it('detach view hủy subscription an toàn', () => {
    const mockUnsub = vi.fn();
    vi.mocked(mockGetUserList.subscribe!).mockReturnValue(mockUnsub);

    presenter.attach(mockView as UserManagementView);
    presenter.detach();

    expect(mockUnsub).toHaveBeenCalled();
  });

  it('addUser gọi CreateUser useCase và reload danh sách', async () => {
    presenter.attach(mockView as UserManagementView);
    await presenter.addUser({ name: 'User B', email: 'b@auto28.vn', role: 'staff' });

    expect(mockCreateUser.execute).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'User B', email: 'b@auto28.vn', role: 'staff' })
    );
    expect(mockGetUserList.execute).toHaveBeenCalledTimes(2); // Initial + reload
  });

  it('updateUser gọi UpdateUserRole useCase và reload', async () => {
    presenter.attach(mockView as UserManagementView);
    await presenter.updateUser('1', { role: 'accountant' });

    expect(mockUpdateUserRole.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', role: 'accountant' })
    );
  });

  it('deleteUser gọi DeleteUser useCase và reload', async () => {
    presenter.attach(mockView as UserManagementView);
    await presenter.deleteUser('1');

    expect(mockDeleteUser.execute).toHaveBeenCalledWith('1');
  });

  it('hiển thị lỗi lên view khi có exception', async () => {
    vi.mocked(mockCreateUser.execute!).mockRejectedValue(new Error('Tên không hợp lệ'));
    presenter.attach(mockView as UserManagementView);

    await presenter.addUser({ name: '', email: 'b@auto28.vn' });
    expect(mockView.showError).toHaveBeenCalledWith('Tên không hợp lệ');
  });
});
