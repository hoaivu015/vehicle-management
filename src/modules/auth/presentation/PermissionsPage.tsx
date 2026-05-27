import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Save, Check, X, Lock, Eye, Edit3, Trash2, ChevronRight } from 'lucide-react';
import { UserRole, USER_ROLE_LABELS, USER_TAB_LABELS } from '@/src/shared/domain/constants';
import { RolePermission } from '@/src/modules/auth/domain/PermissionService';
import { useNotification } from '@/src/shared/presentation/useNotification';
import { cn } from '@/src/shared/utils/cn';
import { motion } from 'motion/react';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { PermissionsView } from './PermissionsPresenter';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

const PermissionsPageSkeleton = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">
    {/* Header skeleton */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="rectangle" width={48} height={48} className="rounded-2xl animate-pulse bg-kraft-accent/10" />
        <div className="space-y-2">
          <Skeleton variant="text" width={220} height={22} className="animate-pulse bg-black/5" />
          <Skeleton variant="text" width={300} height={10} className="animate-pulse bg-black/5" />
        </div>
      </div>
      <Skeleton variant="rectangle" width={140} height={48} className="rounded-2xl animate-pulse bg-kraft-accent/10" />
    </div>
    {/* Grid skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-3">
        <Skeleton variant="text" width={80} height={10} className="animate-pulse bg-black/5 ml-2 mb-4" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangle" width="100%" height={52} className="rounded-2xl animate-pulse bg-black/5" />
        ))}
      </div>
      {/* Table */}
      <div className="lg:col-span-3">
        <div className="glass-purity-surface rounded-[2.5rem] border-white/40 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-5 gap-4 p-6 border-b border-black/5 bg-white/30">
            <Skeleton variant="text" width={100} height={10} className="animate-pulse bg-black/5" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton variant="rectangle" width={24} height={24} className="rounded animate-pulse bg-black/5" />
                <Skeleton variant="text" width={40} height={10} className="animate-pulse bg-black/5" />
              </div>
            ))}
          </div>
          {/* Table rows */}
          <div className="divide-y divide-black/5">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 items-center p-6">
                <div className="flex items-center gap-4">
                  <Skeleton variant="rectangle" width={40} height={40} className="rounded-xl shrink-0 animate-pulse bg-black/5" />
                  <div className="space-y-1.5">
                    <Skeleton variant="text" width={80} height={12} className="animate-pulse bg-black/5" />
                    <Skeleton variant="text" width={60} height={10} className="animate-pulse bg-black/5" />
                  </div>
                </div>
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex justify-center">
                    <Skeleton variant="rectangle" width={40} height={40} className="rounded-xl animate-pulse bg-black/5" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MODULES = [
  'dashboard',
  'inventory',
  'staff',
  'cashflow',
  'users',
  'personal',
  'permissions'
];

const ACTIONS = [
  { id: 'can_access', label: 'Truy cập', icon: Lock, color: 'text-blue-500' },
  { id: 'can_view', label: 'Chỉ xem', icon: Eye, color: 'text-emerald-500' },
  { id: 'can_edit', label: 'Sửa', icon: Edit3, color: 'text-orange-500' },
  { id: 'can_delete', label: 'Xoá', icon: Trash2, color: 'text-red-500' },
] as const;

export const PermissionsPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STAFF);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const notification = useNotification();

  const { createPermissionsPresenter } = useDependencies();
  const presenter = useMemo(() => createPermissionsPresenter(), [createPermissionsPresenter]);

  useEffect(() => {
    const view: PermissionsView = {
      showLoading: () => setLoading(true),
      hideLoading: () => setLoading(false),
      showError: (msg) => notification.error(msg),
      setPermissions: (data) => setPermissions(data),
      setSaving: (isSaving) => setSaving(isSaving)
    };
    presenter.attachView(view);
    presenter.loadPermissions();
    return () => presenter.detachView();
  }, [presenter, notification]);

  const getPermission = (role: string, module: string) => {
    return permissions.find(p => p.role === role && p.module === module) || {
      role,
      module,
      can_access: false,
      can_view: false,
      can_edit: false,
      can_delete: false
    };
  };

  const togglePermission = (role: string, module: string, action: keyof Omit<RolePermission, 'id' | 'role' | 'module' | 'updated_at'>) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.role === role && p.module === module);
      if (existing) {
        return prev.map(p => 
          (p.role === role && p.module === module) 
            ? { ...p, [action]: !p[action] } 
            : p
        );
      } else {
        return [...prev, {
          role,
          module,
          can_access: false,
          can_view: false,
          can_edit: false,
          can_delete: false,
          [action]: true
        } as RolePermission];
      }
    });
  };

  const handleSave = async () => {
    await presenter.savePermissions(selectedRole, permissions);
  };

  if (loading) return <PermissionsPageSkeleton />;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-kraft-accent to-kraft-accent/60 flex items-center justify-center text-white shadow-lg shadow-kraft-accent/20">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-kraft-ink tracking-tight uppercase">Phân quyền hệ thống</h1>
              <p className="text-xs font-bold text-kraft-ink/40 uppercase tracking-widest">Thiết lập quyền truy cập và thao tác cho từng vai trò</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="glass-purity-button bg-kraft-accent text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest shadow-xl shadow-kraft-accent/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Role Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] font-black text-kraft-ink/30 uppercase tracking-[0.2em] ml-2 mb-4">Vai trò người dùng</p>
          {(Object.keys(UserRole) as Array<keyof typeof UserRole>).map((roleKey) => {
            const role = UserRole[roleKey];
            const isActive = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center justify-between group",
                  isActive 
                    ? "glass-purity-surface border-kraft-accent/20 shadow-lg" 
                    : "hover:bg-white/40 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    isActive ? "bg-kraft-accent scale-125 shadow-[0_0_10px_rgba(var(--kraft-accent-rgb),0.5)]" : "bg-kraft-ink/10 group-hover:bg-kraft-ink/20"
                  )} />
                  <span className={cn(
                    "text-xs uppercase tracking-wider transition-all",
                    isActive ? "font-black text-kraft-ink" : "font-bold text-kraft-ink/40"
                  )}>
                    {USER_ROLE_LABELS[role]}
                  </span>
                </div>
                {isActive && <ChevronRight size={14} className="text-kraft-accent animate-in slide-in-from-left-2 duration-300" />}
              </button>
            );
          })}
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3">
          <div className="glass-purity-surface rounded-[2.5rem] border-white/40 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-white/30 backdrop-blur-md">
                    <th className="p-6 text-[10px] font-black text-kraft-ink/30 uppercase tracking-[0.2em]">Chức năng / Tab</th>
                    {ACTIONS.map(action => (
                      <th key={action.id} className="p-6 text-center text-[10px] font-black text-kraft-ink/30 uppercase tracking-[0.2em]">
                        <div className="flex flex-col items-center gap-2">
                          <action.icon size={14} className={action.color} />
                          {action.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {MODULES.map((module, idx) => {
                    const perm = getPermission(selectedRole, module);
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={module} 
                        className="group hover:bg-white/30 transition-colors"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/60 shadow-sm border border-black/5 flex items-center justify-center text-kraft-accent group-hover:scale-110 transition-transform">
                              <Shield size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-kraft-ink uppercase tracking-tight">{USER_TAB_LABELS[module] || module}</p>
                              <p className="text-[10px] font-bold text-kraft-ink/30 uppercase tracking-widest">{module}</p>
                            </div>
                          </div>
                        </td>
                        {ACTIONS.map(action => (
                          <td key={action.id} className="p-6 text-center">
                            <button
                              onClick={() => togglePermission(selectedRole, module, action.id)}
                              className={cn(
                                "w-10 h-10 rounded-xl mx-auto flex items-center justify-center transition-all duration-300 active:scale-90",
                                perm[action.id] 
                                  ? "bg-kraft-accent/10 text-kraft-accent shadow-inner border border-kraft-accent/20" 
                                  : "bg-white/40 text-kraft-ink/10 hover:text-kraft-ink/20 border border-transparent"
                              )}
                            >
                              {perm[action.id] ? <Check size={18} strokeWidth={3} /> : <X size={18} />}
                            </button>
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8 p-6 glass-purity-surface rounded-3xl border-orange-500/10 bg-orange-500/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-600 shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">Lưu ý quan trọng</h4>
              <p className="text-[11px] font-bold text-orange-700/70 leading-relaxed uppercase">
                Việc thay đổi phân quyền sẽ có hiệu lực ngay lập tức đối với tất cả người dùng thuộc vai trò này. 
                Hãy cẩn trọng khi giới hạn quyền truy cập của chính mình (Admin).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
