import React from 'react';
import { 
  Car, Calendar, TrendingUp, User, CheckCircle2, 
  Image as ImageIcon, X, Clock, Plus,
  ChevronRight, AlertCircle, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Modal } from '@/src/components/Modal';
import { AddVehicleRequest } from '@/src/modules/inventory/application/AddVehicle';
import { cn } from '@/src/utils/cn';
import { UserRole } from '@/src/shared/domain/constants';
import { useAddVehicleForm } from './useAddVehicleForm';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddVehicleRequest) => Promise<void>;
  staffList: any[];
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSubmit, staffList }) => {
  const {
    formData, setFormData, loading, isUploading, formError, handleSubmit, handleFileUpload
  } = useAddVehicleForm(isOpen, onSubmit, onClose);

  const headerTitle = (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-kraft-accent/10 border border-kraft-accent/20 flex items-center justify-center text-kraft-accent shadow-inner">
        <Car size={22} strokeWidth={2.5} />
      </div>
      <h3 className="text-xl font-black tracking-tight text-kraft-ink uppercase leading-none">Thêm xe mới</h3>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={headerTitle} maxWidth="2xl">
      <div className="p-8 space-y-12">
        {/* Section: Thông tin xe */}
        <section className="space-y-6">
          <SectionHeader iconColor="bg-kraft-accent" label="Thông tin xe" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-3">
              <InputLabel label="Tên sản phẩm / Model" isMain />
              <div className="relative group">
                <Car className="absolute left-6 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={18} strokeWidth={2.5} />
                <input required placeholder="VD: Mercedes C300 AMG 2021" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="liquid-input pl-16 h-16" />
              </div>
            </div>
            <FormInput label="Năm SX" icon={Calendar} value={formData.year} type="number" onChange={(v) => setFormData({...formData, year: parseInt(v)})} />
            <FormInput label="Màu ngoại thất" icon={Layers} value={formData.color} placeholder="Trắng / Đen..." onChange={(v) => setFormData({...formData, color: v})} />
            <div className="md:col-span-2">
              <SmartAmountInput label="Số ODO (km)" value={formData.odo || 0} onChange={(v) => setFormData({...formData, odo: v})} suffix=" km" icon={Clock} showTextPreview={false} placeholder="Nhập vd: 5k, 12k..." />
            </div>
            <ImageUploadSection isUploading={isUploading} imageUrl={formData.image_url} onUpload={handleFileUpload} onRemove={() => setFormData({...formData, image_url: ''})} onUrlChange={(v) => setFormData({...formData, image_url: v})} />
          </div>
        </section>

        {/* Section: Thông tin mua vào */}
        <section className="space-y-6">
          <SectionHeader iconColor="bg-emerald-500" label="Thông tin mua vào" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SmartAmountInput label="Giá nhập xe" value={formData.purchase_price} onChange={(v) => setFormData({...formData, purchase_price: v})} />
            <FormInput label="Ngày cọc mua" icon={Calendar} value={formData.purchase_date} type="date" onChange={(v) => setFormData({...formData, purchase_date: v})} isLarge />
            <StaffSelect label="Nhân viên mua" value={formData.buyer} staffList={staffList} onChange={(v) => setFormData({...formData, buyer: v})} />
            <CoInvestToggle isActive={formData.is_coinvested} onClick={() => setFormData(prev => ({ ...prev, is_coinvested: !prev.is_coinvested }))} />
          </div>
        </section>

        <CoInvestDetails isVisible={formData.is_coinvested} staffList={staffList} coinvestorCode={formData.coinvestor_code} coinvestAmount={formData.coinvest_amount} onCodeChange={(v) => setFormData({...formData, coinvestor_code: v})} onAmountChange={(v) => setFormData({...formData, coinvest_amount: v})} />

        <section className="space-y-4">
          <SectionHeader iconColor="bg-blue-400" label="Ghi chú" />
          <textarea rows={3} placeholder="Mô tả tình trạng xe, các hạng mục cần lưu ý..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="liquid-input min-h-[120px] py-4" />
        </section>

        <FormFooter error={formError} loading={loading} isUploading={isUploading} onCancel={onClose} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
};

// --- Sub-components to reduce main JSX size ---

const SectionHeader = ({ iconColor, label }: { iconColor: string, label: string }) => (
  <div className="flex items-center gap-3 ml-1">
    <div className={cn("w-1.5 h-1.5 rounded-full", iconColor)} />
    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">{label}</h4>
  </div>
);

const InputLabel = ({ label, isMain }: { label: string, isMain?: boolean }) => (
  <label className={cn("text-[10px] font-black uppercase tracking-widest opacity-40", isMain ? "ml-4" : "ml-1")}>{label}</label>
);

const FormInput = ({ label, icon: Icon, value, onChange, type = "text", placeholder, isLarge }: any) => (
  <div className={cn("space-y-2", isLarge && "md:col-span-2 space-y-3")}>
    <InputLabel label={label} isMain={isLarge} />
    <div className="relative group">
      <Icon className={cn("absolute top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors", isLarge ? "left-6" : "left-4")} size={isLarge ? 18 : 16} strokeWidth={isLarge ? 2.5 : 2} />
      <input type={type} required placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={cn("liquid-input", isLarge ? "pl-16 h-16" : "pl-12 h-14")} />
    </div>
  </div>
);

const StaffSelect = ({ label, value, staffList, onChange }: any) => (
  <div className="md:col-span-2 space-y-2">
    <InputLabel label={label} />
    <div className="relative group">
      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
      <select required className="liquid-input pl-12 h-14 pr-10 appearance-none" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Chọn nhân viên công ty...</option>
        {staffList.filter((s: any) => s.role !== UserRole.ADMIN).map((s: any) => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 rotate-90"><ChevronRight size={14} /></div>
    </div>
  </div>
);

const CoInvestToggle = ({ isActive, onClick }: any) => (
  <div className={cn("md:col-span-2 flex items-center gap-6 p-6 rounded-lg border transition-all cursor-pointer group", isActive ? "bg-kraft-accent text-white border-kraft-accent shadow-xl shadow-kraft-accent/20" : "bg-white/40 border-white/60 hover:bg-white")} onClick={onClick}>
    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shadow-lg", isActive ? "bg-white/20 text-white" : "bg-kraft-accent/10 text-kraft-accent")}><TrendingUp size={20} /></div>
    <div className="flex-1">
      <p className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", isActive ? "text-white" : "text-kraft-ink")}>Hợp tác đầu tư (Cổ đông)</p>
      <p className={cn("text-[8px] uppercase font-bold tracking-tight opacity-60", isActive ? "text-white" : "text-kraft-ink/40")}>Có cổ đông góp vốn cùng</p>
    </div>
    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", isActive ? "border-white bg-white" : "border-kraft-accent/20")}>
      {isActive && <CheckCircle2 size={12} className="text-kraft-accent" fill="currentColor" />}
    </div>
  </div>
);

const CoInvestDetails = ({ isVisible, staffList, coinvestorCode, coinvestAmount, onCodeChange, onAmountChange }: any) => (
  <AnimatePresence>
    {isVisible && (
      <motion.section initial={{ opacity: 0, height: 0, marginTop: -20 }} animate={{ opacity: 1, height: 'auto', marginTop: 0 }} exit={{ opacity: 0, height: 0, marginTop: -20 }} className="space-y-6 overflow-hidden">
        <div className="p-8 bg-black/[0.02] rounded-lg border border-[#E5E7EB] space-y-8">
          <SectionHeader iconColor="bg-kraft-accent" label="Chi tiết góp vốn" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <InputLabel label="Đối tác góp vốn" isMain />
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={18} strokeWidth={2.5} />
                <select required className="liquid-input pl-16 h-16 pr-10 appearance-none bg-black/[0.02]" value={coinvestorCode} onChange={(e) => onCodeChange(e.target.value)}>
                  <option value="">Chọn đối tác...</option>
                  {staffList.filter((s: any) => s.role !== UserRole.ADMIN).map((s: any) => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 rotate-90"><ChevronRight size={14} /></div>
              </div>
            </div>
            <SmartAmountInput label="Số tiền góp vốn" value={coinvestAmount || 0} onChange={onAmountChange} />
          </div>
        </div>
      </motion.section>
    )}
  </AnimatePresence>
);

const ImageUploadSection = ({ isUploading, imageUrl, onUpload, onRemove, onUrlChange }: any) => (
  <div className="md:col-span-2 space-y-3">
    <InputLabel label="Ảnh đại diện" />
    <div className="flex gap-4">
      <div className="flex-1 relative group">
        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30 group-focus-within:text-kraft-accent transition-colors" size={16} />
        <input placeholder="Dán URL ảnh hoặc tải lên..." value={imageUrl} onChange={(e) => onUrlChange(e.target.value)} className="liquid-input pl-12 pr-32 h-14" />
        <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer transition-transform active:scale-95">
          <div className="h-10 px-4 bg-kraft-accent text-white rounded-lg shadow-lg flex items-center gap-2 hover:brightness-110 transition-colors shadow-kraft-accent/20">
            {isUploading ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
            <span className="text-[8px] font-black uppercase tracking-widest">Tải lên</span>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={onUpload} disabled={isUploading} />
        </label>
      </div>
      {imageUrl && (
        <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-white shadow-xl group shrink-0">
          <img src={imageUrl} className="w-full h-full object-cover" />
          <button type="button" onClick={onRemove} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"><X size={16} /></button>
        </div>
      )}
    </div>
  </div>
);

const FormFooter = ({ error, loading, isUploading, onCancel, onSubmit }: any) => (
  <div className="pt-8 border-t border-black/5 flex flex-col gap-6">
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          <AlertCircle size={18} />
          <p className="text-[9px] font-black uppercase tracking-widest">{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
    <div className="flex gap-4">
      <button type="button" onClick={onCancel} className="liquid-button-secondary h-16 flex-1 text-[10px] font-black uppercase tracking-widest">Hủy</button>
      <button onClick={() => onSubmit()} disabled={loading || isUploading} className="liquid-button-primary h-16 flex-[1.5] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
        {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <ShieldCheck size={18} />}
        Khởi tạo hồ sơ xe
      </button>
    </div>
  </div>
);
