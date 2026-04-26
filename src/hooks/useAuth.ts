import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/shared/infrastructure/supabase';
import { ROLE_PERMISSIONS } from '@/src/constants';
import { UserRole } from '@/src/shared/domain/constants';
import { toast } from 'sonner';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  const fetchProfile = useCallback(async (email: string) => {
    try {
      const { data } = await supabase.from('employees').select('*').eq('email', email).maybeSingle();

      if (data) {
        setCurrentUser({ ...data, docId: data.id });
      } else {
        console.error("Authenticated user has no employee profile. Cleaning up session.");
        toast.error("Tài khoản của bạn không có hồ sơ hợp lệ. Vui lòng liên hệ Admin.");
        await handleLogout();
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session?.user);
      if (session?.user?.email) {
        fetchProfile(session.user.email);
      } else {
        setIsAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthed(!!session?.user);
      if (session?.user?.email) {
        fetchProfile(session.user.email);
      } else {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const handleLogout = async () => {
    setCurrentUser(null);
    setIsAuthed(false);
    await supabase.auth.signOut();
  };

  const hasPermission = useCallback((permission: string) => {
    if (!currentUser) return false;
    const role = currentUser.role || UserRole.STAFF;
    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRole.STAFF];
    return permissions.includes(permission);
  }, [currentUser]);

  const handleUpdateUser = async (email: string, data: any) => {
    try {
      if (data.password) {
        const { error: authError } = await supabase.auth.updateUser({ password: data.password });
        if (authError) throw authError;
      }

      const { password, ...profileData } = data;
      if (Object.keys(profileData).length > 0) {
        const { error } = await supabase.from('employees').update(profileData).eq('email', email);
        if (error) throw error;
      }

      if (password) {
        const { error: mirrorError } = await supabase.from('users').update({ password }).eq('email', email);
        if (mirrorError) console.error("Error updating mirror password:", mirrorError);
      }

      const userData: any = {};
      if (data.name) userData.name = data.name;
      if (data.role) userData.role = data.role;

      if (Object.keys(userData).length > 0) {
        await supabase.from('users').update(userData).ilike('email', email);
      }

      setCurrentUser((prev: any) => {
        if (!prev || prev.email.toLowerCase() !== email.toLowerCase()) return prev;
        return { ...prev, ...data };
      });

      toast.success("Cập nhật thông tin thành công!");
    } catch (err: any) {
      console.error("Error updating user:", err);
      toast.error(err.message || "Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  return {
    currentUser,
    setCurrentUser,
    isAuthLoading,
    isAuthed,
    hasPermission,
    handleLogout,
    handleUpdateUser
  };
};
