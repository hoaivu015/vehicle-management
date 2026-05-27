import { useState, useEffect, useCallback } from 'react';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { useNotification } from '@/src/shared/presentation/useNotification';
import { Staff, Vehicle } from '@/src/shared/domain/types';

export const useAuth = () => {
  const { authRepo, staffRepo, permissionRepo } = useDependencies();
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const notification = useNotification();

  const fetchPermissions = useCallback(async () => {
    try {
      const data = await permissionRepo.getAllPermissions();
      if (data) {
        PermissionService.setDynamicPermissions(data);
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
    }
  }, [permissionRepo]);

  const fetchProfile = useCallback(async (email: string) => {
    try {
      // Fetch permissions first or in parallel
      await fetchPermissions();
      
      const data = await staffRepo.getByEmail(email);

      if (data) {
        setCurrentUser(data);
      } else {
        console.error("Authenticated user has no employee profile. Cleaning up session.");
        notification.error("Tài khoản của bạn không có hồ sơ hợp lệ. Vui lòng liên hệ Admin.");

        await handleLogout();
      }
    } catch (err: unknown) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsAuthLoading(false);
    }
  }, [fetchPermissions, staffRepo]);

  useEffect(() => {
    authRepo.getSessionUserEmail().then((email) => {
      setIsAuthed(!!email);
      if (email) {
        fetchProfile(email);
      } else {
        setIsAuthLoading(false);
      }
    });

    const unsubscribe = authRepo.onAuthStateChange(async (email) => {
      setIsAuthed(!!email);
      if (email) {
        fetchPermissions(); // Refresh permissions on auth change
        fetchProfile(email);
      } else {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchProfile, fetchPermissions, authRepo]);

  const handleLogout = async () => {
    setCurrentUser(null);
    setIsAuthed(false);
    await authRepo.signOut();
  };

  const hasPermission = useCallback((permission: string) => {
    return PermissionService.hasPermission(currentUser?.role, permission as any);
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

      const { password, ...profileData } = data;
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
