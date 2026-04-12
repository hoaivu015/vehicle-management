import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Key,
  LogOut,
  Settings,
  ShieldCheck,
  Zap,
  ChevronRight,
  PieChart,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';
import { calculateStaffSalaryDetails } from '../utils/finance';
import { VehicleStatus } from '../shared/domain/constants';
import { STAFF } from '../constants';
import { Modal } from './Modal';

import { PersonalPresenter, PersonalViewInterface } from '../modules/user/presentation/PersonalPresenter';
import { SupabaseVehicleRepository } from '../modules/inventory/infrastructure/SupabaseVehicleRepository';
import { Vehicle } from '../shared/domain/types';

interface PersonalViewProps {
  user: any;
  onUpdateUser?: (docId: string, data: any) => void;
  onLogout?: () => void;
}

export const PersonalView = ({ user, onUpdateUser, onLogout }: PersonalViewProps) => {
  if (!user) return null;

  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const presenter = React.useMemo(() => {
    return new PersonalPresenter(new SupabaseVehicleRepository());
  }, []);

  React.useEffect(() => {
    const view: PersonalViewInterface = {
      updateVehicles: setCars,
      setLoading: setLoading
    };
    presenter.attach(view);
    return () => presenter.detach();
  }, [presenter]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const [editFormData, setEditFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    department: user.department || 'Phòng Kinh doanh'
  });

  // Calculate personal KPIs based on cars handled
  const salaryDetails = calculateStaffSalaryDetails(user, cars, selectedMonth);
  
  const activities = React.useMemo(() => {
    const list: any[] = [];
    cars.forEach(car => {
      if (!car) return;
      // Check for sale activity
      if (car.seller === user.code) {
        list.push({
          type: 'sale',
          date: car.sale_date,
          carName: car.name,
          amount: car.commission ?? (user.commission_per_car || 0),
          car: car
        });
      }
      // Check for purchase activity
      if (car.buyer === user.code) {
        list.push({
          type: 'purchase',
          date: car.purchase_date,
          carName: car.name,
          amount: car.buying_commission ?? STAFF.DEFAULT_BUYING_COMMISSION,
          car: car
        });
      }
    });
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [cars, user.code, user.email, user.commission_per_car]);

  const soldCars = React.useMemo(() => cars.filter(car => 
    car.status === VehicleStatus.SOLD && 
    (car.seller === user.code) &&
    car.sale_date?.startsWith(selectedMonth)
  ), [cars, user.code, selectedMonth]);

  const boughtCars = React.useMemo(() => cars.filter(car => 
    (car.buyer === user.code) &&
    car.purchase_date?.startsWith(selectedMonth)
  ), [cars, user.code, selectedMonth]);

  const coinvestedCars = React.useMemo(() => cars.filter(car => {
    if (!car.is_coinvested || car.coinvestor_code !== user.code) return false;
    
    const purchaseMonth = car.purchase_date?.slice(0, 7);
    const saleMonth = car.sale_date?.slice(0, 7);
    
    // Relevant if:
    // 1. Sold in this month
    if (car.status === VehicleStatus.SOLD && saleMonth === selectedMonth) return true;
    // 2. Bought in this month
    if (purchaseMonth === selectedMonth) return true;
    // 3. Was active during this month (Bought before, and (Not sold yet OR Sold after))
    if (purchaseMonth < selectedMonth && (car.status !== VehicleStatus.SOLD || (saleMonth && saleMonth > selectedMonth))) return true;
    
    return false;
  }), [cars, user.code, user.email, selectedMonth]);

  const totalCommission = salaryDetails.totalCommission;
  const totalSalary = salaryDetails.totalSalary;
  const coinvestProfitShare = salaryDetails.coinvestProfitShare;

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu phải từ 6 ký tự trở lên.");
      return;
    }
    if (onUpdateUser) {
      onUpdateUser(user.email, { password: newPassword });
      setIsModalOpen(false);
      setNewPassword('');
      toast.success("Đổi mật khẩu thành công!");
    }
  };
  const handleUpdateProfile = () => {
    if (!editFormData.name) {
      toast.error("Vui lòng nhập tên.");
      return;
    }
    if (onUpdateUser) {
      onUpdateUser(user.email, editFormData);
      setIsEditModalOpen(false);
      toast.success("Cập nhật thông tin thành công!");
    }
  };

  return (
    <div className="h-full space-y-10 md:space-y-14 overflow-y-auto px-6 md:px-12 custom-scrollbar pt-24 pb-24 max-w-[1700px] mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10"
      >
        <div className="text-center lg:text-left">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-6 justify-center lg:justify-start">
            <div className="w-16 h-16 rounded-[2rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20">
              <User size={38} strokeWidth={2.5} />
            </div>
            Cá nhân
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-4 opacity-30 flex items-center gap-3 justify-center lg:justify-start">
            <span className="w-2 h-2 rounded-full bg-kraft-accent animate-pulse" />
            Xem hiệu suất và thu nhập của bạn
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md rounded-[1.5rem] px-6 py-4 border border-white/60 shadow-xl h-16 w-full lg:w-auto">
          <Calendar size={20} className="text-kraft-accent" />
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-black outline-none bg-transparent text-kraft-ink uppercase tracking-[0.2em] w-full"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="liquid-card border-white/60 p-0 overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-kraft-accent/5">
            <div className="bg-kraft-accent/5 p-10 flex flex-col items-center text-center space-y-6 border-b border-black/5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-kraft-accent to-indigo-400 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative w-32 h-32 rounded-[2.5rem] bg-white flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
                  <User size={64} className="text-kraft-accent" strokeWidth={1.5} />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-black text-kraft-ink tracking-tight mb-2">{user.name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-kraft-accent px-3 py-1 bg-kraft-accent/10 rounded-full">{user.role}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">#{user.code}</span>
                </div>
              </div>
            </div>

            <div className="p-10 space-y-6">
              <InfoItem icon={Mail} label="Email liên hệ" value={user.email} />
              <InfoItem icon={Phone} label="Số điện thoại" value={user.phone || 'Chưa cập nhật'} />
              <InfoItem icon={Calendar} label="Ngày gia nhập" value={formatDate(user.join_date || user.createdAt)} />
              <InfoItem icon={Briefcase} label="Phòng ban" value={user.department || 'Phòng Kinh doanh'} />
              
              <div className="pt-6 space-y-4">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full h-14 liquid-button-secondary flex items-center justify-center gap-3 group"
                >
                  <Settings size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                  Chỉnh sửa hồ sơ
                </button>

                {onUpdateUser && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full h-14 liquid-button-primary flex items-center justify-center gap-3 group"
                  >
                    <Key size={14} strokeWidth={3} className="group-hover:rotate-[30deg] transition-transform" />
                    Bảo mật tài khoản
                  </button>
                )}

                {onLogout && (
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] transition-all duration-500 border border-red-500/10 group shadow-sm hover:shadow-red-500/20"
                  >
                    <LogOut size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    Rời khỏi hệ thống
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats & KPI */}
        <div className="lg:col-span-3 space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            <StatCard 
              delay={0.2}
              icon={DollarSign} 
              label={`Thu nhập tháng ${selectedMonth.split('-')[1]}`} 
              value={formatCurrency(totalSalary)} 
              color="emerald" 
            />
            <StatCard 
              delay={0.3}
              icon={Award} 
              label={`Hoa hồng tích lũy`} 
              value={formatCurrency(totalCommission)} 
              color="amber" 
            />
            <StatCard 
              delay={0.4}
              icon={TrendingUp} 
              label={`Tài sản góp vốn`} 
              value={formatCurrency(coinvestProfitShare)} 
              color="purple" 
            />
            <StatCard 
              delay={0.5}
              icon={CheckCircle2} 
              label={`Xe đã chốt`} 
              value={`${soldCars.length} / ${user.target || 0} xe`} 
              color="indigo" 
              progress={salaryDetails.completionRate}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* Salary Breakdown Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="liquid-card border-white/60 !p-0 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/5 bg-emerald-500/5 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase flex items-center gap-4 text-emerald-600">
                  <div className="p-3 rounded-[1rem] bg-emerald-500/10">
                    <PieChart size={24} strokeWidth={2.5} />
                  </div>
                  Bảng kê lương chi tiết
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Tháng {selectedMonth.split('-')[1]}</span>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="space-y-6">
                  <SalaryItem 
                    label="Lương cơ bản" 
                    value={formatCurrency(salaryDetails.base)} 
                    icon={DollarSign}
                  />
                  <SalaryItem 
                    label="Hoa hồng bán xe" 
                    value={formatCurrency(salaryDetails.salesCommission)} 
                    icon={TrendingUp}
                    detail={salaryDetails.kpiBonusMultiplier < 1 ? `(Hệ số KPI: ${salaryDetails.kpiBonusMultiplier})` : '(Hệ số KPI: 1.0)'}
                  />
                  <SalaryItem 
                    label="Hoa hồng nhập xe" 
                    value={formatCurrency(salaryDetails.buyingCommission)} 
                    icon={Zap}
                  />
                  <SalaryItem 
                    label="Chia sẻ lợi nhuận góp vốn" 
                    value={formatCurrency(salaryDetails.coinvestProfitShare)} 
                    icon={Target}
                  />
                </div>
                
                <div className="pt-8 border-t-2 border-dashed border-black/5 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-1">Tổng thu nhập thực nhận</p>
                      <p className="text-4xl font-black text-kraft-ink tracking-tight">
                        {formatCurrency(salaryDetails.totalSalary)}
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white">
                      <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="liquid-card border-white/60 !p-0 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/5 bg-indigo-500/5 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase flex items-center gap-4 text-indigo-600">
                  <div className="p-3 rounded-[1rem] bg-indigo-500/10">
                    <Clock size={24} strokeWidth={2.5} />
                  </div>
                  Hoạt động gần đây
                </h3>
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:opacity-60 transition-opacity">Xem tất cả</button>
              </div>
              
              <div className="p-8 space-y-5 max-h-[500px] overflow-y-auto custom-scrollbar">
                {activities.slice(0, 6).map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-[1.25rem] bg-white/40 border border-white/60 hover:border-kraft-accent/20 transition-all duration-300 group shadow-sm hover:shadow-md cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-[1rem] shadow-sm flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110",
                        activity.type === 'sale' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-kraft-ink tracking-tight group-hover:text-kraft-accent transition-colors">{activity.carName}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-40 flex items-center gap-2">
                          <span className={cn("inline-block w-1.5 h-1.5 rounded-full", activity.type === 'sale' ? "bg-emerald-500" : "bg-amber-500")} />
                          {activity.type === 'sale' ? 'Chốt bán' : 'Nhập kho'} • {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-black text-base text-kraft-ink tracking-tight">
                          +{formatCurrency(activity.amount)}
                        </p>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Hoa hồng</p>
                      </div>
                      <ChevronRight size={16} className="text-kraft-ink/20 group-hover:text-kraft-accent transition-colors translate-x-0 group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-24">
                    <div className="w-16 h-16 bg-kraft-accent/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-kraft-accent/10 opacity-30">
                      <AlertCircle size={24} className="text-kraft-accent" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-kraft-ink/30 italic">Chưa có hoạt động nào</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="space-y-12">
        {/* My Sold Cars Section */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-kraft-ink uppercase tracking-tight flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
            Xe đã bán tháng {selectedMonth.split('-')[1]}
          </h3>
          <div className="liquid-card border-white/60 !p-0 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-kraft-accent/5">
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Mã xe</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Thông tin xe</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Ngày bán</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60 text-right">Giá bán</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60 text-right">Hoa hồng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {soldCars.map((car) => (
                    <tr key={car.id} className="group hover:bg-kraft-accent/5 transition-all duration-300">
                      <td className="py-6 px-8">
                        <span className="font-black text-sm text-kraft-accent tracking-widest bg-kraft-accent/5 px-3 py-1.5 rounded-lg border border-kraft-accent/10">{car.code}</span>
                      </td>
                      <td className="py-6 px-8">
                        <p className="font-black text-base text-kraft-ink tracking-tight">{car.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-1">
                          {car.year} • {(car.odo || 0).toLocaleString()} km
                        </p>
                      </td>
                      <td className="py-6 px-8 text-xs font-black opacity-40 uppercase tracking-widest">
                        {formatDate(car.sale_date)}
                      </td>
                      <td className="py-6 px-8 text-right font-black text-base text-kraft-ink tracking-tight">
                        {formatCurrency(car.sale_price)}
                      </td>
                      <td className="py-6 px-8 text-right font-black text-base text-emerald-500 tracking-tight">
                        {formatCurrency(car.commission ?? (user.commission_per_car || 0))}
                      </td>
                    </tr>
                  ))}
                  {soldCars.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                         <p className="text-sm font-black uppercase tracking-[0.3em] text-kraft-ink/30 italic">Bạn chưa chốt xe nào trong tháng này</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* My Bought Cars Section */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-kraft-ink uppercase tracking-tight flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            Danh sách xe đã nhập
          </h3>
          <div className="liquid-card border-white/60 !p-0 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-kraft-accent/5">
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Mã xe</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Thông tin xe</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Ngày nhập</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60 text-right">Giá nhập</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60 text-right">Hoa hồng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {boughtCars.map((car) => (
                    <tr key={car.id} className="group hover:bg-kraft-accent/5 transition-all duration-300">
                      <td className="py-6 px-8">
                        <span className="font-black text-sm text-kraft-accent tracking-widest bg-kraft-accent/5 px-3 py-1.5 rounded-lg border border-kraft-accent/10">{car.code}</span>
                      </td>
                      <td className="py-6 px-8">
                        <p className="font-black text-base text-kraft-ink tracking-tight">{car.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-1">
                          {car.year} • {(car.odo || 0).toLocaleString()} km
                        </p>
                      </td>
                      <td className="py-6 px-8 text-xs font-black opacity-40 uppercase tracking-widest">
                        {formatDate(car.purchase_date)}
                      </td>
                      <td className="py-6 px-8 text-right font-black text-base text-kraft-ink tracking-tight">
                        {formatCurrency(car.purchase_price)}
                      </td>
                      <td className="py-6 px-8 text-right font-black text-base text-emerald-500 tracking-tight">
                        {formatCurrency(car.buying_commission ?? STAFF.DEFAULT_BUYING_COMMISSION)}
                      </td>
                    </tr>
                  ))}
                  {boughtCars.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-kraft-ink/30 italic">Bạn chưa nhập xe nào trong tháng này</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* My Co-invested Cars Section */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-kraft-ink uppercase tracking-tight flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <DollarSign size={24} strokeWidth={2.5} />
            </div>
            Danh mục đầu tư góp vốn
          </h3>
          <div className="liquid-card border-white/60 !p-0 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-kraft-accent/5">
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Mã xe</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Tên tài sản</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Trạng thái đầu tư</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60 text-right">Vốn đã góp</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60 text-right">Lợi nhuận chia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {coinvestedCars.map((car) => {
                    const purchasePrice = car.purchase_price || 0;
                    const profit = (car.status === VehicleStatus.SOLD && purchasePrice > 0)
                      ? (car.sale_price || 0) - purchasePrice - (car.total_cost || 0)
                      : 0;
                    const share = purchasePrice > 0 ? (car.coinvest_amount / purchasePrice) * profit : 0;
                    
                    const isSoldInSelectedMonth = car.status === VehicleStatus.SOLD && car.sale_date?.startsWith(selectedMonth);

                    return (
                      <tr key={car.id} className="group hover:bg-kraft-accent/5 transition-all duration-300">
                        <td className="py-6 px-8">
                          <span className="font-black text-sm text-kraft-accent tracking-widest bg-kraft-accent/5 px-3 py-1.5 rounded-lg border border-kraft-accent/10">{car.code}</span>
                        </td>
                        <td className="py-6 px-8 font-black text-base text-kraft-ink tracking-tight">{car.name}</td>
                        <td className="py-6 px-8">
                          <div className="flex flex-col gap-1.5">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest w-fit border shadow-sm",
                              car.status === VehicleStatus.SOLD ? "bg-emerald-600 text-white border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )}>
                              {car.status === VehicleStatus.SOLD ? 'Hoàn tất đầu tư' : 'Đang vận hành'}
                            </span>
                            {isSoldInSelectedMonth && (
                              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest px-2 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                Chốt lợi nhuận tháng này
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-6 px-8 text-right font-black text-base text-kraft-ink tracking-tight">
                          {formatCurrency(car.coinvest_amount)}
                        </td>
                        <td className="py-6 px-8 text-right font-black text-base text-emerald-500 tracking-tight">
                          {isSoldInSelectedMonth ? formatCurrency(share > 0 ? share : 0) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {coinvestedCars.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-kraft-ink/30 italic">Bạn chưa thực hiện góp vốn nào</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Đổi mật khẩu"
        maxWidth="sm"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider ml-1 opacity-60 text-kraft-ink">Mật khẩu mới</label>
            <input 
              type="text" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="liquid-input h-12 px-4 text-sm w-full"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => { setIsModalOpen(false); setNewPassword(''); }}
              className="flex-1 h-14 liquid-button-secondary"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleChangePassword}
              className="flex-1 liquid-button-primary h-14"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa hồ sơ"
        maxWidth="md"
      >
        <div className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40 text-kraft-ink">Họ và tên</label>
              <input 
                type="text" 
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                className="liquid-input h-14 px-6 text-sm w-full font-black tracking-tight"
                placeholder="Nhập họ và tên..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40 text-kraft-ink">Số điện thoại</label>
              <input 
                type="text" 
                value={editFormData.phone}
                onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                className="liquid-input h-14 px-6 text-sm w-full font-black tracking-tight"
                placeholder="Nhập số điện thoại..."
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40 text-kraft-ink">Phòng ban / Vai trò</label>
              <input 
                type="text" 
                value={editFormData.department}
                disabled
                className="liquid-input h-14 px-6 text-sm w-full font-black tracking-tight opacity-50 cursor-not-allowed bg-black/5"
              />
              <p className="text-[9px] font-bold text-kraft-ink/30 italic ml-1">* Vui lòng liên hệ quản trị viên để thay đổi phòng ban.</p>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 h-14 liquid-button-secondary shadow-lg"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleUpdateProfile}
              className="flex-1 liquid-button-primary h-14 shadow-xl shadow-kraft-accent/20"
            >
              Cập nhật thông tin
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const SalaryItem = ({ label, value, icon: Icon, detail }: any) => (
  <div className="flex items-center justify-between group/salary">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-kraft-accent border border-black/5 group-hover/salary:scale-110 transition-all">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">{label}</p>
        {detail && <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{detail}</p>}
      </div>
    </div>
    <p className="font-black text-kraft-ink text-base tracking-tight">{value}</p>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-5 group/info">
    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-kraft-accent border border-black/5 group-hover/info:scale-110 group-hover/info:rotate-6 transition-all duration-500">
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-0.5">{label}</p>
      <p className="font-black text-kraft-ink text-sm tracking-tight">{value}</p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, progress, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="liquid-card !p-10 flex flex-col items-center text-center group hover:scale-[1.03] transition-all duration-500 shadow-xl border-white/60"
  >
    <div className={cn(
      "w-20 h-20 rounded-[2.5rem] shadow-lg mb-8 flex items-center justify-center transition-all duration-500 group-hover:rotate-12",
      color === 'emerald' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : 
      color === 'amber' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : 
      color === 'purple' ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" : 
      "bg-kraft-accent/10 text-kraft-accent border border-kraft-accent/20"
    )}>
      <Icon size={32} strokeWidth={2.5} />
    </div>
    <div className="w-full">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-kraft-ink opacity-30 mb-4">{label}</p>
      <p className="text-2xl font-black text-kraft-ink tracking-tighter">{value}</p>
    </div>
    {progress !== undefined && (
      <div className="w-full mt-8 space-y-3">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-30">
          <span>Tiến độ mục tiêu</span>
          <span className={cn(progress >= 100 ? "text-emerald-500" : "text-kraft-ink")}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden p-0.5 border border-black/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: delay + 0.3 }}
            className={cn("h-full rounded-full shadow-lg", progress >= 100 ? "bg-emerald-500" : "bg-kraft-accent")}
          />
        </div>
      </div>
    )}
  </motion.div>
);
