import React from 'react';
import { User, Mail, Phone, Calendar, Briefcase, Settings, Key, LogOut, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { InfoItem } from './PersonalShared';
import { formatDate } from '@/src/shared/utils/date';
import { Staff } from '@/src/shared/domain/types';
import { PillButton } from '@/src/shared/design-system/Buttons';
import { haptics } from '@/src/shared/utils/haptics';

interface PersonalSidebarProps {
  user: Staff;
  onLogout?: () => void;
  setIsEditModalOpen: (val: boolean) => void;
  onUpdateUser?: (email: string, data: Partial<Staff> & { password?: string }) => void;
  setIsModalOpen: (val: boolean) => void;
}

export const PersonalSidebar: React.FC<PersonalSidebarProps> = ({
  user,
  onLogout,
  setIsEditModalOpen,
  onUpdateUser,
  setIsModalOpen
}) => {
  const handleEditClick = () => {
    haptics.light();
    setIsEditModalOpen(true);
  };

  const handlePasswordClick = () => {
    haptics.light();
    setIsModalOpen(true);
  };

  const handleLogoutClick = () => {
    haptics.heavy();
    if (onLogout) onLogout();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.15 }}
      style={{ willChange: 'transform, opacity' }}
      className="h-full flex flex-col"
    >
      <div className="liquid-card border-hairline-soft p-0 overflow-hidden shadow-kraft-deep rounded-t2 flex flex-col justify-between h-full">
        {/* Profile Header Hero */}
        <div className="bg-gradient-to-b from-kraft-accent/10 via-kraft-accent/5 to-transparent p-6 sm:p-8 flex flex-col items-center text-center space-y-4 border-b border-hairline-soft relative">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-kraft-accent to-indigo-400 rounded-[2.5rem] blur-md opacity-20 group-hover:opacity-40 transition duration-700" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-t2 bg-white flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              {user.name ? (
                <span className="text-3xl sm:text-4xl font-black text-kraft-accent select-none">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={48} className="text-kraft-accent" strokeWidth={1.5} />
              )}
            </div>
          </div>
          
          <div className="w-full space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-kraft-ink tracking-tight font-heading truncate">
              {user.name}
            </h2>
            <div className="flex items-center justify-center flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-kraft-accent px-3 py-1 bg-kraft-accent/10 border border-kraft-accent/20 rounded-full shadow-sm">
                <Shield size={10} />
                {user.role}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-sub-label px-2.5 py-0.5 bg-black/5 rounded-full">
                #{user.code}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info List */}
        <div className="p-6 sm:p-8 space-y-5 flex-1">
          <InfoItem icon={Mail} label="Email liên hệ" value={user.email} />
          <InfoItem icon={Phone} label="Số điện thoại" value={user.phone || '---'} />
          <InfoItem icon={Calendar} label="Ngày gia nhập" value={formatDate(user.created_at || '')} />
          <InfoItem icon={Briefcase} label="Phòng ban" value={user.department || 'Phòng Kinh doanh'} />
        </div>

        {/* Action Buttons Dock */}
        <div className="p-6 sm:p-8 pt-0 space-y-3 border-t border-hairline-soft bg-black/[0.01]">
          <div className="grid grid-cols-2 gap-3">
            <PillButton
              variant="secondary"
              size="sm"
              icon={Settings}
              onClick={handleEditClick}
              fullWidth
              className="text-[9px]"
            >
              Hồ sơ
            </PillButton>
            {onUpdateUser && (
              <PillButton
                variant="secondary"
                size="sm"
                icon={Key}
                onClick={handlePasswordClick}
                fullWidth
                className="text-[9px]"
              >
                Mật khẩu
              </PillButton>
            )}
          </div>
          {onLogout && (
            <PillButton
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleLogoutClick}
              fullWidth
              className="text-[9px] !border-red-200 !text-red-500 hover:!bg-red-50 hover:!border-red-300"
            >
              Đăng xuất
            </PillButton>
          )}
        </div>
      </div>
    </motion.div>
  );
};
