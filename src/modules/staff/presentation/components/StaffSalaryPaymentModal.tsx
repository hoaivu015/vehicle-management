import React, { useState } from 'react';
import { Calendar, DollarSign, Info } from 'lucide-react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { StaffWithSalary } from '../../application/GetStaffList';
import { formatCurrency } from '@/src/shared/utils/currency';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { SectionHeader } from '@/src/shared/design-system/BaseCard';

interface StaffSalaryPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffWithSalary;
  month: string;
  onConfirm: (date: string) => Promise<void>;
  isLoading: boolean;
}

export const StaffSalaryPaymentModal: React.FC<StaffSalaryPaymentModalProps> = ({
  isOpen,
  onClose,
  staff,
  month,
  onConfirm,
  isLoading
}) => {
  // Default to the last day of the work month
  const getDefaultDate = () => {
    const [year, mm] = month.split('-').map(Number);
    const lastDay = new Date(year, mm, 0).getDate();
    return `${month}-${String(lastDay).padStart(2, '0')}`;
  };

  const [paymentDate, setPaymentDate] = useState(getDefaultDate());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(paymentDate);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="xl" 
      title="Chi lương"
      subtitle={`Thanh toán lương & hoàn ứng cho ${staff.name}`}
      icon={DollarSign}
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <ModalBody className="flex-1">
          <div className="space-y-8">
            {/* Salary Summary */}
            <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-start text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600/60 mb-3">Tổng số tiền thực trả</span>
              <span className="text-4xl font-black tracking-tighter text-emerald-600">{formatCurrency(staff.salaryDetails.netSalary)}</span>
              <div className="mt-6 flex flex-wrap justify-start gap-x-6 gap-y-2 opacity-40">
                <span className="text-[10px] font-bold uppercase tracking-widest">Lương: {formatCurrency(staff.salaryDetails.totalSalary)}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Hoàn ứng: {formatCurrency(staff.salaryDetails.totalReimbursements)}</span>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-6">
              <SectionHeader accentColor="bg-kraft-accent">Thiết lập hạch toán</SectionHeader>

              <div className="space-y-4">
                <BaseInput 
                  label="Ngày hạch toán"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  icon={Calendar}
                />
                
                <div className="p-5 rounded-2xl bg-kraft-accent/5 border border-kraft-accent/10 flex gap-4">
                  <Info size={18} className="text-kraft-accent shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold leading-relaxed text-kraft-ink/60 italic">
                    Lưu ý: Ngày này sẽ được dùng để ghi nhận phiếu chi vào Dòng tiền. Hệ thống mặc định chọn ngày cuối tháng để báo cáo lợi nhuận chuẩn xác nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter 
          onCancel={onClose} 
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
          submitLabel={isLoading ? 'Đang quyết toán...' : 'Chi lương'}
        />
      </form>
    </Modal>
  );
};
