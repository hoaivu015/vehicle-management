import React, { useState, useEffect, useMemo } from 'react';
import { 
  CircleDollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BarChart3,
  Calendar,
  Trash2,
  Edit2,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { cn } from '../../../utils/cn';
import { SmartAmountInput } from '../../../components/SmartAmountInput';
import { Modal } from '../../../components/Modal';
import { FinancePresenter, FinanceView } from './FinancePresenter';
import { MonthlyFinanceData } from '../application/GetMonthlyFinance';
import { FinancialOverviewData } from '../application/GetFinancialOverview';
import { CashflowSkeleton } from './components/CashflowSkeleton';
import { Vehicle } from '../../../shared/domain/types';
import { PERMISSIONS } from '../../../constants';

interface CashflowPageProps {
  presenter: FinancePresenter;
  userRole: string;
  hasPermission: (permission: string) => boolean;
}

export const CashflowPage: React.FC<CashflowPageProps> = ({ 
  presenter, 
  userRole,
  hasPermission 
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyFinanceData | null>(null);
  const [overview, setOverview] = useState<FinancialOverviewData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ name: '', amount: 0, category: 'Vận hành', date: new Date().toISOString().split('T')[0] });
  const [editingExpenseId, setEditingExpenseId] = useState<string | number | null>(null);
  const [tempCapital, setTempCapital] = useState(0);

  const allCarCosts = useMemo(() => {
    return vehicles.reduce((acc: any[], car) => {
      const monthCosts = car.cost_history?.filter((c: any) => c.date?.startsWith(filterMonth)) || [];
      monthCosts.forEach((cost: any) => acc.push({ ...cost, carName: car.name, carCode: car.code }));
      return acc;
    }, []).sort((a: any, b: any) => b.date.localeCompare(a.date));
  }, [vehicles, filterMonth]);

  const view: FinanceView = useMemo(() => ({
    setLoading,
    setMonthlyFinance: setData,
    setFinancialOverview: setOverview,
    setTotalCapital: setTempCapital,
    setVehicles: setVehicles,
    setStaff: setStaff,
    showError: (msg) => console.error(msg)
  }), []);

  useEffect(() => {
    presenter.attachView(view);
    presenter.loadFinanceData();
    presenter.subscribeToChanges();

    return () => {
      presenter.detachView();
    };
  }, [presenter, view]);

  const handleMonthChange = (month: string) => {
    setFilterMonth(month);
    presenter.setMonth(month);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpenseId) {
      presenter.updateExpense(editingExpenseId, expenseForm);
    } else {
      presenter.addExpense(expenseForm);
    }
    setShowExpenseModal(false);
    setEditingExpenseId(null);
    setExpenseForm({ name: '', amount: 0, category: 'Vận hành', date: new Date().toISOString().split('T')[0] });
  };

  if (loading && !data) return <CashflowSkeleton />;

  return (
    <div className="space-y-10 md:space-y-14 py-6 md:py-10 px-6 md:px-12 max-w-[1700px] mx-auto pb-24 h-full overflow-y-auto scrollbar-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10"
      >
        <div className="text-center lg:text-left">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-6 justify-center lg:justify-start">
            <div className="w-16 h-16 rounded-[2rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20">
              <CircleDollarSign size={38} strokeWidth={2.5} />
            </div>
            Dòng tiền
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-4 opacity-30 flex items-center gap-3 justify-center lg:justify-start">
            <span className="w-2 h-2 rounded-full bg-kraft-accent animate-pulse" />
            Quản lý thu chi và cân đối tài chính Showroom
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md rounded-[1.5rem] px-6 py-4 border border-white/60 shadow-xl h-16 w-full sm:w-auto">
            <Calendar size={20} className="text-kraft-accent" />
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="text-xs font-black outline-none bg-transparent text-kraft-ink uppercase tracking-[0.2em] w-32"
            />
          </div>
          
          {hasPermission(PERMISSIONS.EDIT_CASHFLOW) && (
            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                onClick={() => setShowCapitalModal(true)}
                className="liquid-button-secondary h-16 px-8 flex items-center gap-3 flex-1 sm:flex-none justify-center rounded-[1.5rem]"
              >
                <Wallet size={18} className="text-kraft-accent outline-4" /> 
                <span className="text-[10px] font-black uppercase tracking-widest">Chốt vốn</span>
              </button>
              <button 
                onClick={() => setShowExpenseModal(true)}
                className="liquid-button-primary h-16 px-8 flex items-center gap-3 flex-1 sm:flex-none justify-center rounded-[1.5rem]"
              >
                <Plus size={20} strokeWidth={3} /> 
                <span className="text-[10px] font-black uppercase tracking-widest">Ghi chi phí</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard delay={0.1} label="Tổng thu" value={formatCurrency(data?.revenue || 0)} icon={TrendingUp} color="emerald" />
        <StatCard delay={0.2} label="Tổng chi" value={formatCurrency((data?.purchaseOutflow || 0) + (data?.carCosts || 0) + (data?.operatingExpenses || 0) + (data?.salaries || 0))} icon={TrendingDown} color="red" />
        <StatCard delay={0.3} label="Lợi nhuận ròng" value={formatCurrency(data?.netProfit || 0)} icon={BarChart3} color={(data?.netProfit || 0) >= 0 ? "emerald" : "red"} />
        <StatCard delay={0.4} label="Dòng tiền thuần" value={formatCurrency(data?.netCashflow || 0)} icon={CircleDollarSign} color={(data?.netCashflow || 0) >= 0 ? "indigo" : "red"} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 space-y-12"
        >
          {/* Expenses List */}
          <section className="liquid-card border-white/60 !p-0 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-black/5 flex items-center justify-between bg-white/20">
              <h3 className="text-2xl font-black uppercase flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                  <TrendingDown size={24} strokeWidth={2.5} />
                </div>
                Chi phí vận hành
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">
                {data?.allExpenses.length || 0} Giao dịch trong tháng
              </p>
            </div>
            
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-kraft-accent/5">
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Hạng mục</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Số tiền</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Ngày</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {data?.allExpenses.map((exp) => (
                    <tr key={exp.id} className="group hover:bg-kraft-accent/5 transition-all duration-300">
                      <td className="py-6 px-8">
                        <p className="font-black text-base text-kraft-ink tracking-tight">{exp.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-1">{exp.category || 'Chung'}</p>
                      </td>
                      <td className="py-6 px-8">
                        <span className="font-black text-lg text-red-500 tracking-tight">{formatCurrency(exp.amount)}</span>
                      </td>
                      <td className="py-6 px-8">
                        <span className="text-xs font-black opacity-40 uppercase tracking-widest">{formatDate(exp.date)}</span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <button 
                            onClick={() => {
                              setEditingExpenseId(exp.id);
                              setExpenseForm({ 
                                name: exp.name, 
                                amount: exp.amount, 
                                category: exp.category || 'Vận hành', 
                                date: exp.date 
                              });
                              setShowExpenseModal(true);
                            }}
                            className="w-10 h-10 rounded-xl bg-kraft-accent/10 text-kraft-accent flex items-center justify-center hover:bg-kraft-accent hover:text-white transition-all shadow-sm"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => presenter.deleteExpense(exp.id)}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data?.allExpenses || data.allExpenses.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-32 text-center">
                        <div className="w-16 h-16 bg-kraft-accent/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-kraft-accent/10 opacity-30">
                          <Plus size={24} className="text-kraft-accent" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-kraft-ink/30 italic">Chưa có bản ghi chi phí nào</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Car Costs List */}
          <section className="liquid-card border-white/60 !p-0 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-black/5 flex items-center justify-between bg-amber-500/5">
              <h3 className="text-2xl font-black uppercase flex items-center gap-4 text-amber-600">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                  <Wrench size={24} strokeWidth={2.5} />
                </div>
                Chi phí phát sinh xe
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">
                {allCarCosts.length} Ghi nhận trong tháng
              </p>
            </div>
            
            <div className="overflow-x-auto min-h-[200px] max-h-[400px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-kraft-accent/5">
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Tài sản (Mã xuất)</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60">Hạng mục chi</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60 text-right">Số tiền</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-kraft-accent/60 text-right">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {allCarCosts.map((cost, idx) => (
                    <tr key={idx} className="group hover:bg-kraft-accent/5 transition-all duration-300">
                      <td className="py-6 px-8">
                        <p className="font-black text-base text-kraft-ink tracking-tight">{cost.carName}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-1">{cost.carCode}</p>
                      </td>
                      <td className="py-6 px-8">
                        <p className="font-black text-sm text-kraft-ink tracking-tight">{cost.note}</p>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <span className="font-black text-base text-amber-600 tracking-tight">{formatCurrency(cost.amount)}</span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <span className="text-xs font-black opacity-40 uppercase tracking-widest">{formatDate(cost.date)}</span>
                      </td>
                    </tr>
                  ))}
                  {allCarCosts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-kraft-ink/30 italic">Không có chi phí phát sinh xe nào</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </motion.div>

        {/* Right Column: Breakdown */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-12"
        >
          <section className="liquid-card border-none bg-kraft-ink text-white p-10 shadow-2xl overflow-visible relative">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-kraft-accent/20 rounded-full blur-3xl" />
            <h3 className="text-2xl font-black uppercase mb-10 tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                <BarChart3 size={24} strokeWidth={2.5} />
              </div>
              Cấu trúc chi
            </h3>
            <div className="space-y-8">
              <BreakdownRow label="Mua xe" value={data?.purchaseOutflow || 0} total={(data?.revenue || 0)} color="bg-blue-400" />
              <BreakdownRow label="Chi phí xe" value={data?.carCosts || 0} total={(data?.revenue || 0)} color="bg-amber-400" />
              <BreakdownRow label="Vận hành" value={data?.operatingExpenses || 0} total={(data?.revenue || 0)} color="bg-rose-400" />
              <BreakdownRow label="Lương nhân viên" value={data?.salaries || 0} total={(data?.revenue || 0)} color="bg-emerald-400" />
            </div>
            
          </section>
        </motion.div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={showExpenseModal} 
        onClose={() => {
          setShowExpenseModal(false);
          setEditingExpenseId(null);
          setExpenseForm({ name: '', amount: 0, category: 'Vận hành', date: new Date().toISOString().split('T')[0] });
        }} 
        title={editingExpenseId ? "Chỉnh sửa chi phí" : "Thêm chi phí vận hành"}
      >
        <form onSubmit={handleSubmitExpense} className="p-0 overflow-hidden">
          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-2">Tên chi phí / Hạng mục</label>
              <input 
                required
                value={expenseForm.name}
                onChange={(e) => setExpenseForm({...expenseForm, name: e.target.value})}
                className="liquid-input h-14 bg-white/40 border-white/40 font-black"
                placeholder="VD: Tiền điện, Marketing, Mặt bằng..."
              />
            </div>
            
            <SmartAmountInput 
              label="Số tiền chi (VNĐ)"
              value={expenseForm.amount}
              onChange={(val) => setExpenseForm({...expenseForm, amount: val})}
            />

            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-2">Ngày thực hiện chi</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-kraft-accent/30" size={18} />
                <input 
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                  className="liquid-input h-14 pl-14 bg-white/40 border-white/40 font-black"
                />
              </div>
            </div>
          </div>

          <div className="p-8 bg-white/20 backdrop-blur-3xl border-t border-white/60">
            <button type="submit" className="w-full liquid-button-primary h-16 shadow-kraft-deep">
              <span className="font-black uppercase tracking-[0.2em]">
                {editingExpenseId ? "Lưu thay đổi" : "Xác nhận ghi tăng chi phí"}
              </span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCapitalModal} onClose={() => setShowCapitalModal(false)} title="Điều chỉnh vốn">
        <div className="p-0 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="p-6 bg-kraft-accent/5 rounded-3xl border border-kraft-accent/10 flex items-start gap-4">
               <div className="w-10 h-10 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent">
                 <Wallet size={20} />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-kraft-ink opacity-40 mb-1">Kiểm soát dòng vốn</p>
                 <p className="text-[11px] font-bold text-kraft-ink leading-relaxed">Điều chỉnh tổng vốn lưu động của hệ thống. Lưu ý: Thao tác này ảnh hưởng đến các chỉ số báo cáo tài chính.</p>
               </div>
            </div>

            <SmartAmountInput 
              label="Tổng vốn thực tế (VNĐ)"
              value={tempCapital}
              onChange={setTempCapital}
            />
          </div>

          <div className="p-8 bg-white/20 backdrop-blur-3xl border-t border-white/60">
            <button 
              onClick={() => {
                presenter.updateCapital(tempCapital);
                setShowCapitalModal(false);
              }}
              className="w-full liquid-button-primary h-16 shadow-kraft-deep"
            >
              <span className="font-black uppercase tracking-[0.2em]">Chốt số dư vốn</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="liquid-card !p-10 flex flex-col items-center text-center group hover:scale-[1.03] transition-all duration-500 shadow-xl border-white/60"
  >
    <div className={cn(
      "w-20 h-20 rounded-[2.5rem] shadow-lg mb-8 flex items-center justify-center transition-all duration-500 group-hover:rotate-12",
      color === 'emerald' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : 
      color === 'red' ? "bg-red-500/10 text-red-600 border border-red-500/20" : 
      "bg-kraft-accent/10 text-kraft-accent border border-kraft-accent/20"
    )}>
      <Icon size={32} strokeWidth={2.5} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-kraft-ink opacity-30 mb-4">{label}</span>
    <span className={cn(
      "text-3xl font-black tracking-tighter",
      color === 'emerald' ? "text-emerald-600" : 
      color === 'red' ? "text-red-500" : "text-kraft-ink"
    )}>{value}</span>
    
    <div className="mt-8 w-12 h-1 bg-current opacity-10 rounded-full" />
  </motion.div>
);

const BreakdownRow = ({ label, value, total, color }: any) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
        <span className="opacity-40">{label}</span>
        <span className="text-white">{formatCurrency(value)}</span>
      </div>
      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full shadow-lg", color)} 
        />
      </div>
    </div>
  );
};
