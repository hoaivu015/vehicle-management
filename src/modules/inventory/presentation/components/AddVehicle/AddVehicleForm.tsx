import React from 'react';
import { ChevronRight, RefreshCw, X, FileText, BarChart3, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { DESIGN_TOKENS } from '@/src/shared/design-system/tokens';
import { Staff } from '@/src/shared/domain/types';
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
    handleFileUpload
  } = useAddVehicleForm(isOpen, onSubmit, onClose, storageRepo);

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-[var(--meta-step-2)]">
      {/* Body Area - 3 Columns Matrix */}
      <div className={cn(
        "flex-1 overflow-y-auto lg:overflow-hidden custom-scrollbar py-6 md:py-8",
        DESIGN_TOKENS.layout.content_padding
      )}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-g4 h-full">
          {/* Column 1: Profile & Specs */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 text-kraft-accent mb-2 px-2">
              <FileText size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">Hồ sơ cơ bản</span>
              <div className="h-px flex-1 bg-kraft-accent/10 ml-2" />
            </div>
            <VehicleProfile 
              formData={formData} 
              setFormData={setFormData} 
            />
          </motion.div>

          {/* Column 2: Economics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
            className="space-y-6"
          >
             <div className="flex items-center gap-3 text-income mb-2 px-2">
              <BarChart3 size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">Kinh tế thu mua</span>
              <div className="h-px flex-1 bg-income/10 ml-2" />
            </div>
            <EconomicSection 
              formData={formData} 
              setFormData={setFormData} 
              staffList={staffList} 
            />
          </motion.div>

          {/* Column 3: Collaboration, Image & Notes */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.2 }}
            className="space-y-6 flex flex-col"
          >
            <div className="flex items-center gap-3 text-brand mb-2 px-2">
              <ImageIcon size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">Hợp tác & Hình ảnh</span>
              <div className="h-px flex-1 bg-brand/10 ml-2" />
            </div>
            
            <CoInvestModule 
              formData={formData} 
              setFormData={setFormData} 
              staffList={staffList} 
            />

            <div className="flex-1 pt-6">
              <ImageUploader 
                imageUrl={formData.image_url || ''}
                isUploading={isUploading}
                onUpload={handleFileUpload}
                onRemove={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                onUrlChange={(url: string) => setFormData(prev => ({ ...prev, image_url: url }))}
              />
            </div>
            
            {/* Form Error Display */}
            {formError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-t2 bg-expense-light border border-expense/20 flex items-center gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-expense/10 flex items-center justify-center text-expense">
                  <X size={14} strokeWidth={3} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-expense">{formError}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Actions - Traditional Pattern */}
      <div className={cn(
        "p-6 border-t border-hairline-soft bg-white/80 backdrop-blur-2xl flex justify-end gap-g2 items-center z-30",
        DESIGN_TOKENS.layout.content_padding
      )}>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onClose}
          className="px-8 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-sub-label hover:bg-surface-soft transition-all"
        >
          Hủy bỏ
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading || isUploading}
          className={cn(
            "px-10 h-14 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-kraft-deep",
            loading || isUploading ? "bg-kraft-accent/50 text-white cursor-not-allowed" : "bg-kraft-accent text-white shadow-kraft-accent/20"
          )}
        >
          {loading || isUploading ? <RefreshCw className="animate-spin" size={16} /> : <ChevronRight size={16} strokeWidth={3} />}
          <span>{loading ? 'Đang tạo...' : 'Tạo hồ sơ'}</span>
        </motion.button>
      </div>
    </form>
  );
};
