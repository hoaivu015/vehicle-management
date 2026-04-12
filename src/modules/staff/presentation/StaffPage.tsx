import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Search, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/src/utils/cn';

import { StaffPresenter, StaffView } from './StaffPresenter';
import { GetStaffList, StaffWithSalary } from '@/src/modules/staff/application/GetStaffList';
import { AddStaff } from '@/src/modules/staff/application/AddStaff';
import { UpdateStaff } from '@/src/modules/staff/application/UpdateStaff';
import { DeleteStaff } from '@/src/modules/staff/application/DeleteStaff';
import { SupabaseStaffRepository } from '@/src/modules/staff/infrastructure/SupabaseStaffRepository';
import { SupabaseVehicleRepository } from '@/src/modules/inventory/infrastructure/SupabaseVehicleRepository';
import { Vehicle } from '@/src/shared/domain/types';

import { StaffCard } from './components/StaffCard';
import { StaffSkeleton } from './components/StaffSkeleton';
import { StaffAddModal } from './components/StaffAddModal';
import { StaffDetailModal } from './components/StaffDetailModal';
import { ConfirmModal } from '@/src/components/ConfirmModal';
import { PERMISSIONS } from '@/src/constants';

interface StaffPageProps {
  userRole: string;
  hasPermission: (permission: string) => boolean;
}

export const StaffPage: React.FC<StaffPageProps> = ({ userRole, hasPermission }) => {
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [staffList, setStaffList] = useState<StaffWithSalary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffWithSalary | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffWithSalary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithSalary | null>(null);

  // NEW: Helper for async actions
  const withSubmitState = (fn: Function) => async (...args: any[]) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fn(...args);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Khởi tạo Presenter & UseCase
  const presenter = useMemo(() => {
    const repository = new SupabaseStaffRepository();
    const vehicleRepo = new SupabaseVehicleRepository();
    return new StaffPresenter(
      new GetStaffList(repository, vehicleRepo),
      new AddStaff(repository),
      new UpdateStaff(repository),
      new DeleteStaff(repository)
    );
  }, []);

  // Thực thi View Interface
  const view: StaffView = useMemo(() => ({
    showStaffList: (list) => setStaffList(list),
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
    showError: (msg) => {
      setError(msg);
      toast.error(msg);
    },
    onStaffAdded: () => {
      toast.success('Thêm nhân viên thành công!');
      presenter.loadStaff(filterMonth);
      setIsAddOpen(false);
    },
    onStaffUpdated: () => {
      toast.success('Cập nhật thành công!');
      presenter.loadStaff(filterMonth);
    },
    onStaffDeleted: () => {
      toast.success('Đã xóa nhân viên!');
      presenter.loadStaff(filterMonth);
    }
  }), [presenter, filterMonth]);

  useEffect(() => {
    presenter.attachView(view);
    presenter.loadStaff(filterMonth);
    presenter.subscribeToChanges(filterMonth);
    return () => presenter.detachView();
  }, [presenter, view, filterMonth]);

  const handleEdit = (staff: StaffWithSalary) => {
    setEditingStaff(staff);
  };

  const handleDelete = withSubmitState(async () => {
    if (!deletingStaff) return;
    await presenter.deleteStaff(deletingStaff.id);
    setDeletingStaff(null);
  });



  return (
    <div className="space-y-8 md:space-y-12 py-6 md:py-10 px-6 md:px-12 max-w-[1700px] mx-auto h-full overflow-y-auto pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10">
        <div className="text-center lg:text-left">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-6 justify-center lg:justify-start">
            <div className="w-16 h-16 rounded-[2rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20">
              <Users size={38} strokeWidth={2.5} />
            </div>
            Nhân sự
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-4 opacity-30 flex items-center gap-3 justify-center lg:justify-start">
            <span className="w-2 h-2 rounded-full bg-kraft-accent animate-pulse" />
            Quản lý đội ngũ và hiệu suất kinh doanh
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center justify-center lg:justify-end">
          <div className="flex items-center bg-white/40 border border-white/60 p-1.5 rounded-[1.5rem] shadow-sm">
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 bg-transparent text-sm font-black text-kraft-ink outline-none appearance-none"
            />
          </div>

          
          {hasPermission(PERMISSIONS.EDIT_STAFF) && (
            <button 
              onClick={() => setIsAddOpen(true)}
              className="h-16 liquid-button-primary px-8 flex items-center justify-center gap-3 rounded-[1.5rem] group shadow-xl hover:shadow-kraft-accent/20 transition-all font-black uppercase tracking-widest text-xs"
            >
              <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
              Thêm nhân sự
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && staffList.length === 0 ? (
          <StaffSkeleton hideHeader />
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center bg-red-50/50 backdrop-blur-md rounded-[3rem] border border-red-100"
          >
            <AlertCircle className="mx-auto text-red-500 mb-6" size={48} />
            <h3 className="text-xl font-black text-red-700 uppercase mb-2">Đã có lỗi xảy ra</h3>
            <p className="text-sm font-bold text-red-600/60 mb-8 uppercase tracking-widest">{error}</p>
            <button 
              onClick={() => presenter.loadStaff(filterMonth)}
              className="liquid-button-primary px-10 h-14"
            >
              Thử lại ngay
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:gap-12 justify-items-center"
          >
            {staffList.map((member) => (
              <div key={member.id} className="w-full max-w-[360px]">
                <StaffCard 
                  member={member} 
                  onEdit={hasPermission(PERMISSIONS.EDIT_STAFF) ? () => handleEdit(member) : undefined}
                  onDelete={hasPermission(PERMISSIONS.EDIT_STAFF) ? () => setDeletingStaff(member) : undefined}
                  onViewDetail={(staff) => setSelectedStaff(staff)}
                  isSubmitting={isSubmitting}
                />
              </div>
            ))}
            {staffList.length === 0 && (
              <div className="col-span-full py-40 text-center">
                <div className="w-24 h-24 bg-kraft-accent/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-kraft-accent/10 opacity-40">
                  <Plus size={32} className="text-kraft-accent" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-kraft-ink/30 italic">Chưa có nhân sự nào được đăng ký</p>
                {hasPermission(PERMISSIONS.EDIT_STAFF) && (
                  <button 
                    onClick={() => setIsAddOpen(true)}
                    className="mt-6 text-[10px] font-black uppercase tracking-widest text-kraft-accent hover:underline decoration-2 underline-offset-8"
                  >
                    Nhấp vào đây để thêm nhân viên đầu tiên
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isAddOpen || editingStaff) && (
          <StaffAddModal 
            isOpen={isAddOpen || !!editingStaff} 
            member={editingStaff ?? undefined}
            onClose={() => {
              setIsAddOpen(false);
              setEditingStaff(null);
            }} 
            onAdd={(data) => editingStaff 
              ? presenter.updateStaff(editingStaff.id, data) 
              : presenter.addStaff(data)
            }
          />
        )}
        {selectedStaff && (
          <StaffDetailModal 
            member={selectedStaff}
            isOpen={!!selectedStaff}
            onClose={() => setSelectedStaff(null)}
            filterMonth={filterMonth}
          />
        )}
        {deletingStaff && (
          <ConfirmModal 
            isOpen={!!deletingStaff}
            onClose={() => setDeletingStaff(null)}
            onConfirm={handleDelete}
            isLoading={isSubmitting}
            title="Xác nhận xóa?"
            message={`Bạn có chắc chắn muốn xóa nhân viên ${deletingStaff.name}? Dữ liệu này sẽ không thể khôi phục.`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
