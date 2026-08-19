import React from 'react';
import { BaseCard, CardContentSection, SectionHeader } from '@/src/shared/design-system/BaseCard';
import { ActivityItem, EmptyState } from '@/src/shared/design-system/DataDisplay';
import { Vehicle } from '@/src/shared/domain/types';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { CheckCircle2, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

interface PayableDebtsListProps {
  debts: { vehicle: Vehicle; purchaseDebt: number }[];
  total: number;
  onVehicleClick?: (vehicleId: number | string) => void;
  isCompact?: boolean;
}

export const PayableDebtsList: React.FC<PayableDebtsListProps> = ({
  debts,
  total,
  onVehicleClick,
  isCompact = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.15 }}
      className="flex-1 w-full"
    >
      <BaseCard isCompact={isCompact} className="h-full bg-white/60 backdrop-blur-3xl border border-white/80">
        <CardContentSection isCompact={isCompact} className="flex flex-col h-full justify-between">
          <div>
            {/* Header standard with red accent color */}
            <SectionHeader accentColor="bg-red-500">
              NỢ PHẢI TRẢ (Accounts Payable)
            </SectionHeader>

            {/* Sum Display section with Wow premium style */}
            <div className="mb-6 p-4 sm:p-5 bg-red-50/60 rounded-[20px] border border-red-200/60 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                  <TrendingDown size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-800/60 leading-none block whitespace-nowrap">
                    Tổng nợ tiền xe
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-red-600 mt-1 leading-none whitespace-nowrap">
                    {formatCurrency(total)}
                  </h3>
                </div>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-red-700 bg-red-100/90 border border-red-200/80 px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap shadow-xs">
                {debts.length} xe
              </span>
            </div>

            {/* List render */}
            <div className="divide-y divide-hairline-soft md:max-h-[360px] md:overflow-y-auto overflow-visible pr-1 pb-2 render-boundary-isolated">
              {debts.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="ĐÃ TRẢ HẾT NỢ"
                  description="Tất cả các xe nhập về đã được thanh toán đầy đủ cho chủ cũ."
                  className="py-16"
                />
              ) : (
                debts.map(({ vehicle, purchaseDebt }, index) => {
                  const latestPayment = vehicle.purchase_payment_history && vehicle.purchase_payment_history.length > 0
                    ? vehicle.purchase_payment_history[vehicle.purchase_payment_history.length - 1]
                    : null;
                  const displayDate = latestPayment
                    ? formatDate(latestPayment.date)
                    : (vehicle.purchase_date ? formatDate(vehicle.purchase_date) : formatDate(vehicle.created_at));

                  return (
                    <motion.div
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.04 }}
                      whileHover={{ x: 4 }}
                      onClick={() => onVehicleClick?.(vehicle.id)}
                      className="cursor-pointer scroll-reveal-item"
                    >
                      <ActivityItem
                        date={displayDate}
                        title={vehicle.name}
                        subtitle={`Nhân viên nhập: ${vehicle.buyer || '—'}`}
                        amount={formatCurrency(purchaseDebt)}
                        amountType="expense"
                        category={vehicle.code}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </CardContentSection>
      </BaseCard>
    </motion.div>
  );
};
