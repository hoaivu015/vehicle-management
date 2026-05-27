import React, { useState, useEffect } from 'react';
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
  const { executeAction, isSubmitting } = useActionResponse();
  const [formData, setFormData] = useState<AddStaffExpenseInput>({
    amount: 0,
    note: '',
    date: new Date().toISOString().split('T')[0],
    type: 'vehicle',
    vehicleId: undefined,
    category: 'Vận hành'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        setFormData({
          amount: expense.amount,
          note: expense.note || '',
          date: expense.date,
          type: expense.type as 'vehicle' | 'operating',
          vehicleId: (expense.vehicleId !== undefined && expense.vehicleId !== null) ? expense.vehicleId : undefined,
          category: expense.category || 'Vận hành'
        });
      } else {
        setFormData({
          amount: 0,
          note: '',
          date: new Date().toISOString().split('T')[0],
          type: 'vehicle',
          vehicleId: undefined,
          category: 'Vận hành'
        });
      }
      setErrors({});
    }
  }, [isOpen, expense]);

  const handleDelete = () => {
    if (!expense || !onDelete) return;
    executeAction(() => onDelete(expense.id), {
      onSuccess: () => onClose()
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    // Zod Boundary (L6)
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={isEdit ? 'Sửa khoản chi' : 'Ghi nhận chi'}
      subtitle={`Hồ sơ chi phí bởi ${staffName}`}
      icon={DollarSign}
      height="auto"
    >
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
                    "h-16 md:h-20 rounded-t2 border flex flex-col items-center justify-center gap-1 md:gap-2 transition-all shadow-sm",
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
                    "h-16 md:h-20 rounded-t2 border flex flex-col items-center justify-center gap-1 md:gap-2 transition-all shadow-sm",
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

            <div className="space-y-5 pt-6 border-t border-hairline-soft">
              <SmartAmountInput
                label="Số tiền thực chi"
                value={formData.amount}
                onChange={(v) => setFormData({ ...formData, amount: v })}
                placeholder="VD: 1.5tr"
                variant="dense"
                error={errors.amount}
              />

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
                    <option value="">--</option>
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
          submitLabel={isEdit ? 'Lưu' : 'Ghi nhận chi'}
        />
      </form>
    </Modal>
  );
};

