import { useState } from 'react';
import { PillButton } from '../../../../shared/design-system/Buttons';
import { SmartAmountInput } from '../../../../shared/design-system/SmartAmountInput';
import { BaseCard } from '../../../../shared/design-system/BaseCard';
import { BaseModal } from '../../../../shared/design-system/BaseModal';
import { Sparkles, Send, ShieldAlert, Check, HelpCircle, Maximize2 } from 'lucide-react';
import { haptics } from '../../../../shared/utils/haptics';
import { LiquidGlassCard } from './LiquidGlassCard';


export const AtomicShowroom = () => {
  const [testAmount, setTestAmount] = useState<number>(5000000);
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);

  const triggerErrorSimulation = () => {
    setInputError("Số tiền thu mua không thể nhỏ hơn 100.000.000 đ!");
    // haptics.error() đã được tự động gọi trong useEffect của SmartAmountInput
    setTimeout(() => {
      setInputError(undefined);
    }, 4000); // Tự động xóa lỗi sau 4 giây
  };

  const handleAsyncAction = () => {
    setIsLoadingButton(true);
    haptics.light();
    setTimeout(() => {
      setIsLoadingButton(false);
      haptics.success();
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* 0. Liquid Glassmorphism Showroom */}
      <LiquidGlassCard />

      {/* 1. Buttons Section */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Sparkles size={20} />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Hệ thống Nút bấm (PillButton Specs)</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Các nút bấm dạng PillButton hỗ trợ vi-hoạt ảnh thu nhỏ chuẩn Apple `active:scale-95` và liên kết chặt chẽ với Capacitor Haptics.
          </p>
        </div>

        <div className="space-y-6 bg-black/5 p-6 rounded-3xl border border-black/[0.02]">
          <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest block">Biến thể màu sắc (Variants)</span>
          <div className="flex flex-wrap gap-4">
            <PillButton variant="primary" icon={Send}>Primary Amber</PillButton>
            <PillButton variant="success" icon={Check}>Success Green</PillButton>
            <PillButton variant="danger" icon={ShieldAlert}>Danger Red</PillButton>
            <PillButton variant="secondary">Secondary Card</PillButton>
            <PillButton variant="glass" icon={Sparkles}>Liquid Glass</PillButton>
            <PillButton variant="ghost">Ghost Border</PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/5 p-6 rounded-3xl border border-black/[0.02] space-y-4">
            <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest block">Kích thước chuẩn (Sizes)</span>
            <div className="flex flex-wrap items-end gap-3">
              <PillButton size="sm" variant="primary">Small (44px)</PillButton>
              <PillButton size="md" variant="primary">Medium (56px)</PillButton>
              <PillButton size="lg" variant="primary">Large (64px)</PillButton>
            </div>
          </div>

          <div className="bg-black/5 p-6 rounded-3xl border border-black/[0.02] space-y-4">
            <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest block">Trạng thái Đặc biệt (States)</span>
            <div className="flex flex-wrap gap-4">
              <PillButton
                variant="primary"
                isLoading={isLoadingButton}
                onClick={handleAsyncAction}
              >
                {isLoadingButton ? "Đang xử lý..." : "Bấm xử lý thử"}
              </PillButton>
              <PillButton variant="primary" disabled>Nút bị khóa (Disabled)</PillButton>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Smart Inputs Section */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <HelpCircle size={20} />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Ô Nhập Tiền Tệ Thông Minh (Smart Input)</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Tự động biên dịch số viết tắt (VD: "5tr" thành 5.000.000, "2.5t" thành 2.500.000.000), hiển thị tooltip xem trước và rung cảnh báo lỗi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <SmartAmountInput
              value={testAmount}
              onChange={setTestAmount}
              label="Số tiền thu mua xe (Thử gõ: 5tr, 1.2t, 500k...)"
              placeholder="Nhập số tiền..."
              error={inputError}
            />

            <div className="bg-black/5 p-5 rounded-3xl border border-black/[0.02] flex items-center justify-between">
              <span className="text-[10px] font-black text-kraft-ink/40 uppercase tracking-wider">Giá trị state thực tế:</span>
              <span className="text-sm font-black text-kraft-ink">{testAmount.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <div className="bg-white/60 p-6 rounded-3xl border border-white/80 space-y-4">
            <span className="text-xs font-black text-kraft-ink uppercase tracking-wider block">Phòng mô phỏng tương tác:</span>
            <p className="text-xs text-kraft-ink/60 font-medium">
              Nhấn nút dưới để mô phỏng một sự kiện nhập liệu sai quy định tài chính. Ô nhập tiền sẽ lập tức rung lắc cảnh báo (`animate-micro-shake`) và kích hoạt Capacitor Haptics lỗi.
            </p>
            <PillButton
              variant="danger"
              size="md"
              fullWidth
              onClick={triggerErrorSimulation}
            >
              Mô phỏng lỗi nhập liệu (Shake & Haptic Error)
            </PillButton>
          </div>
        </div>
      </div>

      {/* 3. Cards & Modals Section */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Maximize2 size={20} />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Thẻ Nền & Popup (BaseCard & BaseModal)</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Lớp phủ Liquid Glassmorphism sang trọng với hiệu ứng phản hồi co giãn 95% khi nhấp chuột.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BaseCard Interactive */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest block">Thẻ nền tảng (BaseCard)</span>
            <BaseCard onClick={() => haptics.light()} className="p-6 cursor-pointer text-center">
              <div className="h-28 flex flex-col justify-center items-center space-y-2">
                <span className="text-sm font-black text-kraft-ink">Interactive BaseCard</span>
                <span className="text-[10px] text-kraft-ink/40 font-bold uppercase">Nhấp để co giãn scale-95 và rung haptic</span>
              </div>
            </BaseCard>
          </div>

          {/* BaseModal Activation */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-widest block">Popup tương tác (BaseModal)</span>
              <p className="text-xs text-kraft-ink/60 font-medium">
                Mở một lớp popup phủ mờ nền Liquid Glass mượt mà dựa trên React Portal, đảm bảo giao diện hiển thị cực kỳ sang trọng.
              </p>
            </div>
            <PillButton
              variant="glass"
              size="md"
              fullWidth
              onClick={() => {
                haptics.medium();
                setIsModalOpen(true);
              }}
            >
              Mở thử Modal Liquid Glass
            </PillButton>
          </div>
        </div>
      </div>

      {/* BaseModal Showcase */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={() => {
          haptics.light();
          setIsModalOpen(false);
        }}
        title="Popup Thử Nghiệm"
      >
        <div className="space-y-6">
          <p className="text-sm font-medium text-kraft-ink/70 leading-relaxed">
            Chào mừng bạn đến với popup Liquid Glassmorphism cao cấp của Auto 28! Mọi thành phần đều hỗ trợ blur nhẹ nhàng, bo góc chuẩn iOS và vi-hoạt ảnh nảy spring.
          </p>
          <div className="p-4 bg-black/5 rounded-2xl flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-kraft-ink/60">Hệ thống hoạt động bình thường</span>
          </div>
          <div className="flex gap-4">
            <PillButton variant="secondary" size="md" className="flex-1" onClick={() => setIsModalOpen(false)}>Đóng</PillButton>
            <PillButton variant="primary" size="md" className="flex-1" onClick={() => { haptics.success(); setIsModalOpen(false); }}>Xác nhận</PillButton>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};
