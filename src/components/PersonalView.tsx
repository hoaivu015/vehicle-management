import React from 'react';
import { User, Calendar, DollarSign } from 'lucide-react';
import { calculateStaffSalaryDetails } from '@/src/utils/finance';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { Modal } from './Modal';
import { StaffAddExpenseModal } from '@/src/modules/staff/presentation/components/StaffAddExpenseModal';
import { usePersonalState } from '@/src/hooks/usePersonalState';

import { PersonalSidebar } from './Personal/PersonalSidebar';
import { PersonalStatsGrid } from './Personal/PersonalStatsGrid';
import { SalaryBreakdownCard } from './Personal/SalaryBreakdownCard';
import { PersonalAdvancesCard } from './Personal/PersonalAdvancesCard';
import { PersonalVehiclesSection } from './Personal/PersonalVehiclesSection';

interface PersonalViewProps {
  user: any;
  onUpdateUser?: (docId: string, data: any) => void;
  onLogout?: () => void;
}

export const PersonalView = ({ user, onUpdateUser, onLogout }: PersonalViewProps) => {
  const {
    cars, selectedMonth, setSelectedMonth, staffData, isExpenseModalOpen, setIsExpenseModalOpen,
    editingExpense, setEditingExpense, isModalOpen, setIsModalOpen, isEditModalOpen, setIsEditModalOpen,
    newPassword, setNewPassword, editFormData, setEditFormData, handleChangePassword, handleUpdateProfile,
    staffPresenter
  } = usePersonalState(user, onUpdateUser);

  if (!user) return null;

  const salaryDetails = calculateStaffSalaryDetails(user, cars, selectedMonth);
  const soldCars = React.useMemo(() => cars.filter(car => car.status === VehicleStatus.SOLD && car.seller === user.code && car.sale_date?.startsWith(selectedMonth)), [cars, user.code, selectedMonth]);
  const boughtCars = React.useMemo(() => cars.filter(car => car.buyer === user.code && car.purchase_date?.startsWith(selectedMonth)), [cars, user.code, selectedMonth]);
  const coinvestedCars = React.useMemo(() => cars.filter(car => {
    if (!car.is_coinvested || car.coinvestor_code !== user.code) return false;
    const pMonth = car.purchase_date?.slice(0, 7);
    const sMonth = car.sale_date?.slice(0, 7);
    return (car.status === VehicleStatus.SOLD && sMonth === selectedMonth) || (pMonth === selectedMonth) || (pMonth && pMonth < selectedMonth && (car.status !== VehicleStatus.SOLD || (sMonth && sMonth > selectedMonth)));
  }), [cars, user.code, selectedMonth]);

  return (
    <div className="h-full space-y-10 md:space-y-14 overflow-y-auto px-4 md:px-12 py-4 md:py-12 custom-scrollbar pb-24 max-w-[1700px] mx-auto">
      <header className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10">
        <div className="text-center lg:text-left">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-6 justify-center lg:justify-start font-heading">
            <div className="w-16 h-16 rounded-t2 bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20"><User size={38} strokeWidth={2.5} /></div>
            Cá nhân
          </h2>
          <p className="text-sub-label !opacity-30 mt-4 flex items-center gap-3 justify-center lg:justify-start"><span className="w-2 h-2 rounded-full bg-kraft-accent animate-pulse" />Xem hiệu suất và thu nhập của bạn</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md rounded-t2 px-6 py-4 border border-white/60 shadow-xl h-16 min-w-[220px]">
          <Calendar size={20} className="text-kraft-accent" />
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="text-[11px] font-black outline-none bg-transparent text-kraft-ink uppercase tracking-widest w-full cursor-pointer" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <PersonalSidebar user={user} onLogout={onLogout} setIsEditModalOpen={setIsEditModalOpen} setIsModalOpen={setIsModalOpen} onUpdateUser={onUpdateUser} />
        <div className="lg:col-span-3 space-y-12">
          <PersonalStatsGrid totalSalary={salaryDetails.totalSalary} totalCommission={salaryDetails.totalCommission} coinvestProfitShare={salaryDetails.coinvestProfitShare} soldCarsCount={soldCars.length} target={user.target} completionRate={salaryDetails.completionRate} selectedMonth={selectedMonth} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <SalaryBreakdownCard salaryDetails={salaryDetails} selectedMonth={selectedMonth} />
            <PersonalAdvancesCard expenses={staffData?.expenses || []} onAddClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} onEditClick={(e) => { setEditingExpense(e); setIsExpenseModalOpen(true); }} onDeleteClick={(id) => staffPresenter.deleteExpense(staffData?.id || user.id, id)} />
          </div>
        </div>
      </div>

      <PersonalVehiclesSection soldCars={soldCars} boughtCars={boughtCars} coinvestedCars={coinvestedCars} selectedMonth={selectedMonth} user={user} />

      <StaffAddExpenseModal isOpen={isExpenseModalOpen} onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }} staffId={staffData?.id || user.id} staffName={user.name} expense={editingExpense} onAdd={(data) => editingExpense ? staffPresenter.updateExpense(staffData?.id || user.id, editingExpense.id, data) : staffPresenter.addStaffExpense(staffData?.id || user.id, data)} />

      <PasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} value={newPassword} onChange={setNewPassword} onSubmit={handleChangePassword} />
      <ProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} data={editFormData} onChange={setEditFormData} onSubmit={handleUpdateProfile} />
    </div>
  );
};

const PasswordModal = ({ isOpen, onClose, value, onChange, onSubmit }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu" maxWidth="sm">
    <div className="p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <label className="text-sub-label ml-1">Mật khẩu mới</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="liquid-input h-12 px-4 text-sm w-full" placeholder="Nhập mật khẩu mới..." />
      </div>
      <div className="flex gap-4 pt-4">
        <button onClick={onClose} className="flex-1 h-14 liquid-button-secondary">Hủy</button>
        <button onClick={onSubmit} className="flex-1 liquid-button-primary h-14">Xác nhận</button>
      </div>
    </div>
  </Modal>
);

const ProfileModal = ({ isOpen, onClose, data, onChange, onSubmit }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa hồ sơ" maxWidth="md">
    <div className="p-8 md:p-10 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-sub-label ml-1">Họ và tên</label>
          <input type="text" value={data.name} onChange={(e) => onChange({...data, name: e.target.value})} className="liquid-input h-14 px-6 text-sm w-full font-black tracking-tight" />
        </div>
        <div className="space-y-3">
          <label className="text-sub-label ml-1">Số điện thoại</label>
          <input type="text" value={data.phone} onChange={(e) => onChange({...data, phone: e.target.value})} className="liquid-input h-14 px-6 text-sm w-full font-black tracking-tight" />
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button onClick={onClose} className="flex-1 h-14 liquid-button-secondary">Hủy</button>
        <button onClick={onSubmit} className="flex-1 liquid-button-primary h-14">Cập nhật</button>
      </div>
    </div>
  </Modal>
);
