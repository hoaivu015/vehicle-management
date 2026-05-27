import { Vehicle } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleStatus } from '../../../shared/domain/constants';
import { CreateVehicleSchema, CreateVehicleInput } from '../domain/VehicleSchema';
import { VehicleCodeGenerator } from '../domain/services/VehicleCodeGenerator';

export type AddVehicleRequest = CreateVehicleInput;

export class AddVehicle {
  constructor(
    private readonly repository: VehicleRepository,
    private readonly codeGenerator: VehicleCodeGenerator
  ) {}

  async execute(request: AddVehicleRequest): Promise<Vehicle> {
    // L6: Zod Boundary - Validation
    const validatedRequest = CreateVehicleSchema.parse(request);

    if (validatedRequest.is_coinvested && (validatedRequest.coinvest_amount || 0) > validatedRequest.purchase_price) {
      throw new Error('Số tiền góp vốn không được lớn hơn giá mua xe.');
    }

    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any;

    while (attempts < maxAttempts) {
      try {
        const code = await this.codeGenerator.generate(new Date());

        const newVehicle: Omit<Vehicle, 'id'> = {
          code,
          name: validatedRequest.name,
          year: validatedRequest.year,
          status: VehicleStatus.DEPOSIT_BUY,
          purchase_price: validatedRequest.purchase_price,
          purchase_date: validatedRequest.purchase_date,
          buyer: validatedRequest.buyer,
          odo: validatedRequest.odo,
          color: validatedRequest.color,
          image_url: validatedRequest.image_url,
          is_coinvested: validatedRequest.is_coinvested,
          coinvestor_code: validatedRequest.coinvestor_code,
          coinvest_amount: validatedRequest.coinvest_amount,
          notes: validatedRequest.notes,
          buying_commission: validatedRequest.buying_commission,
          total_cost: 0,
          cost_history: [],
          purchase_paid_amount: 0,
          purchase_payment_history: [],
          buyer_name: '',
          customer_name: '',
          sale_price: 0,
          sale_date: '',
          seller: '',
          seller_name: '',
          commission: 0,
          buying_bonus: 0,
          buying_bonus_paid: false,
          images: [],
          received_amount: 0,
          sale_payment_history: [],
          history: [],
          profit: 0,
          days: 0,
          is_pinned: false,
          partner_capital_repaid: false,
          partner_profit_shared: false
        };

        const historyEntry = {
          date: validatedRequest.purchase_date,
          status: VehicleStatus.DEPOSIT_BUY,
          user: 'Hệ thống',
          note: 'Khởi tạo xe mới (Cọc mua)'
        };

        return await this.repository.create({
          ...newVehicle,
          history: [historyEntry]
        });
      } catch (error: any) {
        lastError = error;
        // Lỗi 23505 (Postgres) hoặc 409 (HTTP Conflict) là trùng mã xe
        if (error.code === '23505' || error.status === 409 || error.code === '409') {
          attempts++;
          console.log(`[AddVehicle] Phát hiện trùng mã xe, đang thử lại lần ${attempts}...`);
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }
}
