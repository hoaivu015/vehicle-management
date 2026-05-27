import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddVehicle } from '../AddVehicle';
import { VehicleStatus } from '../../../../shared/domain/constants';

describe('AddVehicle Use Case', () => {
  const mockVehicleRepo = {
    create: vi.fn(),
    getNextVehicleCode: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getByCode: vi.fn(),
    getAvailableVehicles: vi.fn(),
    getSoldVehiclesByMonth: vi.fn(),
    updateStatus: vi.fn(),
    addPurchasePayment: vi.fn(),
    addSalePayment: vi.fn(),
    cancelSale: vi.fn(),
    getVehiclesByStaff: vi.fn(),
    getVehiclesByCodes: vi.fn(),
    subscribe: vi.fn(),
  };

  const mockCodeGenerator = {
    generate: vi.fn(),
    isValid: vi.fn()
  };

  let useCase: AddVehicle;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new AddVehicle(mockVehicleRepo as any, mockCodeGenerator as any);
  });

  const validRequest = {
    name: 'VinFast Lux A2.0',
    year: '2022',
    odo: 15000,
    color: 'Trắng',
    purchase_price: 800000000,
    purchase_date: '2024-05-13',
    buyer: 'STAFF01',
    image_url: '',
    is_coinvested: false,
    coinvestor_code: '',
    coinvest_amount: 0,
    notes: 'Xe đẹp, máy zin',
    buying_commission: 3000000
  };

  it('nên tạo xe mới thành công với mã xe tự động', async () => {
    const mockGeneratedCode = 'VH1405-01';
    mockCodeGenerator.generate.mockResolvedValue(mockGeneratedCode);
    mockVehicleRepo.create.mockImplementation((item) => Promise.resolve({ id: 1, ...item }));

    const result = await useCase.execute(validRequest);

    expect(mockCodeGenerator.generate).toHaveBeenCalled();
    expect(mockVehicleRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      code: mockGeneratedCode,
      name: validRequest.name,
      status: VehicleStatus.DEPOSIT_BUY,
      purchase_price: validRequest.purchase_price,
      history: expect.arrayContaining([
        expect.objectContaining({
          status: VehicleStatus.DEPOSIT_BUY,
          note: expect.stringContaining('Khởi tạo')
        })
      ])
    }));
    expect(result.id).toBe(1);
    expect(result.code).toBe(mockGeneratedCode);
  });

  it('nên quăng lỗi nếu số tiền góp vốn lớn hơn giá mua', async () => {
    const invalidRequest = {
      ...validRequest,
      is_coinvested: true,
      coinvestor_code: 'INVESTOR01',
      coinvest_amount: 900000000 // > 800,000,000
    };

    await expect(useCase.execute(invalidRequest as any)).rejects.toThrow('Số tiền góp vốn không được lớn hơn giá mua xe.');
  });

  it('nên sử dụng các giá trị mặc định từ schema nếu thiếu', async () => {
    const minimalRequest = {
      name: 'Toyota Vios',
      year: 2021, // Testing union number -> string
      purchase_price: 500000000,
      purchase_date: '2024-05-13',
      buyer: 'STAFF02'
    };

    mockCodeGenerator.generate.mockResolvedValue('VH1405-02');
    mockVehicleRepo.create.mockImplementation((item) => Promise.resolve({ id: 2, ...item }));

    const result = await useCase.execute(minimalRequest as any);

    expect(result.year).toBe('2021');
    expect(result.odo).toBe(0);
    expect(result.color).toBe('');
    expect(result.is_coinvested).toBe(false);
    expect(result.buying_commission).toBe(3000000); // Default value
  });

  it('nên quăng lỗi nếu thiếu các trường bắt buộc (Zod validation)', async () => {
    const incompleteRequest = {
      name: 'Lỗi thiếu trường'
      // Thiếu year, purchase_price, etc.
    };

    await expect(useCase.execute(incompleteRequest as any)).rejects.toThrow();
  });
});
