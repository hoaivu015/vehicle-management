import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, FileText, Car, Settings, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from '@/src/components/Modal';
import { SmartAmountInput } from '@/src/components/SmartAmountInput';
import { Vehicle, StaffExpense } from '@/src/shared/domain/types';
import { cn } from '@/src/utils/cn';
import { SupabaseVehicleRepository } from '@/src/modules/inventory/infrastructure/SupabaseVehicleRepository';

interface StaffAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
  onAdd: (expenseData: any) => Promise<void>;
  onDelete?: (expenseId: string) => Promise<void>;
  expense?: StaffExpense;
}

export const StaffAddExpenseModal: React.FC<StaffAddExpenseModalProps> = ({
  isOpen,
  onClose,
  staffId,
  staffName,
  onAdd,
  onDelete,
  expense
}) => {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState({
    amount: 0,
    note: '',
    date: new Date().toISOString().split('T')[0],
    type: 'vehicle' as 'vehicle' | 'operating',
    vehicleId: undefined as number | undefined,
    category: 'Vận hành'
  });

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        setFormData({
          amount: expense.amount,
          note: expense.note,
          date: expense.date,
          type: expense.type,
          vehicleId: expense.vehicle_id,
          category: expense.category || 'Vận hành'
        });
      } else {
        setFormData({
          amount: 0,
          note: '',
          date: new Date().toISOString().split('T')[0],
          type: 'vehicle',
          vehicleId: undefined,
          category: 'Vận hành'
        });
      }

      const fetchVehicles = async () => {
        const repo = new SupabaseVehicleRepository();
        const data = await repo.getAll();
        setVehicles(data.filter(v => v.status !== 'SOLD'));
      };
      fetchVehicles();
    }
  }, [isOpen, expense]);

  const handleDelete = async () => {
    if (!expense || !onDelete) return;
    if (!confirm('Bạn có chắc muốn xóa khoản chi này?')) return;

    setIsDeleting(true);
    try {
      await onDelete(expense.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    if (formData.type === 'vehicle' && !formData.vehicleId) return;

    setLoading(true);
    try {
      await onAdd(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!expense;

  const title = (
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border",
        isEdit ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
      )}>
        <DollarSign size={22} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-xl font-black tracking-tight text-kraft-ink uppercase leading-none mb-1">
          {isEdit ? 'Cập nhật khoản chi' : 'Ghi nhận khoản chi'}
        </h3>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
          Tạm ứng chi phí bởi {staffName}
        </p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="xl">
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">Phân loại chi phí</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'vehicle' })}
              className={cn(
                "h-20 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all",
                formData.type === 'vehicle' 
                  ? "bg-amber-500/5 border-amber-500/30 text-amber-700 shadow-lg shadow-amber-500/10" 
                  : "bg-white/40 border-black/5 text-kraft-ink/40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:bg-white/60 hover:shadow-md"
              )}
            >
              <Car size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Chi phí cho Xe</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'operating' })}
              className={cn(
                "h-20 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all",
                formData.type === 'operating' 
                  ? "bg-indigo-500/5 border-indigo-500/30 text-indigo-700 shadow-lg shadow-indigo-500/10" 
                  : "bg-white/40 border-black/5 text-kraft-ink/40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:bg-white/60 hover:shadow-md"
              )}
            >
              <Settings size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Chi phí Vận hành</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-kraft-accent" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-kraft-ink/40">Chi tiết khoản chi</h4>
          </div>

          <div className="space-y-6">
            <SmartAmountInput
              label="Số tiền thực chi"
              value={formData.amount}
              onChange={(v) => setFormData({ ...formData, amount: v })}
              placeholder="VD: 1.5tr"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Ngày thực hiện</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-accent/30" size={16} />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="liquid-input pl-12 h-14"
                  />
                </div>
              </div>

              {formData.type === 'vehicle' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Chọn xe được chi</label>
                  <select
                    required
                    value={formData.vehicleId || ''}
                    onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
                    className="liquid-input h-14 px-6 appearance-none bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">-- Chọn Xe --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Hạng mục chi</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="liquid-input h-14 px-6 appearance-none bg-white/50 backdrop-blur-sm"
                  >
                    <option value="Vận hành">Vận hành Showroom</option>
                    <option value="Marketing">Marketing / Quảng cáo</option>
                    <option value="Sửa chữa">Sửa chữa / Bảo trì TB</option>
                    <option value="Tiền điện/nước">Tiền điện / nước / Net</option>
                    <option value="Tiếp khách">Tiếp khách / Ăn uống</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Nội dung chi chi tiết</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 text-kraft-ink/20" size={16} />
                <textarea
                  required
                  rows={3}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="liquid-input pl-12 pt-4 min-h-[100px] resize-none"
                  placeholder="VD: Thay dầu máy xe Camry, Mua văn phòng phẩm..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-black/5 flex gap-4">
          {isEdit && onDelete && (
            <button
              type="button"
              disabled={loading || isDeleting}
              onClick={handleDelete}
              className="liquid-button-secondary h-16 px-8 text-red-500 border-red-500/20 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest flex items-center justify-center"
            >
              {isDeleting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-red-200 border-t-red-500 rounded-full" />
              ) : 'Xóa'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="liquid-button-secondary h-16 flex-1 text-[10px] font-black uppercase tracking-widest"
          >
            Đóng
          </button>
          <button
            type="submit"
            disabled={loading || formData.amount <= 0 || (formData.type === 'vehicle' && !formData.vehicleId)}
            className="liquid-button-primary h-16 flex-[2] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : <CheckCircle size={18} />}
            {isEdit ? 'Cập nhật khoản chi' : 'Xác nhận ghi tăng khoản chi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

