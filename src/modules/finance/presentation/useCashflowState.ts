import { useState, useMemo, useEffect } from 'react';
import { FinanceView, FinancePresenter } from '../FinancePresenter';
import { MonthlyFinanceData } from '../../application/GetMonthlyFinance';
import { FinancialOverviewData } from '../../application/GetFinancialOverview';
import { Vehicle } from '../../../../shared/domain/types';

export const useCashflowState = (presenter: FinancePresenter, userCode: string) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyFinanceData | null>(null);
  const [overview, setOverview] = useState<FinancialOverviewData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ name: '', amount: 0, category: 'Vận hành', date: new Date().toISOString().split('T')[0] });
  const [editingExpenseId, setEditingExpenseId] = useState<string | number | null>(null);
  const [tempCapital, setTempCapital] = useState(0);

  const allCarCosts = useMemo(() => {
    return vehicles.reduce((acc: any[], car) => {
      const monthCosts = car.cost_history?.filter((c: any) => c.date?.startsWith(filterMonth)) || [];
      monthCosts.forEach((cost: any) => acc.push({ ...cost, carName: car.name, carCode: car.code }));
      return acc;
    }, []).sort((a: any, b: any) => b.date.localeCompare(a.date));
  }, [vehicles, filterMonth]);

  const view: FinanceView = useMemo(() => ({
    setLoading,
    setMonthlyFinance: setData,
    setFinancialOverview: setOverview,
    setTotalCapital: setTempCapital,
    setVehicles: setVehicles,
    setStaff: setStaff,
    showError: (msg) => console.error(msg)
  }), []);

  useEffect(() => {
    presenter.attachView(view);
    presenter.loadFinanceData();
    presenter.subscribeToChanges();
    return () => presenter.detachView();
  }, [presenter, view]);

  const handleMonthChange = (month: string) => {
    setFilterMonth(month);
    presenter.setMonth(month);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpenseId) {
      presenter.updateExpense(editingExpenseId, expenseForm);
    } else {
      presenter.addExpense(expenseForm);
    }
    setShowExpenseModal(false);
    setEditingExpenseId(null);
    setExpenseForm({ name: '', amount: 0, category: 'Vận hành', date: new Date().toISOString().split('T')[0] });
  };

  const startEditExpense = (exp: any) => {
    setEditingExpenseId(exp.id);
    setExpenseForm({ 
      name: exp.name, 
      amount: exp.amount, 
      category: exp.category || 'Vận hành', 
      date: exp.date 
    });
    setShowExpenseModal(true);
  };

  return {
    loading, data, overview, vehicles, staff, filterMonth, showExpenseModal, setShowExpenseModal,
    showCapitalModal, setShowCapitalModal, expenseForm, setExpenseForm, editingExpenseId, setEditingExpenseId,
    tempCapital, setTempCapital, allCarCosts, handleMonthChange, handleSubmitExpense, startEditExpense
  };
};
