import React from 'react';
import { Plus, Save, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const SandboxButtons = () => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
    <section className="section-card">
      <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2"><div className="w-2 h-6 bg-kraft-accent rounded-full" />Liquid Buttons</h2>
      <div className="flex flex-wrap gap-4">
        <button className="liquid-button-primary">Primary Action</button>
        <button className="liquid-button-primary flex items-center gap-2"><Plus size={16} /> Add New</button>
        <button className="liquid-button-secondary">Secondary</button>
        <button className="liquid-button-secondary flex items-center gap-2"><Save size={16} /> Save Data</button>
        <button className="p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 text-red-500 hover:bg-red-50 transition-all"><Trash2 size={20} /></button>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button whileHover={{ x: 5 }} className="flex items-center justify-between p-6 bg-kraft-accent text-white rounded-[2rem] font-bold group shadow-lg shadow-kraft-accent/20">Xem báo cáo chi tiết <ArrowRight className="group-hover:translate-x-2 transition-transform" /></motion.button>
        <button className="flex items-center justify-center p-6 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] font-bold text-kraft-ink hover:bg-white/60 transition-all shadow-sm">Hủy bỏ thay đổi</button>
      </div>
    </section>

    <section className="section-card">
      <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2"><div className="w-2 h-6 bg-kraft-accent rounded-full" />Brand Palette</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['kraft-accent', 'kraft-ink', 'kraft-bg', 'white'].map(color => (
          <div key={color} className="space-y-2">
            <div className={`h-20 bg-${color} rounded-2xl shadow-lg border border-black/5`} />
            <p className="text-[10px] font-black uppercase tracking-tight text-center">{color.replace('-', ' ')}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);
