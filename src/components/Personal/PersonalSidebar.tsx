import React from 'react';
import { User, Mail, Phone, Calendar, Briefcase, Settings, Key, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { InfoItem } from './PersonalShared';
import { formatDate } from '@/src/utils/date';

interface PersonalSidebarProps {
  user: any;
  onLogout?: () => void;
  setIsEditModalOpen: (val: boolean) => void;
  onUpdateUser?: (email: string, data: any) => void;
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
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
          
          <div>
            <h2 className="text-3xl font-black text-kraft-ink tracking-tighter mb-2">{user.name}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-kraft-accent px-3 py-1 bg-kraft-accent/10 rounded-full">{user.role}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">#{user.code}</span>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-6">
          <InfoItem icon={Mail} label="Email liên hệ" value={user.email} />
          <InfoItem icon={Phone} label="Số điện thoại" value={user.phone || 'Chưa cập nhật'} />
          <InfoItem icon={Calendar} label="Ngày gia nhập" value={formatDate(user.join_date || user.createdAt)} />
          <InfoItem icon={Briefcase} label="Phòng ban" value={user.department || 'Phòng Kinh doanh'} />
          
          <div className="pt-6 space-y-4">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full h-14 liquid-button-secondary flex items-center justify-center gap-3 group rounded-t3"
            >
              <Settings size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
              Chỉnh sửa hồ sơ
            </button>

            {onUpdateUser && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full h-14 liquid-button-primary flex items-center justify-center gap-3 group rounded-t3"
              >
                <Key size={14} strokeWidth={3} className="group-hover:rotate-[30deg] transition-transform" />
                Bảo mật tài khoản
              </button>
            )}

            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 py-5 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 rounded-t3 font-black uppercase tracking-widest text-[10px] transition-all duration-500 border border-red-500/10 group shadow-sm hover:shadow-red-500/20"
              >
                <LogOut size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                Rời khỏi hệ thống
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
