import { Skeleton } from '@/src/shared/design-system/Skeleton';

export const SandboxSkeletons = () => (
  <section className="section-card mt-8">
    <h2 className="text-xl font-black text-kraft-ink mb-8 flex items-center gap-2"><div className="w-2 h-6 bg-kraft-accent rounded-full" />Liquid Skeleton Screens</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Staff Card Skeleton</h3>
        <div className="bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border border-white/60 shadow-sm space-y-6">
          <div className="flex items-center gap-4"><Skeleton variant="circle" width={64} height={64} /><div className="space-y-2 flex-1"><Skeleton variant="text" width="60%" height={20} /><Skeleton variant="text" width="40%" height={14} /></div></div>
          <div className="grid grid-cols-2 gap-4"><Skeleton height={80} className="rounded-3xl" /><Skeleton height={80} className="rounded-3xl" /></div>
          <Skeleton height={56} className="rounded-full" />
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40 ml-4">Vehicle Row Skeleton</h3>
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-[3rem] border border-white/60 shadow-sm space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-2 border-b border-black/5 last:border-0">
              <Skeleton width={80} height={60} className="rounded-xl shrink-0" /><div className="flex-1 space-y-2"><div className="flex justify-between"><Skeleton variant="text" width="50%" height={16} /><Skeleton variant="text" width="20%" height={16} /></div><Skeleton variant="text" width="30%" height={12} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
