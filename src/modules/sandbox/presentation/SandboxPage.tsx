import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { SmartAmountInput } from '../../../components/SmartAmountInput';
import { VehicleStatus } from '../../../shared/domain/constants';
import { Vehicle } from '../../../shared/domain/types';
import { StaffWithSalary } from '../../staff/application/GetStaffList';

import { SandboxHeader } from './components/SandboxHeader';
import { SandboxInputs } from './components/SandboxInputs';
import { SandboxUIElements } from './components/SandboxUIElements';
import { SandboxSkeletons } from './components/SandboxSkeletons';
import { SandboxResizers } from './components/SandboxResizers';

export const SandboxPage = () => {
  const [testAmount, setTestAmount] = useState<number | undefined>(5000000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardWidth, setCardWidth] = useState(380);
  const [cardHeight, setCardHeight] = useState(450);
  const [cardVariant, setCardVariant] = useState<'standard' | 'large'>('standard');
  const [staffCardWidth, setStaffCardWidth] = useState(360);

  const mockVehicle: Vehicle = {
    id: 1, name: "Land Rover Defender 110 V8 Bond Edition", code: "DEF-007", year: 2024, odo: 1500, status: VehicleStatus.IN_STOCK, purchase_price: 8000000000, sale_price: 9500000000, image_url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200", is_pinned: true, days: 3, purchase_date: new Date().toISOString(), total_cost: 0, cost_history: [], is_coinvested: false, coinvest_amount: 0, buyer: ""
  };

  const mockStaff: StaffWithSalary = {
    id: "1", name: "Phan Vũ", code: "PV-001", email: "phanvu@auto28.vn", role: "Admin", base_salary: 15000000, commission_per_car: 500000, target: 10, status: "active", salaryDetails: { base: 15000000, salesCommission: 2500000, buyingCommission: 1000000, coinvestProfitShare: 1500000, kpiBonusMultiplier: 1, totalCommission: 5000000, totalSalary: 20000000, soldCount: 5, boughtCount: 2, completionRate: 50, soldCars: [], boughtCars: [], coinvestedCars: [] }
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 pt-8">
      <SandboxHeader onOpenModal={() => setIsModalOpen(true)} />
      <div className="space-y-12">
        <SandboxInputs testAmount={testAmount} setTestAmount={setTestAmount} />
        <SandboxUIElements />
        <SandboxSkeletons />
        <SandboxResizers cardWidth={cardWidth} setCardWidth={setCardWidth} cardHeight={cardHeight} setCardHeight={setCardHeight} cardVariant={cardVariant} setCardVariant={setCardVariant} staffCardWidth={staffCardWidth} setStaffCardWidth={setStaffCardWidth} mockVehicle={mockVehicle} mockStaff={mockStaff} />
      </div>

      {/* Demo Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 lg:p-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-kraft-ink/60 backdrop-blur-md cursor-pointer" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-lg bg-white/90 backdrop-blur-3xl rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/60 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/60 flex items-center justify-between bg-white/40">
                  <div><h3 className="text-xl font-black text-kraft-ink uppercase">Thêm xe mới</h3><p className="text-[10px] font-bold text-kraft-ink/40 uppercase tracking-[0.2em] mt-1 italic">Liquid Professional Standard</p></div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-black/5 rounded-2xl transition-colors text-kraft-ink/40"><X size={20} /></button>
                </div>
                <div className="p-8 md:p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Tên xe / Model</label><input type="text" className="liquid-input" placeholder="VD: Toyota Camry 2022" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Năm sản xuất</label><input type="text" className="liquid-input" placeholder="2022" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Màu sắc</label><input type="text" className="liquid-input" placeholder="Trắng" /></div>
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Giá thu mua</label><SmartAmountInput value={0} onChange={() => {}} placeholder="Nhập giá..." /></div>
                </div>
                <div className="p-8 bg-white/60 border-t border-white/60 flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 liquid-button-secondary h-16">Hủy bỏ</button>
                  <button className="flex-1 liquid-button-primary h-16">Lưu thông tin</button>
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
