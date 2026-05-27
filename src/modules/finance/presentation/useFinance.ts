import { useMemo } from 'react';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';

export const useFinance = () => {
  const { createFinancePresenter } = useDependencies();

  const financePresenter = useMemo(() => {
    return createFinancePresenter();
  }, [createFinancePresenter]);

  return { financePresenter };
};
