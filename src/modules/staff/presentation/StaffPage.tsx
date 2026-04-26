import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Search, AlertCircle, Plus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/src/utils/cn';

import { StaffPresenter, StaffView } from './StaffPresenter';
import { GetStaffList, StaffWithSalary } from '@/src/modules/staff/application/GetStaffList';
import { AddStaff } from '@/src/modules/staff/application/AddStaff';
import { UpdateStaff } from '@/src/modules/staff/application/UpdateStaff';
import { AddStaffExpense } from '@/src/modules/staff/application/AddStaffExpense';
import { ToggleStaffExpenseReimbursement } from '@/src/modules/staff/application/ToggleStaffExpenseReimbursement';
import { SupabaseExpenseRepository } from '@/src/modules/finance/infrastructure/SupabaseExpenseRepository';
import { SupabaseStaffRepository } from '@/src/modules/staff/infrastructure/SupabaseStaffRepository';
import { SupabaseVehicleRepository } from '@/src/modules/inventory/infrastructure/SupabaseVehicleRepository';
import { DeleteStaff } from '@/src/modules/staff/application/DeleteStaff';
import { DeleteStaffExpense } from '@/src/modules/staff/application/DeleteStaffExpense';
import { UpdateStaffExpense } from '@/src/modules/staff/application/UpdateStaffExpense';
import { ReimburseStaffExpenses } from '@/src/modules/staff/application/ReimburseStaffExpenses';
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
    const expenseRepo = new SupabaseExpenseRepository();
    return new StaffPresenter(
      new GetStaffList(repository, vehicleRepo),
      new AddStaff(repository),
      new UpdateStaff(repository),
      new DeleteStaff(repository),
      new AddStaffExpense(repository, vehicleRepo, expenseRepo),
      new ToggleStaffExpenseReimbursement(repository),
      new DeleteStaffExpense(repository),
      new UpdateStaffExpense(repository),
      new ReimburseStaffExpenses(repository)
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

  // Luôn đồng bộ selectedStaff với dữ liệu mới nhất từ server
  useEffect(() => {
    setSelectedStaff(current => {
      if (!current) return current;
      const updated = staffList.find(s => s.id === current.id);
      return updated || current;
    });
  }, [staffList]);



  return (
    <div className="space-y-6 md:space-y-12 py-4 md:py-12 px-4 md:px-12 max-w-[1700px] mx-auto h-full flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-black/5 pb-8 md:pb-10 relative z-30">
        <div className="text-left">
          <h2 className="text-[clamp(1.5rem,8vw,3.5rem)] md:text-5xl lg:text-6xl font-black tracking-tighter text-kraft-ink flex items-center gap-3 md:gap-6 leading-none uppercase">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20 shadow-inner shrink-0 scale-90 md:scale-100">
              <Users size={32} className="md:w-9 md:h-9" strokeWidth={2.5} />
            </div>
            Nhân sự
          </h2>
          <p className="text-sub-label !text-kraft-ink/60 mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-kraft-accent animate-pulse" />
            Quản lý đội ngũ và hiệu suất kinh doanh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center lg:justify-end">
          <div className="relative group min-w-[220px] md:w-60">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-kraft-accent/60 group-hover:text-kraft-accent transition-colors">
              <Calendar size={16} />
            </div>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="pl-12 pr-6 h-14 w-full bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 text-[11px] font-black uppercase tracking-widest text-kraft-ink focus:border-kraft-accent/40 focus:ring-4 focus:ring-kraft-accent/5 transition-all outline-none shadow-sm"
            />
          </div>


          {hasPermission(PERMISSIONS.EDIT_STAFF) && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="h-14 liquid-button-primary px-8 flex items-center justify-center gap-3 groupshadow-xl hover:shadow-kraft-accent/20 transition-all font-black uppercase tracking-widest text-[10px]"
            >
              <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
              Thêm nhân sự
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading && staffList.length === 0 ? (
          <StaffSkeleton hideHeader />
        ) : error ? (
          <div
            className="p-12 text-center bg-red-50/50 backdrop-blur-md rounded-[3rem] border border-red-100"
          >
            <AlertCircle className="mx-auto text-red-500 mb-6" size={48} />
            <h3 className="text-xl font-black text-red-700 uppercase mb-2">Đã có lỗi xảy ra</h3>
            <p className="text-sm font-bold text-red-600 mb-8 uppercase tracking-widest">{error}</p>
            <button
              onClick={() => presenter.loadStaff(filterMonth)}
              className="liquid-button-primary px-10 h-14"
            >
              Thử lại ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:gap-12 justify-items-center overflow-y-auto h-full pr-2 custom-scrollbar pb-20">
            {staffList.map((member) => (
              <div key={member.id} className="w-full max-w-[380px]">
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
                <p className="text-sub-label !text-kraft-ink/60 italic">Chưa có nhân sự nào được đăng ký</p>
                {hasPermission(PERMISSIONS.EDIT_STAFF) && (
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="mt-6 text-sub-label !text-kraft-accent hover:underline decoration-2 underline-offset-8"
                  >
                    Nhấp vào đây để thêm nhân viên đầu tiên
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

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
            onAddExpense={(staffId, data) => presenter.addStaffExpense(staffId, data)}
            onToggleReimbursement={(staffId, expId) => presenter.toggleReimbursement(staffId, expId)}
            onDeleteExpense={(staffId, expId) => presenter.deleteExpense(staffId, expId)}
            onUpdateExpense={(staffId, expId, data) => presenter.updateExpense(staffId, expId, data)}
            onReimburseMultiple={(staffId, ids) => presenter.reimburseMultiple(staffId, ids)}
            userRole={userRole}
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
