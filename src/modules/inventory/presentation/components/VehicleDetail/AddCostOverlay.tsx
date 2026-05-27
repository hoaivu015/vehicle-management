import React from 'react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { Plus, FileText, Car } from 'lucide-react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { SectionHeader } from '@/src/shared/design-system/BaseCard';
import { useUnifiedExpense } from '@/src/shared/presentation/hooks/useUnifiedExpense';

interface AddCostOverlayProps {
   isOpen: boolean;
   onClose: () => void;
   onAdd: (name: string, amount: number) => Promise<void>;
   isSubmitting: boolean;
   initialForm?: { name: string; amount: number };
}

export const AddCostOverlay: React.FC<AddCostOverlayProps> = ({
   isOpen,
   onClose,
   onAdd,
   isSubmitting
}) => {
   const { form, setForm, resetForm } = useUnifiedExpense({
      scope: 'vehicle'
   });

   const [error, setError] = React.useState<string | null>(null);

   React.useEffect(() => {
      if (isOpen) {
         resetForm();
         setError(null);
      }
   }, [isOpen]);

   const handleConfirm = async () => {
      if (!form.name || form.name.trim() === '') {
         setError("Tên chi phí không được để trống");
         return;
      }
      if (!form.amount || form.amount <= 0) {
         setError("Số tiền phải lớn hơn 0");
         return;
      }

      await onAdd(form.name, form.amount);
      onClose();
   };


   return (
      <Modal
         isOpen={isOpen}
         onClose={onClose}
         maxWidth="lg"
         title="Ghi nhận chi phí"
         subtitle="Hạng mục Spa, dọn dẹp, sửa chữa cho xe"
         icon={Plus}
         height="auto"
      >
         <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }} className="flex-1 flex flex-col overflow-hidden">
            <ModalBody className="flex-1">
               <div className="space-y-3 md:space-y-6 py-0.5">
                  <div className="space-y-3 md:space-y-5">
                     <SectionHeader accentColor="bg-warning" noMargin className="mb-2 md:mb-6">Thông tin chi phí</SectionHeader>

                     <BaseInput
                        label="Tên hạng mục chi phí"
                        placeholder="VD: Thay dầu, Sơn dặm, Rửa xe..."
                        value={form.name || ''}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        icon={FileText}
                        autoFocus
                        variant="dense"
                      />

                     <SmartAmountInput
                        label="Số tiền thực chi"
                        value={form.amount ?? 0}
                        onChange={v => setForm({ ...form, amount: v })}
                        placeholder="VD: 500k, 1.5tr..."
                        variant="dense"
                     />
                  </div>

                  {error && (
                     <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-100 text-[10px] font-bold text-red-500 uppercase tracking-tight animate-shake">
                        {error}
                     </div>
                  )}

                  <div className="p-3 md:p-5 bg-amber-50/50 rounded-xl md:rounded-[2rem] border border-amber-100/50 flex items-center gap-3">
                     <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                        <Car size={14} />
                     </div>
                     <p className="text-[10px] font-bold text-amber-900/60 leading-relaxed uppercase tracking-tight">
                        Chi phí này sẽ cộng vào giá vốn và trừ trực tiếp vào lợi nhuận xe.
                     </p>
                  </div>
               </div>
            </ModalBody>

            <ModalFooter
               onSubmit={handleConfirm}
               isSubmitting={isSubmitting}
               submitLabel="Ghi nhận chi"
               error={error}
            />
         </form>
      </Modal>
   );
};
