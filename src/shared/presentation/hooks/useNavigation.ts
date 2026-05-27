import React, { useMemo } from 'react';
import { Car, LayoutDashboard, Users, User, CircleDollarSign, Beaker, Shield, Globe } from 'lucide-react';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { Staff } from '@/src/shared/domain/types';
import { UserRole } from '@/src/shared/domain/constants';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  visible: boolean;
  hideOnMobile?: boolean;
  isAction?: boolean;
}

export const useNavigation = (
  currentUser: Staff | null,
  setActiveTab: (tab: string) => void,
  onInventoryClick: () => void,
  hasPermission: (permission: string) => boolean
) => {
  const navItems: NavItem[] = useMemo(() => [
    { id: 'dashboard', label: 'BÁO CÁO', icon: LayoutDashboard, onClick: () => setActiveTab('dashboard'), visible: hasPermission('VIEW_DASHBOARD') },
    { id: 'inventory', label: 'Kho xe', icon: Car, onClick: onInventoryClick, visible: hasPermission('VIEW_INVENTORY') },
    { id: 'staff', label: 'Nhân sự', icon: Users, onClick: () => setActiveTab('staff'), visible: hasPermission('VIEW_STAFF'), hideOnMobile: currentUser?.role !== UserRole.ACCOUNTANT && currentUser?.role !== UserRole.ADMIN },
    { id: 'cashflow', label: 'Dòng tiền', icon: CircleDollarSign, onClick: () => setActiveTab('cashflow'), visible: hasPermission('VIEW_CASHFLOW') },
    { id: 'landingpage', label: 'Landing Page', icon: Globe, onClick: () => setActiveTab('landingpage'), visible: hasPermission('MANAGE_LANDINGPAGE'), hideOnMobile: true },
    { id: 'personal', label: 'Cá nhân', icon: User, onClick: () => setActiveTab('personal'), visible: hasPermission('VIEW_PERSONAL') },
    { id: 'users', label: 'Tài khoản', icon: Shield, onClick: () => setActiveTab('users'), visible: hasPermission('MANAGE_USERS'), hideOnMobile: true },
    { id: 'permissions', label: 'Phân quyền', icon: Shield, onClick: () => setActiveTab('permissions'), visible: hasPermission('MANAGE_PERMISSIONS'), hideOnMobile: true },
    { id: 'sandbox', label: 'Thử nghiệm', icon: Beaker, onClick: () => setActiveTab('sandbox'), visible: PermissionService.isAdmin(currentUser?.role), hideOnMobile: true },
  ], [currentUser, setActiveTab, onInventoryClick, hasPermission]);

  return navItems;
};
