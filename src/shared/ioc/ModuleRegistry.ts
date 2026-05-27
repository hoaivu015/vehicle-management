/**
 * ModuleRegistry
 * 
 * A registry for application modules to register their dependencies
 * without bloating a single central file.
 */
export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private registries: Map<string, Record<string, unknown>> = new Map();

  private constructor() {}

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * Register a module's dependencies
   */
  public register(moduleName: string, dependencies: Record<string, unknown>): void {
    this.registries.set(moduleName, {
      ...this.registries.get(moduleName),
      ...dependencies
    });
  }

  /**
   * Get all registered dependencies
   */
  public getDependencies(): Record<string, unknown> {
    const deps: Record<string, unknown> = {};
    this.registries.forEach((value, key) => {
      deps[key] = value;
    });
    return deps;
  }
}

/**
 * Helper to register a module
 */
export const registerModule = (name: string, deps: Record<string, unknown>) => {
  ModuleRegistry.getInstance().register(name, deps);
};
