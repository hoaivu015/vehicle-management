import { Vehicle, CostItem } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleStatus } from '../../../shared/domain/constants';

export interface AddVehicleRequest {
  // code được hệ thống tự sinh — không nhận từ form
  name: string;
  year: number;
  odo?: number;
  color?: string;
  purchase_price: number;
  purchase_date: string;
  buyer: string;
  image_url?: string;
  is_coinvested: boolean;
  coinvestor_code?: string;
  coinvest_amount?: number;
  notes?: string;
  buying_commission?: number;
}

export class AddVehicle {
  constructor(private readonly repository: VehicleRepository) {}

  async execute(request: AddVehicleRequest): Promise<Vehicle> {
    let code: string | undefined = undefined;

    // 1. Tạo mã xe tự động nếu chưa có (Định dạng VH-YYMM-NN)
    if (!code) {
      const now = new Date();
      const yy = now.getFullYear().toString().slice(-2);
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `VH-${yy}${mm}-`;

      const allCars = await this.repository.getAll();
      const codesInMonth = allCars
        .map(c => c.code)
        .filter(code => code?.startsWith(prefix));

      let nextNN = 1;
      if (codesInMonth.length > 0) {
        const numbers = codesInMonth
          .map(code => {
            const parts = code.split('-');
            const lastPart = parts[parts.length - 1];
            return parseInt(lastPart);
          })
          .filter(n => !isNaN(n));
        
        if (numbers.length > 0) {
          nextNN = Math.max(...numbers) + 1;
        }
      }
      
      code = `${prefix}${nextNN.toString().padStart(2, '0')}`;
    }

    const newVehicle: Omit<Vehicle, 'id'> = {
      code,
      name: request.name,
      year: request.year,
      status: VehicleStatus.DEPOSIT_BUY, // Luôn bắt đầu từ Cọc mua theo yêu cầu
      purchase_price: request.purchase_price,
      purchase_date: request.purchase_date,
      buyer: request.buyer,
      odo: request.odo,
      color: request.color,
      image_url: request.image_url,
      is_coinvested: request.is_coinvested,
      coinvestor_code: request.coinvestor_code,
      coinvest_amount: request.coinvest_amount || 0,
      notes: request.notes,
      buying_commission: request.buying_commission !== undefined ? request.buying_commission : 3000000,
      total_cost: 0,
      cost_history: [],
      purchase_paid_amount: 0,
      purchase_payment_history: [],
    };

    // Khởi tạo lịch sử
    const historyEntry = {
      date: request.purchase_date,
      status: VehicleStatus.DEPOSIT_BUY,
      user: 'Hệ thống',
      note: 'Khởi tạo xe mới (Cọc mua)'
    };

    const savedVehicle = await this.repository.create({
      ...newVehicle,
      history: [historyEntry]
    } as any);

    return savedVehicle;
  }
}
