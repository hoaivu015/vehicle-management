import { Vehicle, StaffExpense } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';
import { ExpenseRepository } from '../../finance/domain/ExpenseRepository';
import { StaffRepository } from '../../staff/domain/StaffRepository';
import { calculateVehicleFinancials } from '../../../shared/utils/vehicle_calculations';
import { generateUUID } from '../../../shared/utils/stringUtils';

export interface UpdateVehicleRequest {
  id: number;
  data: Partial<Vehicle>;
}

export class UpdateVehicle {
  constructor(
    private readonly repository: VehicleRepository,
    private readonly expenseRepository: ExpenseRepository,
    private readonly staffRepository: StaffRepository
  ) {}

  async execute(request: UpdateVehicleRequest): Promise<Vehicle> {
    // 1. Get current state to detect changes
    const current = await this.repository.getById(request.id);
    if (!current) throw new Error('Không tìm thấy xe');

    // 2. Perform main update
    const updated = await this.repository.update(request.id.toString(), request.data);

    // 3. Handle Side Effects (Financial Records)
    const financials = calculateVehicleFinancials(updated as any);
    const today = new Date().toISOString().split('T')[0];

    // --- Side Effect Logic for Co-investment ---
    const syncStaffExpense = async (isAdding: boolean, amount: number, note: string, category: string) => {
      if (!current.coinvestor_code) return;
      const staff = await this.staffRepository.getByCode(current.coinvestor_code);
      if (!staff) return;

      let updatedExpenses = [...(staff.expenses || [])];
      if (isAdding) {
        // Only add if not already present (prevent duplicates)
        const exists = updatedExpenses.some(e => e.note === note && e.amount === amount);
        if (!exists) {
          const newExp: StaffExpense = {
            id: generateUUID(),
            amount,
            note,
            date: today,
            type: 'operating',
            category,
            is_reimbursed: true // Mark as already paid since it's profit sharing/capital return
          };
          updatedExpenses.push(newExp);
        }
      } else {
        updatedExpenses = updatedExpenses.filter(e => e.note !== note || e.amount !== amount);
      }
      await this.staffRepository.update(staff.id, { expenses: updatedExpenses });
    };

    // Case: Repaying Partner Capital
    const capitalNote = `Hoàn vốn đối tác: ${current.name} (${current.code})`;
    if (request.data.partner_capital_repaid === true && current.partner_capital_repaid !== true) {
      await this.expenseRepository.add({
        name: capitalNote,
        amount: financials.coinvestAmount,
        category: 'Đối tác',
        date: today
      } as any);
      await syncStaffExpense(true, financials.coinvestAmount, capitalNote, 'Hoàn vốn');
    } else if (request.data.partner_capital_repaid === false && current.partner_capital_repaid === true) {
      await this.expenseRepository.deleteByNameAndCategory(capitalNote, 'Đối tác');
      await syncStaffExpense(false, financials.coinvestAmount, capitalNote, 'Hoàn vốn');
    }

    // Case: Sharing Partner Profit
    const profitNote = `Chia LN đối tác: ${current.name} (${current.code})`;
    if (request.data.partner_profit_shared === true && current.partner_profit_shared !== true) {
      await this.expenseRepository.add({
        name: profitNote,
        amount: financials.partnerProfitShare,
        category: 'Đối tác',
        date: today
      } as any);
      await syncStaffExpense(true, financials.partnerProfitShare, profitNote, 'Lợi nhuận góp vốn');
    } else if (request.data.partner_profit_shared === false && current.partner_profit_shared === true) {
      await this.expenseRepository.deleteByNameAndCategory(profitNote, 'Đối tác');
      await syncStaffExpense(false, financials.partnerProfitShare, profitNote, 'Lợi nhuận góp vốn');
    }

    return updated;
  }
}
