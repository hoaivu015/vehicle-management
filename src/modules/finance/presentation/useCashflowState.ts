import React, { useState, useMemo, useEffect } from 'react';
import { FinanceView, FinancePresenter } from './FinancePresenter';
import { MonthlyFinanceData } from '@/src/modules/finance/application/GetMonthlyFinance';
import { FinancialOverviewData } from '@/src/modules/finance/application/GetFinancialOverview';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { Expense } from '@/src/modules/finance/domain/ExpenseRepository';
import { ExpenseDTO, ExpenseSchema } from '@/src/shared/domain/schemas';
import { VehicleStatus } from '@/src/shared/domain/constants';



export interface JournalTransaction {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  category: string;
  type: 'inflow' | 'outflow';
  amount: number;
  vehicleId?: number | string;
  vehicleCode?: string;
  scope: 'sale' | 'purchase' | 'car_cost' | 'operating' | 'salary' | 'partner' | 'other_income';
  runningBalance: number;
  rawExpenseId?: string | number;
  editable?: boolean;
}

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

  // Unified Journal Transactions with Chronological Running Balance
  const { allJournalTransactions, filteredTransactions } = useMemo(() => {
    const rawItems: Array<{
      id: string;
      date: string;
      title: string;
      subtitle?: string;
      category: string;
      type: 'inflow' | 'outflow';
      amount: number;
      vehicleId?: number | string;
      vehicleCode?: string;
      scope: 'sale' | 'purchase' | 'car_cost' | 'operating' | 'salary' | 'partner' | 'other_income';
      rawExpenseId?: string | number;
      editable?: boolean;
    }> = [];

    // 1. Sale Inflows (Tiền khách cọc/thanh toán mua xe)
    vehicles.forEach(v => {
      (v.sale_payment_history || []).forEach((p, pIdx) => {
        if (p.date?.startsWith(filterMonth)) {
          rawItems.push({
            id: `sale-${v.id}-${pIdx}-${p.date}`,
            date: p.date,
            title: `Bán xe ${v.name}`,
            subtitle: `Mã xe: ${v.code}${v.seller ? ` • NV: ${v.seller}` : ''}`,
            category: 'Bán xe',
            type: 'inflow',
            amount: p.amount || 0,
            vehicleId: v.id,
            vehicleCode: v.code,
            scope: 'sale'
          });
        }
      });
    });

    // 2. Purchase Outflows (Tiền mua xe vào kho)
    vehicles.forEach(v => {
      (v.purchase_payment_history || []).forEach((p, pIdx) => {
        if (p.date?.startsWith(filterMonth)) {
          rawItems.push({
            id: `purchase-${v.id}-${pIdx}-${p.date}`,
            date: p.date,
            title: `Mua xe ${v.name}`,
            subtitle: `Mã xe: ${v.code}${v.buyer ? ` • NV mua: ${v.buyer}` : ''}`,
            category: 'Mua xe',
            type: 'outflow',
            amount: p.amount || 0,
            vehicleId: v.id,
            vehicleCode: v.code,
            scope: 'purchase'
          });
        }
      });
    });

    // 3. Vehicle Cost Outflows (Chi phí làm đẹp/sửa chữa xe)
    vehicles.forEach(v => {
      (v.cost_history || []).forEach((c, cIdx) => {
        if (c.date?.startsWith(filterMonth)) {
          rawItems.push({
            id: `cost-${v.id}-${cIdx}-${c.date}`,
            date: c.date,
            title: c.note || 'Chi phí xe',
            subtitle: `${v.name} (${v.code})`,
            category: 'Chi phí xe',
            type: 'outflow',
            amount: c.amount || 0,
            vehicleId: v.id,
            vehicleCode: v.code,
            scope: 'car_cost'
          });
        }
      });
    });

    // 4. Operating Expenses & Other Transactions
    (data?.allExpenses || []).forEach(exp => {
      const isPartner = exp.category === 'Đối tác';
      const isSalary = exp.category === 'Lương nhân sự' || exp.name.toLowerCase().includes('lương');
      rawItems.push({
        id: `exp-${exp.id}`,
        date: exp.date,
        title: exp.name,
        subtitle: exp.category || 'Vận hành',
        category: exp.category || 'Vận hành',
        type: 'outflow',
        amount: exp.amount || 0,
        scope: isPartner ? 'partner' : isSalary ? 'salary' : 'operating',
        rawExpenseId: exp.id,
        editable: true
      });
    });

    // Sort chronologically ascending to calculate running balance
    rawItems.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.id.localeCompare(b.id);
    });

    let currentBalance = data?.openingCashBalance || 0;
    const computedTransactions: JournalTransaction[] = rawItems.map(item => {
      if (item.type === 'inflow') {
        currentBalance += item.amount;
      } else {
        currentBalance -= item.amount;
      }
      return {
        ...item,
        runningBalance: currentBalance
      };
    });

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
    receivableDebts, totalReceivables, payableDebts, totalPayables,
    // Ledger & Accounting additions
    allJournalTransactions, filteredTransactions,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    typeFilter, setTypeFilter,
    recordUnifiedTransaction
  };
};

export type CashflowState = ReturnType<typeof useCashflowState>;


