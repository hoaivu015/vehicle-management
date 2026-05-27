import React from 'react';
import { User, Mail, Phone, Calendar, Briefcase, MoreHorizontal, Settings, Key, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { InfoItem } from './PersonalShared';
import { formatDate } from '@/src/shared/utils/date';

import { Staff } from '@/src/shared/domain/types';

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
  return (
    <motion.div 
      initial={{ opacity: 0, x: -30, rotate: -1, filter: 'blur(6px)' }}
      animate={{ opacity: 1, x: 0, rotate: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.15 }}
      style={{ willChange: 'transform, opacity' }}
      className="lg:col-span-1"
    >
      <div className="liquid-card border-white/60 p-0 overflow-hidden shadow-[var(--shadow-kraft-deep)] transition-all duration-500 hover:shadow-kraft-accent/5 rounded-t1">
        <div className="bg-kraft-accent/5 p-10 flex flex-col items-center text-center space-y-6 border-b border-black/5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-kraft-accent to-indigo-400 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative w-32 h-32 rounded-[2.5rem] bg-white flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
              <User size={64} className="text-kraft-accent" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="relative w-full">
            <h2 className="text-3xl font-black text-kraft-ink tracking-tighter mb-2 flex items-center justify-center gap-3">
              {user.name}
              <div className="relative group/menu">
                <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <MoreHorizontal size={20} className="text-kraft-ink/40" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-black/5 py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-50 overflow-hidden">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full px-6 py-4 flex items-center gap-3 hover:bg-kraft-accent/5 transition-colors text-left"
                  >
                    <Settings size={14} strokeWidth={3} className="text-kraft-accent" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-kraft-ink">Chỉnh sửa hồ sơ</span>
                  </button>
                  {onUpdateUser && (
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full px-6 py-4 flex items-center gap-3 hover:bg-kraft-accent/5 transition-colors text-left border-t border-black/5"
                    >
                      <Key size={14} strokeWidth={3} className="text-indigo-500" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-kraft-ink">Bảo mật</span>
                    </button>
                  )}
                  {onLogout && (
                    <button 
                      onClick={onLogout}
                      className="w-full px-6 py-4 flex items-center gap-3 hover:bg-red-50 transition-colors text-left border-t border-black/5 group/logout"
                    >
                      <LogOut size={14} strokeWidth={3} className="text-red-500 group-hover/logout:translate-x-1 transition-transform" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-red-500">Đăng xuất</span>
                    </button>
                  )}
                </div>
              </div>
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-kraft-accent px-3 py-1 bg-kraft-accent/10 rounded-full">{user.role}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">#{user.code}</span>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-6">
          <InfoItem icon={Mail} label="Email liên hệ" value={user.email} />
          <InfoItem icon={Phone} label="Số điện thoại" value={user.phone || '---'} />
          <InfoItem icon={Calendar} label="Ngày gia nhập" value={formatDate(user.created_at || '')} />
          <InfoItem icon={Briefcase} label="Phòng ban" value={user.department || 'Phòng Kinh doanh'} />
          
        </div>
      </div>
    </motion.div>
  );
};
