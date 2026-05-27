import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseTable } from '../ExpenseTable';
import { StaffExpense } from '../../../../../../shared/domain/types';
import { UserRole } from '../../../../../../shared/domain/constants';


describe('ExpenseTable Component', () => {
  const mockExpenses: StaffExpense[] = [
    { id: '1', amount: 1000000, note: 'Unpaid 1', date: '2026-04-10', type: 'operating', is_reimbursed: false },
    { id: '2', amount: 2000000, note: 'Unpaid 2', date: '2026-04-15', type: 'operating', is_reimbursed: false },
    { id: '3', amount: 500000, note: 'Paid In March', date: '2026-03-20', type: 'operating', is_reimbursed: true },
    { id: '4', amount: 700000, note: 'Paid In April', date: '2026-04-05', type: 'operating', is_reimbursed: true },
  ];

  const defaultProps = {
    expenses: mockExpenses,
    memberId: 'm1',
    userRole: UserRole.ADMIN,
    onAddClick: vi.fn(),
    onToggleReimbursement: vi.fn(),
    onDeleteExpense: vi.fn(),
    onUpdateExpense: vi.fn(),
    onReimburseMultiple: vi.fn(),
    filterMonth: '2026-04',
  };

  it('calculates totals correctly', () => {
    render(<ExpenseTable {...defaultProps} />);
    
    // Total unreimbursed: 1M + 2M = 3M
    // Total reimbursed in 2026-04: 700k
    expect(screen.getAllByText('3 Tr').length).toBeGreaterThan(0);
    expect(screen.getAllByText('700k').length).toBeGreaterThan(0);
  });

  it('filters reimbursed expenses by month', () => {
    const { rerender } = render(<ExpenseTable {...defaultProps} />);
    
    // In April 2026: Paid In April should be visible
    expect(screen.getAllByText('Paid In April').length).toBeGreaterThan(0);
    expect(screen.queryByText('Paid In March')).toBeNull();

    // Change filter to March 2026
    rerender(<ExpenseTable {...defaultProps} filterMonth="2026-03" />);
    expect(screen.queryByText('Paid In April')).toBeNull();
    expect(screen.getAllByText('Paid In March').length).toBeGreaterThan(0);
  });

  it('calls onReimburseMultiple when Pay All is clicked', () => {
    render(<ExpenseTable {...defaultProps} />);
    
    const payAllButton = screen.getByTitle('Thanh toán toàn bộ');
    fireEvent.click(payAllButton);
    
    expect(defaultProps.onReimburseMultiple).toHaveBeenCalledWith('m1', ['1', '2']);
  });

  it('disables pay button for non-admin users', () => {
    render(<ExpenseTable {...defaultProps} userRole={UserRole.STAFF} />);
    
    const toggleButtons = screen.getAllByRole('button', { name: /Chờ hoàn tiền|Đã chi lại/ });
    toggleButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
