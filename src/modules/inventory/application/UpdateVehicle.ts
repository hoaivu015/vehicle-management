import { Vehicle, StaffExpense } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';
import { ExpenseRepository } from '../../finance/domain/ExpenseRepository';
import { StaffRepository } from '../../staff/domain/StaffRepository';
import { calculateVehicleFinancials } from '../../../shared/utils/vehicle_calculations';
import { generateUUID } from '../../../shared/utils/stringUtils';

import { getTodayDateString } from '../../../shared/utils/date';

export interface UpdateVehicleRequest {
  id: number;
  data: Partial<Vehicle>;
  skipExpenseSync?: boolean;
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

    // If caller explicitly requested skipping expense sync (e.g. from Payroll payout), exit early
    if (request.skipExpenseSync) {
      return updated;
    }

    // 3. Handle Side Effects (Financial Records)
    const financials = calculateVehicleFinancials(updated);
    const today = getTodayDateString();

    // --- Side Effect Logic for Co-investment ---
    const targetCoinvestorCode = updated.coinvestor_code || current.coinvestor_code;
    const syncStaffExpense = async (isAdding: boolean, amount: number, note: string, category: string) => {
      if (!targetCoinvestorCode) return;
      const staff = await this.staffRepository.getByCode(targetCoinvestorCode);
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

    const currentFinancials = calculateVehicleFinancials(current);

    // Case 1: Repaying Partner Capital (Sử dụng refundablePartnerCapital để tự động khấu trừ lỗ nếu bán cắt lỗ)
    const capitalNote = `Hoàn vốn đối tác: ${current.name} (${current.code})`;
    const repaidAmount = financials.refundablePartnerCapital ?? financials.coinvestAmount;
    const currentRepaidAmount = currentFinancials.refundablePartnerCapital ?? currentFinancials.coinvestAmount;

    if (request.data.partner_capital_repaid === true && current.partner_capital_repaid !== true) {
      await this.expenseRepository.add({
        name: capitalNote,
        amount: repaidAmount,
        category: 'Đối tác',
        date: today
      });
      await syncStaffExpense(true, repaidAmount, capitalNote, 'Hoàn vốn');
    } else if (request.data.partner_capital_repaid === false && current.partner_capital_repaid === true) {
      await this.expenseRepository.deleteByNameAndCategory(capitalNote, 'Đối tác');
      await syncStaffExpense(false, currentRepaidAmount, capitalNote, 'Hoàn vốn');
    } else if (current.partner_capital_repaid === true && repaidAmount !== currentRepaidAmount) {
      // Amount changed while already repaid -> update financial record
      await this.expenseRepository.deleteByNameAndCategory(capitalNote, 'Đối tác');
      await syncStaffExpense(false, currentRepaidAmount, capitalNote, 'Hoàn vốn');
      await this.expenseRepository.add({
        name: capitalNote,
        amount: repaidAmount,
        category: 'Đối tác',
        date: today
      });
      await syncStaffExpense(true, repaidAmount, capitalNote, 'Hoàn vốn');
    }

    // Case 2: Sharing Partner Profit
    const profitNote = `Chia LN đối tác: ${current.name} (${current.code})`;
    if (request.data.partner_profit_shared === true && current.partner_profit_shared !== true) {
      await this.expenseRepository.add({
        name: profitNote,
        amount: financials.partnerProfitShare,
        category: 'Đối tác',
        date: today
      });
      await syncStaffExpense(true, financials.partnerProfitShare, profitNote, 'Lợi nhuận góp vốn');
    } else if (request.data.partner_profit_shared === false && current.partner_profit_shared === true) {
      await this.expenseRepository.deleteByNameAndCategory(profitNote, 'Đối tác');
      await syncStaffExpense(false, currentFinancials.partnerProfitShare, profitNote, 'Lợi nhuận góp vốn');
    } else if (current.partner_profit_shared === true && financials.partnerProfitShare !== currentFinancials.partnerProfitShare) {
      // Profit changed while already shared -> update financial record
      await this.expenseRepository.deleteByNameAndCategory(profitNote, 'Đối tác');
      await syncStaffExpense(false, currentFinancials.partnerProfitShare, profitNote, 'Lợi nhuận góp vốn');
      await this.expenseRepository.add({
        name: profitNote,
        amount: financials.partnerProfitShare,
        category: 'Đối tác',
        date: today
      });
      await syncStaffExpense(true, financials.partnerProfitShare, profitNote, 'Lợi nhuận góp vốn');
    }

    return updated;
  }
}
