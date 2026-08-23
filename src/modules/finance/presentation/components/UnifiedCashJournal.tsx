import React from 'react';
import {
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Receipt,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { JournalTransaction } from '../useCashflowState';
import { formatCurrency } from '@/src/shared/utils/currency';
import { formatDate } from '@/src/shared/utils/date';
import { cn } from '@/src/shared/utils/cn';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface UnifiedCashJournalProps {
  transactions: JournalTransaction[];
  allTransactions: JournalTransaction[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  typeFilter: 'ALL' | 'INFLOW' | 'OUTFLOW';
  onTypeFilterChange: (type: 'ALL' | 'INFLOW' | 'OUTFLOW') => void;
  onEditExpense: (rawExpenseId: string | number) => void;
  onDeleteExpense: (rawExpenseId: string | number) => void;
  onVehicleClick?: (vehicleId: string | number) => void;
  filterMonth: string;
}

export const UnifiedCashJournal: React.FC<UnifiedCashJournalProps> = ({
  transactions,
  allTransactions,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  typeFilter,
  onTypeFilterChange,
  onEditExpense,
  onDeleteExpense,
  onVehicleClick,
  filterMonth
}) => {
  // Extract unique categories for filter
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    allTransactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [allTransactions]);

  const inflowCount = allTransactions.filter(t => t.type === 'inflow').length;
  const outflowCount = allTransactions.filter(t => t.type === 'outflow').length;

  // Export CSV Functionality (Excel-ready with UTF-8 BOM)
  const handleExportCSV = () => {
    if (allTransactions.length === 0) {
      toast.error('Không có dữ liệu để xuất file');
      return;
    }

    const headers = ['STT', 'Ngày', 'Loại giao dịch', 'Phân loại', 'Nội dung', 'Mã xe', 'Số tiền Thu (+)', 'Số tiền Chi (-)', 'Số dư quỹ'];
    
    // Sort oldest to newest for standard accounting export
    const exportData = [...allTransactions].reverse();

    const rows = exportData.map((t, idx) => [
      idx + 1,
      `"${t.date}"`,
      `"${t.type === 'inflow' ? 'THU' : 'CHI'}"`,
      `"${t.category}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.vehicleCode || ''}"`,
      t.type === 'inflow' ? t.amount : 0,
      t.type === 'outflow' ? t.amount : 0,
      t.runningBalance
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `So_Quy_Dong_Tien_Auto28_${filterMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Đã xuất sổ quỹ tháng ${filterMonth} thành công!`);
  };

  return (
    <div className="rounded-[28px] bg-white/80 backdrop-blur-2xl border border-black/5 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Header & Controls Bar */}
      <div className="p-6 md:p-7 border-b border-black/5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-kraft-accent/10 text-kraft-accent flex items-center justify-center font-bold">
              <Receipt size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-kraft-ink">
                Sổ Nhật Ký Thu Chi & Đối Soát
              </h3>
              <p className="text-[11px] font-bold text-sub-label">
                {transactions.length} / {allTransactions.length} Giao dịch trong tháng
              </p>
            </div>
          </div>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-2 border border-emerald-200/60 active:scale-95 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            <span>Xuất Sổ Quỹ Excel</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
          {/* Segment Tabs: All / Inflow / Outflow */}
          <div className="flex items-center p-1 bg-black/5 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => onTypeFilterChange('ALL')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer",
                typeFilter === 'ALL' ? "bg-white text-kraft-ink shadow-xs" : "text-sub-label hover:text-kraft-ink"
              )}
            >
              Tất cả ({allTransactions.length})
            </button>
            <button
              type="button"
              onClick={() => onTypeFilterChange('INFLOW')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer",
                typeFilter === 'INFLOW' ? "bg-emerald-500 text-white shadow-xs" : "text-sub-label hover:text-kraft-ink"
              )}
            >
              Thu ({inflowCount})
            </button>
            <button
              type="button"
              onClick={() => onTypeFilterChange('OUTFLOW')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer",
                typeFilter === 'OUTFLOW' ? "bg-rose-500 text-white shadow-xs" : "text-sub-label hover:text-kraft-ink"
              )}
            >
              Chi ({outflowCount})
            </button>
          </div>

          {/* Search Input & Category Dropdown */}
          <div className="flex items-center gap-2.5 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sub-label pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm nội dung, mã xe, số tiền..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-black/[0.03] border border-black/5 text-xs font-bold text-kraft-ink placeholder:text-sub-label focus:bg-white focus:border-kraft-accent focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sub-label hover:text-kraft-ink text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={e => onCategoryChange(e.target.value)}
              className="h-10 px-3 rounded-xl bg-black/[0.03] border border-black/5 text-xs font-bold text-kraft-ink focus:bg-white focus:border-kraft-accent focus:outline-none cursor-pointer shrink-0"
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="flex-1 overflow-x-auto min-h-[450px] max-h-[620px] custom-scrollbar render-boundary-isolated">
        {transactions.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-black/5 text-sub-label mx-auto flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-sm font-black uppercase text-kraft-ink">Không có giao dịch nào phù hợp</p>
            <p className="text-xs font-medium text-sub-label">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-md shadow-xs">
              <tr className="border-b border-black/5 text-[10px] font-black uppercase tracking-wider text-sub-label">
                <th className="py-3.5 px-6">Ngày</th>
                <th className="py-3.5 px-4">Phân loại</th>
                <th className="py-3.5 px-6">Nội dung chứng từ</th>
                <th className="py-3.5 px-6 text-right">Số tiền Thu (+)</th>
                <th className="py-3.5 px-6 text-right">Số tiền Chi (-)</th>
                <th className="py-3.5 px-6 text-right">Số dư sau GD</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs font-bold text-kraft-ink">
              {transactions.map((t, idx) => {
                const isInflow = t.type === 'inflow';
                const isCarRelated = !!t.vehicleId;

                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02, type: 'spring', damping: 25, stiffness: 250 }}
                    className="hover:bg-black/[0.02] transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-4 px-6 whitespace-nowrap text-sub-label font-mono text-[11px]">
                      {formatDate(t.date)}
                    </td>

                    {/* Category Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block",
                          t.category === 'Bán xe'
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : t.category === 'Hoàn cọc'
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : t.category === 'Góp vốn'
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : t.category === 'Mua xe'
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : t.category === 'Chi phí xe'
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : t.category === 'Marketing'
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        )}
                      >
                        {t.category}
                      </span>
                    </td>

                    {/* Title and Subtitle */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-kraft-ink">{t.title}</span>
                        {t.vehicleCode && (
                          <span
                            onClick={() => t.vehicleId && onVehicleClick?.(t.vehicleId)}
                            className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors shrink-0"
                          >
                            🚗 {t.vehicleCode}
                          </span>
                        )}
                      </div>
                      {t.subtitle && (
                        <p className="text-[11px] font-medium text-sub-label mt-0.5">{t.subtitle}</p>
                      )}
                    </td>

                    {/* Inflow Amount */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {isInflow ? (
                        <span className="font-black text-sm text-emerald-600">
                          +{formatCurrency(t.amount)}
                        </span>
                      ) : (
                        <span className="text-sub-label opacity-30">—</span>
                      )}
                    </td>

                    {/* Outflow Amount */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {!isInflow ? (
                        <span className="font-black text-sm text-rose-600">
                          -{formatCurrency(t.amount)}
                        </span>
                      ) : (
                        <span className="text-sub-label opacity-30">—</span>
                      )}
                    </td>

                    {/* Running Balance */}
                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono">
                      <span className="font-black text-xs text-kraft-ink">
                        {formatCurrency(t.runningBalance)}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {t.editable && t.rawExpenseId ? (
                        <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEditExpense(t.rawExpenseId!)}
                            className="w-7 h-7 rounded-xl bg-black/5 hover:bg-kraft-accent hover:text-white text-sub-label flex items-center justify-center transition-colors cursor-pointer"
                            title="Chỉnh sửa chi phí"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(t.rawExpenseId!)}
                            className="w-7 h-7 rounded-xl bg-black/5 hover:bg-rose-500 hover:text-white text-sub-label flex items-center justify-center transition-colors cursor-pointer"
                            title="Xóa chi phí"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : isCarRelated && t.vehicleId ? (
                        <button
                          type="button"
                          onClick={() => onVehicleClick?.(t.vehicleId!)}
                          className="px-2.5 py-1 rounded-full bg-black/5 hover:bg-black/10 text-[10px] font-bold text-kraft-ink inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Xem chi tiết xe"
                        >
                          <ExternalLink size={12} />
                          <span>Chi tiết</span>
                        </button>
                      ) : (
                        <span className="text-sub-label opacity-30 text-[10px] font-mono">Hệ thống</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer summary bar */}
      <div className="p-4 md:px-7 border-t border-black/5 bg-black/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-bold text-sub-label">
        <span>💡 Mẹo: Nhấn Ctrl+Enter tại bảng lập phiếu để lưu và nhập liên tục.</span>
        <span className="text-kraft-ink">
          Tổng cộng: <strong className="text-emerald-600">+{formatCurrency(allTransactions.filter(t => t.type === 'inflow').reduce((s, t) => s + t.amount, 0))}</strong> | <strong className="text-rose-600">-{formatCurrency(allTransactions.filter(t => t.type === 'outflow').reduce((s, t) => s + t.amount, 0))}</strong>
        </span>
      </div>
    </div>
  );
};
