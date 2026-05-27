import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  CircleDollarSign, 
  User, 
  Shield, 
  Beaker,
  Plus
} from 'lucide-react';
import { MobileBottomNav } from './MobileBottomNav';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { UserRole } from '@/src/shared/domain/constants';

import { Staff } from '@/src/shared/domain/types';
import { NavItem } from '@/src/shared/presentation/hooks/useNavigation';

interface MobileBottomNavContainerProps {
  currentUser: Staff | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onInventoryClick: () => void;
  onAddExpenseClick: () => void;
  hasPermission: (p: string) => boolean;
}

export const MobileBottomNavContainer: React.FC<MobileBottomNavContainerProps> = ({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onInventoryClick,
  onAddExpenseClick,
  hasPermission 
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Báo cáo',
      icon: LayoutDashboard,
      onClick: () => setActiveTab('dashboard'),
      visible: hasPermission('VIEW_DASHBOARD')
    },
    {
      id: 'inventory',
      label: 'Kho xe',
      icon: Car,
      onClick: onInventoryClick,
      visible: hasPermission('VIEW_INVENTORY')
    },
    {
      id: 'add_expense',
      label: 'Ghi chú',
      icon: Plus,
      onClick: onAddExpenseClick,
      visible: currentUser?.role !== UserRole.ADMIN,
      isAction: true
    },
    {
      id: 'staff',
      label: 'Nhân sự',
      icon: Users,
      onClick: () => setActiveTab('staff'),
      visible: hasPermission('VIEW_STAFF')
    },
    {
      id: 'cashflow',
      label: 'Dòng tiền',
      icon: CircleDollarSign,
      onClick: () => setActiveTab('cashflow'),
      visible: hasPermission('VIEW_CASHFLOW')
    },
    {
      id: 'personal',
      label: 'Cá nhân',
      icon: User,
      onClick: () => setActiveTab('personal'),
      visible: hasPermission('VIEW_PERSONAL')
    },
    {
      id: 'users',
      label: 'Tài khoản',
      icon: Shield,
      onClick: () => setActiveTab('users'),
      visible: hasPermission('MANAGE_USERS')
    },
    {
      id: 'sandbox',
      label: 'Thử nghiệm',
      icon: Beaker,
      onClick: () => setActiveTab('sandbox'),
      visible: PermissionService.isAdmin(currentUser?.role)
    },
  ];

  return <MobileBottomNav navItems={navItems as NavItem[]} activeTab={activeTab} />;
};
