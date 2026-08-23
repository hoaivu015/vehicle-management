/**
 * Tab Preloader Utility (Auto 28 Showroom Manager)
 * Preloads tab JS chunks in idle time or on user touch/hover intent
 * to ensure 0ms instantaneous tab switching.
 */

type TabKey = 'dashboard' | 'inventory' | 'staff' | 'cashflow' | 'personal' | 'users' | 'permissions';

const tabLoaders: Record<string, () => Promise<unknown>> = {
  dashboard: () => import('@/src/modules/dashboard/presentation/DashboardPage'),
  inventory: () => import('@/src/modules/inventory/presentation/InventoryPage'),
  staff: () => import('@/src/modules/staff/presentation/StaffPage'),
  cashflow: () => import('@/src/modules/finance/presentation/CashflowPage'),
  personal: () => import('@/src/modules/personal/presentation/PersonalView'),
  users: () => import('@/src/modules/staff/presentation/AccountPage'),
  permissions: () => import('@/src/modules/auth/presentation/PermissionsPage'),
};

const preloadedSet = new Set<string>();

/**
 * Preload a specific tab chunk immediately (on hover / touchstart)
 */
export const preloadTab = (tab: string) => {
  if (typeof window === 'undefined') return;
  const key = tab === '' ? 'dashboard' : tab;
  if (preloadedSet.has(key)) return;
  
  const loader = tabLoaders[key];
  if (loader) {
    preloadedSet.add(key);
    loader().catch((err) => {
      console.debug(`[TabPreloader] Preload failed for tab: ${key}`, err);
    });
  }
};

/**
 * Automatically preload all core tabs during idle time after app startup
 */
export const initIdleTabPreloader = () => {
  if (typeof window === 'undefined') return;

  const runIdle = () => {
    const coreTabs: TabKey[] = ['inventory', 'dashboard', 'cashflow', 'staff', 'personal'];
    coreTabs.forEach((tab, index) => {
      setTimeout(() => {
        preloadTab(tab);
      }, (index + 1) * 300);
    });
  };

  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
      .requestIdleCallback(runIdle, { timeout: 2000 });
  } else {
    setTimeout(runIdle, 1000);
  }
};
