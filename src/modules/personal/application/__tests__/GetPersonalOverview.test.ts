import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPersonalOverview } from '../GetPersonalOverview';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { VehicleRepository } from '@/src/modules/inventory/domain/VehicleRepository';
import { Staff, Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus } from '@/src/shared/domain/constants';

describe('GetPersonalOverview UseCase', () => {
  let mockStaffRepo: Partial<StaffRepository>;
  let mockVehicleRepo: Partial<VehicleRepository>;
  let useCase: GetPersonalOverview;

  const mockStaff: Staff = {
    id: 1,
    code: 'NV01',
    name: 'Nguyễn Văn A',
    role: 'SALES',
    email: 'nva@auto28.vn',
    status: 'ACTIVE',
    department: 'Phòng Kinh doanh',
    base_salary: 10000000,
    commission_per_car: 5000000,
    target: 2,
    expenses: [
      {
        id: 'exp-1',
        amount: 2000000,
        note: 'Tạm ứng lương tháng 05',
        date: '2026-05-10',
        type: 'advance',
        is_reimbursed: false,
      }
    ],
    paid_months: [],
  };

  const mockVehicles: Vehicle[] = [
    {
      id: 101,
      code: 'CAR-01',
      name: 'Mazda CX-5 2022',
      status: VehicleStatus.SOLD,
      purchase_price: 700000000,
      sale_price: 780000000,
      purchase_date: '2026-05-01',
      sale_date: '2026-05-15',
      seller: 'NV01',
      buyer: 'NV01',
      commission: 5000000,
      buying_commission: 2000000,
      buying_bonus: 1000000,
      cost_history: [],
      sale_payment_history: [{ amount: 780000000, note: 'Thu tiền bán', date: '2026-05-15', staff_id: '1', staff_expense_id: 'se-1', receiver: 'Quỹ' }],
      is_coinvested: false,
      year: '2022',
      image_url: '',
      images: [],
      total_cost: 0,
      profit: 80000000,
      days: 14,
      holding_days: 14,
      is_pinned: false,
      purchase_payment_history: [],
      history: [],
    },
    {
      id: 102,
      code: 'CAR-02',
      name: 'Hyundai Tucson 2021',
      status: VehicleStatus.IN_STOCK,
      purchase_price: 650000000,
      sale_price: 720000000,
      purchase_date: '2026-05-20',
      buyer: 'NV01',
      buying_commission: 2000000,
      buying_bonus: 0,
      cost_history: [],
      sale_payment_history: [],
      is_coinvested: false,
      year: '2021',
      image_url: '',
      images: [],
      total_cost: 0,
      profit: 0,
      days: 12,
      holding_days: 12,
      is_pinned: false,
      purchase_payment_history: [],
      history: [],
    }
  ];

  beforeEach(() => {
    mockStaffRepo = {
      getByCode: vi.fn().mockImplementation((code: string) => {
        if (code === 'NV01') return Promise.resolve(mockStaff);
        return Promise.resolve(null);
      }),
      getById: vi.fn().mockImplementation((id: string | number) => {
        if (Number(id) === 1) return Promise.resolve(mockStaff);
        return Promise.resolve(null);
      }),
    };

    mockVehicleRepo = {
      getAll: vi.fn().mockResolvedValue(mockVehicles),
    };

    useCase = new GetPersonalOverview(
      mockStaffRepo as StaffRepository,
      mockVehicleRepo as VehicleRepository
    );
  });

  it('lấy thành công overview của nhân sự theo staffCode', async () => {
    const result = await useCase.execute({ code: 'NV01' }, '2026-05');

    expect(result.staff.name).toBe('Nguyễn Văn A');
    expect(result.soldVehicles.length).toBe(1);
    expect(result.boughtVehicles.length).toBe(2);
    expect(result.kpiSummary.target).toBe(2);
    expect(result.kpiSummary.soldCount).toBe(1);
    // Completion rate = 1 / 2 = 50%
    expect(result.kpiSummary.completionRate).toBe(50);
    // Base salary = 10,000,000
    expect(result.incomeSummary.baseSalary).toBe(10000000);
    // Total Advances = 2,000,000
    expect(result.incomeSummary.totalAdvances).toBe(2000000);
    // Net Salary = Total Salary - Advances
    expect(result.incomeSummary.netSalary).toBe(result.incomeSummary.totalSalary - 2000000);
  });

  it('lấy thành công overview của nhân sự theo staffId', async () => {
    const result = await useCase.execute({ id: 1 }, '2026-05');

    expect(result.staff.code).toBe('NV01');
    expect(result.personalExpenses.length).toBe(1);
  });

  it('báo lỗi khi không tìm thấy nhân sự', async () => {
    await expect(useCase.execute({ code: 'UNKNOWN' }, '2026-05')).rejects.toThrow(
      'Không tìm thấy thông tin nhân sự.'
    );
  });
});
