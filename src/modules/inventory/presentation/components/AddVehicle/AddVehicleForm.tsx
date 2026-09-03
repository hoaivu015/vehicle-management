import React from 'react';
import { ChevronRight, RefreshCw, X, FileText, BarChart3, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { Staff } from '@/src/shared/domain/types';
import { BaseTextArea } from '@/src/shared/design-system/FormElements';
import { AddVehicleRequest } from '../../../application/AddVehicle';
import { VehicleProfile } from './components/VehicleProfile';
import { EconomicSection } from './components/EconomicSection';
import { CoInvestModule } from './components/CoInvestModule';
import { ImageUploader } from './components/ImageUploader';
import { useAddVehicleForm } from './hooks/useAddVehicleForm';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';

interface AddVehicleFormProps {
  onClose: () => void;
  onSubmit: (data: AddVehicleRequest) => Promise<void>;
  staffList: Staff[];
  isOpen: boolean;
}

export const AddVehicleForm: React.FC<AddVehicleFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  staffList 
}) => {
  const { storageRepo } = useDependencies();
  const {
    formData,
    setFormData,
    loading,
    isUploading,
    formError,
    handleSubmit,
    handleFileUpload,
    handleToggleCoInvest,
    handleBuyerChange,
    handleCoinvestorChange
  } = useAddVehicleForm(isOpen, onSubmit, onClose, storageRepo);

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-slate-50/40">
      {/* Body Area - Zero-Scroll Balanced 2-Column Bento Matrix */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden custom-scrollbar p-3.5 md:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left Column (7/12): Vehicle Specs, Economics & Internal Notes */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="lg:col-span-7 space-y-3"
          >
            {/* Section 1: Vehicle Specs */}
            <div className="bg-white p-3.5 md:p-4 rounded-[20px] border border-hairline-soft shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-kraft-ink">
                <div className="w-7 h-7 rounded-full bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
                  <Sparkles size={14} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-kraft-ink">Hồ sơ & Thông số xe</h3>
              </div>

              <VehicleProfile 
                formData={formData} 
                setFormData={setFormData} 
              />
            </div>

            {/* Section 2: Purchase Economics */}
            <div className="bg-white p-3.5 md:p-4 rounded-[20px] border border-hairline-soft shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-kraft-ink">
                <div className="w-7 h-7 rounded-full bg-income/10 flex items-center justify-center text-income">
                  <BarChart3 size={14} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-kraft-ink">Thông tin thu mua</h3>
              </div>

              <EconomicSection 
                formData={formData} 
                setFormData={setFormData} 
                staffList={staffList} 
                onBuyerChange={handleBuyerChange}
              />
            </div>

            {/* Section 3: Internal Notes */}
            <div className="bg-white p-3 md:p-3.5 rounded-[20px] border border-hairline-soft shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-kraft-ink">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-kraft-ink/60">
                  <FileText size={14} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-kraft-ink">Ghi chú nội bộ</h3>
              </div>

              <BaseTextArea 
                placeholder="Nhập ghi chú chi tiết về tình trạng xe, thỏa thuận đặt cọc, kế hoạch làm đẹp hoàn thiện..."
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[52px] h-13 text-xs"
                variant="dense"
              />
            </div>
          </motion.div>

          {/* Right Column (5/12): Hero Media & Co-Investment Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220, delay: 0.05 }}
            className="lg:col-span-5 space-y-3"
          >
            {/* Media Uploader Box */}
            <div className="bg-white p-3.5 md:p-4 rounded-[20px] border border-hairline-soft shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-kraft-ink">
                <div className="w-7 h-7 rounded-full bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
                  <ImageIcon size={14} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-kraft-ink">Hình ảnh đại diện</h3>
              </div>

              <ImageUploader 
                imageUrl={formData.image_url || ''}
                isUploading={isUploading}
                onUpload={handleFileUpload}
                onRemove={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                onUrlChange={(url: string) => setFormData(prev => ({ ...prev, image_url: url }))}
              />
            </div>

            {/* Co-Investment Module */}
            <CoInvestModule 
              formData={formData} 
              setFormData={setFormData} 
              staffList={staffList} 
              onToggleCoInvest={handleToggleCoInvest}
              onCoinvestorChange={handleCoinvestorChange}
            />

            {/* Form Error Alert */}
            {formError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-[16px] bg-expense-light border border-expense/20 flex items-center gap-2.5 shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-expense/10 flex items-center justify-center text-expense shrink-0">
                  <X size={14} strokeWidth={3} />
                </div>
                <p className="text-[11px] font-bold text-expense">{formError}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Actions - Compact Pill Buttons */}
      <div className="py-2.5 px-4 md:px-6 border-t border-hairline-soft bg-white/90 backdrop-blur-2xl flex justify-end gap-2.5 items-center shrink-0 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
        <motion.button 
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onClose}
          disabled={loading || isUploading}
          className="px-5 h-10 md:h-11 rounded-full font-black text-xs uppercase tracking-wider text-sub-label hover:text-kraft-ink hover:bg-black/5 transition-all cursor-pointer"
        >
          Hủy bỏ
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={loading || isUploading}
          className={cn(
            "px-7 h-10 md:h-11 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer",
            loading || isUploading 
              ? "bg-kraft-accent/50 text-white cursor-not-allowed" 
              : "bg-kraft-accent hover:bg-kraft-accent/90 text-white shadow-kraft-accent/25"
          )}
        >
          {loading || isUploading ? <RefreshCw className="animate-spin" size={15} /> : <ChevronRight size={15} strokeWidth={3} />}
          <span>{loading ? 'Đang lưu...' : 'Thêm xe mới'}</span>
        </motion.button>
      </div>
    </form>
  );
};
