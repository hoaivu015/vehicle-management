import React, { useState, useMemo } from 'react';
import { useActionResponse } from '../useActionResponse';
import { UnifiedExpenseCommandSchema, UnifiedExpenseCommand } from '../../domain/schemas';
import { useDependencies } from '../../ioc/DependencyContext';
import { IUnifiedExpensePresenter } from '../interfaces/IUnifiedExpensePresenter';

export interface UseUnifiedExpenseProps {
  scope: 'showroom' | 'vehicle' | 'staff' | 'personal';
  staffId?: string | number;
  vehicleId?: string | number;
  onSuccess?: () => void;
}

export const useUnifiedExpense = ({ scope, staffId, vehicleId, onSuccess }: UseUnifiedExpenseProps) => {
  const { createFinancePresenter, createStaffPresenter, createInventoryPresenter } = useDependencies();
  const { executeAction, isSubmitting } = useActionResponse();

  const [form, setForm] = useState<Partial<UnifiedExpenseCommand>>({
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: scope === 'vehicle' ? 'vehicle' : 'operating',
    category: 'Vận hành',
    staffId: staffId ? String(staffId) : undefined,
    vehicleId: vehicleId ? String(vehicleId) : undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Resolve appropriate presenter for the scope
  const presenter = useMemo<IUnifiedExpensePresenter>(() => {
    if (scope === 'showroom') return createFinancePresenter();
    if (scope === 'vehicle') return createInventoryPresenter();
    return createStaffPresenter(); // staff & personal
  }, [scope, createFinancePresenter, createStaffPresenter, createInventoryPresenter]);

  // 2. Main submission handler
  const submitExpense = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});

    const commandData = {
      ...form,
      staffId: staffId || form.staffId,
      vehicleId: vehicleId || form.vehicleId,
    };

    // Zod Boundary Validation (L6)
    const parsed = UnifiedExpenseCommandSchema.safeParse(commandData);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Unified Action Pattern (L8)
    await executeAction(
      async () => {
        await presenter.recordExpense(parsed.data);
      },
      {
        successMessage: 'Ghi nhận chi phí thành công!',
        onSuccess: () => {
          resetForm();
          if (onSuccess) onSuccess();
        }
      }
    );
  };

  const resetForm = () => {
    setForm({
      name: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: scope === 'vehicle' ? 'vehicle' : 'operating',
      category: 'Vận hành',
      staffId: staffId ? String(staffId) : undefined,
      vehicleId: vehicleId ? String(vehicleId) : undefined,
    });
    setErrors({});
  };

  return {
    form,
    setForm,
    errors,
    isSubmitting,
    submitExpense,
    resetForm
  };
};
