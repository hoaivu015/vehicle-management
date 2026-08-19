import React, { useState } from 'react';
import { DollarSign, Calendar, FileText, Car, Settings } from 'lucide-react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { Vehicle, StaffExpense } from '@/src/shared/domain/types';
import { cn } from '@/src/shared/utils/cn';
import { BaseInput, BaseSelect, BaseTextArea } from '@/src/shared/design-system/FormElements';
import { SectionHeader } from '@/src/shared/design-system/BaseCard';
import { useActionResponse } from '@/src/shared/presentation/useActionResponse';
import { AddStaffExpenseSchema, AddStaffExpenseInput } from '../../domain/StaffValidation';
import { motion } from 'motion/react';

interface StaffAddExpenseFormProps {
  staffName: string;
  onAdd: (expenseData: AddStaffExpenseInput) => Promise<void>;
  onDelete?: (expenseId: string | number) => Promise<void>;
  onClose: () => void;
  expense?: StaffExpense;
  vehicles?: Vehicle[];
}

const StaffAddExpenseForm: React.FC<StaffAddExpenseFormProps> = ({
  onClose,
  onAdd,
  onDelete,
  expense,
  vehicles = []
}) => {
  const { executeAction, isSubmitting } = useActionResponse();
  const [formData, setFormData] = useState<AddStaffExpenseInput>(() => ({
    amount: expense?.amount || 0,
    note: expense?.note || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    type: (expense?.type as 'vehicle' | 'operating') || 'vehicle',
    vehicleId: (expense?.vehicleId !== undefined && expense?.vehicleId !== null) ? expense.vehicleId : undefined,
    category: expense?.category || 'Vận hành'
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDelete = () => {
    if (!expense || !onDelete) return;
    executeAction(() => onDelete(expense.id), {
      onSuccess: () => onClose()
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const result = AddStaffExpenseSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    executeAction(() => onAdd(result.data), {
      onSuccess: () => onClose()
    });
  };

  const isEdit = !!expense;
  const activeVehicles = vehicles.filter(v => v.status !== 'SOLD' || (expense && expense.vehicleId === v.id));

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
      <ModalBody className="flex-1">
        <div className="space-y-6 py-2">
          <div className="space-y-3">
            <SectionHeader accentColor="bg-warning">Phân loại chi phí</SectionHeader>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setFormData({ ...formData, type: 'vehicle' })}
                className={cn(
                  "h-16 md:h-20 rounded-t2 border flex flex-col items-center justify-center gap-1 md:gap-2 transition-all shadow-sm cursor-pointer",
                  formData.type === 'vehicle'
                    ? "bg-warning/5 border-warning/30 text-warning shadow-warning/10"
                    : "bg-surface-soft/60 border-hairline-soft text-sub-label opacity-40 hover:opacity-100"
                )}
              >
                <Car size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">Chi phí cho Xe</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setFormData({ ...formData, type: 'operating' })}
                className={cn(
                  "h-16 md:h-20 rounded-t2 border flex flex-col items-center justify-center gap-1 md:gap-2 transition-all shadow-sm cursor-pointer",
                  formData.type === 'operating'
                    ? "bg-brand/5 border-brand/30 text-brand shadow-brand/10"
                    : "bg-surface-soft/60 border-hairline-soft text-sub-label opacity-40 hover:opacity-100"
                )}
              >
                <Settings size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">Chi phí Vận hành</span>
              </motion.button>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-sub-label block px-1">
              Gợi ý hạng mục nhanh
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(formData.type === 'vehicle' ? [
                { label: '🧴 Rửa xe & Dọn nội thất', note: 'Rửa xe và dọn dẹp nội thất' },
                { label: '🎨 Sơn dặm / Đánh bóng', note: 'Sơn dặm và đánh bóng' },
                { label: '🛢️ Thay dầu / Bảo dưỡng', note: 'Thay dầu và bảo dưỡng xe' },
                { label: '📋 Phí đăng kiểm / Đường bộ', note: 'Phí đăng kiểm và bảo trì đường bộ' },
                { label: '🛞 Thay lốp / Phụ tùng', note: 'Thay lốp và phụ tùng' },
              ] : [
                { label: '💡 Điện / Nước / Net', category: 'Tiền điện/nước', note: 'Tiền điện, nước, internet' },
                { label: '📢 Marketing & QC', category: 'Marketing', note: 'Chi phí quảng cáo / Marketing' },
                { label: '☕ Tiếp khách', category: 'Tiếp khách', note: 'Chi phí tiếp khách showroom' },
                { label: '🛠️ Sửa chữa trang TB', category: 'Sửa chữa', note: 'Sửa chữa, bảo trì thiết bị' },
                { label: '📦 Văn phòng phẩm', category: 'Khác', note: 'Văn phòng phẩm & vật dụng' },
              ]).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      note: preset.note,
                      category: 'category' in preset ? preset.category : prev.category
                    }));
                  }}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-surface-soft/80 text-kraft-ink hover:bg-surface-soft border border-hairline-soft cursor-pointer transition-all active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 pt-4 border-t border-hairline-soft">
            <div className="space-y-1.5">
              <SmartAmountInput
                label="Số tiền thực chi"
                value={formData.amount}
                onChange={(v) => setFormData({ ...formData, amount: v })}
                placeholder="VD: 1.5tr"
                variant="dense"
                error={errors.amount}
              />
              <div className="flex items-center gap-1.5 pt-1 px-1">
                <span className="text-[9px] font-black uppercase text-sub-label tracking-wider mr-1">Cộng nhanh:</span>
                {[500000, 1000000, 2000000, 5000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: (prev.amount || 0) + val }))}
                    className="px-2.5 py-1 rounded-full bg-surface-soft hover:bg-black/5 text-[10px] font-mono font-bold text-kraft-ink border border-hairline-soft cursor-pointer transition-colors active:scale-95"
                  >
                    +{val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BaseInput
                label="Ngày thực hiện"
                type="date"
                required
                value={formData.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
                icon={Calendar}
                variant="dense"
                error={errors.date}
              />

              {formData.type === 'vehicle' ? (
                <BaseSelect
                  label="Xe được chi"
                  required
                  value={formData.vehicleId ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value;
                    setFormData({ ...formData, vehicleId: val !== '' ? (isNaN(Number(val)) ? val : Number(val)) : undefined });
                  }}
                  variant="dense"
                  error={errors.vehicleId}
                >
                  <option value="">-- Chọn xe --</option>
                  {activeVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                  ))}
                </BaseSelect>
              ) : (
                <BaseSelect
                  label="Hạng mục chi"
                  required
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value })}
                  variant="dense"
                  error={errors.category}
                >
                  <option value="Vận hành">Vận hành Showroom</option>
                  <option value="Marketing">Marketing / Quảng cáo</option>
                  <option value="Sửa chữa">Sửa chữa / Bảo trì TB</option>
                  <option value="Tiền điện/nước">Tiền điện / nước / Net</option>
                  <option value="Tiếp khách">Tiếp khách / Ăn uống</option>
                  <option value="Khác">Khác</option>
                </BaseSelect>
              )}
            </div>

            <BaseTextArea
              label="Nội dung chi chi tiết"
              required
              value={formData.note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({
                ...formData,
                note: e.target.value
              })}
              placeholder="VD: Thay dầu máy xe Camry, Mua văn phòng phẩm..."
              icon={FileText}
              variant="dense"
              className="min-h-[100px]"
              error={errors.note}
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter
        onSubmit={handleSubmit}
        onDelete={isEdit ? handleDelete : undefined}
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? 'Lưu khoản chi' : 'Ghi nhận chi'}
      />
    </form>
  );
};

interface StaffAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  onAdd: (expenseData: AddStaffExpenseInput) => Promise<void>;
  onDelete?: (expenseId: string | number) => Promise<void>;
  expense?: StaffExpense;
  vehicles?: Vehicle[];
}

export const StaffAddExpenseModal: React.FC<StaffAddExpenseModalProps> = ({
  isOpen,
  onClose,
  staffName,
  onAdd,
  onDelete,
  expense,
  vehicles = []
}) => {
  const isEdit = !!expense;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={isEdit ? 'Sửa khoản chi' : 'Ghi nhận chi'}
      subtitle={`Hồ sơ chi phí bởi ${staffName}`}
      icon={DollarSign}
      height="auto"
    >
      {isOpen && (
        <StaffAddExpenseForm
          key={expense?.id ?? 'new'}
          staffName={staffName}
          expense={expense}
          vehicles={vehicles}
          onAdd={onAdd}
          onDelete={onDelete}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};
