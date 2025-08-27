export interface ServiceProvider {
  register(container: Container): void;
  boot?(container: Container): Promise<void>;
}

export class Container {
  private services: Map<string, any> = new Map();
  private singletons: Map<string, any> = new Map();
  private providers: ServiceProvider[] = [];

  // Register a service
  bind<T>(abstract: string, concrete: T | (() => T)): void {
    this.services.set(abstract, concrete);
  }

  // Register a singleton
  singleton<T>(abstract: string, concrete: T | (() => T)): void {
    this.singletons.set(abstract, concrete);
  }

  // Resolve a service
  resolve<T>(abstract: string): T {
    // Check if it's a singleton
    if (this.singletons.has(abstract)) {
      const concrete = this.singletons.get(abstract);
      if (typeof concrete === 'function') {
        const instance = concrete();
        this.singletons.set(abstract, instance);
        return instance;
      }
      return concrete;
    }

    // Check if it's a regular service
    if (this.services.has(abstract)) {
      const concrete = this.services.get(abstract);
      if (typeof concrete === 'function') {
        return concrete();
      }
      return concrete;
    }

    throw new Error(`Service "${abstract}" not found`);
  }

  // Check if service exists
  has(abstract: string): boolean {
    return this.services.has(abstract) || this.singletons.has(abstract);
  }

  // Register service providers
  register(provider: ServiceProvider): void {
    this.providers.push(provider);
    provider.register(this);
  }

  // Boot all providers
  async boot(): Promise<void> {
    for (const provider of this.providers) {
      if (provider.boot) {
        await provider.boot(this);
      }
    }
  }

  // Clear all services
  clear(): void {
    this.services.clear();
    this.singletons.clear();
    this.providers = [];
  }
}
