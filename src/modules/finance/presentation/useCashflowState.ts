import React, { useState, useMemo, useEffect } from 'react';
import { FinanceView, FinancePresenter } from './FinancePresenter';
import { MonthlyFinanceData } from '@/src/modules/finance/application/GetMonthlyFinance';
import { FinancialOverviewData } from '@/src/modules/finance/application/GetFinancialOverview';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { Expense } from '@/src/modules/finance/domain/ExpenseRepository';
import { ExpenseDTO, ExpenseSchema } from '@/src/shared/domain/schemas';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { FinanceService, UnifiedLedgerEntry } from '@/src/modules/finance/domain/FinanceService';
import { calculateVehicleFinancials, calcVehicleReceivableDebt, calcVehiclePayableDebt } from '@/src/shared/utils/vehicle_calculations';

export type JournalTransaction = UnifiedLedgerEntry & {
  runningBalance: number;
};

export const useCashflowState = (presenter: FinancePresenter) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyFinanceData | null>(null);
  const [overview, setOverview] = useState<FinancialOverviewData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [tempCapital, setTempCapital] = useState(0);
  const [isEditingCapital, setIsEditingCapital] = useState(false);

  // Filters for Accountant Ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');

  const [expenseForm, setExpenseForm] = useState<ExpenseDTO>({
    name: '',
    amount: 0,
    category: 'Vận hành',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingExpenseId, setEditingExpenseId] = useState<string | number | null>(null);

  const allCarCosts = data?.allCarCosts || [];

  // Derived state: Receivable Debts (Nợ phải thu - Khách nợ khi chốt bán) theo SSoT
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

  // Derived state: Held Partner Capital (Tiền vốn ngoài/đối tác đang nắm giữ)
  const heldPartnerCapitals = useMemo(() => {
    return vehicles
      .filter(v => v.is_coinvested && (v.coinvest_amount || 0) > 0 && !v.partner_capital_repaid)
      .map(v => {
        const fin = calculateVehicleFinancials(v);
        return {
          vehicle: v,
          coinvestAmount: v.coinvest_amount || 0,
          refundableCapital: fin.refundablePartnerCapital || v.coinvest_amount || 0,
          partnerCode: v.coinvestor_code || '',
          isSold: v.status === VehicleStatus.SOLD
        };
      });
  }, [vehicles]);

  const totalHeldPartnerCapital = useMemo(() => {
    return heldPartnerCapitals.reduce((sum, item) => sum + item.refundableCapital, 0);
  }, [heldPartnerCapitals]);

  // Unified Journal Transactions with Chronological Running Balance (SSoT from FinanceService)
  const { allJournalTransactions, filteredTransactions } = useMemo(() => {
    const rawItems = FinanceService.buildUnifiedLedger(vehicles, data?.allExpenses || [], filterMonth);

    // Sort chronologically ascending to calculate running balance
    rawItems.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.id.localeCompare(b.id);
    });

    const computedTransactions = rawItems.reduce<{ list: JournalTransaction[]; balance: number }>(
      (acc, item) => {
        const nextBalance = item.type === 'inflow' ? acc.balance + item.amount : acc.balance - item.amount;
        acc.list.push({
          ...item,
          runningBalance: nextBalance
        });
        acc.balance = nextBalance;
        return acc;
      },
      { list: [], balance: data?.openingCashBalance || 0 }
    ).list;

    // Sort descending (newest first) for UI display
    const newestFirst = [...computedTransactions].reverse();

    // Filter transactions
    const filtered = newestFirst.filter(tx => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(q);
        const matchSub = (tx.subtitle || '').toLowerCase().includes(q);
        const matchCat = tx.category.toLowerCase().includes(q);
        const matchAmount = tx.amount.toString().includes(q);
        const matchCode = (tx.vehicleCode || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchCat && !matchAmount && !matchCode) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL') {
        if (tx.category !== selectedCategory) return false;
      }

      // 3. Type Filter
      if (typeFilter === 'INFLOW' && tx.type !== 'inflow') return false;
      if (typeFilter === 'OUTFLOW' && tx.type !== 'outflow') return false;

      return true;
    });

    return {
      allJournalTransactions: newestFirst,
      filteredTransactions: filtered
    };
  }, [vehicles, data, filterMonth, searchQuery, selectedCategory, typeFilter]);

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

  const recordUnifiedTransaction = async (command: import('@/src/shared/domain/schemas').UnifiedExpenseCommand): Promise<boolean> => {
    try {
      await presenter.recordExpense(command);
      return true;
    } catch {
      return false;
    }
  };

  return {
    loading, data, overview, vehicles, staff, filterMonth, showExpenseModal, setShowExpenseModal,
    showCapitalModal, setShowCapitalModal, expenseForm, setExpenseForm, editingExpenseId, setEditingExpenseId,
    tempCapital, setTempCapital, isEditingCapital, setIsEditingCapital, allCarCosts, handleMonthChange, handleSubmitExpense, startEditExpense, errors,
    receivableDebts, totalReceivables, payableDebts, totalPayables, heldPartnerCapitals, totalHeldPartnerCapital,
    // Ledger & Accounting additions
    allJournalTransactions, filteredTransactions,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    typeFilter, setTypeFilter,
    recordUnifiedTransaction
  };
};

export type CashflowState = ReturnType<typeof useCashflowState>;


