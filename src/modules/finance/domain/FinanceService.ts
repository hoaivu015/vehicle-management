import { VehicleStatus } from '@/src/shared/domain/constants';
import { Vehicle } from '@/src/shared/domain/types';
import { StaffSalaryService } from '@/src/modules/staff/domain/StaffSalaryService';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';

import { Expense } from './ExpenseRepository';
export type { Expense };

export interface SalaryCalculation {
  staffId: string;
  staffName: string;
  baseSalary: number;
  salesCommission: number;
  buyingCommission: number;
  bonusMultiplier: number;
  totalIncome: number;
  soldCarsCount: number;
  boughtCarsCount: number;
}

export class FinanceService {
  /**
   * Tính toán lương và hoa hồng cho nhân viên trong một tháng.
   */
  static calculateMonthlySalaries(
    staff: import('../../../shared/domain/types').Staff[],
    vehicles: Vehicle[],
    month: string
  ): SalaryCalculation[] {
    return staff.map(s => {
      const details = StaffSalaryService.calculateMonthlySalary(s, vehicles, month);
      
      return {
        staffId: String(s.id),
        staffName: s.name,
        baseSalary: details.base,
        salesCommission: details.salesCommission,
        buyingCommission: details.buyingCommission,
        bonusMultiplier: details.kpiBonusMultiplier,
        totalIncome: details.totalSalary,
        soldCarsCount: details.soldCount,
        boughtCarsCount: details.boughtCount
      };
    });
  }

  /**
   * Tính toán doanh thu từ việc bán xe trong tháng (theo dòng tiền thực tế).
   */
  static calculateMonthlyRevenue(vehicles: Vehicle[], month: string): number {
    return vehicles.reduce((acc, v) => {
      const monthPayments = (v.sale_payment_history || [])
        .filter(p => p.date?.startsWith(month))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      return acc + monthPayments;
    }, 0);
  }

  /**
   * Tính toán lợi nhuận gộp từ việc bán xe (đã trừ vốn và chi phí xe).
   * Vẫn tính theo xe đã bán (Realized Profit).
   */
  static calculateMonthlySalesProfit(vehicles: Vehicle[], month: string): number {
    return vehicles
      .filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(month))
      .reduce((acc, v) => {
        const fin = calculateVehicleFinancials(v as any);
        // Doanh thu gộp của Showroom = Lợi nhuận gộp - Phần chia cho đối tác
        return acc + (fin.grossProfit - (fin.partnerProfitShare || 0));
      }, 0);
  }

  /**
   * Tính toán tổng dòng tiền chi ra cho việc mua xe trong tháng (theo dòng tiền thực tế).
   */
  static calculateMonthlyPurchaseOutflow(vehicles: Vehicle[], month: string): number {
    return vehicles.reduce((acc, v) => {
      const monthPayments = (v.purchase_payment_history || [])
        .filter(p => p.date?.startsWith(month))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      return acc + monthPayments;
    }, 0);
  }

  /**
   * Tính toán tổng chi phí sửa chữa/spa phát sinh trong tháng.
   */
  static calculateMonthlyCarCosts(vehicles: Vehicle[], month: string): number {
    return vehicles.reduce((acc, v) => {
      const monthCosts = (v.cost_history || [])
        .filter(cost => cost.date?.startsWith(month))
        .reduce((sum, cost) => sum + (cost.amount || 0), 0);
      return acc + monthCosts;
    }, 0);
  }

  /**
   * Tính toán tổng chi trả cho đối tác trong tháng (Vốn + Lợi nhuận)
   */
  static calculateMonthlyPartnerPayouts(vehicles: Vehicle[], month: string): number {
     return vehicles
        .filter(v => v.status === VehicleStatus.SOLD && v.is_coinvested)
        .reduce((acc, v) => {
           const fin = calculateVehicleFinancials(v as any);
           let payout = 0;
           if (v.sale_date?.startsWith(month)) {
              if (v.partner_capital_repaid) payout += fin.coinvestAmount;
              if (v.partner_profit_shared) payout += fin.partnerProfitShare;
           }
           return acc + payout;
        }, 0);
  }

  /**
   * Tính toán dữ liệu biểu đồ tuần dựa trên dòng tiền thực tế (Cash-basis).
   */
  static calculateWeeklyCashflow(
    vehicles: Vehicle[], 
    month: string,
    expenses: Expense[]
  ) {
    const weeks = [
      { name: 'Tuần 1', start: 1, end: 7, thu: 0, chi: 0 },
      { name: 'Tuần 2', start: 8, end: 14, thu: 0, chi: 0 },
      { name: 'Tuần 3', start: 15, end: 21, thu: 0, chi: 0 },
      { name: 'Tuần 4', start: 22, end: 31, thu: 0, chi: 0 }
    ];

    vehicles.forEach(v => {
      if (v.sale_payment_history && v.sale_payment_history.length > 0) {
        v.sale_payment_history
          .filter(p => p.date?.startsWith(month))
          .forEach(p => {
            const day = parseInt(p.date.split('-')[2]);
            const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
            week.thu += (p.amount || 0);
          });
      }

      if (v.purchase_payment_history && v.purchase_payment_history.length > 0) {
        v.purchase_payment_history
          .filter(p => p.date?.startsWith(month))
          .forEach(p => {
            const day = parseInt(p.date.split('-')[2]);
            const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
            week.chi += (p.amount || 0);
          });
      }

      (v.cost_history || [])
        .filter(c => c.date?.startsWith(month))
        .forEach(c => {
          const day = parseInt(c.date.split('-')[2]);
          const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
          week.chi += (c.amount || 0);
        });
    });

    expenses
      .filter(e => e.date?.startsWith(month))
      .forEach(e => {
        const day = parseInt(e.date.split('-')[2]);
        const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
        week.chi += (e.amount || 0);
      });

    return weeks.map(({ name, thu, chi }) => ({ name, thu, chi }));
  }

  /**
   * Tính toán số dư tiền mặt dồn tích (Cash Balance) dựa trên lịch sử toàn thời gian.
   */
  static calculateTotalCashBalance(
    totalCapital: number,
    vehicles: Vehicle[],
    allExpenses: Expense[]
  ): number {
    // 1. All-time Incomes (Bao gồm cọc và thanh toán từ khách)
    const totalIncomes = vehicles.reduce((acc, v) => {
      const income = (v.sale_payment_history || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      return acc + income;
    }, 0);

    // 2. All-time Outflows (Tiền showroom thực chi để mua xe)
    const totalPurchaseOutflow = vehicles.reduce((acc, v) => {
      const outflow = (v.purchase_payment_history || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      return acc + outflow;
    }, 0);

    // 3. All-time Car Costs (Chi phí spa, sửa chữa thực tế đã chi)
    const totalCarCosts = vehicles.reduce((acc, v) => {
      const vehicleCosts = (v.cost_history || []).reduce((sum, c) => sum + (c.amount || 0), 0);
      return acc + vehicleCosts;
    }, 0);

    // 4. All-time Operating Expenses (Chi phí vận hành showroom)
    const totalOpExpenses = allExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // 5. Staff payments are now tracked via Operating Expenses ('Lương nhân sự')
    // We no longer subtract commissions directly from vehicles to avoid double-counting.
    
    return Math.round(totalCapital + totalIncomes - totalPurchaseOutflow - totalCarCosts - totalOpExpenses);
  }
}
