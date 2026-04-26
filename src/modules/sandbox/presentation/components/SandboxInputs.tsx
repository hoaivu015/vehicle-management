import React from 'react';
import { Search, AlertCircle, Sparkles } from 'lucide-react';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';

export const SandboxInputs = ({ testAmount, setTestAmount }: any) => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <section className="section-card">
      <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2"><div className="w-2 h-6 bg-kraft-accent rounded-full" />Smart Inputs</h2>
      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Tiền tệ (5k, 1tr...)</label>
          <SmartAmountInput value={testAmount} onChange={setTestAmount} placeholder="Nhập số tiền..." label="Thử nghiệm nhập liệu" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Input thường</label><input type="text" className="liquid-input shadow-sm" placeholder="Nhập văn bản..." /></div>
          <div className="space-y-2 relative"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Input có Icon</label><div className="relative"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-kraft-ink/30" size={18} /><input type="text" className="liquid-input pl-14 shadow-sm" placeholder="Tìm kiếm tài liệu..." /></div></div>
        </div>
      </div>
    </section>

    <section className="section-card">
      <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2"><div className="w-2 h-6 bg-kraft-accent rounded-full" />Field Sizes & States</h2>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Small</label><input type="text" className="w-full bg-white/50 border-2 border-white/40 rounded-xl px-4 py-2 text-sm outline-none focus:border-kraft-accent" placeholder="Nhỏ gọn..." /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Medium</label><input type="text" className="liquid-input shadow-sm" placeholder="Mặc định..." /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Large</label><input type="text" className="w-full bg-white/50 border-2 border-white/40 rounded-[2rem] px-8 py-6 text-xl font-black outline-none focus:border-kraft-accent shadow-lg" placeholder="Nổi bật..." /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-black/5">
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Disabled</label><input disabled type="text" className="liquid-input opacity-40 cursor-not-allowed bg-black/5" placeholder="Không thể nhập..." /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-red-500/60 ml-4">Error</label><input type="text" className="liquid-input border-red-500/40 bg-red-50/30 text-red-600 focus:border-red-500 placeholder:text-red-300" placeholder="Lỗi nhập liệu..." /><p className="text-[10px] font-bold text-red-500 ml-4 flex items-center gap-1"><AlertCircle size={10} /> Thông tin bắt buộc</p></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-green-600/60 ml-4">Success</label><div className="relative"><input type="text" className="liquid-input border-green-500/40 bg-green-50/30 text-green-700" defaultValue="Dữ liệu hợp lệ" /><Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 text-green-500" size={18} /></div></div>
        </div>
      </div>
    </section>
  </div>
);
