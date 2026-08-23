import React from 'react';
import { BaseCard, CardContentSection, SectionHeader } from '@/src/shared/design-system/BaseCard';
import { ActivityItem, EmptyState } from '@/src/shared/design-system/DataDisplay';
import { Vehicle } from '@/src/shared/domain/types';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { HandCoins, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export interface HeldPartnerCapitalItem {
  vehicle: Vehicle;
  coinvestAmount: number;
  refundableCapital?: number;
  partnerCode: string;
  isSold: boolean;
}

interface HeldPartnerCapitalListProps {
  items: HeldPartnerCapitalItem[];
  total: number;
  onVehicleClick?: (vehicleId: number | string) => void;
  isCompact?: boolean;
}

export const HeldPartnerCapitalList: React.FC<HeldPartnerCapitalListProps> = ({
  items,
  total,
  onVehicleClick,
  isCompact = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 100, damping: 18, delay: 0.2 }}
      className="flex-1 w-full"
    >
      <BaseCard isCompact={isCompact} className="h-full bg-white/60 backdrop-blur-3xl border border-white/80">
        <CardContentSection isCompact={isCompact} className="flex flex-col h-full justify-between">
          <div>
            {/* Header with indigo accent */}
            <SectionHeader accentColor="bg-indigo-500">
              VỐN ĐỐI TÁC ĐANG NẮM GIỮ (Co-investment Funds)
            </SectionHeader>

            {/* Sum Hero Card */}
            <div className="mb-6 p-4 sm:p-5 bg-indigo-50/60 rounded-[20px] border border-indigo-200/60 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                  <HandCoins size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800/60 leading-none block whitespace-nowrap">
                    Tổng vốn ngoài đang giữ
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-indigo-600 mt-1 leading-none whitespace-nowrap">
                    {formatCurrency(total)}
                  </h3>
                </div>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/90 border border-indigo-200/80 px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap shadow-xs">
                {items.length} khoản
              </span>
            </div>

            {/* List of Held Capital */}
            <div className="divide-y divide-hairline-soft md:max-h-[360px] md:overflow-y-auto overflow-visible pr-1 pb-2 render-boundary-isolated">
              {items.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="KHÔNG CÓ VỐN ĐỐI TÁC ĐANG GIỮ"
                  description="Hiện tại không có khoản vốn góp nào của đối tác đang ký quỹ tại showroom."
                  className="py-16"
                />
              ) : (
                items.map(({ vehicle, coinvestAmount, refundableCapital, partnerCode, isSold }, index) => {
                  const displayDate = vehicle.purchase_date ? formatDate(vehicle.purchase_date) : formatDate(vehicle.created_at);
                  const effectiveAmount = refundableCapital !== undefined ? refundableCapital : coinvestAmount;
                  const hasLossDeduction = isSold && effectiveAmount < coinvestAmount;
                  const statusLabel = isSold 
                    ? (hasLossDeduction ? `Đã bán (Khấu trừ lỗ: ${formatCurrency(effectiveAmount)})` : 'Đã bán (Giữ ký quỹ)') 
                    : 'Đang lưu kho';

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
                        subtitle={`Đối tác: #${partnerCode || 'ĐT'} • ${statusLabel}`}
                        amount={formatCurrency(effectiveAmount)}
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
