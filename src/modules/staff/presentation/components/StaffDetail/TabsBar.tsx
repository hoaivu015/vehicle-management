import React from 'react';
import { cn } from '@/src/utils/cn';
import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
}

interface TabsBarProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: any) => void;
}

export const TabsBar: React.FC<TabsBarProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="ctab-bar px-8">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={cn(
            "ctab",
            activeTab === tab.id && "ctab-active"
          )}
        >
          <tab.icon size={14} className={cn("transition-all", activeTab === tab.id ? "text-kraft-accent scale-110" : "opacity-40")} />
          <span className={cn(
            "text-[10px] uppercase tracking-[0.2em] transition-all",
            activeTab === tab.id ? "text-kraft-ink font-black" : "text-kraft-ink/30 font-bold"
          )}>
            {tab.label}
          </span>
          <span className={cn(
            "ml-2 px-2 py-0.5 rounded-full text-[8px] font-black",
            activeTab === tab.id ? "bg-kraft-accent/10 text-kraft-accent" : "bg-black/5 text-kraft-ink/20"
          )}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};
