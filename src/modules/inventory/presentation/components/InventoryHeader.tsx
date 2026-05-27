import { Package, Search, Calendar, Plus, Filter, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { PERMISSIONS } from '@/src/constants';
import { INVENTORY_CONSTANTS } from '@/src/shared/domain/constants';
import { BaseInput } from '@/src/shared/design-system/FormElements';
import { SlidingPillSwitcher } from '@/src/shared/design-system/Buttons';

interface InventoryHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onSearch: (val: string) => void;
  activeTab: 'AVAILABLE' | 'SOLD';
  setActiveTab: (tab: 'AVAILABLE' | 'SOLD') => void;
  soldMonth: string;
  setSoldMonth: (month: string) => void;
  setIsAddOpen: (open: boolean) => void;
  hasPermission: (p: string) => boolean;
  filterCriteria?: string;
  onClearFilter?: () => void;
  isCompact?: boolean;
  setIsCompact?: (val: boolean) => void;
}



export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  activeTab,
  setActiveTab,
  soldMonth,
  setSoldMonth,
  setIsAddOpen,
  hasPermission,
  filterCriteria = 'ALL',
  onClearFilter,
  isCompact,
  setIsCompact
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-black/5 pb-8 md:pb-10 relative z-30">
      <div className="text-left">
        <h2 className="text-[clamp(1.5rem,8vw,3.5rem)] md:text-5xl lg:text-6xl font-black tracking-tighter text-kraft-ink flex items-center gap-3 md:gap-6 leading-none uppercase">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20 shadow-inner shrink-0 scale-90 md:scale-100">
            <Package size={32} className="md:w-9 md:h-9" strokeWidth={2.5} />
          </div>
          Kho xe
        </h2>
        <p className="text-sub-label !text-kraft-ink/40 mt-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-income opacity-30" />
          Hệ thống quản trị kho xe & dòng tiền tập trung
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start lg:justify-end">
        {/* Search Bar */}
        <div className="relative group min-w-[220px] md:w-64">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-kraft-accent/60 group-focus-within:text-kraft-accent transition-colors">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Tên xe, mã xe..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              onSearch(val);
            }}
            className="pl-12 pr-6 h-14 w-full glass-surface !rounded-t2 text-[11px] font-black uppercase tracking-widest text-kraft-ink placeholder:text-kraft-ink/20 focus:border-kraft-accent/40 focus:ring-4 focus:ring-kraft-accent/5 transition-all outline-none"
          />
        </div>

        {/* Compact Toggle - Desktop Only */}
        <div className="hidden md:flex">
          <SlidingPillSwitcher isCompact={isCompact || false} onChange={setIsCompact || (() => {})} />
        </div>

        {/* Month Picker - ONLY SHOW FOR SOLD TAB */}
        {activeTab === 'SOLD' && (
          <div className="min-w-[220px] md:w-60 animate-in fade-in slide-in-from-right-4 duration-500">
            <BaseInput
              type="month"
              value={soldMonth}
              onChange={(e) => setSoldMonth(e.target.value)}
              icon={Calendar}
            />
          </div>
        )}

        <div className="flex glass-surface p-1 !rounded-full shadow-kraft-deep relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('AVAILABLE')}
            className={cn(
              "relative px-4 md:px-6 py-2 rounded-full text-sub-label transition-all duration-500 cursor-pointer",
              activeTab === 'AVAILABLE' ? "text-white font-black scale-105" : "text-kraft-ink/60 hover:text-kraft-ink"
            )}
          >
            {activeTab === 'AVAILABLE' && (
              <motion.div 
                layoutId="inventoryWebTabPill"
                className="absolute inset-0 bg-black rounded-full shadow-xl z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Trong kho</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('SOLD')}
            className={cn(
              "relative px-4 md:px-6 py-2 rounded-full text-sub-label transition-all duration-500 cursor-pointer",
              activeTab === 'SOLD' ? "text-white font-black scale-105" : "text-kraft-ink/60 hover:text-kraft-ink"
            )}
          >
            {activeTab === 'SOLD' && (
              <motion.div 
                layoutId="inventoryWebTabPill"
                className="absolute inset-0 bg-income rounded-full shadow-2xl z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Đã bán</span>
          </motion.button>
        </div>

        {hasPermission(PERMISSIONS.EDIT_INVENTORY) && (
          <>
            {/* Desktop Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddOpen(true)}
              className="hidden md:flex w-14 h-14 liquid-button-primary p-0 items-center justify-center shrink-0 rounded-full hover:rotate-90 transition-all duration-500 shadow-kraft-deep"
              title="Nhập xe mới"
            >
              <Plus size={24} strokeWidth={3} />
            </motion.button>

            {/* Mobile FAB */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddOpen(true)}
              className="md:hidden fixed bottom-28 right-6 w-16 h-16 bg-kraft-accent text-white flex items-center justify-center rounded-full shadow-kraft-deep z-[60] transition-all"
            >
              <Plus size={32} strokeWidth={3} />
            </motion.button>
          </>
        )}
      </div>

      {/* Active Filter Indicator */}
      {filterCriteria !== 'ALL' && (
        <div className="absolute -bottom-6 left-0 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-kraft-accent/10 border border-kraft-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest text-kraft-accent">
            <Filter size={12} strokeWidth={3} />
            <span>Đang lọc: {filterCriteria === 'AGING_25' ? `Xe tồn kho > ${INVENTORY_CONSTANTS.AGING_THRESHOLD_DAYS} ngày` : filterCriteria}</span>
            <button 
              onClick={onClearFilter}
              className="ml-1 p-0.5 hover:bg-kraft-accent/20 rounded-full transition-colors"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
