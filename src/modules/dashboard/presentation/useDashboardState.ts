import { useState, useEffect, useMemo } from 'react';
import { FinancePresenter, FinanceView } from '@/src/modules/finance/presentation/FinancePresenter';
import { FinancialOverviewData } from '@/src/modules/finance/application/GetFinancialOverview';
import { MonthlyFinanceData } from '@/src/modules/finance/application/GetMonthlyFinance';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { calcVehicleReceivableDebt, calcVehiclePayableDebt } from '@/src/shared/utils/vehicle_calculations';

export const useDashboardState = (presenter: FinancePresenter) => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<FinancialOverviewData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinanceData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const view: FinanceView = useMemo(() => ({
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
    setMonthlyFinance: setMonthlyData,
    setFinancialOverview: setOverview,
    setTotalCapital: () => { },
    setVehicles: setVehicles,
    setStaff: setStaff,
    showError: (msg) => console.error(msg)
  }), []);

  useEffect(() => {
    presenter.attachView(view);
    presenter.loadFinanceData();
    presenter.subscribeToChanges();

    return () => {
      presenter.detachView();
    };
  }, [presenter, view]);

  // Derived state: Receivable Debts (Nợ phải thu - Khách nợ) theo SSoT
  const receivableDebts = useMemo(() => {
    return vehicles
      .map(v => {
        const saleDebt = calcVehicleReceivableDebt(v);
        return { vehicle: v, saleDebt };
      })
      .filter(item => item.saleDebt > 0);
  }, [vehicles]);

  const totalReceivables = useMemo(() => {
    return receivableDebts.reduce((sum, item) => sum + item.saleDebt, 0);
  }, [receivableDebts]);

  // Derived state: Payable Debts (Nợ phải trả - Showroom nợ chủ cũ/NPP) theo SSoT
  const payableDebts = useMemo(() => {
    return vehicles
      .map(v => {
        const purchaseDebt = calcVehiclePayableDebt(v);
        return { vehicle: v, purchaseDebt };
      })
      .filter(item => item.purchaseDebt > 0);
  }, [vehicles]);

  const totalPayables = useMemo(() => {
    return payableDebts.reduce((sum, item) => sum + item.purchaseDebt, 0);
  }, [payableDebts]);

  const handleMonthChange = (val: string) => {
    setFilterMonth(val);
    presenter.setMonth(val);
  };

  return {
    loading,
    overview,
    monthlyData,
    vehicles,
    staff,
    filterMonth,
    handleMonthChange,
    receivableDebts,
    totalReceivables,
    payableDebts,
    totalPayables
  };
};

export type DashboardState = ReturnType<typeof useDashboardState>;
