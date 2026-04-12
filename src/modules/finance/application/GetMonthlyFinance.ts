import { Vehicle } from '../../../shared/domain/types';
import { FinanceService, Expense, SalaryCalculation } from '../domain/FinanceService';
import { ExpenseRepository } from '../infrastructure/ExpenseRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { StaffRepository } from '../../staff/domain/StaffRepository';

export interface MonthlyFinanceData {
  revenue: number;
  purchaseOutflow: number;
  carCosts: number;
  operatingExpenses: number;
  salaries: number;
  salesProfit: number;
  netProfit: number;
  netCashflow: number;
  allExpenses: Expense[];
  salaryCalculations: SalaryCalculation[];
}

export class GetMonthlyFinance {
  constructor(
    private readonly expenseRepo: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly staffRepository: StaffRepository
  ) {}

  async execute(month: string): Promise<MonthlyFinanceData> {
    const [allOpExpenses, vehicles, staff] = await Promise.all([
      this.expenseRepo.getAll(),
      this.vehicleRepository.getAll(),
      this.staffRepository.getAll()
    ]);
    const monthlyOpExpenses = allOpExpenses.filter(e => e.date?.startsWith(month));
    
    const revenue = FinanceService.calculateMonthlyRevenue(vehicles, month);
    const purchaseOutflow = FinanceService.calculateMonthlyPurchaseOutflow(vehicles, month);
    const carCosts = FinanceService.calculateMonthlyCarCosts(vehicles, month);
    const opExpensesTotal = monthlyOpExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    
    const salaryCalculations = FinanceService.calculateMonthlySalaries(staff, vehicles, month);
    const salariesTotal = salaryCalculations.reduce((acc, s) => acc + s.totalIncome, 0);
    
    const salesProfit = FinanceService.calculateMonthlySalesProfit(vehicles, month);
    const netProfit = salesProfit - opExpensesTotal - salariesTotal;
    
    const totalOutflow = purchaseOutflow + carCosts + opExpensesTotal + salariesTotal;
    const netCashflow = revenue - totalOutflow;

    return {
      revenue,
      purchaseOutflow,
      carCosts,
      operatingExpenses: opExpensesTotal,
      salaries: salariesTotal,
      salesProfit,
      netProfit,
      netCashflow,
      allExpenses: monthlyOpExpenses,
      salaryCalculations
    };
  }
}
