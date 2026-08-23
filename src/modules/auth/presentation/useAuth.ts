import { useState, useEffect, useCallback } from 'react';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { PermissionService, Permission } from '@/src/modules/auth/domain/PermissionService';
import { useNotification } from '@/src/shared/presentation/useNotification';
import { Staff, Vehicle } from '@/src/shared/domain/types';

const CACHE_KEY_USER = 'AUTO28_CACHED_USER';
const CACHE_KEY_PERMS = 'AUTO28_CACHED_PERMISSIONS';

import { StaffSchema } from '@/src/modules/staff/domain/StaffSchema';
import { staffMapper } from '@/src/modules/staff/infrastructure/mappers/StaffMapper';

const getInitialCachedUser = (): Staff | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY_USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validation = StaffSchema.safeParse(parsed);
    if (!validation.success) {
      localStorage.removeItem(CACHE_KEY_USER);
      return null;
    }
    return staffMapper.toDomain(validation.data);
  } catch {
    return null;
  }
};

const getInitialCachedPermissions = (): import('@/src/modules/auth/domain/PermissionService').RolePermission[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY_PERMS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(CACHE_KEY_PERMS);
      return null;
    }
    return parsed as import('@/src/modules/auth/domain/PermissionService').RolePermission[];
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const { authRepo, staffRepo, permissionRepo } = useDependencies();
  
  // Instant SWR Boot: Initialize state from local cache to eliminate 1.5s splash screen delay
  const initialCached = getInitialCachedUser();
  const initialPerms = getInitialCachedPermissions();
  if (initialPerms && initialPerms.length > 0) {
    PermissionService.setDynamicPermissions(initialPerms);
  }

  const [currentUser, setCurrentUser] = useState<Staff | null>(initialCached);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(!initialCached);
  const [isAuthed, setIsAuthed] = useState<boolean>(!!initialCached);
  const notification = useNotification();

  const handleLogout = useCallback(async () => {
    try {
      localStorage.removeItem(CACHE_KEY_USER);
      localStorage.removeItem(CACHE_KEY_PERMS);
    } catch {
      // Ignore storage errors
    }
    setCurrentUser(null);
    setIsAuthed(false);
    await authRepo.signOut();
  }, [authRepo]);

  const fetchPermissions = useCallback(async () => {
    try {
      const data = await permissionRepo.getAllPermissions();
      if (data) {
        PermissionService.setDynamicPermissions(data);
        try {
          localStorage.setItem(CACHE_KEY_PERMS, JSON.stringify(data));
        } catch {
          // Ignore quota/storage errors
        }
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
    }
  }, [permissionRepo]);

  const fetchProfile = useCallback(async (email: string) => {
    try {
      // Fetch permissions and employee profile in parallel to eliminate waterfall
      const [, data] = await Promise.all([
        fetchPermissions(),
        staffRepo.getByEmail(email)
      ]);

      if (data) {
        setCurrentUser(data);
        try {
          localStorage.setItem(CACHE_KEY_USER, JSON.stringify(data));
        } catch {
          // Ignore quota/storage errors
        }
      } else {
        console.error("Authenticated user has no employee profile. Cleaning up session.");
        notification.error("Tài khoản của bạn không có hồ sơ hợp lệ. Vui lòng liên hệ Admin.");
        try {
          localStorage.removeItem(CACHE_KEY_USER);
          localStorage.removeItem(CACHE_KEY_PERMS);
        } catch {
          // Ignore storage errors
        }
        await handleLogout();
      }
    } catch (err: unknown) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsAuthLoading(false);
    }
  }, [fetchPermissions, staffRepo, handleLogout, notification]);

  useEffect(() => {
    authRepo.getSessionUserEmail().then((email) => {
      setIsAuthed(!!email);
      if (email) {
        fetchProfile(email);
      } else {
        try {
          localStorage.removeItem(CACHE_KEY_USER);
          localStorage.removeItem(CACHE_KEY_PERMS);
        } catch {
          // Ignore storage errors
        }
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    const unsubscribe = authRepo.onAuthStateChange(async (email) => {
      setIsAuthed(!!email);
      if (email) {
        fetchProfile(email);
      } else {
        try {
          localStorage.removeItem(CACHE_KEY_USER);
          localStorage.removeItem(CACHE_KEY_PERMS);
        } catch {
          // Ignore storage errors
        }
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchProfile, authRepo]);

  // Realtime synchronization for global permissions matrix
  useEffect(() => {
    if (!permissionRepo.subscribe) return;
    const unsubPerms = permissionRepo.subscribe((perms) => {
      if (perms && perms.length > 0) {
        PermissionService.setDynamicPermissions(perms);
        try {
          localStorage.setItem(CACHE_KEY_PERMS, JSON.stringify(perms));
        } catch {
          // Ignore quota/storage errors
        }
      }
    });
    return () => {
      unsubPerms();
    };
  }, [permissionRepo]);

  // Realtime synchronization for current user profile / role changes
  useEffect(() => {
    if (!currentUser?.email || !staffRepo.subscribeToEmail) return;
    const unsubProfile = staffRepo.subscribeToEmail(currentUser.email, (updatedProfile) => {
      if (updatedProfile) {
        setCurrentUser(updatedProfile);
        try {
          localStorage.setItem(CACHE_KEY_USER, JSON.stringify(updatedProfile));
        } catch {
          // Ignore quota/storage errors
        }
      }
    });
    return () => {
      unsubProfile();
    };
  }, [currentUser?.email, staffRepo]);

  const hasPermission = useCallback((permission: Permission | string) => {
    return PermissionService.hasPermission(currentUser?.role, permission as Permission);
  }, [currentUser]);

  const can = useCallback((module: string, action: 'access' | 'view' | 'edit' | 'delete') => {
    return PermissionService.can(currentUser?.role, module, action);
  }, [currentUser]);

  const canSeeAllData = useCallback(() => {
    return PermissionService.canSeeAllData(currentUser?.role);
  }, [currentUser]);

  const isAdmin = useCallback(() => {
    return PermissionService.isAdmin(currentUser?.role);
  }, [currentUser]);

  const canSeeFinancials = useCallback((vehicle: Partial<Vehicle>) => {
    return PermissionService.canSeeFinancials(currentUser?.role, currentUser?.code, vehicle);
  }, [currentUser]);

  const handleUpdateUser = async (email: string, data: Partial<Staff> & { password?: string }) => {
    try {
      if (data.password) {
        await authRepo.updatePassword(data.password);
      }

      const { password: _password, ...profileData } = data;
      if (Object.keys(profileData).length > 0 && currentUser) {
        await staffRepo.update(currentUser.id, profileData);
      }

      setCurrentUser((prev) => {
        if (!prev || prev.email?.toLowerCase() !== email.toLowerCase()) return prev;
        return { ...prev, ...profileData };
      });
    } catch (err: unknown) {
      console.error("Error updating user:", err);
      const message = err instanceof Error ? err.message : "Không thể cập nhật thông tin. Vui lòng thử lại.";
      notification.error(message);
    }
  };

  return {
    currentUser,
    setCurrentUser,
    isAuthLoading,
    isAuthed,
    hasPermission,
    can,
    canSeeAllData,
    isAdmin,
    canSeeFinancials,
    handleLogout,
    handleUpdateUser,
    refreshPermissions: fetchPermissions
  };
};
