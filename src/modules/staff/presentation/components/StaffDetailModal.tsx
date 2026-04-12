import React, { useState } from 'react';
import { X, User, DollarSign, Target, ShoppingBag, TrendingUp, Users, ChevronRight, Calculator, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { cn } from '@/src/utils/cn';
import { Z_INDEX } from '@/src/constants';
import { UserRole, USER_ROLE_LABELS, STAFF_CONSTANTS } from '@/src/shared/domain/constants';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { StaffWithSalary } from '../../application/GetStaffList';
import { formatCurrency } from '@/src/utils/currency';

interface StaffDetailModalProps {
  member: StaffWithSalary;
  isOpen: boolean;
  onClose: () => void;
  filterMonth: string;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({ member, isOpen, onClose, filterMonth }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'buying' | 'collaboration'>('sales');
  
  if (!isOpen) return null;

  const isAdmin = member.role === UserRole.ADMIN;
  const { salaryDetails } = member;

  const tabs = [
    { id: 'sales', label: 'Lương bán', icon: TrendingUp, count: salaryDetails.soldCars.length },
    { id: 'buying', label: 'Lương nhập', icon: ShoppingBag, count: salaryDetails.boughtCars.length },
    { id: 'collaboration', label: 'Hợp tác', icon: Users, count: salaryDetails.coinvestedCars.length },
  ];

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: Z_INDEX.MODAL }}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-kraft-ink/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-white/40 relative z-10 flex flex-col max-h-[92vh]"
      >
        {/* Header Section - Premium & Clean */}
        <div className="p-10 pb-6 flex items-start justify-between shrink-0 mb-4">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-[2.25rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20 relative overflow-hidden group shadow-inner">
              <User size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-tr from-kraft-accent/20 to-transparent opacity-50" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 bg-black/5 rounded-xl border border-black/[0.03] text-kraft-ink/60">
                  {member.code}
                </span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-xl border",
                  isAdmin ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-kraft-accent/10 text-kraft-accent border-kraft-accent/20"
                )}>
                  {USER_ROLE_LABELS[member.role as UserRole] || member.role}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-kraft-ink uppercase leading-none mb-3">
                {member.name}
              </h2>
              <p className="text-[11px] font-bold text-kraft-ink/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-kraft-accent animate-pulse" />
                {member.department || 'Phòng kinh doanh'} • {member.email}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 rounded-2xl bg-black/[0.03] hover:bg-black/5 flex items-center justify-center text-kraft-ink/40 transition-all hover:rotate-90 duration-500 border border-black/[0.03]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          {isAdmin ? (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 px-10">
              <div className="w-24 h-24 rounded-[2rem] bg-black/5 flex items-center justify-center mb-8 border border-black/10">
                <Calculator size={40} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-4">Dữ liệu tài chính bị giới hạn</h3>
              <p className="text-xs font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                Tài khoản Quản trị viên không áp dụng hệ thống tính lương và KPI tự động dựa trên giao dịch xe.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Overview Cards - Using highlight-card pattern */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="highlight-card relative overflow-hidden group border-white/60">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 -rotate-12 group-hover:rotate-0">
                    <PieChart size={120} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-kraft-ink/30 mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-kraft-ink/10 rounded-full" />
                    Lương cơ bản
                  </p>
                  <p className="text-3xl font-black tracking-tighter text-kraft-ink">{formatCurrency(salaryDetails.base)}</p>
                  <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-kraft-ink/20 group-hover:text-kraft-accent/40 transition-colors">
                    <div className="w-5 h-[1px] bg-current" />
                    Hợp đồng cố định
                  </div>
                </div>

                <div className="highlight-card border-kraft-accent/10 bg-kraft-accent/[0.02] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 -rotate-12 group-hover:rotate-0">
                    <TrendingUp size={120} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-kraft-accent/60 mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-kraft-accent/20 rounded-full" />
                    Tổng hoa hồng
                  </p>
                  <p className="text-3xl font-black tracking-tighter text-kraft-accent">{formatCurrency(salaryDetails.totalCommission)}</p>
                  <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-kraft-accent/40">
                    <div className="w-5 h-[1px] bg-current" />
                    Tháng {filterMonth}
                  </div>
                </div>

                <div className="highlight-card bg-kraft-ink/90 border-none relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all duration-700 -rotate-12 group-hover:rotate-0">
                    <DollarSign size={120} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-white/20 rounded-full" />
                    Thực nhận dự kiến
                  </p>
                  <p className="text-4xl font-black tracking-tighter text-white drop-shadow-sm">{formatCurrency(salaryDetails.totalSalary)}</p>
                  <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                    <div className="w-5 h-[1px] bg-current" />
                    Dữ liệu thời gian thực
                  </div>
                </div>
              </div>

              {/* KPI Section - Refined */}
              <div className="highlight-card p-10 border-white/60 bg-white/40">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[1.75rem] bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-500/10 relative overflow-hidden group">
                      <Target size={36} className="relative z-10 group-hover:rotate-45 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter text-kraft-ink">Chỉ tiêu kinh doanh</h4>
                      <div className="flex items-center gap-4 mt-2">
                         <p className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-[0.2em]">Kế hoạch: {member.target} xe</p>
                         <div className="w-1 h-1 rounded-full bg-kraft-ink/20" />
                         <p className="text-[10px] font-black text-kraft-accent uppercase tracking-[0.2em]">Hoàn thành: {member.salaryDetails.soldCount} xe</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-6xl font-black tracking-tighter text-kraft-ink leading-none">{Math.round(salaryDetails.completionRate)}%</p>
                    <div className={cn(
                      "mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      salaryDetails.completionRate >= 100 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                    )}>
                      {salaryDetails.completionRate >= 100 ? 'Hệ số thưởng: x1.0 (Full)' : `Hệ số thưởng: x${salaryDetails.kpiBonusMultiplier}`}
                    </div>
                  </div>
                </div>
                
                <div className="relative pt-2">
                  <div className="h-4 bg-black/5 rounded-full overflow-hidden p-[3px] border border-black/[0.05] shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(salaryDetails.completionRate, 100)}%` }}
                      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "h-full rounded-full relative shadow-sm",
                        salaryDetails.completionRate >= 100 ? "bg-emerald-500" : "bg-kraft-accent"
                      )}
                    >
                       <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </motion.div>
                  </div>
                  
                  {/* Milestones Labels */}
                  <div className="flex justify-between mt-4 px-1">
                    {[0, 25, 50, 75, 100].map(val => (
                      <div key={val} className="flex flex-col items-center gap-1.5">
                        <div className="h-1.5 w-[1.5px] bg-black/10" />
                        <span className="text-[8px] font-black text-kraft-ink/20 uppercase tracking-widest">{val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown - Folder Style Tabs */}
              <div className="space-y-0">
                <div className="flex items-end gap-1.5 ml-8">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "folder-tab transition-all duration-500",
                        activeTab === tab.id 
                          ? "folder-tab-active" 
                          : "folder-tab-inactive"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon size={15} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        <span className="text-[11px] font-black tracking-[0.15em]">{tab.label}</span>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black min-w-[24px]",
                          activeTab === tab.id ? "bg-kraft-accent/10 text-kraft-accent" : "bg-black/5 text-kraft-ink/30"
                        )}>
                          {tab.count}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="liquid-card overflow-hidden !mt-0 relative">
                  <div className="absolute inset-0 bg-white/20 pointer-events-none" />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-2 min-h-[300px]"
                    >
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-black/5 text-[9px] font-black uppercase tracking-[0.3em] text-kraft-ink/30 px-6">
                            <th className="py-8 px-10">Xe giao dịch</th>
                            <th className="py-8 px-10">Ngày GD</th>
                            <th className="py-8 px-10 text-right">Giá trị quyết toán</th>
                            <th className="py-8 px-10 text-right">Hoa hồng / LN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.03]">
                          {activeTab === 'sales' && salaryDetails.soldCars.map(car => (
                            <tr key={car.id} className="group hover:bg-white/40 transition-colors">
                              <td className="py-8 px-10">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black uppercase tracking-[0.1em] text-kraft-ink">{car.name}</span>
                                  <span className="text-[10px] font-bold text-kraft-accent uppercase mt-1.5 opacity-60">#{car.code}</span>
                                </div>
                              </td>
                              <td className="py-8 px-10 text-[10px] font-bold text-kraft-ink/40 uppercase tracking-widest">{car.sale_date}</td>
                              <td className="py-8 px-10 text-[12px] font-black text-right tracking-tighter">{formatCurrency(car.sale_price || 0)}</td>
                              <td className="py-8 px-10 text-right">
                                <span className="text-[12px] font-black text-kraft-accent tracking-tighter">
                                  +{formatCurrency(car.commission ?? (member.commission_per_car || 5000000))}
                                </span>
                              </td>
                            </tr>
                          ))}
                          
                          {activeTab === 'buying' && salaryDetails.boughtCars.map(car => (
                            <tr key={car.id} className="group hover:bg-white/40 transition-colors">
                              <td className="py-8 px-10">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black uppercase tracking-[0.1em] text-kraft-ink">{car.name}</span>
                                  <span className="text-[10px] font-bold text-kraft-accent uppercase mt-1.5 opacity-60">#{car.code}</span>
                                </div>
                              </td>
                              <td className="py-8 px-10 text-[10px] font-bold text-kraft-ink/40 uppercase tracking-widest">{car.purchase_date}</td>
                              <td className="py-8 px-10 text-[12px] font-black text-right tracking-tighter">{formatCurrency(car.purchase_price || 0)}</td>
                              <td className="py-8 px-10 text-right">
                                <span className="text-[12px] font-black text-blue-600 tracking-tighter">
                                  +{formatCurrency(car.buying_commission ?? STAFF_CONSTANTS.DEFAULT_BUYING_COMMISSION)}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {activeTab === 'collaboration' && salaryDetails.coinvestedCars.map(car => {
                            const financials = calculateVehicleFinancials(car);
                            const profit = financials.netProfit;
                            const share = (car.coinvest_amount / (financials.totalInvestment || 1)) * profit;
                            return (
                              <tr key={car.id} className="group hover:bg-white/40 transition-colors">
                                <td className="py-8 px-10">
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-[0.1em] text-kraft-ink">{car.name}</span>
                                    <div className="flex items-center gap-3 mt-1.5">
                                       <span className="text-[10px] font-bold text-kraft-accent uppercase opacity-60">#{car.code}</span>
                                       <span className="text-[9px] font-black text-kraft-ink/20 uppercase tracking-widest whitespace-nowrap">Vốn: {formatCurrency(car.coinvest_amount)}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-8 px-10 text-[10px] font-bold text-kraft-ink/40 uppercase tracking-widest">{car.sale_date}</td>
                                <td className="py-8 px-10 text-[12px] font-black text-right tracking-tighter">
                                   <div className="flex flex-col items-end">
                                      <span>{formatCurrency(car.sale_price || 0)}</span>
                                      <span className="text-[9px] font-black text-kraft-ink/20 uppercase tracking-widest mt-1">Lợi nhuận: +{formatCurrency(profit)}</span>
                                   </div>
                                </td>
                                <td className="py-8 px-10 text-right">
                                  <span className={cn("text-[12px] font-black tracking-tighter", share > 0 ? "text-emerald-600" : "text-red-500")}>
                                    {share > 0 ? '+' : ''}{formatCurrency(share)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}

                          {((activeTab === 'sales' && salaryDetails.soldCars.length === 0) ||
                            (activeTab === 'buying' && salaryDetails.boughtCars.length === 0) ||
                            (activeTab === 'collaboration' && salaryDetails.coinvestedCars.length === 0)) && (
                            <tr>
                              <td colSpan={4} className="py-40 text-center">
                                <div className="flex flex-col items-center justify-center opacity-20">
                                   < ShoppingBag size={48} className="mb-4" />
                                   <p className="text-[11px] font-black uppercase tracking-[0.4em]">Chưa có dữ liệu giao dịch</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  ) : null;
};
