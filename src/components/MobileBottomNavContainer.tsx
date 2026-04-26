import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  CircleDollarSign, 
  User, 
  Shield, 
  Beaker 
} from 'lucide-react';
import { MobileBottomNav } from './Header';

interface MobileBottomNavContainerProps {
  currentUser: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onInventoryClick: () => void;
  hasPermission: (p: string) => boolean;
}

export const MobileBottomNavContainer: React.FC<MobileBottomNavContainerProps> = ({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onInventoryClick, 
  hasPermission 
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'BÁO CÁO',
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
      id: 'staff',
      label: 'Nhân sự',
      icon: Users,
      onClick: () => setActiveTab('staff'),
      visible: hasPermission('VIEW_STAFF'),
      hideOnMobile: true
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
      visible: hasPermission('MANAGE_USERS'),
      hideOnMobile: true
    },
    {
      id: 'sandbox',
      label: 'Thử nghiệm',
      icon: Beaker,
      onClick: () => setActiveTab('sandbox'),
      visible: currentUser?.role === 'ADMIN',
      hideOnMobile: true
    },
  ];

  return <MobileBottomNav navItems={navItems as any} activeTab={activeTab} />;
};
