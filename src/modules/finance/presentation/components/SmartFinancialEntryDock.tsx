import React, { useState, useRef } from 'react';
import { Sparkles, Calendar, Car, User, Zap, Check } from 'lucide-react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';
import { BaseInput, BaseSelect } from '@/src/shared/design-system/FormElements';
import { Vehicle, Staff } from '@/src/shared/domain/types';
import { formatCurrency, numberToVietnameseText } from '@/src/shared/utils/currency';
import { haptics } from '@/src/shared/utils/haptics';
import { cn } from '@/src/shared/utils/cn';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { UnifiedExpenseCommand } from '@/src/shared/domain/schemas';

interface SmartFinancialEntryDockProps {
  vehicles: Vehicle[];
  staff: Staff[];
  currentBalance: number;
  onRecord: (command: UnifiedExpenseCommand) => Promise<boolean>;
  filterMonth: string;
}

const EXPENSE_PRESETS = [
  { label: '🏢 Tiền điện/nước', name: 'Tiền điện & nước Showroom', category: 'Vận hành', type: 'operating' as const },
  { label: '📣 Marketing / Ads', name: 'Chi phí quảng cáo Marketing', category: 'Marketing', type: 'operating' as const },
  { label: '🧴 Spa / Rửa xe', name: 'Rửa xe & dọn dẹp nội thất', category: 'Chi phí xe', type: 'vehicle' as const },
  { label: '🎨 Sơn dặm & Spa', name: 'Sơn dặm & đánh bóng xe', category: 'Chi phí xe', type: 'vehicle' as const },
  { label: '🛢️ Bảo dưỡng / Lốp', name: 'Bảo dưỡng & thay thế phụ tùng', category: 'Chi phí xe', type: 'vehicle' as const },
  { label: '☕ Tiếp khách', name: 'Tiếp khách & dịch vụ showroom', category: 'Tiếp khách', type: 'operating' as const },
  { label: '⛽ Xăng dầu', name: 'Xăng dầu chạy thử & công tác', category: 'Vận hành', type: 'operating' as const },
  { label: '📋 Phí đăng kiểm', name: 'Phí đăng kiểm & đường bộ', category: 'Chi phí xe', type: 'vehicle' as const },
];

const QUICK_AMOUNTS = [
  { label: '+500k', value: 500_000 },
  { label: '+1Tr', value: 1_000_000 },
  { label: '+2Tr', value: 2_000_000 },
  { label: '+5Tr', value: 5_000_000 },
  { label: '+10Tr', value: 10_000_000 },
];

export const SmartFinancialEntryDock: React.FC<SmartFinancialEntryDockProps> = ({
  vehicles,
  staff,
  currentBalance,
  onRecord,
  filterMonth
}) => {
  const [transactionType, setTransactionType] = useState<'outflow' | 'inflow'>('outflow');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Vận hành');
  const [expenseScope, setExpenseScope] = useState<'operating' | 'vehicle'>('operating');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(filterMonth) ? today : `${filterMonth}-01`;
  });
  const [prevFilterMonth, setPrevFilterMonth] = useState(filterMonth);

  if (filterMonth !== prevFilterMonth) {
    setPrevFilterMonth(filterMonth);
    const today = new Date().toISOString().split('T')[0];
    setDate(today.startsWith(filterMonth) ? today : `${filterMonth}-01`);
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (preset: typeof EXPENSE_PRESETS[0]) => {
    haptics.light();
    setName(preset.name);
    setCategory(preset.category);
    setExpenseScope(preset.type);
    if (error) setError(null);
  };

  const handleAddQuickAmount = (val: number) => {
    haptics.light();
    setAmount(prev => (prev || 0) + val);
    if (error) setError(null);
  };

  const handleResetForm = (keepDate = true) => {
    setName('');
    setAmount(0);
    setCategory('Vận hành');
    setExpenseScope('operating');
    setSelectedVehicleId('');
    setSelectedStaffId('');
    setError(null);
    if (!keepDate) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today.startsWith(filterMonth) ? today : `${filterMonth}-01`);
    }
    // Re-focus name input for consecutive data entry
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);
  };

  const handleSubmit = async (e?: React.FormEvent, isConsecutive = false) => {
    if (e) e.preventDefault();

    if (!name || name.trim() === '') {
      setError('Vui lòng nhập nội dung chi / chứng từ');
      nameInputRef.current?.focus();
      return;
    }

    if (!amount || amount <= 0) {
      setError('Số tiền phải lớn hơn 0 ₫');
      return;
    }

    if (expenseScope === 'vehicle' && !selectedVehicleId) {
      setError('Vui lòng chọn xe cho chi phí này');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const command: UnifiedExpenseCommand = {
      name: name.trim(),
      amount: amount,
      date: date,
      type: expenseScope,
      category: category,
      vehicleId: selectedVehicleId ? selectedVehicleId : undefined,
      staffId: selectedStaffId ? selectedStaffId : undefined
    };

    const success = await onRecord(command);
    setIsSubmitting(false);

    if (success) {
      haptics.success();
      toast.success(
        isConsecutive
          ? `Đã lưu "${name.trim()}" (${formatCurrency(amount)}). Sẵn sàng nhập tiếp!`
          : `Ghi nhận thành công "${name.trim()}"`
      );
      setLastSaved(`${name.trim()} - ${formatCurrency(amount)}`);
      handleResetForm(true);
    } else {
      setError('Không thể lưu giao dịch. Vui lòng thử lại.');
    }
  };

  // Keyboard shortcut listener: Ctrl+Enter or Cmd+Enter to Save & Continue
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(undefined, true);
    }
  };

  // Live Simulated Balance
  const simulatedBalance =
    transactionType === 'outflow' ? currentBalance - (amount || 0) : currentBalance + (amount || 0);

  return (
    <div
      onKeyDown={handleKeyDown}
      className="p-6 md:p-7 rounded-[28px] bg-white/80 backdrop-blur-2xl border border-black/5 shadow-xl relative flex flex-col justify-between"
    >
      <div>
        {/* Header with Fast Badge */}
        <div className="flex items-center justify-between pb-5 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Zap size={20} className="fill-current" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-kraft-ink">Lập Phiếu Thu / Chi</h3>
              <p className="text-[10px] font-bold text-sub-label uppercase tracking-wider">
                Nhập liệu nhanh • Hỗ trợ phím tắt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-black/5 rounded-full">
            <button
              type="button"
              onClick={() => {
                setTransactionType('outflow');
                haptics.light();
              }}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                transactionType === 'outflow' ? "bg-rose-500 text-white shadow-xs" : "text-sub-label hover:text-kraft-ink"
              )}
            >
              Chi (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setTransactionType('inflow');
                haptics.light();
              }}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                transactionType === 'inflow'
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-sub-label hover:text-kraft-ink"
              )}
            >
              Thu (+)
            </button>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-sub-label flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" /> Hạng mục 1 chạm
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXPENSE_PRESETS.map(preset => {
              const isSelected = name === preset.name;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer active:scale-95",
                    isSelected
                      ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                      : "bg-black/[0.03] hover:bg-black/5 text-kraft-ink border-black/5"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={e => handleSubmit(e, false)} className="mt-5 space-y-4">
          {/* Transaction Name Input */}
          <BaseInput
            ref={nameInputRef}
            label="Nội dung chứng từ / Khoản chi"
            required
            placeholder="VD: Tiền điện Showroom, Làm đẹp hoàn thiện xe Camry..."
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            variant="dense"
            error={error && !name ? error : undefined}
          />

          {/* Amount and Quick Amount Adders */}
          <div className="space-y-1.5">
            <SmartAmountInput
              label="Số tiền giao dịch (VNĐ)"
              value={amount}
              onChange={v => {
                setAmount(v);
                if (error) setError(null);
              }}
              placeholder="VD: 500k, 1.5tr, 18m..."
              variant="dense"
              error={error && amount <= 0 ? error : undefined}
            />

            {/* Vietnamese Spell-out Text */}
            {amount > 0 && (
              <div className="px-3 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] font-bold text-amber-800 flex items-center justify-between animate-in fade-in duration-200">
                <span className="opacity-70">Bằng chữ:</span>
                <span className="font-black capitalize">{numberToVietnameseText(amount)}</span>
              </div>
            )}

            {/* Quick Add Buttons */}
            <div className="flex items-center gap-1.5 pt-1 px-1">
              <span className="text-[9px] font-black uppercase text-sub-label tracking-wider mr-1">Cộng nhanh:</span>
              {QUICK_AMOUNTS.map(q => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleAddQuickAmount(q.value)}
                  className="px-2 py-0.5 rounded-full bg-black/[0.04] hover:bg-black/10 text-[10px] font-mono font-bold text-kraft-ink border border-black/5 cursor-pointer transition-colors active:scale-95"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope and Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BaseSelect
              label="Phân loại"
              value={expenseScope}
              onChange={e => {
                setExpenseScope(e.target.value as 'operating' | 'vehicle');
                if (e.target.value === 'operating') setSelectedVehicleId('');
              }}
              variant="dense"
            >
              <option value="operating">🏢 Vận hành Showroom</option>
              <option value="vehicle">🚗 Chi phí cho Xe (Tăng giá vốn)</option>
            </BaseSelect>

            <BaseInput
              label="Ngày chứng từ"
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              icon={Calendar}
              variant="dense"
            />
          </div>

          {/* Vehicle Selector if vehicle scope */}
          {expenseScope === 'vehicle' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
              <BaseSelect
                label="Chọn xe gán chi phí"
                required
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                variant="dense"
                icon={Car}
                error={error && expenseScope === 'vehicle' && !selectedVehicleId ? error : undefined}
              >
                <option value="">-- Chọn xe trong kho --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    [{v.code}] {v.name}
                  </option>
                ))}
              </BaseSelect>
            </motion.div>
          )}

          {/* Optional Staff who advanced money */}
          <BaseSelect
            label="Nhân viên ứng tiền (Tùy chọn)"
            value={selectedStaffId}
            onChange={e => setSelectedStaffId(e.target.value)}
            variant="dense"
            icon={User}
          >
            <option value="">-- Quỹ Showroom chi trực tiếp --</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role})
              </option>
            ))}
          </BaseSelect>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs font-bold text-red-600 animate-shake">
              {error}
            </div>
          )}

          {/* Simulated Balance Box */}
          <div className="p-3.5 bg-black/[0.02] rounded-2xl border border-black/5 space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-sub-label">
              <span>Số dư quỹ hiện tại:</span>
              <span className="text-kraft-ink">{formatCurrency(currentBalance)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider pt-1 border-t border-black/5">
              <span>Sau giao dịch này:</span>
              <span
                className={cn(
                  "text-sm font-black",
                  simulatedBalance >= 0 ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {formatCurrency(simulatedBalance)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(undefined, true)}
              className="w-full h-12 rounded-2xl bg-accent-soft hover:bg-kraft-accent/15 text-kraft-accent font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 border border-kraft-accent/20 cursor-pointer disabled:opacity-50"
            >
              <Zap size={16} />
              <span>Lưu & Nhập tiếp</span>
              <span className="text-[9px] opacity-70 font-mono hidden sm:inline">(Ctrl+Enter)</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-kraft-accent hover:bg-kraft-accent/90 text-white font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-kraft-accent/25 cursor-pointer disabled:opacity-50"
            >
              <Check size={16} />
              <span>Lưu phiếu</span>
            </button>
          </div>
        </form>
      </div>

      {/* Last saved notification indicator */}
      {lastSaved && (
        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Vừa lưu: {lastSaved}
          </span>
          <button
            type="button"
            onClick={() => setLastSaved(null)}
            className="text-sub-label hover:text-kraft-ink cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};
