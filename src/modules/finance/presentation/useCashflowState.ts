import { useState, useMemo, useEffect } from 'react';
import { FinanceView, FinancePresenter } from './FinancePresenter';
import { MonthlyFinanceData } from '@/src/modules/finance/application/GetMonthlyFinance';
import { FinancialOverviewData } from '@/src/modules/finance/application/GetFinancialOverview';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { Expense } from '@/src/modules/finance/domain/ExpenseRepository';
import { ExpenseDTO, ExpenseSchema } from '@/src/shared/domain/schemas';
import { VehicleStatus } from '@/src/shared/domain/constants';



export const useCashflowState = (presenter: FinancePresenter) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyFinanceData | null>(null);
  const [overview, setOverview] = useState<FinancialOverviewData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState<ExpenseDTO>({
    name: '',
    amount: 0,
    category: 'Vận hành',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingExpenseId, setEditingExpenseId] = useState<string | number | null>(null);
  const [tempCapital, setTempCapital] = useState(0);
  const [isEditingCapital, setIsEditingCapital] = useState(false);

  const allCarCosts = data?.allCarCosts || [];

  // Derived state: Receivable Debts (Nợ phải thu - Khách nợ)
  const receivableDebts = useMemo(() => {
    return vehicles
      .map(v => {
        const isSalePhase = [
          VehicleStatus.DEPOSIT_SALE,
          VehicleStatus.BANK_DEPOSIT,
          VehicleStatus.BANK_CONFIRMED,
          VehicleStatus.SOLD
        ].includes(v.status);
        const saleDebt = isSalePhase ? (v.sale_price || 0) - (v.received_amount || 0) : 0;
        return { vehicle: v, saleDebt };
      })
      .filter(item => item.saleDebt > 0);
  }, [vehicles]);

  const totalReceivables = useMemo(() => {
    return receivableDebts.reduce((sum, item) => sum + item.saleDebt, 0);
  }, [receivableDebts]);

  // Derived state: Payable Debts (Nợ phải trả - Showroom nợ chủ cũ/NPP)
  const payableDebts = useMemo(() => {
    return vehicles
      .map(v => {
        const purchaseDebt = v.purchase_price - (v.purchase_paid_amount || 0);
        return { vehicle: v, purchaseDebt };
      })
      .filter(item => item.purchaseDebt > 0);
  }, [vehicles]);

  const totalPayables = useMemo(() => {
    return payableDebts.reduce((sum, item) => sum + item.purchaseDebt, 0);
  }, [payableDebts]);

  const view: FinanceView = useMemo(() => ({
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
    setMonthlyFinance: setData,
    setFinancialOverview: setOverview,
    setTotalCapital: (cap) => !isEditingCapital && setTempCapital(cap),
    setVehicles: setVehicles,
    setStaff: setStaff,
    showError: (msg) => console.error(msg)
  }), [isEditingCapital]);

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

  const handleSubmitExpense = (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});

    // Zod Boundary (L6)
    const result = ExpenseSchema.safeParse(expenseForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingExpenseId) {
      presenter.updateExpense(editingExpenseId, result.data);
    } else {
      presenter.addExpense({
        ...result.data,
        created_at: new Date().toISOString()
      });
    }
    setShowExpenseModal(false);
    setEditingExpenseId(null);
    setExpenseForm({ name: '', amount: 0, category: 'Vận hành', date: new Date().toISOString().split('T')[0] });
  };

  const startEditExpense = (exp: Expense) => {
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
    tempCapital, setTempCapital, isEditingCapital, setIsEditingCapital, allCarCosts, handleMonthChange, handleSubmitExpense, startEditExpense, errors,
    receivableDebts, totalReceivables, payableDebts, totalPayables
  };
};

