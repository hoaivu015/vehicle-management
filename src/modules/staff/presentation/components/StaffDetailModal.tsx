import React, { useState } from 'react';
import { X, DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { Z_INDEX } from '@/src/constants';
import { UserRole } from '@/src/shared/domain/constants';
import { StaffWithSalary } from '../../application/GetStaffList';
import { StaffAddExpenseModal } from './StaffAddExpenseModal';
import { Sidebar } from './StaffDetail/Sidebar';
import { TabsBar } from './StaffDetail/TabsBar';
import { CarTable } from './StaffDetail/CarTable';
import { ExpenseTable } from './StaffDetail/ExpenseTable';

interface StaffDetailModalProps {
  member: StaffWithSalary;
  isOpen: boolean;
  onClose: () => void;
  filterMonth: string;
  onAddExpense: (staffId: string, data: any) => Promise<void>;
  onToggleReimbursement: (staffId: string, expenseId: string) => Promise<void>;
  onDeleteExpense: (staffId: string, expenseId: string) => Promise<void>;
  onUpdateExpense: (staffId: string, expenseId: string, data: any) => Promise<void>;
  onReimburseMultiple: (staffId: string, expenseIds: string[]) => Promise<void>;
  userRole?: string;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({ 
  member, 
  isOpen, 
  onClose, 
  filterMonth,
  onAddExpense,
  onToggleReimbursement,
  onDeleteExpense,
  onUpdateExpense,
  onReimburseMultiple,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'buying' | 'collaboration' | 'advances'>('sales');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  if (!isOpen) return null;

  const isAdmin = member.role === UserRole.ADMIN;
  const { salaryDetails } = member;

  const totalUnreimbursed = (member.expenses || [])
    .filter(e => !e.is_reimbursed)
    .reduce((sum, e) => sum + e.amount, 0);

  const tabs = [
    { id: 'sales', label: 'Lương bán', icon: TrendingUp, count: salaryDetails.soldCars.length },
    { id: 'buying', label: 'Lương nhập', icon: ShoppingBag, count: salaryDetails.boughtCars.length },
    { id: 'collaboration', label: 'Hợp tác', icon: Users, count: salaryDetails.coinvestedCars.length },
    { id: 'advances', label: 'Tạm ứng', icon: DollarSign, count: (member.expenses || []).length },
  ];

  const getCarsForTab = () => {
    if (activeTab === 'sales') return salaryDetails.soldCars;
    if (activeTab === 'buying') return salaryDetails.boughtCars;
    if (activeTab === 'collaboration') return salaryDetails.coinvestedCars;
    return [];
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4" style={{ zIndex: Z_INDEX.MODAL }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-kraft-ink/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-7xl bg-white/90 backdrop-blur-3xl rounded-t1 border border-white/60 shadow-[var(--shadow-kraft-deep)] overflow-hidden flex flex-col lg:flex-row h-[92vh] lg:h-[85vh]"
      >
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[110]">
          <button
            onClick={onClose}
            className="p-2 sm:p-3 bg-white/40 backdrop-blur-md border border-white/60 text-kraft-ink hover:bg-white/60 rounded-t3 transition-all shadow-lg active:scale-[0.98]"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <Sidebar 
          member={member} 
          filterMonth={filterMonth} 
          isAdmin={isAdmin} 
          totalUnreimbursed={totalUnreimbursed} 
        />

        <div className="flex-1 flex flex-col bg-[var(--meta-step-2)] overflow-hidden pt-6">
          <TabsBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="ctab-panel flex-1 flex flex-col overflow-hidden mx-1">
            <div className="ctab-content flex-1 overflow-y-auto p-4 sm:px-6 sm:py-10 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {activeTab !== 'advances' ? (
                    <CarTable activeTab={activeTab} cars={getCarsForTab()} />
                  ) : (
                    <ExpenseTable 
                      expenses={member.expenses || []} 
                      memberId={member.id} 
                      userRole={userRole}
                      onAddClick={() => {
                        setEditingExpense(null);
                        setIsExpenseModalOpen(true);
                      }}
                      onToggleReimbursement={onToggleReimbursement}
                      onDeleteExpense={onDeleteExpense}
                      onUpdateExpense={(staffId, expId, data) => {
                        setEditingExpense(data);
                        setIsExpenseModalOpen(true);
                        return Promise.resolve();
                      }}
                      onReimburseMultiple={onReimburseMultiple}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
      
      <StaffAddExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        staffId={member.id}
        staffName={member.name}
        expense={editingExpense}
        onAdd={(data) => editingExpense 
          ? onUpdateExpense(member.id, editingExpense.id, data)
          : onAddExpense(member.id, data)
        }
        onDelete={(id) => onDeleteExpense(member.id, id)}
      />
    </div>,
    document.body
  ) : null;
};

