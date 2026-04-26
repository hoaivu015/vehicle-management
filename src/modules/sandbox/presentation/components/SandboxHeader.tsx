import React from 'react';
import { Beaker, Plus } from 'lucide-react';

export const SandboxHeader = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20"><Beaker size={20} /></div>
        <h1 className="text-3xl font-black text-kraft-ink tracking-tight uppercase">Phòng thí nghiệm</h1>
      </div>
      <p className="text-kraft-ink/60 font-medium">Nơi thử nghiệm các thành phần UI cao cấp (Liquid Professional)</p>
    </div>
    <button onClick={onOpenModal} className="liquid-button-primary flex items-center gap-2"><Plus size={16} /> Thêm mới thành phần</button>
  </div>
);
