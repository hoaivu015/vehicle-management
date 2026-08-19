import React from 'react';
import { BaseCard, CardContentSection, SectionHeader } from '@/src/shared/design-system/BaseCard';
import { ActivityItem, EmptyState } from '@/src/shared/design-system/DataDisplay';
import { Vehicle } from '@/src/shared/domain/types';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface ReceivableDebtsListProps {
  debts: { vehicle: Vehicle; saleDebt: number }[];
  total: number;
  onVehicleClick?: (vehicleId: number | string) => void;
  isCompact?: boolean;
}

export const ReceivableDebtsList: React.FC<ReceivableDebtsListProps> = ({
  debts,
  total,
  onVehicleClick,
  isCompact = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.1 }}
      className="flex-1 w-full"
    >
      <BaseCard isCompact={isCompact} className="h-full bg-white/60 backdrop-blur-3xl border border-white/80">
        <CardContentSection isCompact={isCompact} className="flex flex-col h-full justify-between">
          <div>
            {/* Header standard with emerald accent color */}
            <SectionHeader accentColor="bg-emerald-500">
              NỢ PHẢI THU (Accounts Receivable)
            </SectionHeader>

            {/* Sum Display section with Wow premium style */}
            <div className="mb-6 p-4 sm:p-5 bg-emerald-50/60 rounded-[20px] border border-emerald-200/60 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                  <TrendingUp size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800/60 leading-none block whitespace-nowrap">
                    Tổng công nợ phải thu
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-600 mt-1 leading-none whitespace-nowrap">
                    {formatCurrency(total)}
                  </h3>
                </div>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/90 border border-emerald-200/80 px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap shadow-xs">
                {debts.length} xe
              </span>
            </div>

            {/* List render */}
            <div className="divide-y divide-hairline-soft md:max-h-[360px] md:overflow-y-auto overflow-visible pr-1 pb-2 render-boundary-isolated">
              {debts.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="ĐÃ THU HẾT CÔNG NỢ"
                  description="Tất cả các xe được bàn giao đã thu đủ tiền từ khách hàng."
                  className="py-16"
                />
              ) : (
                debts.map(({ vehicle, saleDebt }, index) => {
                  const latestPayment = vehicle.sale_payment_history && vehicle.sale_payment_history.length > 0
                    ? vehicle.sale_payment_history[vehicle.sale_payment_history.length - 1]
                    : null;
                  const displayDate = vehicle.sale_date
                    ? formatDate(vehicle.sale_date)
                    : (latestPayment ? formatDate(latestPayment.date) : formatDate(vehicle.created_at));

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
                        subtitle={`Nhân viên bán: ${vehicle.seller || '—'}`}
                        amount={formatCurrency(saleDebt)}
                        amountType="income"
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
