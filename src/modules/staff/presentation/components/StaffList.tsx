import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Plus } from 'lucide-react';
import { StaffWithSalary } from '../../application/GetStaffList';
import { StaffCard } from './StaffCard';
import { StaffSkeleton } from './StaffSkeleton';
import { EmptyState } from '@/src/shared/design-system/DataDisplay';

interface StaffListProps {
  loading: boolean;
  staffList: StaffWithSalary[];
  error: string | null;
  onRefresh: () => void;
  onEdit: (staff: StaffWithSalary) => void;
  onDelete: (staff: StaffWithSalary) => void;
  onViewDetail: (staff: StaffWithSalary) => void;
  onTogglePayment: (staff: StaffWithSalary) => Promise<void>;
  isSubmitting: boolean;
  hasEditPermission: boolean;
  setIsAddOpen: (open: boolean) => void;
}

export const StaffList: React.FC<StaffListProps> = ({
  loading,
  staffList,
  error,
  onRefresh,
  onEdit,
  onDelete,
  onViewDetail,
  onTogglePayment,
  isSubmitting,
  hasEditPermission,
  setIsAddOpen
}) => {
  if (loading && staffList.length === 0) {
    return <StaffSkeleton hideHeader />;
  }

  if (error) {
    return (
      <div className="p-g6 text-center bg-kraft-bg rounded-t2 border border-expense/20 shadow-kraft">
        <AlertCircle className="mx-auto text-expense mb-g3" size={48} />
        <h3 className="text-[11px] font-black text-expense uppercase tracking-[0.3em] mb-2">Đã có lỗi xảy ra</h3>
        <p className="text-xs font-bold text-expense/60 mb-g4 uppercase tracking-widest leading-relaxed">{error}</p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          className="liquid-button-primary px-g5 h-14 native-interactive"
        >
          Thử lại ngay
        </motion.button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-g2 md:gap-g4 justify-items-center overflow-y-auto h-full custom-scrollbar pb-g6 pt-g2 render-boundary-isolated">
      {staffList.map((member, index) => (
        <motion.div 
          key={member.id} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: 'spring' as const, 
            damping: 25, 
            stiffness: 200, 
            delay: index * 0.04 
          }}
          style={{ willChange: 'transform, opacity' }}
          className="w-full h-full scroll-reveal-item"
        >
          <StaffCard
            member={member}
            onEdit={hasEditPermission ? () => onEdit(member) : undefined}
            onDelete={hasEditPermission ? () => onDelete(member) : undefined}
            onViewDetail={onViewDetail}
            onTogglePayment={hasEditPermission ? () => onTogglePayment(member) : undefined}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      ))}
      {staffList.length === 0 && (
        <EmptyState
          icon={Plus}
          title="Chưa có nhân sự nào được đăng ký"
          description="Hiện tại chưa có nhân viên nào trong danh sách."
          action={hasEditPermission && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="text-sub-label !text-kraft-accent hover:underline decoration-2 underline-offset-8"
            >
              Nhấp vào đây để thêm nhân viên đầu tiên
            </button>
          )}
        />
      )}
    </div>
  );
};
