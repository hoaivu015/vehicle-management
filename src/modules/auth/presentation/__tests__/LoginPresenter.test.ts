import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPresenter, LoginViewContract } from '../presenters/LoginPresenter';
import { AuthRepository } from '../../domain/AuthRepository';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { LoginSchema, PinSchema } from '../../domain/dtos/LoginSchema';
import { QuickPinService } from '../../domain/services/QuickPinService';
import { Staff } from '@/src/shared/domain/types';

describe('LoginSchema Validation', () => {
  it('hợp lệ khi nhập mã nhân viên và mật khẩu >= 6 ký tự', () => {
    const result = LoginSchema.safeParse({
      identifier: 'NV01',
      password: 'password123',
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it('từ chối khi mật khẩu dưới 6 ký tự', () => {
    const result = LoginSchema.safeParse({
      identifier: 'admin@auto28.vn',
      password: '123',
      rememberMe: false,
    });
    expect(result.success).toBe(false);
  });

  it('xác thực đúng định dạng mã PIN 4 số', () => {
    expect(PinSchema.safeParse({ pin: '1234' }).success).toBe(true);
    expect(PinSchema.safeParse({ pin: '123' }).success).toBe(false);
    expect(PinSchema.safeParse({ pin: '12345' }).success).toBe(false);
    expect(PinSchema.safeParse({ pin: 'abcd' }).success).toBe(false);
  });
});

describe('QuickPinService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('thiết lập và xác thực mã PIN chính xác', async () => {
    const email = 'sales@auto28.vn';
    await QuickPinService.setPin(email, '8888');

    expect(QuickPinService.hasPin(email)).toBe(true);

    const correctVerify = await QuickPinService.verifyPin(email, '8888');
    expect(correctVerify.success).toBe(true);

    const wrongVerify = await QuickPinService.verifyPin(email, '1111');
    expect(wrongVerify.success).toBe(false);
    expect(wrongVerify.remainingAttempts).toBe(4);
  });
});

describe('LoginPresenter (Smart Identifier & MVP Flow)', () => {
  let mockAuthRepo: AuthRepository;
  let mockStaffRepo: StaffRepository;
  let presenter: LoginPresenter;
  let mockView: LoginViewContract;

  const mockStaff: Staff = {
    id: 1,
    code: 'NV01',
    name: 'Nguyễn Văn Hoài',
    role: 'STAFF',
    email: 'hoai@auto28.vn',
    status: 'ACTIVE',
    department: 'SALES',
    base_salary: 10000000,
    commission_per_car: 2000000,
    target: 5,
    expenses: [],
    paid_months: [],
  };

  beforeEach(() => {
    localStorage.clear();

    mockAuthRepo = {
      getSessionUserEmail: vi.fn().mockResolvedValue(null),
      onAuthStateChange: vi.fn().mockReturnValue(() => {}),
      signIn: vi.fn().mockResolvedValue({ success: true }),
      signUp: vi.fn().mockResolvedValue({ success: true }),
      signOut: vi.fn().mockResolvedValue(undefined),
      updatePassword: vi.fn().mockResolvedValue(undefined),
    };

    mockStaffRepo = {
      getByCode: vi.fn().mockImplementation(async (code: string) => {
        if (code === 'NV01') return mockStaff;
        return null;
      }),
      getByEmail: vi.fn().mockImplementation(async (email: string) => {
        if (email.toLowerCase() === 'hoai@auto28.vn') return mockStaff;
        return null;
      }),
      getAll: vi.fn().mockResolvedValue([mockStaff]),
      getById: vi.fn().mockResolvedValue(mockStaff),
      create: vi.fn().mockResolvedValue(mockStaff),
      update: vi.fn().mockResolvedValue(mockStaff),
      delete: vi.fn().mockResolvedValue(undefined),
      getCodesByDepartment: vi.fn().mockResolvedValue(['NV01']),
      getAccounts: vi.fn().mockResolvedValue([]),
      updateAccountPassword: vi.fn().mockResolvedValue(undefined),
      deleteAccountByCode: vi.fn().mockResolvedValue(undefined),
      addSalaryPayout: vi.fn().mockResolvedValue(undefined),
      deleteSalaryPayout: vi.fn().mockResolvedValue(undefined),
      registerUser: vi.fn().mockResolvedValue(undefined),
    };

    mockView = {
      showLoading: vi.fn(),
      showError: vi.fn(),
      clearError: vi.fn(),
      setMode: vi.fn(),
      setSavedAccount: vi.fn(),
      onLoginSuccess: vi.fn(),
    };

    presenter = new LoginPresenter(mockAuthRepo, mockStaffRepo);
    presenter.attachView(mockView);
  });

  it('phân giải mã nhân viên NV01 sang email hoai@auto28.vn', async () => {
    const result = await presenter.resolveIdentifierToEmail('NV01');
    expect(result.email).toBe('hoai@auto28.vn');
    expect(result.staff?.name).toBe('Nguyễn Văn Hoài');
  });

  it('phân giải email trực tiếp nếu có chứa @', async () => {
    const result = await presenter.resolveIdentifierToEmail('admin@auto28.vn');
    expect(result.email).toBe('admin@auto28.vn');
  });

  it('đăng nhập thành công bằng mã NV01 và mật khẩu hợp lệ', async () => {
    const success = await presenter.loginWithPassword('NV01', 'password123', true);
    expect(success).toBe(true);
    expect(mockAuthRepo.signIn).toHaveBeenCalledWith('hoai@auto28.vn', 'password123');
    expect(mockView.onLoginSuccess).toHaveBeenCalledWith(mockStaff);
  });

  it('hiển thị thông báo tiếng Việt khi sai thông tin đăng nhập', async () => {
    vi.mocked(mockAuthRepo.signIn).mockResolvedValueOnce({
      success: false,
      error: 'Invalid login credentials',
    });
    // Giả sử mã nhân viên không tồn tại trong employees
    vi.mocked(mockStaffRepo.getByEmail).mockResolvedValueOnce(null);

    const success = await presenter.loginWithPassword('UNKNOWN_USER@auto28.vn', 'wrongpass', false);
    expect(success).toBe(false);
    expect(mockView.showError).toHaveBeenCalledWith('Mã nhân viên hoặc mật khẩu không chính xác.');
  });
});
