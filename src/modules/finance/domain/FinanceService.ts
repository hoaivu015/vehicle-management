import { VehicleStatus } from '../../../shared/domain/constants';
import { Vehicle } from '../../../shared/domain/types';
import { StaffSalaryService } from '../../staff/domain/StaffSalaryService';
import { calculateVehicleFinancials } from '../../../shared/utils/vehicle_calculations';

export interface Expense {
  id: string | number;
  name: string;
  amount: number;
  category: string;
  date: string;
}

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
    staff: any[],
    vehicles: Vehicle[],
    month: string
  ): SalaryCalculation[] {
    return staff.map(s => {
      const details = StaffSalaryService.calculateMonthlySalary(s, vehicles, month);
      
      return {
        staffId: s.id,
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
      .reduce((acc, v) => acc + (calculateVehicleFinancials(v).showroomProfitShare || 0), 0);
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
   * Tính toán dữ liệu biểu đồ tuần dựa trên dòng tiền thực tế (Cash-basis).
   * Bổ sung fallback cho dữ liệu cũ chưa có payment_history.
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
      // Incomes from Sale Payments
      if (v.sale_payment_history && v.sale_payment_history.length > 0) {
        v.sale_payment_history
          .filter(p => p.date?.startsWith(month))
          .forEach(p => {
            const day = parseInt(p.date.split('-')[2]);
            const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
            week.thu += (p.amount || 0);
          });
      } else if (v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(month)) {
        // Fallback for legacy sold cars: consider full sale price as income on sale_date
        const day = parseInt(v.sale_date.split('-')[2]);
        const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
        week.thu += (v.sale_price || 0);
      }

      // Outflows from Purchase Payments
      if (v.purchase_payment_history && v.purchase_payment_history.length > 0) {
        v.purchase_payment_history
          .filter(p => p.date?.startsWith(month))
          .forEach(p => {
            const day = parseInt(p.date.split('-')[2]);
            const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
            week.chi += (p.amount || 0);
          });
      } else if (v.purchase_date?.startsWith(month)) {
        // Fallback for legacy purchased cars: consider full purchase price as outflow on purchase_date
        const day = parseInt(v.purchase_date.split('-')[2]);
        const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
        week.chi += (v.purchase_price || 0);
      }

      // Outflows from Car Costs
      (v.cost_history || [])
        .filter(c => c.date?.startsWith(month))
        .forEach(c => {
          const day = parseInt(c.date.split('-')[2]);
          const week = weeks.find(w => day >= w.start && day <= w.end) || weeks[3];
          week.chi += (c.amount || 0);
        });
    });

    // Outflows from Operating Expenses
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
    allExpenses: Expense[],
    allStaff: any[]
  ): number {
    // 1. All-time Incomes
    const totalIncomes = vehicles.reduce((acc, v) => {
      let income = 0;
      if (v.sale_payment_history && v.sale_payment_history.length > 0) {
        income = v.sale_payment_history.reduce((sum, p) => sum + (p.amount || 0), 0);
      } else if (v.status === VehicleStatus.SOLD) {
        income = (v.sale_price || 0);
      }
      return acc + income;
    }, 0);

    // 2. All-time Outflows (Purchase)
    const totalPurchaseOutflow = vehicles.reduce((acc, v) => {
      let outflow = 0;
      if (v.purchase_payment_history && v.purchase_payment_history.length > 0) {
        // Assume purchase_payment_history records only showroom payments
        outflow = v.purchase_payment_history.reduce((sum, p) => sum + (p.amount || 0), 0);
      } else {
        // Fallback: Showroom only paid the part it owns
        outflow = Math.max(0, (v.purchase_price || 0) - (v.coinvest_amount || 0));
      }
      return acc + outflow;
    }, 0);

    // 3. All-time Car Costs
    const totalCarCosts = vehicles.reduce((acc, v) => {
      const vehicleCosts = (v.cost_history || []).reduce((sum, c) => sum + (c.amount || 0), 0);
      return acc + vehicleCosts;
    }, 0);

    // 4. All-time Operating Expenses
    const totalOpExpenses = allExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // 5. All-time Commissions (Actually paid)
    const totalCommissions = vehicles.reduce((acc, v) => {
      const buyingComm = v.buying_commission || 0;
      const sellingComm = v.status === VehicleStatus.SOLD ? (v.commission || 0) : 0;
      return acc + buyingComm + sellingComm;
    }, 0);

    // 6. All-time Partner ROI Payouts (Investment + Profit Share)
    // Only occurs for SOLD vehicles where partner paid directly
    const totalPartnerPayouts = vehicles
      .filter(v => v.status === VehicleStatus.SOLD && v.is_coinvested)
      .reduce((acc, v) => {
        const fin = calculateVehicleFinancials(v);
        return acc + fin.coinvestAmount + fin.partnerProfitShare;
      }, 0);
    
    return totalCapital + totalIncomes - totalPurchaseOutflow - totalCarCosts - totalOpExpenses - totalCommissions - totalPartnerPayouts;
  }
}
