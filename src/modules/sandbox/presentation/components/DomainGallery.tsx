import { useState } from 'react';
import { CarCard } from '../../../inventory/presentation/components/CarCard';
import { VehicleStatus } from '../../../../shared/domain/constants';
import { calculateVehicleFinancials } from '../../../../shared/utils/vehicle_calculations';
import { Sliders, Eye, EyeOff, LayoutGrid, Sparkles } from 'lucide-react';
import { haptics } from '../../../../shared/utils/haptics';

export const DomainGallery = () => {
  const [carStatus, setCarStatus] = useState<VehicleStatus>(VehicleStatus.IN_STOCK);
  const [canSeeFullInfo, setCanSeeFullInfo] = useState<boolean>(true);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [cardVariant, setCardVariant] = useState<'standard' | 'large'>('standard');
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [daysInStock, setDaysInStock] = useState<number>(15);

  const mockVehicle = {
    id: 1,
    name: "Porsche 911 GT3 RS (992)",
    code: "POR-911",
    year: 2024,
    odo: 2500,
    status: carStatus,
    purchase_price: 15500000000,
    sale_price: 17800000000,
    image_url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200",
    is_pinned: isPinned,
    days: daysInStock,
    purchase_date: new Date().toISOString(),
    total_cost: 300000000, // chi phí sửa sang 300tr
    cost_history: [],
    is_coinvested: true,
    coinvest_amount: 5000000000, // góp 5 tỷ
    buyer: ""
  } as any;

  const financials = calculateVehicleFinancials(mockVehicle);

  const handleCardClick = () => {
    haptics.success();
    alert(`Bấm xem chi tiết xe: ${mockVehicle.name}`);
  };

  const handlePin = async (_id: number, pinned: boolean) => {
    haptics.light();
    setIsPinned(pinned);
  };

  return (
    <div className="space-y-8">
      {/* Interactive Controller */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Sliders size={20} />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Bảng điều khiển Card xe (Interactive Controls)</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Tinh chỉnh động các thuộc tính nghiệp vụ để quan sát phản ứng tức thời của giao diện CarCard nghiệp vụ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status Switcher */}
          <div className="bg-white/60 p-5 rounded-3xl border border-white/80 space-y-3">
            <label className="text-[10px] font-black uppercase tracking-wider text-kraft-ink/40">Trạng thái Xe (Vehicle Status):</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(VehicleStatus).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setCarStatus(status);
                    haptics.light();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    carStatus === status
                      ? 'bg-kraft-ink text-white shadow-sm'
                      : 'bg-black/5 hover:bg-black/10 text-kraft-ink/60'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility & Toggles */}
          <div className="bg-white/60 p-5 rounded-3xl border border-white/80 space-y-4">
            <label className="text-[10px] font-black uppercase tracking-wider text-kraft-ink/40">Quyền Hạn & Tính Năng:</label>
            
            {/* Can see full info */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kraft-ink flex items-center gap-2">
                {canSeeFullInfo ? <Eye size={16} className="text-amber-500" /> : <EyeOff size={16} className="text-gray-400" />}
                Xem thông tin Lợi nhuận
              </span>
              <button
                onClick={() => {
                  setCanSeeFullInfo(!canSeeFullInfo);
                  haptics.light();
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                  canSeeFullInfo ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    canSeeFullInfo ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Is Compact Card */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kraft-ink flex items-center gap-2">
                <LayoutGrid size={16} className="text-amber-500" />
                Kiểu Card thu nhỏ (Compact)
              </span>
              <button
                onClick={() => {
                  setIsCompact(!isCompact);
                  haptics.light();
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                  isCompact ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    isCompact ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Days In Stock Slider */}
          <div className="bg-white/60 p-5 rounded-3xl border border-white/80 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-wider text-kraft-ink/40">Số ngày tồn kho (Days):</label>
              <span className={`text-xs font-black ${daysInStock > 30 ? 'text-red-500' : 'text-kraft-ink'}`}>
                {daysInStock} ngày
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={daysInStock}
              onChange={(e) => {
                setDaysInStock(Number(e.target.value));
                if (Number(e.target.value) === 31) {
                  haptics.heavy(); // Cảnh báo vượt ngưỡng tồn kho quá lâu
                } else {
                  haptics.light();
                }
              }}
              className="w-full accent-amber-500 h-2 bg-black/5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[9px] text-kraft-ink/40 font-bold uppercase">
              {daysInStock > 30 ? '⚠️ QUÁ HẠN TỒN KHO (>30 ngày - Rung cảnh báo!)' : '✓ Trong giới hạn tồn kho'}
            </p>
          </div>
        </div>
      </div>

      {/* Showcase Stage */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Sparkles size={20} />
            </span>
            <h3 className="text-lg font-black text-kraft-ink uppercase tracking-wider">Khu vực hiển thị Card Xe (Showcase Arena)</h3>
          </div>
          <p className="text-xs text-kraft-ink/50 mt-2 font-medium">
            Thử nghiệm lướt chuột, vuốt chạm và co giãn cửa sổ trình duyệt để kiểm tra tính Responsive trên cả Mobile & Desktop.
          </p>
        </div>

        {/* Card Variant Controller */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCardVariant('standard');
              haptics.light();
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              cardVariant === 'standard'
                ? 'bg-kraft-ink text-white shadow-md'
                : 'bg-white/60 border border-white/80 text-kraft-ink/50'
            }`}
          >
            Standard Variant
          </button>
          <button
            onClick={() => {
              setCardVariant('large');
              haptics.light();
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              cardVariant === 'large'
                ? 'bg-kraft-ink text-white shadow-md'
                : 'bg-white/60 border border-white/80 text-kraft-ink/50'
            }`}
          >
            Large Variant
          </button>
        </div>

        {/* Card Arena Grid */}
        <div className="bg-black/5 p-8 rounded-3xl border border-black/[0.02] flex items-center justify-center min-h-[300px]">
          <div className="w-full max-w-[420px]">
            <CarCard
              car={mockVehicle}
              onClick={handleCardClick}
              onPin={handlePin}
              variant={cardVariant}
              isCompact={isCompact}
              financials={financials}
              canSeeFullInfo={canSeeFullInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
