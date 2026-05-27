import React, { useEffect, useState } from 'react';
import { Shield, Eye, EyeOff, RefreshCw, Key, Search, Mail, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '@/src/shared/presentation/useNotification';
import { cn } from '@/src/shared/utils/cn';
import { UserRole } from '@/src/shared/domain/constants';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { Account } from '@/src/shared/domain/types';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

const AccountPageSkeleton = () => (
  <div className="space-y-10 md:space-y-14 py-4 md:py-12 px-4 md:px-12 max-w-[1700px] mx-auto">
    {/* Header skeleton */}
    <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10">
      <div className="flex items-center gap-6">
        <Skeleton variant="rectangle" width={64} height={64} className="rounded-[2rem] bg-black/5 animate-pulse" />
        <Skeleton variant="text" width={180} height={52} className="animate-pulse" />
      </div>
      <div className="flex gap-4">
        <Skeleton variant="rectangle" width={280} height={56} className="rounded-2xl animate-pulse bg-black/5" />
        <Skeleton variant="rectangle" width={56} height={56} className="rounded-2xl animate-pulse bg-black/5" />
      </div>
    </div>
    {/* Table skeleton */}
    <div className="liquid-card overflow-hidden p-0 border-white/60">
      {/* Table header */}
      <div className="bg-kraft-accent/5 grid grid-cols-5 gap-4 py-5 px-8 border-b border-black/5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="text" width="60%" height={10} className="animate-pulse bg-black/5" />
        ))}
      </div>
      {/* Table rows */}
      <div className="divide-y divide-black/5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 items-center py-5 px-8">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <Skeleton variant="circle" width={40} height={40} className="rounded-full shrink-0 animate-pulse bg-black/5" />
              <Skeleton variant="text" width={100} height={14} className="animate-pulse bg-black/5" />
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <Skeleton variant="text" width={130} height={12} className="animate-pulse bg-black/5" />
              <Skeleton variant="text" width={80} height={10} className="animate-pulse bg-black/5" />
            </div>
            {/* Role */}
            <Skeleton variant="rectangle" width={70} height={24} className="rounded-full animate-pulse bg-black/5" />
            {/* Password */}
            <div className="flex items-center gap-3">
              <Skeleton variant="rectangle" width={128} height={36} className="rounded-lg animate-pulse bg-black/5" />
              <Skeleton variant="rectangle" width={32} height={32} className="rounded-lg animate-pulse bg-black/5" />
            </div>
            {/* Action */}
            <div className="flex justify-end">
              <Skeleton variant="rectangle" width={80} height={40} className="rounded-xl animate-pulse bg-black/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AccountPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const notification = useNotification();


  const { staffRepo: repository } = useDependencies();

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await repository.getAccounts();
      setAccounts(data);
    } catch (error: unknown) {
      notification.error('Không thể tải danh sách tài khoản');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const togglePassword = (email: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const handleUpdatePassword = async (email: string, currentPassword: string) => {
    const newPassword = prompt(`⚠️ ĐỔI MẬT KHẨU:\nBạn đang thực hiện đổi mật khẩu cho tài khoản ${email}.\n\nNhập mật khẩu mới (tối thiểu 6 ký tự):`, currentPassword);
    if (!newPassword || newPassword === currentPassword) return;
    
    if (newPassword.length < 6) {
      notification.error('Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }


    setIsUpdating(email);
    try {
      await repository.updateAccountPassword(email, newPassword);
      notification.success('Đã cập nhật mật khẩu đăng nhập thành công!');
      fetchAccounts();
    } catch (error) {
      notification.error('Lỗi khi cập nhật mật khẩu. Hãy đảm bảo Edge Function đã được deploy.');
    } finally {

      setIsUpdating(null);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.role !== UserRole.ADMIN && (
      acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      acc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return <AccountPageSkeleton />;

  return (
    <div className="space-y-10 md:space-y-14 py-4 md:py-12 px-4 md:px-12 max-w-[1700px] mx-auto h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-black/5 pb-10 relative z-30">
        <div className="text-center lg:text-left">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-kraft-ink uppercase flex items-center gap-6 justify-center lg:justify-start">
             <div className="w-16 h-16 rounded-[2rem] bg-kraft-accent/10 flex items-center justify-center text-kraft-accent border border-kraft-accent/20 shadow-inner">
               <Shield size={38} strokeWidth={2.5} />
             </div>
             Tài khoản
          </h2>
          <p className="text-liquid-label mt-4 opacity-30 flex items-center gap-3 justify-center lg:justify-start">
            <span className="w-2 h-2 rounded-full bg-kraft-accent animate-pulse" />
            Quản lý quyền truy cập và bảo mật hệ thống
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center lg:justify-end">
          <div className="relative group min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-kraft-ink/30 group-focus-within:text-kraft-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="TÌM TÊN, EMAIL HOẶC VAI TRÒ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="liquid-input pl-12 pr-6 h-14 w-full text-[11px] font-black uppercase tracking-widest"
            />
          </div>
          
          <button 
            onClick={fetchAccounts}
            className="w-14 h-14 liquid-button-secondary p-0 flex items-center justify-center shrink-0 rounded-2xl group transition-all"
            title="Làm mới"
            disabled={loading}
          >
            <RefreshCw size={22} className={cn(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative">
        <div className="liquid-card overflow-hidden p-0 border-white/60 shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-kraft-accent/5">
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/50 border-b border-black/5">Người dùng</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/50 border-b border-black/5">Email / Liên kết</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/50 border-b border-black/5">Vai trò</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/50 border-b border-black/5">Mật khẩu</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/50 border-b border-black/5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <AnimatePresence mode="popLayout">
                  {filteredAccounts.map((account, index) => (
                    <motion.tr 
                      key={account.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-white/40 transition-colors"
                    >
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-kraft-accent/5 flex items-center justify-center text-kraft-accent font-black text-xs shadow-sm border border-kraft-accent/10">
                            {account.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-black text-sm text-kraft-ink uppercase tracking-tight">{account.name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-kraft-ink/60 lowercase">
                            <Mail size={12} className="opacity-40" />
                            {account.email}
                          </div>
                          {account.linkedfrom && (
                            <span className="text-liquid-label text-kraft-accent opacity-40">Mã NV: {account.linkedfrom}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="px-3 py-1 bg-kraft-ink/5 border border-black/5 rounded-full text-liquid-label text-kraft-ink/60">
                          {account.role}
                        </span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-kraft-ink/5 px-3 py-2 rounded-lg font-mono text-sm tracking-widest flex justify-between items-center border border-black/5 shadow-inner">
                            <span className="mt-0.5">
                              {showPasswordMap[account.email || ''] ? account.password : '••••••••'}
                            </span>
                          </div>
                          <button 
                            onClick={() => togglePassword(account.email || '')}
                            className="p-2 hover:bg-kraft-accent/10 rounded-lg text-kraft-accent transition-colors"
                          >
                            {showPasswordMap[account.email || ''] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button 
                          onClick={() => handleUpdatePassword(account.email || '', account.password || '')}
                          disabled={isUpdating === account.email}
                          className="h-10 px-4 liquid-button-primary rounded-xl flex items-center gap-2 float-right group"
                        >
                          {isUpdating === account.email ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          ) : <Key size={14} strokeWidth={3} className="group-hover:rotate-45 transition-transform" />}
                          <span className="text-liquid-label !text-white">LƯU</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {!loading && filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <UserCheck size={48} />
                        <p className="text-liquid-label opacity-40">Không tìm thấy tài khoản phù hợp</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
