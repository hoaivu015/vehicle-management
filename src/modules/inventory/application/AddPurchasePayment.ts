import { Vehicle, PaymentItem } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';

export interface AddPurchasePaymentRequest {
  vehicleId: number;
  amount: number;
  note: string;
  receiver: string;
  date?: string;
}

export class AddPurchasePayment {
  constructor(private readonly repository: VehicleRepository) {}

  async execute(request: AddPurchasePaymentRequest): Promise<void> {
    const payment: PaymentItem = {
      amount: request.amount,
      note: request.note,
      date: request.date || new Date().toISOString().split('T')[0],
      receiver: request.receiver
    };

    if (payment.amount <= 0) throw new Error('Số tiền thanh toán phải lớn hơn 0');

    await this.repository.addPurchasePayment(request.vehicleId, payment);
  }
}
