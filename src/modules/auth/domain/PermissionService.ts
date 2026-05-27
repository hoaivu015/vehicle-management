import { UserRole } from '@/src/shared/domain/constants';
import { Vehicle } from '@/src/shared/domain/types';

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_INVENTORY: 'VIEW_INVENTORY',
  EDIT_INVENTORY: 'EDIT_INVENTORY',
  VIEW_CASHFLOW: 'VIEW_CASHFLOW',
  EDIT_CASHFLOW: 'EDIT_CASHFLOW',
  VIEW_STAFF: 'VIEW_STAFF',
  EDIT_STAFF: 'EDIT_STAFF',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  VIEW_PERSONAL: 'VIEW_PERSONAL',
  VIEW_TEAM_DATA: 'VIEW_TEAM_DATA',
  VIEW_OWN_DATA_ONLY: 'VIEW_OWN_DATA_ONLY',
  MANAGE_LANDINGPAGE: 'MANAGE_LANDINGPAGE',
} as const;

export type Permission = keyof typeof PERMISSIONS;

export interface RolePermission {
  role: string;
  module: string;
  can_access: boolean;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [UserRole.ADMIN]: Object.values(PERMISSIONS),
  [UserRole.ACCOUNTANT]: [
    PERMISSIONS.VIEW_PERSONAL,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.EDIT_INVENTORY,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.EDIT_STAFF,
    PERMISSIONS.VIEW_CASHFLOW,
    PERMISSIONS.EDIT_CASHFLOW,
  ],
  [UserRole.MANAGER]: [
    PERMISSIONS.VIEW_PERSONAL,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.VIEW_CASHFLOW,
    PERMISSIONS.MANAGE_LANDINGPAGE,
  ],
  [UserRole.STAFF]: [
    PERMISSIONS.VIEW_PERSONAL,
    PERMISSIONS.VIEW_INVENTORY,
  ],
};


export class PermissionService {
  private static dynamicPermissions: RolePermission[] = [];

  static setDynamicPermissions(permissions: RolePermission[]) {
    this.dynamicPermissions = permissions;
  }

  /**
   * Kiểm tra quyền chức năng
   */
  static hasPermission(role: UserRole | string | undefined, permission: Permission): boolean {
    if (!role) return false;

    // First check dynamic permissions if available
    if (this.dynamicPermissions.length > 0) {
      const moduleMatch = permission.toLowerCase().includes('dashboard') ? 'dashboard' :
                          permission.toLowerCase().includes('inventory') ? 'inventory' :
                          permission.toLowerCase().includes('staff') ? 'staff' :
                          permission.toLowerCase().includes('cashflow') ? 'cashflow' :
                          permission.toLowerCase().includes('users') ? 'users' :
                          permission.toLowerCase().includes('personal') ? 'personal' :
                          permission.toLowerCase().includes('permissions') ? 'permissions' :
                          permission.toLowerCase().includes('landingpage') ? 'landingpage' : null;

      if (moduleMatch) {
        const p = this.dynamicPermissions.find(dp => dp.role === role && dp.module === moduleMatch);
        if (p) {
          if (permission.startsWith('VIEW_') || permission === 'VIEW_PERSONAL') return p.can_access || p.can_view;
          if (permission.startsWith('EDIT_')) return p.can_edit;
          if (permission.startsWith('DELETE_')) return p.can_delete;
          if (permission === 'MANAGE_USERS' || permission === 'MANAGE_PERMISSIONS' || permission === 'MANAGE_LANDINGPAGE') return p.can_edit || p.can_access;
        }
      }
    }

    // Fallback to static permissions
    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRole.STAFF] || [];
    return permissions.includes(permission);
  }

  /**
   * Kiểm tra quyền hành động cụ thể trên module
   */
  static can(role: UserRole | string | undefined, module: string, action: 'access' | 'view' | 'edit' | 'delete'): boolean {
    if (!role) return false;
    
    const p = this.dynamicPermissions.find(dp => dp.role === role && dp.module === module);
    if (p) {
      if (action === 'access') return p.can_access;
      if (action === 'view') return p.can_view || p.can_access;
      if (action === 'edit') return p.can_edit;
      if (action === 'delete') return p.can_delete;
    }

    // Fallback logic for static roles if no dynamic permission found
    if (role === UserRole.ADMIN) return true;
    
    // Default fallback based on existing static permissions
    const permKey = `${action.toUpperCase()}_${module.toUpperCase()}` as Permission;
    return this.hasPermission(role, permKey);
  }

  /**
   * Kiểm tra phạm vi truy cập dữ liệu (Data Access Scope)
   */
  static canSeeAllData(role: UserRole | string | undefined): boolean {
    if (!role) return false;
    return [UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.MANAGER].includes(role as UserRole);
  }

  /**
   * Kiểm tra quyền xem thông tin tài chính chi tiết của xe
   */
  static canSeeFinancials(role: UserRole | string | undefined, userCode: string | undefined, vehicle: Partial<Vehicle>): boolean {
    if (this.canSeeAllData(role)) return true;
    
    if (vehicle.is_coinvested && userCode && vehicle.coinvestor_code === userCode) {
      return true;
    }

    return false;
  }

  /**
   * Kiểm tra quyền quản lý/chỉnh sửa xe
   */
  static canManageVehicle(role: UserRole | string | undefined): boolean {
    return this.can(role, 'inventory', 'edit');
  }

  /**
   * Kiểm tra xem có phải Admin không
   */
  static isAdmin(role: UserRole | string | undefined): boolean {
    return role === UserRole.ADMIN;
  }

  /**
   * Kiểm tra quyền xóa xe
   */
  static canDeleteVehicle(role: UserRole | string | undefined): boolean {
    return this.can(role, 'inventory', 'delete');
  }

  /**
   * Kiểm tra xem người dùng có liên quan đến xe này không
   */
  static isRelatedToVehicle(userCode: string | undefined, vehicle: Partial<Vehicle>): boolean {
    if (!userCode) return false;
    return (
      vehicle.buyer === userCode || 
      vehicle.seller === userCode || 
      (Boolean(vehicle.is_coinvested) && vehicle.coinvestor_code === userCode)
    ) || false;
  }
}


