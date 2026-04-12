import { Vehicle } from '../../../shared/domain/types';
import { FinanceService } from '../domain/FinanceService';
import { ExpenseRepository } from '../infrastructure/ExpenseRepository';
import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { StaffRepository } from '../../staff/domain/StaffRepository';

export interface FinancialOverviewData {
  monthlyRevenue: number;
  inventoryCount: number;
  inventoryValue: number;
  availableCash: number;
  totalCapital: number;
  grossProfit: number;
  netProfit: number;
  finalNetProfit: number;
  soldCount: number;
  boughtCount: number;
  agingCount: number;
  recentActivities: any[];
  weeklyCashflow: { name: string; thu: number; chi: number }[];
}

export class GetFinancialOverview {
  constructor(
    private readonly expenseRepo: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly staffRepository: StaffRepository
  ) {}

  async execute(month: string): Promise<FinancialOverviewData> {
    const [settings, vehicles, staff] = await Promise.all([
      (this.expenseRepo as any).getCompanySettings(),
      this.vehicleRepository.getAll(),
      this.staffRepository.getAll()
    ]);
    const totalCapital = settings.total_capital || 0;

    const inventoryVehicles = vehicles.filter(v => v.status !== VehicleStatus.SOLD);
    const inventoryValue = inventoryVehicles.reduce((acc, v) => acc + (v.purchase_price || 0) + (v.total_cost || 0), 0);
    
    // Correct Cash Balance Calculation
    const allOpExpenses = await this.expenseRepo.getAll();
    const availableCash = FinanceService.calculateTotalCashBalance(
      totalCapital,
      vehicles,
      allOpExpenses,
      staff
    );

    const monthlyRevenue = FinanceService.calculateMonthlyRevenue(vehicles, month);
    const monthlySalesProfit = FinanceService.calculateMonthlySalesProfit(vehicles, month);
    
    // Operating Expenses for the Month
    const monthlyOpExpenses = allOpExpenses.filter(e => e.date?.startsWith(month));
    const opExpensesTotal = monthlyOpExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    
    // Staff Salaries for the Month
    const salaryCalculations = FinanceService.calculateMonthlySalaries(staff, vehicles, month);
    const salariesTotal = salaryCalculations.reduce((acc, s) => acc + s.totalIncome, 0);
    
    const grossProfit = monthlySalesProfit;
    const netProfit = grossProfit - opExpensesTotal;
    const finalNetProfit = netProfit - salariesTotal;

    // Counts
    const soldVehiclesInMonth = vehicles.filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(month));
    const boughtVehiclesInMonth = vehicles.filter(v => v.purchase_date?.startsWith(month));

    // Aging logic (25 days threshold)
    const AGING_THRESHOLD = 25;
    const calculateAging = (purchaseDate: string) => {
      const start = new Date(purchaseDate);
      const now = new Date();
      return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };
    
    const agingCount = inventoryVehicles.filter(v => 
      v.purchase_date && calculateAging(v.purchase_date) > AGING_THRESHOLD
    ).length;

    // Recent Activities from Status History AND Payment History
    const statusActivities = vehicles.flatMap(v => (v.history || []).map(h => ({
      type: h.status === VehicleStatus.IN_STOCK ? 'purchase' : 
            h.status === VehicleStatus.SOLD ? 'sale' : 'other',
      user: h.user || 'Hệ thống',
      action: h.status === VehicleStatus.IN_STOCK ? 'đã nhập xe' : 
              h.status === VehicleStatus.SOLD ? 'đã chốt bán' : 
              h.status === VehicleStatus.DEPOSIT_SALE ? 'đã nhận cọc' : 'đã cập nhật',
      target: v.name,
      date: h.date,
      vCode: v.code
    })));

    const paymentActivities = vehicles.flatMap(v => [
      ...(v.purchase_payment_history || []).map(p => ({
        type: 'purchase',
        user: p.receiver || 'Hệ thống',
        action: 'đã thanh toán nhập xe',
        target: v.name,
        date: p.date,
        vCode: v.code
      })),
      ...(v.sale_payment_history || []).map(p => ({
        type: 'sale',
        user: p.receiver || 'Hệ thống',
        action: p.amount > 0 ? 'đã thu tiền khách' : 'đã hoàn trả tiền cọc',
        target: v.name,
        date: p.date,
        vCode: v.code
      }))
    ]);

    const recentActivities = [...statusActivities, ...paymentActivities]
      .filter(a => a.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);

    const weeklyCashflow = FinanceService.calculateWeeklyCashflow(vehicles, month, allOpExpenses);

    return {
      monthlyRevenue,
      inventoryCount: inventoryVehicles.length,
      inventoryValue,
      availableCash,
      totalCapital,
      grossProfit,
      netProfit,
      finalNetProfit,
      soldCount: soldVehiclesInMonth.length,
      boughtCount: boughtVehiclesInMonth.length,
      agingCount,
      recentActivities,
      weeklyCashflow
    };
  }
}
