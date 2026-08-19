import React from 'react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { DollarSign, Calendar, FileText, Sparkles, TrendingDown } from 'lucide-react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { SectionHeader } from '@/src/shared/design-system/BaseCard';
import { formatCurrency } from '@/src/shared/utils/currency';
import { haptics } from '@/src/shared/utils/haptics';
import { ExpenseDTO } from '@/src/shared/domain/schemas';
import { motion } from 'motion/react';

export interface ShowroomExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: ExpenseDTO;
  setForm: React.Dispatch<React.SetStateAction<ExpenseDTO>>;
  onSubmit: (e?: React.FormEvent) => void;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
}

const SHOWROOM_EXPENSE_PRESETS = [
  { label: '💡 Điện / Nước / Net', category: 'Tiền điện/nước', name: 'Tiền điện, nước, internet' },
  { label: '📢 Marketing & QC', category: 'Marketing', name: 'Chi phí quảng cáo / Marketing' },
  { label: '☕ Tiếp khách & Nước', category: 'Tiếp khách', name: 'Chi phí tiếp khách showroom' },
  { label: '🏢 Thuê mặt bằng', category: 'Vận hành', name: 'Tiền thuê mặt bằng showroom' },
  { label: '🛠️ Sửa chữa trang TB', category: 'Sửa chữa', name: 'Sửa chữa, bảo dưỡng thiết bị' },
  { label: '📦 Văn phòng phẩm', category: 'Khác', name: 'Văn phòng phẩm & vật dụng' },
];

export const ShowroomExpenseModal: React.FC<ShowroomExpenseModalProps> = ({
  isOpen,
  onClose,
  isEditing,
  form,
  setForm,
  onSubmit,
  errors,
  isSubmitting = false
}) => {
  const handleSelectPreset = (preset: typeof SHOWROOM_EXPENSE_PRESETS[0]) => {
    haptics.light();
    setForm(prev => ({
      ...prev,
      name: preset.name,
      category: preset.category
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={isEditing ? "Chỉnh sửa chi phí showroom" : "Thêm chi phí vận hành"}
      subtitle="Hạch toán khoản chi vào báo cáo dòng tiền showroom"
      icon={DollarSign}
      height="auto"
    >
      <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
        <ModalBody className="flex-1">
          <div className="space-y-4 md:space-y-5 py-0.5">
            {/* Quick Category Chips */}
            {!isEditing && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1">
                  <Sparkles size={12} className="text-kraft-accent" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-sub-label">
                    Gợi ý hạng mục nhanh
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SHOWROOM_EXPENSE_PRESETS.map((preset) => {
                    const isSelected = form.category === preset.category && form.name === preset.name;
                    return (
                      <motion.button
                        key={preset.label}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-kraft-accent text-white border-kraft-accent shadow-xs'
                            : 'bg-surface-soft/80 text-kraft-ink hover:bg-surface-soft border-hairline-soft'
                        }`}
                      >
                        {preset.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Thông tin chi tiết */}
            <div className="space-y-3.5 pt-1">
              <SectionHeader accentColor="bg-expense" noMargin className="mb-1 md:mb-3">
                Thông tin khoản chi
              </SectionHeader>

              <BaseInput
                label="Tên chi phí"
                required
                placeholder="VD: Tiền điện, Marketing, Mặt bằng..."
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                icon={FileText}
                autoFocus
                variant="dense"
                error={errors?.name}
              />

              <SmartAmountInput
                label="Số tiền thực chi"
                value={form.amount}
                onChange={(val: number) => setForm({ ...form, amount: val })}
                placeholder="VD: 500k, 1.5tr..."
                variant="dense"
                error={errors?.amount}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <BaseInput
                  label="Ngày thực hiện"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, date: e.target.value })}
                  icon={Calendar}
                  variant="dense"
                  error={errors?.date}
                />

                <BaseSelect
                  label="Hạng mục chi"
                  required
                  value={form.category || 'Vận hành'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, category: e.target.value })}
                  variant="dense"
                  error={errors?.category}
                >
                  <option value="Vận hành">Vận hành Showroom</option>
                  <option value="Marketing">Marketing / Quảng cáo</option>
                  <option value="Sửa chữa">Sửa chữa / Bảo trì TB</option>
                  <option value="Tiền điện/nước">Tiền điện / Nước / Net</option>
                  <option value="Tiếp khách">Tiếp khách / Ăn uống</option>
                  <option value="Khác">Khác</option>
                </BaseSelect>
              </div>
            </div>

            {/* Financial Impact Banner */}
            <div className="p-3.5 md:p-4 bg-expense/5 rounded-2xl border border-expense/15 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-expense/10 flex items-center justify-center text-expense shrink-0 mt-0.5">
                <TrendingDown size={16} strokeWidth={2.5} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-expense">
                  Hạch toán Dòng tiền Showroom
                </p>
                <p className="text-[11px] font-bold text-kraft-ink/70 leading-relaxed">
                  {form.amount > 0 ? (
                    <>
                      Khoản tiền <span className="text-expense font-black">-{formatCurrency(form.amount)}</span> sẽ được ghi nhận vào tổng chi vận hành và khấu trừ trực tiếp vào dòng tiền ròng của showroom.
                    </>
                  ) : (
                    'Khoản chi này sẽ được trừ trực tiếp vào dòng tiền ròng và phản ánh vào báo cáo P&L showroom.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? "Lưu thay đổi" : "Ghi nhận chi"}
        />
      </form>
    </Modal>
  );
};
