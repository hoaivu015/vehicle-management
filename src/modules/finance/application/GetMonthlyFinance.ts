import { FinanceService, Expense, SalaryCalculation } from '@/src/modules/finance/domain/FinanceService';
import { ExpenseRepository } from '@/src/modules/finance/domain/ExpenseRepository';
import { VehicleRepository } from '@/src/modules/inventory/domain/VehicleRepository';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { Vehicle, Staff } from '@/src/shared/domain/types';

export interface MonthlyFinanceData {
  revenue: number;
  saleRevenue?: number;
  coinvestInflow?: number;
  otherInflows?: number;
  netRevenue?: number;
  purchaseOutflow: number;
  carCosts: number;
  operatingExpenses: number;
  partnerPayouts: number;
  paidPayrollOutflow?: number;
  depositRefundsOutflow?: number;
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

    // 1. SỔ CÁI GIAO DỊCH HỢP NHẤT TRONG THÁNG (Unified Virtual Ledger SSoT)
    const monthLedger = FinanceService.buildUnifiedLedger(vehicles, allOpExpenses, month);

    const inflows = monthLedger.filter(e => e.type === 'inflow');
    const outflows = monthLedger.filter(e => e.type === 'outflow');

    const totalInflow = inflows.reduce((sum, e) => sum + e.amount, 0);
    const totalOutflow = outflows.reduce((sum, e) => sum + e.amount, 0);
    const netCashflow = totalInflow - totalOutflow;

    // Chi tiết dòng tiền vào
    const saleRevenue = inflows
      .filter(e => e.scope === 'sale')
      .reduce((sum, e) => sum + e.amount, 0);

    const coinvestInflow = inflows
      .filter(e => e.scope === 'coinvest')
      .reduce((sum, e) => sum + e.amount, 0);

    const otherInflows = inflows
      .filter(e => e.scope === 'other_income')
      .reduce((sum, e) => sum + e.amount, 0);

    // Chi tiết dòng tiền ra
    const purchaseOutflow = outflows
      .filter(e => e.scope === 'purchase')
      .reduce((sum, e) => sum + e.amount, 0);

    const carCosts = outflows
      .filter(e => e.scope === 'car_cost')
      .reduce((sum, e) => sum + e.amount, 0);

    const partnerPayouts = outflows
      .filter(e => e.scope === 'partner')
      .reduce((sum, e) => sum + e.amount, 0);

    const paidPayrollOutflow = outflows
      .filter(e => e.scope === 'salary' || e.scope === 'advance')
      .reduce((sum, e) => sum + e.amount, 0);

    const depositRefundsOutflow = outflows
      .filter(e => e.scope === 'deposit_refund')
      .reduce((sum, e) => sum + e.amount, 0);

    const carCostReimbursements = monthlyOpExpenses
      .filter((e: Expense) => e.category === 'Chi phí xe' && !FinanceService.isInflowExpense(e))
      .reduce((acc: number, e: Expense) => acc + (e.amount || 0), 0);

    const generalOpExpenses = outflows
      .filter(e => e.scope === 'operating' && e.category !== 'Chi phí xe')
      .reduce((sum, e) => sum + e.amount, 0);

    const opExpensesTotal = generalOpExpenses + carCostReimbursements;
    const netRevenue = Math.max(0, saleRevenue - depositRefundsOutflow);

    // 2. HIỆU QUẢ KINH DOANH & LÃI LỖ (P&L - Accrual Basis)
    // generalOpExpenses được dùng cho P&L thay vì opExpensesTotal vì carCostReimbursements đã nằm trong total_cost của xe
    const salaryCalculations = FinanceService.calculateMonthlySalaries(staff, vehicles, month);
    const regularSalariesTotal = salaryCalculations.reduce((acc: number, s: SalaryCalculation) => acc + (s.regularIncome ?? (s.totalIncome - (s.coinvestProfitShare || 0))), 0);
    const totalSalariesAll = salaryCalculations.reduce((acc: number, s: SalaryCalculation) => acc + s.totalIncome, 0);
    
    const salesProfit = FinanceService.calculateMonthlySalesProfit(vehicles, month);
    const netProfit = salesProfit + otherInflows - generalOpExpenses - regularSalariesTotal;

    // 3. ĐỐI SOÁT SỐ DƯ TIỀN MẶT ĐẦU KỲ VÀ CUỐI KỲ (Reconciled Cash Balance)
    const totalCapital = settings?.total_capital ?? 0;
    const openingCashBalance = FinanceService.calculateOpeningCashBalance(totalCapital, vehicles, allOpExpenses, month);
    const closingCashBalance = openingCashBalance + netCashflow;

    // Trích xuất chi phí xe trong tháng
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
      revenue: totalInflow,
      saleRevenue,
      coinvestInflow,
      otherInflows,
      netRevenue,
      purchaseOutflow,
      carCosts,
      operatingExpenses: opExpensesTotal,
      partnerPayouts,
      paidPayrollOutflow,
      depositRefundsOutflow,
      salaries: totalSalariesAll,
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
