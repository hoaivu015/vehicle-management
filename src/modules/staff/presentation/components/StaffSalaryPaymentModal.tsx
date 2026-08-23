import React, { useState } from 'react';
import { Calendar, Banknote, Building2, Lock } from 'lucide-react';
import { BaseModal as Modal, ModalBody, ModalFooter } from '@/src/shared/design-system/BaseModal';
import { StaffWithSalary } from '../../application/GetStaffList';
import { formatCurrency, numberToVietnameseText } from '@/src/shared/utils/currency';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { haptics } from '@/src/shared/utils/haptics';
import { cn } from '@/src/shared/utils/cn';

interface StaffSalaryPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffWithSalary;
  month: string;
  onConfirm: (date: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * StaffSalaryPaymentModal (Minimalist Swiss Executive Edition)
 * Phong cách tối giản Thụy Sĩ: Tinh gọn, trực quan, tập trung vào số liệu cốt lõi
 * và hỗ trợ chu kỳ chi lương ngày 10 chuyển khoản trực tiếp từ tài khoản công ty.
 */
export const StaffSalaryPaymentModal: React.FC<StaffSalaryPaymentModalProps> = ({
  isOpen,
  onClose,
  staff,
  month,
  onConfirm,
  isLoading
}) => {
  // 1. Tính toán ngày mùng 10 tháng sau (Chuẩn chu kỳ chi lương Showroom)
  const getNextMonth10th = (monthStr: string) => {
    const [year, mm] = monthStr.split('-').map(Number);
    const nextDate = new Date(year, mm, 10);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    return `${nextYear}-${nextMonth}-10`;
  };

  // 2. Ngày hôm nay thực tế
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${mm}-${day}`;
  };

  // 3. Ngày cuối kỳ lương
  const getEndOfMonth = (monthStr: string) => {
    const [year, mm] = monthStr.split('-').map(Number);
    const lastDay = new Date(year, mm, 0).getDate();
    return `${monthStr}-${String(lastDay).padStart(2, '0')}`;
  };

  const nextMonth10th = getNextMonth10th(month);
  const todayStr = getTodayStr();
  const endOfMonthStr = getEndOfMonth(month);

  // Mặc định chọn ngày 10 tháng sau theo chu kỳ showroom
  const [paymentDate, setPaymentDate] = useState(nextMonth10th);

  const { salaryDetails } = staff;
  const soldCarsCount = salaryDetails.soldCars?.length || salaryDetails.soldCount || 0;
  const boughtCarsCount = salaryDetails.boughtCars?.length || salaryDetails.boughtCount || 0;
  const coinvestCarsCount = salaryDetails.coinvestedCars?.length || 0;
  const totalVehicles = soldCarsCount + boughtCarsCount + coinvestCarsCount;
  const totalExpensesCount = salaryDetails.targetExpenseIds?.length || 0;

  const formatDateDisplay = (isoStr: string) => {
    const parts = isoStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return isoStr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.success();
    await onConfirm(paymentDate);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      title="Quyết toán lương"
      subtitle={
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-800">{staff.name}</span>
          <span>•</span>
          <span className="font-semibold text-slate-500">#{staff.code}</span>
          <span>•</span>
          <span>Kỳ {month}</span>
        </div>
      }
      icon={Banknote}
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <ModalBody className="flex-1 space-y-4 pt-1">
          {/* Khối Hero Số Tiền Tối Giản (Minimalist Hero Block) */}
          <div className="text-center py-4 px-2 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Số tiền thực chi chuyển khoản
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 my-1">
              {formatCurrency(salaryDetails.netSalary, { showFull: true })}
            </div>
            <p className="text-xs font-medium text-slate-500 italic">
              Bằng chữ: {numberToVietnameseText(salaryDetails.netSalary)}
            </p>
          </div>

          {/* Bảng Kê Chi Tiết Tinh Gọn (Minimalist Ledger Breakdown) */}
          <div className="space-y-2.5 px-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Lương cơ bản</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(salaryDetails.base, { showFull: true })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1">
                Hoa hồng & Thưởng
                {totalVehicles > 0 && (
                  <span className="text-[10px] text-slate-400">
                    ({[
                      soldCarsCount > 0 ? `${soldCarsCount} bán` : null,
                      boughtCarsCount > 0 ? `${boughtCarsCount} nhập` : null,
                      coinvestCarsCount > 0 ? `${coinvestCarsCount} góp vốn` : null
                    ].filter(Boolean).join(', ')})
                  </span>
                )}
              </span>
              <span className="font-bold text-emerald-600">
                +{formatCurrency(salaryDetails.totalCommission, { showFull: true })}
              </span>
            </div>

            {salaryDetails.totalReimbursements > 0 && (
              <div className="flex justify-between items-center text-slate-600">
                <span>Hoàn ứng chi hộ</span>
                <span className="font-bold text-emerald-600">
                  +{formatCurrency(salaryDetails.totalReimbursements, { showFull: true })}
                </span>
              </div>
            )}

            {salaryDetails.totalAdvances > 0 && (
              <div className="flex justify-between items-center text-slate-600">
                <span>Khấu trừ tạm ứng</span>
                <span className="font-bold text-rose-600">
                  -{formatCurrency(salaryDetails.totalAdvances, { showFull: true })}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Lock size={12} />
                Đóng băng dữ liệu
              </span>
              <span>{totalVehicles} xe • {totalExpensesCount} phiếu chi</span>
            </div>
          </div>

          {/* Cụm Thiết Lập Ngày & Nguồn Tiền Tối Giản */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs px-2 py-1 bg-slate-50/50 rounded-xl">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Building2 size={15} className="text-slate-400" />
                Nguồn chi
              </span>
              <span className="font-bold text-slate-700">Tài khoản Công ty (CK Ngân hàng)</span>
            </div>

            <div className="space-y-2">
              <BaseInput 
                label="Ngày hạch toán sổ quỹ"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                icon={Calendar}
              />

              {/* Segmented Quick Presets */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    haptics.light();
                    setPaymentDate(nextMonth10th);
                  }}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap text-center",
                    paymentDate === nextMonth10th
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  10 Tháng sau ({formatDateDisplay(nextMonth10th)})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    haptics.light();
                    setPaymentDate(todayStr);
                  }}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap text-center",
                    paymentDate === todayStr
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Hôm nay ({formatDateDisplay(todayStr)})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    haptics.light();
                    setPaymentDate(endOfMonthStr);
                  }}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap text-center",
                    paymentDate === endOfMonthStr
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Cuối kỳ ({formatDateDisplay(endOfMonthStr)})
                </button>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter 
          onCancel={onClose} 
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
          submitLabel={isLoading ? 'Đang hạch toán...' : `Chi chuyển khoản ${formatCurrency(salaryDetails.netSalary)}`}
        />
      </form>
    </Modal>
  );
};
