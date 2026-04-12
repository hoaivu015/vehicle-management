import { 
  Car, Calendar, TrendingUp, DollarSign, 
  User, CheckCircle2, Image as ImageIcon, X, Clock, Plus,
  ChevronRight, AlertCircle, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Modal } from '@/src/components/Modal';
import { CloudinaryVehicleStorageRepository } from '@/src/modules/inventory/infrastructure/CloudinaryVehicleStorageRepository';
import { AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';
import { cn } from '@/src/utils/cn';
import { UserRole } from '@/src/shared/domain/constants';

import React, { useState, useEffect } from 'react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddVehicleRequest) => Promise<void>;
  staffList: any[];
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  staffList,
}) => {
  const [formData, setFormData] = useState<AddVehicleRequest>({
    name: '',
    year: new Date().getFullYear(),
    odo: 0,
    color: '',
    purchase_price: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    buyer: '',
    is_coinvested: false,
    coinvestor_code: '',
    coinvest_amount: 0,
    notes: '',
    image_url: '',
    buying_commission: 3000000
  });

  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const storageRepo = new CloudinaryVehicleStorageRepository();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when closed
      setFormData({
        name: '',
        year: new Date().getFullYear(),
        odo: 0,
        color: '',
        purchase_price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        buyer: '',
        is_coinvested: false,
        coinvestor_code: '',
        coinvest_amount: 0,
        notes: '',
        image_url: '',
        buying_commission: 3000000
      });
      setFormError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name) return setFormError('Vui lòng nhập tên xe');
    if (!formData.buyer) return setFormError('Vui lòng chọn nhân viên mua');
    if (formData.is_coinvested && (!formData.coinvestor_code || formData.coinvest_amount === 0)) {
      return setFormError('Vui lòng nhập đầy đủ thông tin góp vốn');
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi lưu thông tin. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);
    try {
      const publicUrl = await storageRepo.uploadImage(file, 'vehicle_image');
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error: any) {
      setFormError(error.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const headerTitle = (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-kraft-accent/10 border border-kraft-accent/20 flex items-center justify-center text-kraft-accent shadow-inner">
        <Car size={22} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-xl font-black tracking-tight text-kraft-ink uppercase leading-none">Thêm xe mới</h3>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={headerTitle} maxWidth="2xl">
      <div className="p-8 space-y-12">
        
        {/* Section: Định danh phương tiện */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-kraft-accent" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">Thông tin xe</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Tên xe</label>
              <div className="relative group">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                <input 
                  required placeholder="VD: Mercedes C300 AMG 2021"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="liquid-input pl-12 h-14" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Năm SX</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                <input 
                  type="number" required
                  value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="liquid-input pl-12 h-14" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Màu ngoại thất</label>
              <div className="relative group">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                <input 
                  required placeholder="Trắng / Đen..."
                  value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="liquid-input pl-12 h-14" 
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <SmartAmountInput 
                label="Số ODO (km)"
                value={formData.odo || 0} 
                onChange={(v) => setFormData({...formData, odo: v})}
                suffix=" km" icon={Clock} showTextPreview={false}
                placeholder="Nhập vd: 5k, 12k..."
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Ảnh đại diện</label>
              <div className="flex gap-4">
                <div className="flex-1 relative group">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                  <input 
                    placeholder="Dán URL ảnh hoặc tải lên..."
                    value={formData.image_url} 
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="liquid-input pl-12 pr-32 h-14"
                  />
                  <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer transition-transform active:scale-95">
                    <div className="h-10 px-4 bg-kraft-ink text-white rounded-xl shadow-lg flex items-center gap-2 hover:bg-kraft-accent transition-colors">
                      {isUploading ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                      <span className="text-[8px] font-black uppercase tracking-widest">Tải lên</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
                {formData.image_url && (
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl group shrink-0">
                    <img src={formData.image_url} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Tài chính & Giao dịch */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">Thông tin mua vào</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SmartAmountInput 
              label="Giá nhập xe"
              value={formData.purchase_price} 
              onChange={(v) => setFormData({...formData, purchase_price: v})}
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Ngày cọc mua</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                <input 
                  type="date" required
                  value={formData.purchase_date} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  className="liquid-input pl-12 h-14" 
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Nhân viên mua</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                <select 
                  required className="liquid-input pl-12 h-14 pr-10 appearance-none"
                  value={formData.buyer} onChange={(e) => setFormData({...formData, buyer: e.target.value})}
                >
                  <option value="">Chọn nhân viên công ty...</option>
                  {staffList.filter(s => s.role !== UserRole.ADMIN).map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 rotate-90">
                   <ChevronRight size={14} />
                </div>
              </div>
            </div>

            {/* Co-invest Toggle */}
            <div 
              className={cn(
                "md:col-span-2 flex items-center gap-6 p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group",
                formData.is_coinvested 
                  ? "bg-kraft-accent text-white border-kraft-accent shadow-xl shadow-kraft-accent/20" 
                  : "bg-white/40 border-white/60 hover:bg-white"
              )}
              onClick={() => setFormData(prev => ({ ...prev, is_coinvested: !prev.is_coinvested }))}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg",
                formData.is_coinvested ? "bg-white/20 text-white" : "bg-kraft-accent/10 text-kraft-accent"
              )}>
                <TrendingUp size={20} />
              </div>
              <div className="flex-1">
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", formData.is_coinvested ? "text-white" : "text-kraft-ink")}>
                  Hợp tác đầu tư (Cổ đông)
                </p>
                <p className={cn("text-[8px] uppercase font-bold tracking-tight opacity-60", formData.is_coinvested ? "text-white" : "text-kraft-ink/40")}>
                  Có cổ đông góp vốn cùng
                </p>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                formData.is_coinvested ? "border-white bg-white" : "border-kraft-accent/20"
              )}>
                {formData.is_coinvested && <CheckCircle2 size={12} className="text-kraft-accent" fill="currentColor" />}
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {formData.is_coinvested && (
            <motion.section 
              initial={{ opacity: 0, height: 0, marginTop: -20 }} 
              animate={{ opacity: 1, height: 'auto', marginTop: 0 }} 
              exit={{ opacity: 0, height: 0, marginTop: -20 }}
              className="space-y-6 overflow-hidden"
            >
              <div className="p-8 bg-white/40 rounded-[2rem] border border-white/60 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-kraft-accent" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/40">Chi tiết góp vốn</h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Đối tác góp vốn</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
                      <select 
                        required className="liquid-input pl-12 h-14 pr-10 appearance-none"
                        value={formData.coinvestor_code} 
                        onChange={(e) => setFormData({...formData, coinvestor_code: e.target.value})}
                      >
                        <option value="">Chọn đối tác...</option>
                        {staffList.filter(s => s.role !== UserRole.ADMIN).map(s => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 rotate-90">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <SmartAmountInput 
                      label="Số tiền góp vốn"
                      value={formData.coinvest_amount || 0} 
                      onChange={(v) => setFormData({...formData, coinvest_amount: v})}
                    />
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section: Ghi chú */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">Ghi chú</h4>
          </div>
          <textarea 
            rows={3} placeholder="Mô tả tình trạng xe, các hạng mục cần lưu ý..."
            value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="liquid-input min-h-[120px] py-4"
          />
        </section>

        {/* Action Footer */}
        <div className="pt-8 border-t border-black/5 flex flex-col gap-6">
          <AnimatePresence>
            {formError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100"
              >
                <AlertCircle size={18} />
                <p className="text-[9px] font-black uppercase tracking-widest">{formError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="liquid-button-secondary h-16 flex-1 text-[10px] font-black uppercase tracking-widest"
            >
              Hủy
            </button>
            <button 
              onClick={() => handleSubmit()}
              disabled={loading || isUploading}
              className="liquid-button-primary h-16 flex-[1.5] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
            >
              {loading ? (
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : <ShieldCheck size={18} />}
              Khởi tạo hồ sơ xe
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
