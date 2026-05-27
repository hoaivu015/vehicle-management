import React, { useState } from 'react';
import { X, DollarSign, TrendingUp, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { StaffWithSalary } from '../../application/GetStaffList';
import { Vehicle, StaffExpense } from '@/src/shared/domain/types';
import { StaffAddExpenseModal } from './StaffAddExpenseModal';
import { Sidebar } from './StaffDetail/Sidebar';
import { TabsBar } from './StaffDetail/TabsBar';
import { CarTable } from './StaffDetail/CarTable';
import { ExpenseTable } from './StaffDetail/ExpenseTable';
import { BaseModal as Modal } from '@/src/shared/design-system/BaseModal';
import { AddStaffExpenseInput, UpdateStaffExpenseInput } from '../../domain/StaffValidation';

interface StaffDetailModalProps {
  member: StaffWithSalary;
  isOpen: boolean;
  onClose: () => void;
  filterMonth: string;
  onAddExpense: (staffId: string | number, data: AddStaffExpenseInput) => Promise<void>;
  onToggleReimbursement: (staffId: string | number, expenseId: string) => Promise<void>;
  onDeleteExpense: (staffId: string | number, expenseId: string) => Promise<void>;
  onUpdateExpense: (staffId: string | number, expenseId: string, data: UpdateStaffExpenseInput) => Promise<void>;
  onReimburseMultiple: (staffId: string | number, expenseIds: string[]) => Promise<void>;
  onUpdateVehicle: (id: number, data: Partial<Vehicle>) => Promise<void>;
  userRole?: string;
  vehicles?: Vehicle[];
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
  onUpdateVehicle,
  userRole,
  vehicles = []
}) => {
  const [activeTab, setActiveTab] = useState<'earnings' | 'advances'>('earnings');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<StaffExpense | null>(null);

  type TabType = 'earnings' | 'advances';

  if (!isOpen) return null;

  const isAdmin = PermissionService.isAdmin(member.role);
  const { salaryDetails } = member;

  const totalUnreimbursed = (member.expenses || [])
    .filter(e => !e.is_reimbursed)
    .reduce((sum, e) => sum + e.amount, 0);

  const earningsCount = salaryDetails.soldCars.length + salaryDetails.boughtCars.length + salaryDetails.coinvestedCars.length;

  const tabs: { id: TabType, label: string, icon: LucideIcon, count: number }[] = [
    { id: 'earnings', label: 'Thu nhập', icon: TrendingUp, count: earningsCount },
    { id: 'advances', label: 'Tạm ứng', icon: DollarSign, count: (member.expenses || []).length },
  ];

  const getUnifiedEarnings = () => {
    const combined = [
      ...salaryDetails.soldCars.map(c => ({ ...c, _type: 'sales' as const })),
      ...salaryDetails.boughtCars.map(c => ({ ...c, _type: 'buying' as const })),
      ...salaryDetails.coinvestedCars.map(c => ({ ...c, _type: 'collaboration' as const }))
    ];
    // Sort by date descending
    return combined.sort((a, b) => {
      const dateA = a._type === 'buying' ? a.purchase_date : a.sale_date;
      const dateB = b._type === 'buying' ? b.purchase_date : b.sale_date;
      return (dateB || '').localeCompare(dateA || '');
    });
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        maxWidth="6xl" 
        showCloseButton={false}
        className="h-[92vh] lg:h-[85vh]"
      >
        <div className="relative w-full h-full flex flex-col lg:flex-row overflow-hidden pointer-events-auto">
          <div className="absolute top-[var(--safe-area-top)] right-4 md:top-8 md:right-8 z-[110] flex gap-3 pt-2 md:pt-0">
            <button
              onClick={onClose}
              className="w-10 h-10 md:w-12 md:h-12 glass-purity-surface text-kraft-ink hover:text-red-500 rounded-full transition-all shadow-lg active:scale-[0.95] flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          <Sidebar 
            member={member} 
            filterMonth={filterMonth} 
            isAdmin={isAdmin} 
            totalUnreimbursed={totalUnreimbursed} 
          />

          <div className="flex-1 flex flex-col bg-[var(--meta-step-2)] overflow-hidden pt-2 md:pt-6">
            <TabsBar<TabType> tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 bg-white border border-hairline-soft rounded-[2rem] shadow-kraft-deep overflow-hidden mx-4 md:mx-6 mb-6 flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {activeTab === 'earnings' ? (
                      <CarTable 
                        cars={getUnifiedEarnings()} 
                        onUpdateVehicle={onUpdateVehicle}
                        userRole={userRole}
                      />
                    ) : (
                      <ExpenseTable 
                        expenses={member.expenses || []} 
                        memberId={member.id.toString()} 
                        userRole={userRole}
                        filterMonth={filterMonth}
                        onAddClick={() => {
                          setEditingExpense(null);
                          setIsExpenseModalOpen(true);
                        }}
                        onToggleReimbursement={onToggleReimbursement}
                        onUpdateExpense={(_staffId, _expId, data) => {
                          setEditingExpense(data as StaffExpense);
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
        </div>
      </Modal>

      <StaffAddExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}

        staffName={member.name}
        expense={editingExpense || undefined}
        onAdd={(data) => editingExpense 
          ? onUpdateExpense(String(member.id), editingExpense.id, { ...data, id: editingExpense.id } as UpdateStaffExpenseInput)
          : onAddExpense(String(member.id), data)
        }
        onDelete={(id) => onDeleteExpense(String(member.id), String(id))}
        vehicles={vehicles}
      />
    </>
  );
};
