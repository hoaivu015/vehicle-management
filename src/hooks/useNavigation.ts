import { useMemo } from 'react';
import { Car, LayoutDashboard, Users, User, CircleDollarSign, Beaker, Shield } from 'lucide-react';
import { UserRole } from '@/src/shared/domain/constants';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  onClick: () => void;
  visible: boolean;
  hideOnMobile?: boolean;
}

export const useNavigation = (
  currentUser: any,
  setActiveTab: (tab: string) => void,
  onInventoryClick: () => void,
  hasPermission: (permission: string) => boolean
) => {
  const navItems: NavItem[] = useMemo(() => [
    { id: 'dashboard', label: 'BÁO CÁO', icon: LayoutDashboard, onClick: () => setActiveTab('dashboard'), visible: hasPermission('VIEW_DASHBOARD') },
    { id: 'inventory', label: 'Kho xe', icon: Car, onClick: onInventoryClick, visible: hasPermission('VIEW_INVENTORY') },
    { id: 'staff', label: 'Nhân sự', icon: Users, onClick: () => setActiveTab('staff'), visible: hasPermission('VIEW_STAFF'), hideOnMobile: true },
    { id: 'cashflow', label: 'Dòng tiền', icon: CircleDollarSign, onClick: () => setActiveTab('cashflow'), visible: hasPermission('VIEW_CASHFLOW') },
    { id: 'personal', label: 'Cá nhân', icon: User, onClick: () => setActiveTab('personal'), visible: hasPermission('VIEW_PERSONAL') },
    { id: 'users', label: 'Tài khoản', icon: Shield, onClick: () => setActiveTab('users'), visible: hasPermission('MANAGE_USERS'), hideOnMobile: true },
    { id: 'sandbox', label: 'Thử nghiệm', icon: Beaker, onClick: () => setActiveTab('sandbox'), visible: currentUser?.role === UserRole.ADMIN, hideOnMobile: true },
  ], [currentUser, setActiveTab, onInventoryClick, hasPermission]);

  return navItems;
};
