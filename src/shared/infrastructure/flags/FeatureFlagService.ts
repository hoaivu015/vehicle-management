export interface FeatureFlags {
  enableSandbox: boolean;
  enableAdvancedDashboard: boolean;
  enablePayrollV2: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  enableSandbox: false,
  enableAdvancedDashboard: true,
  enablePayrollV2: false,
};

class FeatureFlagService {
  private flags: FeatureFlags = { ...DEFAULT_FLAGS };

  constructor() {
    this.loadFlags();
  }

  private loadFlags() {
    try {
      const savedFlags = localStorage.getItem('auto28_feature_flags');
      if (savedFlags) {
        this.flags = { ...DEFAULT_FLAGS, ...JSON.parse(savedFlags) };
      }
    } catch (error) {
      console.warn('⚠️ Failed to load feature flags from localStorage:', error);
    }
  }

  public isEnabled(flagName: keyof FeatureFlags): boolean {
    const envOverride = import.meta.env[`VITE_FLAG_${flagName.toUpperCase()}`];
    if (envOverride !== undefined) {
      return envOverride === 'true';
    }
    return this.flags[flagName];
  }

  public setFlag(flagName: keyof FeatureFlags, value: boolean) {
    this.flags[flagName] = value;
    try {
      localStorage.setItem('auto28_feature_flags', JSON.stringify(this.flags));
    } catch (error) {
      console.error('⚠️ Failed to save feature flags:', error);
    }
  }

  public getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }
}

export const featureFlags = new FeatureFlagService();
