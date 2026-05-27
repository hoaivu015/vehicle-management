import { Sparkles, User } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { CarCard } from '@/src/modules/inventory/presentation/components/CarCard';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { StaffCard } from '@/src/modules/staff/presentation/components/StaffCard';
import { toast } from 'sonner';

export const SandboxResizers = ({ 
  cardWidth, setCardWidth, cardHeight, setCardHeight, cardVariant, setCardVariant, 
  staffCardWidth, setStaffCardWidth, mockVehicle, mockStaff 
}: any) => (
  <div className="space-y-12">
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent"><Sparkles size={20} /></div><h2 className="text-xl font-black text-kraft-ink uppercase tracking-tight">Tùy chỉnh kích thước Card Xe</h2></div>
        <div className="flex bg-black/5 p-1 rounded-xl w-fit">
          <button onClick={() => { setCardVariant('standard'); setCardWidth(380); setCardHeight(450); }} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", cardVariant === 'standard' ? "bg-white shadow-sm text-kraft-accent" : "text-kraft-ink/40")}>Standard</button>
          <button onClick={() => { setCardVariant('large'); setCardWidth(600); setCardHeight(550); }} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", cardVariant === 'large' ? "bg-white shadow-sm text-kraft-accent" : "text-kraft-ink/40")}>Large</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-6 bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border border-white/60 shadow-sm">
          <ResizerInput label={`Chiều rộng: ${cardWidth}px`} value={cardWidth} min={280} max={800} onChange={setCardWidth} onReset={() => setCardWidth(cardVariant === 'large' ? 600 : 380)} />
          <ResizerInput label={`Chiều cao: ${cardHeight}px`} value={cardHeight} min={350} max={800} onChange={setCardHeight} onReset={() => setCardHeight(cardVariant === 'large' ? 550 : 450)} />
          <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/30 italic pt-4">💡 Thử nghiệm kích thước để tìm tỉ lệ vàng cho UI chuẩn Liquid Professional.</p>
        </div>
        <div className="lg:col-span-2 flex items-center justify-center bg-kraft-bg/20 rounded-[4rem] border border-dashed border-black/10 p-12 overflow-hidden min-h-[600px] relative">
          <motion.div animate={{ width: cardVariant === 'large' ? '100%' : cardWidth, maxWidth: cardVariant === 'large' ? cardWidth : 'none' }} className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden bg-white">
            <CarCard 
              car={mockVehicle} 
              variant={cardVariant} 
              financials={calculateVehicleFinancials(mockVehicle)}
              canSeeFullInfo={true}
              onClick={() => toast.info('Click!')} 
              onPin={(_id, _pinned) => { toast.success('Pin!'); }} 
            />
          </motion.div>
        </div>
      </div>
    </section>

    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold border border-indigo-500/10"><User size={20} /></div><h2 className="text-xl font-black text-kraft-ink uppercase tracking-tight">Tùy chỉnh Card Nhân sự</h2></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-6 bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border border-white/60 shadow-sm">
          <ResizerInput label={`Chiều rộng: ${staffCardWidth}px`} value={staffCardWidth} min={300} max={600} onChange={setStaffCardWidth} onReset={() => setStaffCardWidth(400)} />
          <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/30 italic pt-4 border-t border-black/5">💡 Staff Card sử dụng hệ thống gradient mờ và bo góc cực đại.</p>
        </div>
        <div className="lg:col-span-2 flex items-center justify-center bg-indigo-50/10 rounded-[4rem] border border-dashed border-indigo-200/50 p-12 overflow-hidden min-h-[500px] relative">
          <motion.div animate={{ width: staffCardWidth }} className="shadow-[0_30px_60px_rgba(0,0,0,0.12)] rounded-[3rem]">
            <StaffCard member={mockStaff} onEdit={() => toast.info('Edit Staff')} onDelete={() => toast.error('Delete Staff')} onViewDetail={() => toast.success('View Detail')} />
          </motion.div>
        </div>
      </div>
    </section>
  </div>
);

const ResizerInput = ({ label, value, min, max, onChange, onReset }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center px-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">{label}</label>
      <button onClick={onReset} className="text-[10px] text-kraft-accent font-bold uppercase tracking-wider hover:underline">Reset</button>
    </div>
    <input type="range" min={min} max={max} step="5" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-kraft-accent h-2 bg-black/5 rounded-full appearance-none cursor-pointer" />
  </div>
);
