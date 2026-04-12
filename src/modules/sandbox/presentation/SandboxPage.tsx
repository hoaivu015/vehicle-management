import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Beaker, Search, Plus, Save, Trash2, ArrowRight, Sparkles, AlertCircle, X, User } from 'lucide-react';
import { SmartAmountInput } from '../../../components/SmartAmountInput';
import { Skeleton } from '../../../components/Skeleton';
import { CarCard } from '../../inventory/presentation/components/CarCard';
import { VehicleStatus } from '../../../shared/domain/constants';
import { cn } from '../../../utils/cn';
import { Vehicle } from '../../../shared/domain/types';
import { toast } from 'sonner';
import { StaffCard } from '../../staff/presentation/components/StaffCard';
import { StaffWithSalary } from '../../staff/application/GetStaffList';

export const SandboxPage = () => {
  const [testAmount, setTestAmount] = useState<number | undefined>(5000000);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardWidth, setCardWidth] = useState(380);
  const [cardHeight, setCardHeight] = useState(450);
  const [cardVariant, setCardVariant] = useState<'standard' | 'large'>('standard');
  const [staffCardWidth, setStaffCardWidth] = useState(360);

  const mockVehicle: Vehicle = {
    id: 1,
    name: "Land Rover Defender 110 V8 Bond Edition",
    code: "DEF-007",
    year: 2024,
    odo: 1500,
    status: VehicleStatus.IN_STOCK,
    purchase_price: 8000000000,
    sale_price: 9500000000,
    image_url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200",
    is_pinned: true,
    days: 3,
    purchase_date: new Date().toISOString(),
    total_cost: 0,
    cost_history: [],
    is_coinvested: false,
    coinvest_amount: 0,
    buyer: ""
  };

  const mockStaff: StaffWithSalary = {
    id: "1",
    name: "Phan Vũ",
    code: "PV-001",
    email: "phanvu@auto28.vn",
    role: "Admin",
    base_salary: 15000000,
    commission_per_car: 500000,
    target: 10,
    status: "active",
    salaryDetails: {
      base: 15000000,
      salesCommission: 2500000,
      buyingCommission: 1000000,
      coinvestProfitShare: 1500000,
      kpiBonusMultiplier: 1,
      totalCommission: 5000000,
      totalSalary: 20000000,
      soldCount: 5,
      boughtCount: 2,
      completionRate: 50,
      soldCars: [],
      boughtCars: [],
      coinvestedCars: []
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20">
              <Beaker size={20} />
            </div>
            <h1 className="text-3xl font-black text-kraft-ink tracking-tight uppercase">Phòng thí nghiệm</h1>
          </div>
          <p className="text-kraft-ink/60 font-medium">Nơi thử nghiệm các thành phần UI cao cấp (Liquid Professional)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="liquid-button-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Thêm mới thành phần
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Section: Smart Inputs */}
        <section className="liquid-card">
          <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2">
            <div className="w-2 h-6 bg-kraft-accent rounded-full" />
            Smart Inputs (Shorthand)
          </h2>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Tiền tệ (5k, 1tr, 2ty...)</label>
              <SmartAmountInput
                value={testAmount}
                onChange={setTestAmount}
                placeholder="Nhập số tiền..."
                label="Thử nghiệm nhập liệu"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Input thường</label>
                <input type="text" className="liquid-input shadow-sm" placeholder="Nhập văn bản..." />
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Input có Icon</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-kraft-ink/30" size={18} />
                  <input type="text" className="liquid-input pl-14 shadow-sm" placeholder="Tìm kiếm tài liệu..." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Field Sizes & States */}
        <section className="liquid-card">
          <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2">
            <div className="w-2 h-6 bg-kraft-accent rounded-full" />
            Field Sizes & States
          </h2>

          <div className="space-y-8">
            {/* Sizes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Small / Compact</label>
                <input type="text" className="w-full bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-xl px-4 py-2 text-sm outline-none focus:border-kraft-accent transition-all" placeholder="Nhỏ gọn..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Medium / Standard</label>
                <input type="text" className="liquid-input shadow-sm" placeholder="Mặc định..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Large / Hero</label>
                <input type="text" className="w-full bg-white/50 backdrop-blur-sm border-2 border-white/40 rounded-[2rem] px-8 py-6 text-xl font-black outline-none focus:border-kraft-accent transition-all shadow-lg" placeholder="Nổi bật..." />
              </div>
            </div>

            {/* States */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-black/5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Disabled State</label>
                <input disabled type="text" className="liquid-input opacity-40 cursor-not-allowed bg-black/5" placeholder="Không thể nhập..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-red-500/60 ml-4">Error State</label>
                <input type="text" className="liquid-input border-red-500/40 bg-red-50/30 text-red-600 focus:border-red-500 focus:ring-red-500/5 placeholder:text-red-300" placeholder="Lỗi nhập liệu..." />
                <p className="text-[10px] font-bold text-red-500 ml-4 flex items-center gap-1">
                  <AlertCircle size={10} /> Thông tin này là bắt buộc
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-green-600/60 ml-4">Success State</label>
                <div className="relative">
                  <input type="text" className="liquid-input border-green-500/40 bg-green-50/30 text-green-700 focus:border-green-500 focus:ring-green-500/5" defaultValue="Dữ liệu hợp lệ" />
                  <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Buttons */}
        <section className="liquid-card">
          <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2">
            <div className="w-2 h-6 bg-kraft-accent rounded-full" />
            Liquid Buttons
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button className="liquid-button-primary">Primary Action</button>
            <button className="liquid-button-primary flex items-center gap-2 items-center">
              <Plus size={16} /> Add New
            </button>
            <button className="liquid-button-secondary">Secondary</button>
            <button className="liquid-button-secondary flex items-center gap-2">
              <Save size={16} /> Save Data
            </button>
            <button className="p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 text-red-500 hover:bg-red-50 transition-all">
              <Trash2 size={20} />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             <motion.button 
              whileHover={{ x: 5 }}
              className="flex items-center justify-between p-6 bg-kraft-accent text-white rounded-[2rem] font-bold group shadow-lg shadow-kraft-accent/20"
            >
              Xem báo cáo chi tiết
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
            
            <button className="flex items-center justify-center p-6 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] font-bold text-kraft-ink hover:bg-white/60 transition-all shadow-sm">
              Hủy bỏ thay đổi
            </button>
          </div>
        </section>

        {/* Section: Color Palette */}
        <section className="liquid-card">
          <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2">
            <div className="w-2 h-6 bg-kraft-accent rounded-full" />
            Brand Palette (Original)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-kraft-accent rounded-2xl shadow-lg border border-white/20" />
              <p className="text-[10px] font-black uppercase tracking-tight text-center">Kraft Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-kraft-ink rounded-2xl shadow-lg border border-white/20" />
              <p className="text-[10px] font-black uppercase tracking-tight text-center">Kraft Ink</p>
            </div>
             <div className="space-y-2">
              <div className="h-20 bg-kraft-bg rounded-2xl shadow-sm border border-black/5" />
              <p className="text-[10px] font-black uppercase tracking-tight text-center">Kraft Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-white shadow-inner rounded-2xl border border-black/5" />
              <p className="text-[10px] font-black uppercase tracking-tight text-center">Pure White</p>
            </div>
          </div>
        </section>
      </div>

      {/* Section: Skeletons */}
      <section className="liquid-card mt-8">
        <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2">
          <div className="w-2 h-6 bg-kraft-accent rounded-full" />
          Liquid Skeleton Screens (Shimmer)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Card Skeleton Demo */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Staff Card Skeleton</h3>
            <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton variant="circle" width={64} height={64} />
                <div className="space-y-2 flex-1">
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={14} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton height={80} className="rounded-3xl" />
                <Skeleton height={80} className="rounded-3xl" />
              </div>
              <Skeleton height={56} className="rounded-full" />
            </div>
          </div>

          {/* List Item Skeleton Demo */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Vehicle Row Skeleton</h3>
            <div className="bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-2 border-b border-black/5 last:border-0">
                  <Skeleton width={80} height={60} className="rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton variant="text" width="50%" height={16} />
                      <Skeleton variant="text" width="20%" height={16} />
                    </div>
                    <Skeleton variant="text" width="30%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section: Car Card Resizer Experiment */}
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-black text-kraft-ink uppercase tracking-tight">Tùy chỉnh kích thước Card Xe</h2>
          </div>
          
          <div className="flex bg-black/5 p-1 rounded-xl w-fit">
            <button 
              onClick={() => { setCardVariant('standard'); setCardWidth(380); setCardHeight(450); }}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                cardVariant === 'standard' ? "bg-white shadow-sm text-kraft-accent" : "text-kraft-ink/40"
              )}
            > Standard
            </button>
            <button 
              onClick={() => { setCardVariant('large'); setCardWidth(600); setCardHeight(550); }}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                cardVariant === 'large' ? "bg-white shadow-sm text-kraft-accent" : "text-kraft-ink/40"
              )}
            > Large
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-6 bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">Chiều rộng: {cardWidth}px</label>
                <button onClick={() => setCardWidth(cardVariant === 'large' ? 600 : 380)} className="text-[10px] text-kraft-accent font-bold uppercase tracking-wider hover:underline">Reset</button>
              </div>
              <input 
                type="range" min="280" max="800" step="5" 
                value={cardWidth} onChange={(e) => setCardWidth(Number(e.target.value))}
                className="w-full accent-kraft-accent h-2 bg-black/5 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">Chiều cao: {cardHeight}px</label>
                <button onClick={() => setCardHeight(cardVariant === 'large' ? 550 : 450)} className="text-[10px] text-kraft-accent font-bold uppercase tracking-wider hover:underline">Reset</button>
              </div>
              <input 
                type="range" min="350" max="800" step="5" 
                value={cardHeight} onChange={(e) => setCardHeight(Number(e.target.value))}
                className="w-full accent-kraft-accent h-2 bg-black/5 rounded-full appearance-none cursor-pointer"
              />
            </div>
            
            <div className="pt-4 space-y-3">
               <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/30 italic">💡 Thử nghiệm kích thước để tìm tỉ lệ vàng cho UI chuẩn Liquid Professional.</p>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center justify-center bg-kraft-bg/20 rounded-[4rem] border border-dashed border-black/10 p-12 overflow-hidden min-h-[600px] relative">
            <div className="absolute top-6 left-6 text-[8px] font-black uppercase tracking-[0.2em] text-kraft-ink/20">Preview Area</div>
            <motion.div 
               animate={{ 
                 width: cardVariant === 'large' ? '100%' : cardWidth,
                 maxWidth: cardVariant === 'large' ? cardWidth : 'none'
               }} 
               className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] overflow-hidden bg-white"
            >
               <CarCard 
                 car={mockVehicle} 
                 variant={cardVariant}
                 onClick={() => toast.info('Click!')} 
                 onPin={() => toast.success('Pin!')} 
               />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section: Staff Card Resizer Experiment */}
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold border border-indigo-500/10">
              <User size={20} />
            </div>
            <h2 className="text-xl font-black text-kraft-ink uppercase tracking-tight">Tùy chỉnh Card Nhân sự</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-6 bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">Chiều rộng: {staffCardWidth}px</label>
                <button onClick={() => setStaffCardWidth(400)} className="text-[10px] text-kraft-accent font-bold uppercase tracking-wider hover:underline">Reset</button>
              </div>
              <input 
                type="range" min="300" max="600" step="5" 
                value={staffCardWidth} onChange={(e) => setStaffCardWidth(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-black/5 rounded-full appearance-none cursor-pointer"
              />
            </div>
            
            <div className="pt-4 space-y-3 border-t border-black/5">
               <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/30 italic">💡 Staff Card sử dụng hệ thống gradient mờ và bo góc cực đại để tạo cảm giác chuyên nghiệp.</p>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center justify-center bg-indigo-50/10 rounded-[4rem] border border-dashed border-indigo-200/50 p-12 overflow-hidden min-h-[500px] relative">
            <div className="absolute top-6 left-6 text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400/40">Staff Preview</div>
            <motion.div 
               animate={{ width: staffCardWidth }} 
               className="shadow-[0_30px_60px_rgba(0,0,0,0.12)] rounded-[2.5rem]"
            >
               <StaffCard 
                 member={mockStaff}
                 onEdit={() => toast.info('Edit Staff')}
                 onDelete={() => toast.error('Delete Staff')}
                 onViewDetail={() => toast.success('View Detail')}
               />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section: Featured Components */}
      <section className="liquid-card mt-8">
        <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2">
          <div className="w-2 h-6 bg-kraft-accent rounded-full" />
          Featured Component: Large Vehicle Card
        </h2>
        
        <div className="p-12 bg-black/5 rounded-[4rem] border border-black/5 flex justify-center">
           <CarCard 
             car={mockVehicle} 
             variant="large" 
             onClick={(c) => console.log('Large card clicked', c)}
             userRole="Admin"
           />
        </div>
      </section>

      {/* Section: Modals Demo */}
      <section className="liquid-card mt-8">
        <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2">
          <div className="w-2 h-6 bg-kraft-accent rounded-full" />
          Liquid Professional Modals
        </h2>
        
        <div className="flex flex-wrap gap-6 p-10 bg-kraft-bg/20 rounded-[2.5rem] border border-white/40 justify-center">
          <div className="flex flex-col items-center gap-4">
             <button 
                onClick={() => setIsModalOpen(true)}
                className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-kraft-accent hover:scale-110 active:scale-95 transition-all border border-kraft-accent/10"
              >
                <Plus size={32} />
              </button>
              <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/60 text-center">Open Modal Demo</p>
          </div>
        </div>
      </section>

      {/* --- Redesigned Standard Modal (Portaled) --- */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 lg:p-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-kraft-ink/60 backdrop-blur-md cursor-pointer"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/60 overflow-hidden flex flex-col pointer-events-auto"
              >
                <div className="p-8 border-b border-white/60 flex items-center justify-between bg-white/40">
                  <div>
                    <h3 className="text-xl font-black text-kraft-ink uppercase tracking-tight">Thêm xe mới</h3>
                    <p className="text-[10px] font-bold text-kraft-ink/40 uppercase tracking-[0.2em] mt-1 italic">Liquid Professional Standard</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 hover:bg-black/5 rounded-2xl transition-colors text-kraft-ink/40"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 md:p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Tên xe / Model</label>
                    <input type="text" className="liquid-input shadow-none" placeholder="VD: Toyota Camry 2.5Q 2022" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Năm sản xuất</label>
                      <input type="text" className="liquid-input shadow-none" placeholder="2022" />
                    </div>
                     <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Màu sắc</label>
                      <input type="text" className="liquid-input shadow-none" placeholder="Trắng" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Giá thu mua</label>
                    <SmartAmountInput value={0} onChange={() => {}} placeholder="Nhập giá..." />
                  </div>
                </div>

                <div className="p-8 bg-white/60 border-t border-white/60 flex gap-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 liquid-button-secondary h-16"
                  >
                    Hủy bỏ
                  </button>
                  <button className="flex-1 liquid-button-primary h-16 shadow-kraft-accent/20">
                    Lưu thông tin
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
