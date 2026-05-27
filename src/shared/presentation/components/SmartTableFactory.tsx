import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Inbox } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

export interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SmartTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  icon?: React.ElementType;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  headerAction?: React.ReactNode;
  className?: string;
}

/**
 * SmartTableFactory
 * 
 * A high-performance, standardized table component factory.
 * Features: Responsive design, custom rendering, empty states, and animations.
 */
export const SmartTable = <T extends { id?: string | number }>({
  data,
  columns,
  title,
  icon: Icon,
  searchPlaceholder,
  onRowClick,
  emptyMessage = 'Không có dữ liệu',
  loading = false,
  headerAction,
  className,
}: SmartTableProps<T>) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((item) => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, searchTerm]);

  return (
    <section className={cn("bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden", className)}>
      {/* Header */}
      {(title || searchPlaceholder || headerAction) && (
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <Icon size={22} strokeWidth={2.5} />
              </div>
            )}
            {title && <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {searchPlaceholder && (
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            )}
            {headerAction}
          </div>
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap",
                    col.align === 'right' ? "text-right" : col.align === 'center' ? "text-center" : "text-left",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    {columns.map((_, j) => (
                      <td key={j} className="py-5 px-6"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={item.id || idx}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "group transition-colors",
                      onRowClick ? "cursor-pointer hover:bg-indigo-50/30" : "hover:bg-gray-50/30"
                    )}
                  >
                    {columns.map((col, colIdx) => (
                      <td 
                        key={colIdx} 
                        className={cn(
                          "py-5 px-6 text-sm font-medium text-gray-700",
                          col.align === 'right' ? "text-right" : col.align === 'center' ? "text-center" : "text-left",
                          col.className
                        )}
                      >
                        {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                      <Inbox size={48} strokeWidth={1} />
                      <p className="text-sm font-bold uppercase tracking-widest">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </section>
  );
};
