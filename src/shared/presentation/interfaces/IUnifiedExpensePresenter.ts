import { UnifiedExpenseCommand } from '../../domain/schemas';

export interface IUnifiedExpensePresenter {
  recordExpense(command: UnifiedExpenseCommand): Promise<void>;
}
