import { useMemo } from 'react';
import { SupabaseExpenseRepository } from '../modules/finance/infrastructure/SupabaseExpenseRepository';
import { SupabaseVehicleRepository } from '../modules/inventory/infrastructure/SupabaseVehicleRepository';
import { SupabaseStaffRepository } from '../modules/staff/infrastructure/SupabaseStaffRepository';
import { GetMonthlyFinance } from '../modules/finance/application/GetMonthlyFinance';
import { GetFinancialOverview } from '../modules/finance/application/GetFinancialOverview';
import { FinancePresenter } from '../modules/finance/presentation/FinancePresenter';

export const useFinance = () => {
  const financePresenter = useMemo(() => {
    const expenseRepo = new SupabaseExpenseRepository();
    const vehicleRepo = new SupabaseVehicleRepository();
    const staffRepo = new SupabaseStaffRepository();

    return new FinancePresenter(
      new GetMonthlyFinance(expenseRepo, vehicleRepo, staffRepo),
      new GetFinancialOverview(expenseRepo, vehicleRepo, staffRepo),
      expenseRepo,
      vehicleRepo,
      staffRepo
    );
  }, []);

  return { financePresenter };
};
