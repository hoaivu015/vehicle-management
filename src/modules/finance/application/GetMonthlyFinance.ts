import { FinanceService, Expense, SalaryCalculation } from '@/src/modules/finance/domain/FinanceService';
import { ExpenseRepository } from '@/src/modules/finance/domain/ExpenseRepository';
import { VehicleRepository } from '@/src/modules/inventory/domain/VehicleRepository';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { Vehicle, Staff } from '@/src/shared/domain/types';

export interface MonthlyFinanceData {
  revenue: number;
  purchaseOutflow: number;
  carCosts: number;
  operatingExpenses: number;
  partnerPayouts: number;
  salaries: number;
  salesProfit: number;
  netProfit: number;
  netCashflow: number;
  totalOutflow: number;
  openingCashBalance: number;
  closingCashBalance: number;
  allExpenses: Expense[];
  allCarCosts: { carName: string; carCode: string; note: string; amount: number; date: string }[];
  salaryCalculations: SalaryCalculation[];
}

export class GetMonthlyFinance {
  constructor(
    private readonly expenseRepo: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly staffRepository: StaffRepository
  ) {}

  async execute(
    month: string,
    preloadedData?: {
      allOpExpenses?: Expense[];
      vehicles?: Vehicle[];
      staff?: Staff[];
      settings?: { total_capital: number } | null;
    }
  ): Promise<MonthlyFinanceData> {
    const [allOpExpenses, vehicles, staff, settings] = await Promise.all([
      preloadedData?.allOpExpenses ?? this.expenseRepo.getAll(),
      preloadedData?.vehicles ?? this.vehicleRepository.getAll(),
      preloadedData?.staff ?? this.staffRepository.getAll(),
      preloadedData?.settings !== undefined ? preloadedData.settings : this.expenseRepo.getCompanySettings()
    ]);
    const monthlyOpExpenses = allOpExpenses.filter((e: Expense) => e.date?.startsWith(month));
    
    const revenue = FinanceService.calculateMonthlyRevenue(vehicles, month);
    const purchaseOutflow = FinanceService.calculateMonthlyPurchaseOutflow(vehicles, month);
    const carCosts = FinanceService.calculateMonthlyCarCosts(vehicles, month);
    
    // Split expenses: Partner payouts vs Regular operating expenses
    const partnerPayouts = monthlyOpExpenses
      .filter((e: Expense) => e.category === 'Đối tác')
      .reduce((acc: number, e: Expense) => acc + (e.amount || 0), 0);
      
    const opExpensesTotal = monthlyOpExpenses
      .filter((e: Expense) => e.category !== 'Đối tác')
      .reduce((acc: number, e: Expense) => acc + (e.amount || 0), 0);
    
    const salaryCalculations = FinanceService.calculateMonthlySalaries(staff, vehicles, month);
    const salariesTotal = salaryCalculations.reduce((acc: number, s: SalaryCalculation) => acc + s.totalIncome, 0);
    
    const salesProfit = FinanceService.calculateMonthlySalesProfit(vehicles, month);
    const netProfit = salesProfit - opExpensesTotal - salariesTotal;
    
    const totalOutflow = purchaseOutflow + carCosts + opExpensesTotal + salariesTotal + partnerPayouts;
    const netCashflow = revenue - totalOutflow;

    const totalCapital = settings?.total_capital ?? 0;
    const openingCashBalance = FinanceService.calculateOpeningCashBalance(totalCapital, vehicles, allOpExpenses, month);
    const closingCashBalance = openingCashBalance + netCashflow;

    // Extract all car costs for this month
    const allCarCosts: MonthlyFinanceData['allCarCosts'] = [];
    vehicles.forEach((car: Vehicle) => {
      const monthCosts = (car.cost_history || []).filter((c: { date?: string }) => c.date?.startsWith(month));
      monthCosts.forEach((cost: { note?: string; amount: number; date: string }) => {
        allCarCosts.push({
          carName: car.name,
          carCode: car.code,
          note: cost.note || '',
          amount: cost.amount,
          date: cost.date
        });
      });
    });
    allCarCosts.sort((a, b) => b.date.localeCompare(a.date));

    return {
      revenue,
      purchaseOutflow,
      carCosts,
      operatingExpenses: opExpensesTotal,
      partnerPayouts,
      salaries: salariesTotal,
      salesProfit,
      netProfit,
      netCashflow,
      totalOutflow,
      openingCashBalance,
      closingCashBalance,
      allExpenses: monthlyOpExpenses,
      allCarCosts,
      salaryCalculations
    };
  }
}
