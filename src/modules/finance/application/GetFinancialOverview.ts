import { Vehicle, Staff } from '@/src/shared/domain/types';
import { FinanceService } from '@/src/modules/finance/domain/FinanceService';
import { ExpenseRepository, Expense } from '@/src/modules/finance/domain/ExpenseRepository';
import { VehicleStatus, INVENTORY_CONSTANTS } from '@/src/shared/domain/constants';
import { isVehicleAging, calculateVehicleFinancials, calculateActiveSellingDays } from '@/src/shared/utils/vehicle_calculations';
import { VehicleRepository } from '@/src/modules/inventory/domain/VehicleRepository';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { calcCompanyMonthlyNetProfit } from '@/src/shared/utils/financial_formulas';

export interface ProfitComparison {
  value: number;
  change: number;
  isIncrease: boolean;
}

export interface MonthlyTrendPoint {
  month: string;
  label: string;
  revenue: number;
  grossProfit: number;
  netProfit: number;
  finalNetProfit: number;
  soldCount: number;
  boughtCount: number;
}

export interface ExpenseBreakdownItem {
  id: string;
  name: string;
  amount: number;
  percent: number;
  color: string;
}

export interface SalesLeaderboardItem {
  staffId: string;
  staffName: string;
  staffCode: string;
  soldCount: number;
  totalRevenue: number;
  grossProfitContribution: number;
  commission: number;
}

export interface FinancialOverviewData {
  monthlyRevenue: number;
  inventoryCount: number;
  inventoryValue: number;
  availableCash: number;
  totalCapital: number;
  grossProfit: number;
  netProfit: number;
  finalNetProfit: number;
  profitComparisons: {
    prevMonth: ProfitComparison;
    prevQuarter: ProfitComparison;
    prevYear: ProfitComparison;
  };
  soldCount: number;
  boughtCount: number;
  agingCount: number;
  averageProfitPerCar: number;
  averageDSI: number;
  profitMarginPercent: number;
  monthlyTrend12M: MonthlyTrendPoint[];
  expenseBreakdown: ExpenseBreakdownItem[];
  salesLeaderboard: SalesLeaderboardItem[];
  recentActivities: {
    type: 'purchase' | 'sale' | 'alert';
    user: string;
    action: string;
    target: string;
    date: string;
    vCode: string;
  }[];
  weeklyCashflow: { name: string; thu: number; chi: number }[];
}

export class GetFinancialOverview {
  constructor(
    private readonly expenseRepo: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly staffRepository: StaffRepository
  ) {}

  async execute(
    month: string,
    preloadedData?: {
      settings?: { total_capital: number };
      vehicles?: Vehicle[];
      staff?: Staff[];
      allOpExpenses?: Expense[];
    }
  ): Promise<FinancialOverviewData> {
    const [settings, vehicles, staff, allOpExpenses] = await Promise.all([
      preloadedData?.settings ?? this.expenseRepo.getCompanySettings(),
      preloadedData?.vehicles ?? this.vehicleRepository.getAll(),
      preloadedData?.staff ?? this.staffRepository.getAll(),
      preloadedData?.allOpExpenses ?? this.expenseRepo.getAll()
    ]);
    const totalCapital = settings.total_capital || 0;

    const inventoryVehicles = vehicles.filter(v => 
      v.status !== VehicleStatus.SOLD && v.status !== VehicleStatus.DEPOSIT_BUY
    );
    const inventoryValue = inventoryVehicles.reduce((acc, v) => {
      const fin = calculateVehicleFinancials(v);
      return acc + fin.purchasePrice + fin.totalCost;
    }, 0);
    
    // Correct Cash Balance Calculation
    const availableCash = FinanceService.calculateTotalCashBalance(
      totalCapital,
      vehicles,
      allOpExpenses
    );

    const monthLedger = FinanceService.buildUnifiedLedger(vehicles, allOpExpenses, month);
    const monthlyRevenue = monthLedger.filter(e => e.scope === 'sale').reduce((sum, e) => sum + e.amount, 0);
    const otherInflows = monthLedger.filter(e => e.type === 'inflow' && e.scope === 'other_income').reduce((sum, e) => sum + e.amount, 0);
    const monthlySalesProfit = FinanceService.calculateMonthlySalesProfit(vehicles, month);
    
    // Operating Expenses for P&L (excluding salary, advance, partner payouts & car costs already in COGS)
    const opExpensesTotal = monthLedger
      .filter(e => e.scope === 'operating' && e.category !== 'Chi phí xe')
      .reduce((acc, e) => acc + e.amount, 0);
    
    // Staff Salaries for the Month (Regular Compensation excluding Co-invest Profit Shares already deducted in Sales Profit)
    const salaryCalculations = FinanceService.calculateMonthlySalaries(staff, vehicles, month);
    const totalRegularSalaries = salaryCalculations.reduce((acc, s) => acc + (s.regularIncome ?? (s.totalIncome - (s.coinvestProfitShare || 0))), 0);
    
    const grossProfit = monthlySalesProfit;
    const netProfit = grossProfit + otherInflows - opExpensesTotal;
    const finalNetProfit = calcCompanyMonthlyNetProfit(monthlySalesProfit, opExpensesTotal, totalRegularSalaries, otherInflows);

    // Counts
    const soldVehiclesInMonth = vehicles.filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(month));
    const boughtVehiclesInMonth = vehicles.filter(v => v.purchase_date?.startsWith(month));

    // Aging logic
    const agingCount = inventoryVehicles.filter(v => 
      isVehicleAging(v, INVENTORY_CONSTANTS.AGING_THRESHOLD_DAYS)
    ).length;

    // Recent Activities from Status History AND Payment History
    const statusActivities = vehicles.flatMap(v => (v.history || []).map(h => ({
      type: (h.status === VehicleStatus.IN_STOCK ? 'purchase' : 
            h.status === VehicleStatus.SOLD ? 'sale' : 'alert') as 'purchase' | 'sale' | 'alert',
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
        type: 'purchase' as const,
        user: p.receiver || 'Showroom',
        action: `đã chi trả mua xe (${(p.amount / 1000000).toFixed(1)}M)`,
        target: v.name,
        date: p.date,
        vCode: v.code
      })),
      ...(v.sale_payment_history || []).map(p => ({
        type: 'sale' as const,
        user: p.receiver || 'Showroom',
        action: `đã thu tiền bán xe (${(p.amount / 1000000).toFixed(1)}M)`,
        target: v.name,
        date: p.date,
        vCode: v.code
      }))
    ]);

    const recentActivities = [...statusActivities, ...paymentActivities]
      .filter(a => a.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const weeklyCashflow = FinanceService.calculateWeeklyCashflow(vehicles, month, allOpExpenses);

    // Historical Comparisons
    const prevMonthStr = this.subtractMonths(month, 1);
    const prevQuarterStr = this.subtractMonths(month, 3);
    const prevYearStr = this.subtractMonths(month, 12);

    const prevMonthProfit = this.calculateNetProfitForMonth(prevMonthStr, vehicles, allOpExpenses, staff);
    const prevQuarterProfit = this.calculateNetProfitForMonth(prevQuarterStr, vehicles, allOpExpenses, staff);
    const prevYearProfit = this.calculateNetProfitForMonth(prevYearStr, vehicles, allOpExpenses, staff);

    const calculateComparison = (current: number, previous: number): ProfitComparison => {
      const change = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / Math.abs(previous)) * 100;
      return {
        value: previous,
        change: Math.abs(change),
        isIncrease: change >= 0
      };
    };

    // 12-Month Historical Trend Series
    const monthlyTrend12M: MonthlyTrendPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const mStr = this.subtractMonths(month, i);
      const mLedger = FinanceService.buildUnifiedLedger(vehicles, allOpExpenses, mStr);
      const mRevenue = mLedger.filter(e => e.scope === 'sale').reduce((sum, e) => sum + e.amount, 0);
      const mOtherInflows = mLedger.filter(e => e.type === 'inflow' && e.scope === 'other_income').reduce((sum, e) => sum + e.amount, 0);
      const mSalesProfit = FinanceService.calculateMonthlySalesProfit(vehicles, mStr);
      const mOpExpenses = mLedger
        .filter(e => e.scope === 'operating' && e.category !== 'Chi phí xe')
        .reduce((sum, e) => sum + e.amount, 0);
      const mSalaries = FinanceService.calculateMonthlySalaries(staff, vehicles, mStr).reduce((sum, s) => sum + (s.regularIncome ?? (s.totalIncome - (s.coinvestProfitShare || 0))), 0);
      const mFinalNet = calcCompanyMonthlyNetProfit(mSalesProfit, mOpExpenses, mSalaries, mOtherInflows);
      const mSoldCount = vehicles.filter(v => v.status === VehicleStatus.SOLD && v.sale_date?.startsWith(mStr)).length;
      const mBoughtCount = vehicles.filter(v => v.purchase_date?.startsWith(mStr)).length;

      const [, m] = mStr.split('-');
      monthlyTrend12M.push({
        month: mStr,
        label: `T${m}`,
        revenue: mRevenue,
        grossProfit: mSalesProfit,
        netProfit: mSalesProfit + mOtherInflows - mOpExpenses,
        finalNetProfit: mFinalNet,
        soldCount: mSoldCount,
        boughtCount: mBoughtCount
      });
    }

    // Expense Breakdown for the Month
    const monthlyCarCosts = FinanceService.calculateMonthlyCarCosts(vehicles, month, true);
    const monthlyCommissions = salaryCalculations.reduce((acc, s) => acc + (s.salesCommission || 0) + (s.buyingCommission || 0) + (s.buyingBonus || 0), 0);
    const monthlyBaseSalaries = salaryCalculations.reduce((acc, s) => acc + (s.baseSalary || 0), 0);
    const totalOutflowExpenses = monthlyCarCosts + monthlyCommissions + opExpensesTotal + monthlyBaseSalaries;

    const expenseBreakdown: ExpenseBreakdownItem[] = [
      {
        id: 'operating',
        name: 'Vận hành Showroom',
        amount: opExpensesTotal,
        percent: totalOutflowExpenses > 0 ? Math.round((opExpensesTotal / totalOutflowExpenses) * 100) : 0,
        color: '#65676B'
      },
      {
        id: 'car_costs',
        name: 'Làm đẹp & Hoàn thiện xe',
        amount: monthlyCarCosts,
        percent: totalOutflowExpenses > 0 ? Math.round((monthlyCarCosts / totalOutflowExpenses) * 100) : 0,
        color: '#0099FF'
      },
      {
        id: 'base_salaries',
        name: 'Lương cơ bản nhân sự',
        amount: monthlyBaseSalaries,
        percent: totalOutflowExpenses > 0 ? Math.round((monthlyBaseSalaries / totalOutflowExpenses) * 100) : 0,
        color: '#1877F2'
      },
      {
        id: 'commissions',
        name: 'Hoa hồng & Thưởng',
        amount: monthlyCommissions,
        percent: totalOutflowExpenses > 0 ? Math.round((monthlyCommissions / totalOutflowExpenses) * 100) : 0,
        color: '#F7B125'
      }
    ];

    // Sales Leaderboard for the Month
    const salesLeaderboard: SalesLeaderboardItem[] = staff
      .map(s => {
        const staffSoldCars = vehicles.filter(v => {
          if (v.status !== VehicleStatus.SOLD || !v.sale_date?.startsWith(month) || !v.seller) return false;
          const sellerLower = v.seller.trim().toLowerCase();
          return (s.code && sellerLower === s.code.trim().toLowerCase()) || (s.name && sellerLower === s.name.trim().toLowerCase());
        });
        const staffRevenue = staffSoldCars.reduce((acc, v) => acc + (v.sale_price || 0), 0);
        const staffProfit = staffSoldCars.reduce((acc, v) => {
          const fin = calculateVehicleFinancials(v);
          return acc + (fin.grossProfit - (fin.partnerProfitShare || 0));
        }, 0);
        const sCal = salaryCalculations.find(sc => sc.staffId === String(s.id));

        return {
          staffId: String(s.id),
          staffName: s.name,
          staffCode: s.code || '',
          soldCount: staffSoldCars.length,
          totalRevenue: staffRevenue,
          grossProfitContribution: staffProfit,
          commission: sCal?.salesCommission || 0
        };
      })
      .filter(item => item.soldCount > 0 || item.commission > 0)
      .sort((a, b) => b.grossProfitContribution - a.grossProfitContribution || b.soldCount - a.soldCount);

    // Advanced Metrics
    const averageProfitPerCar = soldVehiclesInMonth.length > 0 ? Math.round(grossProfit / soldVehiclesInMonth.length) : 0;
    const averageDSI = inventoryVehicles.length > 0 
      ? Math.round(inventoryVehicles.reduce((acc, v) => {
          const activeDays = v.days !== undefined ? v.days : calculateActiveSellingDays(v);
          return acc + activeDays;
        }, 0) / inventoryVehicles.length)
      : 0;
    const contractualRevenue = FinanceService.calculateMonthlyContractRevenue(vehicles, month);
    const profitMarginPercent = contractualRevenue > 0 
      ? Math.round((grossProfit / contractualRevenue) * 100) 
      : (monthlyRevenue > 0 ? Math.round((grossProfit / monthlyRevenue) * 100) : 0);

    return {
      monthlyRevenue,
      inventoryCount: inventoryVehicles.length,
      inventoryValue,
      availableCash,
      totalCapital,
      grossProfit,
      netProfit,
      finalNetProfit,
      profitComparisons: {
        prevMonth: calculateComparison(finalNetProfit, prevMonthProfit),
        prevQuarter: calculateComparison(finalNetProfit, prevQuarterProfit),
        prevYear: calculateComparison(finalNetProfit, prevYearProfit)
      },
      soldCount: soldVehiclesInMonth.length,
      boughtCount: boughtVehiclesInMonth.length,
      agingCount,
      averageProfitPerCar,
      averageDSI,
      profitMarginPercent,
      monthlyTrend12M,
      expenseBreakdown,
      salesLeaderboard,
      recentActivities,
      weeklyCashflow
    };
  }

  private calculateNetProfitForMonth(
    month: string,
    vehicles: Vehicle[],
    allOpExpenses: import('../domain/FinanceService').Expense[],
    staff: import('../../../shared/domain/types').Staff[]
  ): number {
    const monthlySalesProfit = FinanceService.calculateMonthlySalesProfit(vehicles, month);
    const mLedger = FinanceService.buildUnifiedLedger(vehicles, allOpExpenses, month);
    const mOtherInflows = mLedger.filter(e => e.type === 'inflow' && e.scope === 'other_income').reduce((sum, e) => sum + e.amount, 0);
    const opExpensesTotal = mLedger
      .filter(e => e.scope === 'operating' && e.category !== 'Chi phí xe')
      .reduce((acc, e) => acc + e.amount, 0);
    const salaryCalculations = FinanceService.calculateMonthlySalaries(staff, vehicles, month);
    const totalRegularSalaries = salaryCalculations.reduce((acc, s) => acc + (s.regularIncome ?? (s.totalIncome - (s.coinvestProfitShare || 0))), 0);
    
    return calcCompanyMonthlyNetProfit(monthlySalesProfit, opExpensesTotal, totalRegularSalaries, mOtherInflows);
  }

  private subtractMonths(monthStr: string, months: number): string {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1 - months, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
}
