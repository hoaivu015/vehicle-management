// Shared components for Vehicle Detail
import { InfoBox, FinancialBox, AlertBlock, ActivityItem, EmptyState } from '@/src/shared/design-system/DataDisplay';
import { EditRow } from '@/src/shared/design-system/FormElements';

export { InfoBox, FinancialBox, EditRow, AlertBlock, ActivityItem, EmptyState };

export const formatDate = (dateStr: string) => {
   if (!dateStr) return '---';
   return new Date(dateStr).toLocaleDateString('vi-VN');
};

