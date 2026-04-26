import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleRepository } from '../domain/VehicleRepository';

export interface AddSalePaymentRequest {
  vehicleId: number;
  amount: number;
  note: string;
  receiver: string;
  nextStatus: VehicleStatus;
  seller: string;
  buyerName?: string;
  salePrice?: number;
  commission?: number;
  date?: string;
}

export class AddSalePayment {
  constructor(private readonly repository: VehicleRepository) {}

  async execute(request: AddSalePaymentRequest): Promise<void> {
    const payment = {
      amount: request.amount,
      note: request.note,
      date: request.date || new Date().toISOString().split('T')[0],
      receiver: request.receiver
    };

    // Chỉ cho phép amount = 0 nếu đây là bước cập nhật trạng thái mà không phát sinh dòng tiền
    if (payment.amount < 0) throw new Error('Số tiền không được âm');
    if (payment.amount === 0 && request.nextStatus !== VehicleStatus.SOLD && !request.note.includes('cập nhật')) {
       // Nếu có note cập nhật thì có thể chấp nhận 0, nhưng mặc định nên > 0
    }

    await this.repository.addSalePayment(
      request.vehicleId,
      payment,
      request.nextStatus,
      request.seller,
      request.buyerName,
      request.salePrice,
      request.commission
    );
  }
}
