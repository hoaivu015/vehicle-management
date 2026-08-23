import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUserList } from '../GetUserList';
import { CreateUser } from '../CreateUser';
import { UpdateUserRole } from '../UpdateUserRole';
import { DeleteUser } from '../DeleteUser';
import { UserRepository, UserProfile } from '../../domain/UserRepository';
import { UserRole } from '@/src/shared/domain/constants';

describe('User Application Use Cases Suite', () => {
  let mockUserRepo: Partial<UserRepository>;

  const mockUsers: UserProfile[] = [
    { id: '1', name: 'Nguyễn Văn A', email: 'admin@auto28.vn', role: 'admin', created_at: '2026-01-01', linkedfrom: null, password: null },
    { id: '2', name: 'Trần Thị B', email: 'sale@auto28.vn', role: 'staff', created_at: '2026-01-02', linkedfrom: null, password: null }
  ];

  beforeEach(() => {
    mockUserRepo = {
      getAll: vi.fn().mockResolvedValue(mockUsers),
      add: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockReturnValue(() => {})
    };
  });

  describe('GetUserList', () => {
    it('lấy danh sách người dùng thành công', async () => {
      const useCase = new GetUserList(mockUserRepo as UserRepository);
      const users = await useCase.execute();

      expect(users).toHaveLength(2);
      expect(mockUserRepo.getAll).toHaveBeenCalledOnce();
    });

    it('đăng ký subscription realtime', () => {
      const useCase = new GetUserList(mockUserRepo as UserRepository);
      const cb = vi.fn();
      const unsub = useCase.subscribe(cb);

      expect(mockUserRepo.subscribe).toHaveBeenCalledWith(cb);
      expect(typeof unsub).toBe('function');
    });
  });

  describe('CreateUser', () => {
    it('tạo người dùng thông thường thành công', async () => {
      const useCase = new CreateUser(mockUserRepo as UserRepository);
      await useCase.execute({
        name: 'Lê Văn C',
        email: 'levanc@auto28.vn',
        role: UserRole.STAFF
      });

      expect(mockUserRepo.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Lê Văn C',
          email: 'levanc@auto28.vn',
          role: UserRole.STAFF
        })
      );
    });

    it('tự động gán role ADMIN nếu email nằm trong danh sách ADMIN_EMAILS', async () => {
      const useCase = new CreateUser(mockUserRepo as UserRepository);
      await useCase.execute({
        name: 'Admin Boss',
        email: 'hoaivu015@gmail.com',
        role: UserRole.STAFF
      });

      expect(mockUserRepo.add).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'hoaivu015@gmail.com',
          role: UserRole.ADMIN
        })
      );
    });

    it('ném lỗi nếu name hoặc email rỗng', async () => {
      const useCase = new CreateUser(mockUserRepo as UserRepository);
      await expect(useCase.execute({ name: '', email: 'test@auto28.vn', role: 'staff' })).rejects.toThrow();
      await expect(useCase.execute({ name: 'Valid', email: '', role: 'staff' })).rejects.toThrow();
    });
  });

  describe('UpdateUserRole', () => {
    it('cập nhật vai trò người dùng thành công', async () => {
      const useCase = new UpdateUserRole(mockUserRepo as UserRepository);
      await useCase.execute({
        id: '2',
        role: UserRole.ACCOUNTANT,
        name: 'Trần Thị B Updated'
      });

      expect(mockUserRepo.update).toHaveBeenCalledWith('2', {
        role: UserRole.ACCOUNTANT,
        name: 'Trần Thị B Updated'
      });
    });

    it('ném lỗi nếu ID rỗng', async () => {
      const useCase = new UpdateUserRole(mockUserRepo as UserRepository);
      await expect(useCase.execute({ id: '', role: 'staff' })).rejects.toThrow();
    });
  });

  describe('DeleteUser', () => {
    it('xóa người dùng thành công', async () => {
      const useCase = new DeleteUser(mockUserRepo as UserRepository);
      await useCase.execute('2');

      expect(mockUserRepo.delete).toHaveBeenCalledWith('2');
    });

    it('ném lỗi nếu ID không hợp lệ', async () => {
      const useCase = new DeleteUser(mockUserRepo as UserRepository);
      await expect(useCase.execute('')).rejects.toThrow();
    });
  });
});
