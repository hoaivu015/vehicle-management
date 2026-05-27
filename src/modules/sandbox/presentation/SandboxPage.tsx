import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sliders, Zap, Palette, Activity } from 'lucide-react';
import { haptics } from '../../../shared/utils/haptics';

// Import New Showcase Tabs
import { AtomicShowroom } from './components/AtomicShowroom';
import { DomainGallery } from './components/DomainGallery';
import { HapticPhysicsLab } from './components/HapticPhysicsLab';
import { ThemeSpec } from './components/ThemeSpec';

type ShowcaseTab = 'atomic' | 'domain' | 'haptic-lab' | 'theme-spec';

export const SandboxPage = () => {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('atomic');

  const tabsConfig = [
    { id: 'atomic' as ShowcaseTab, label: 'Atomic Showroom', icon: Sparkles, color: 'text-amber-500' },
    { id: 'domain' as ShowcaseTab, label: 'Domain Gallery', icon: Sliders, color: 'text-blue-500' },
    { id: 'haptic-lab' as ShowcaseTab, label: 'Haptic & Physics Lab', icon: Zap, color: 'text-purple-500' },
    { id: 'theme-spec' as ShowcaseTab, label: 'Theme & Typography', icon: Palette, color: 'text-emerald-500' },
  ];

  const handleTabChange = (tabId: ShowcaseTab) => {
    haptics.light();
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 pt-8 space-y-8 max-w-7xl mx-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 🔮 Showroom Header */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            <h1 className="text-2xl md:text-3xl font-black text-kraft-ink uppercase tracking-tight">
              Auto 28 UI Showroom
            </h1>
          </div>
          <p className="text-xs font-bold text-kraft-ink/40 uppercase tracking-[0.2em] italic">
            Mô-đun Quản lý và Trưng bày Giao diện Cao cấp
          </p>
        </div>

        <div className="bg-white/70 border border-white/80 py-2.5 px-5 rounded-2xl flex items-center gap-2 shadow-sm">
          <Activity size={14} className="text-amber-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/50">
            Haptic Engine: Active (Fail-safe Web/Native)
          </span>
        </div>
      </div>

      {/* 📑 Tab Navigation: Liquid Glassmorphism */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-2 rounded-[2rem] shadow-lg flex flex-wrap gap-1.5">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex-1 min-w-[150px] py-3.5 px-5 rounded-[1.5rem] text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] z-10`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeShowroomTab"
                  className="absolute inset-0 bg-white/75 backdrop-blur-md rounded-[1.5rem] shadow-[inset_1px_1px_0_rgba(255,255,255,0.6),0_8px_16px_-8px_rgba(99,102,241,0.2)] border border-white/90 -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={16} className={isActive ? tab.color : 'text-kraft-ink/40'} />
              <span className={isActive ? 'text-kraft-ink' : 'text-kraft-ink/50'}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 🎭 Tab Content Stage */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {activeTab === 'atomic' && <AtomicShowroom />}
            {activeTab === 'domain' && <DomainGallery />}
            {activeTab === 'haptic-lab' && <HapticPhysicsLab />}
            {activeTab === 'theme-spec' && <ThemeSpec />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 🏷️ Lab Footer */}
      <div className="text-center pt-8 border-t border-black/[0.03]">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-kraft-ink/20 italic">
          LIQUID PROFESSIONAL STANDARD V4 • CAPACITOR HAPTICS v6.0.0 • DESIGN SYSTEM SPEC v3.0.7
        </p>
      </div>
    </div>
  );
};
