import { ServiceProvider, Container } from '../container/Container';
import { PermissionManager } from '../PermissionManager';
import { 
  PermissionRepository, 
  RoleRepository, 
  GuardRepository, 
  CacheService, 
  EventDispatcher 
} from '../interfaces/Repository';

export class PermissionServiceProvider implements ServiceProvider {
  register(container: Container): void {
    // Register PermissionManager as singleton
    container.singleton('permission.manager', () => {
      const config = container.resolve('permission.config') as any;
      const permissionRepo = container.resolve('permission.repository');
      const roleRepo = container.resolve('role.repository');
      const guardRepo = container.resolve('guard.repository');
      const cache = container.resolve('cache.service');
      const events = container.resolve('event.dispatcher');

      return new PermissionManager(config, {
        permissionRepository: permissionRepo as any,
        roleRepository: roleRepo as any,
        guardRepository: guardRepo as any,
        cacheService: cache as any,
        eventDispatcher: events as any
      });
    });

    // Register default config
    container.singleton('permission.config', () => ({
      defaultGuard: 'web',
      cacheEnabled: true,
      cacheTtl: 3600
    }));

    // Register default repositories (in-memory)
    container.singleton('permission.repository', () => new InMemoryPermissionRepository());
    container.singleton('role.repository', () => new InMemoryRoleRepository());
    container.singleton('guard.repository', () => new InMemoryGuardRepository());

    // Register default cache service (in-memory)
    container.singleton('cache.service', () => new InMemoryCacheService());

    // Register default event dispatcher (in-memory)
    container.singleton('event.dispatcher', () => new InMemoryEventDispatcher());
  }

  async boot(_container: Container): Promise<void> {
    // Initialize any boot-time logic here
    console.log('Permission system initialized');
  }
}

// In-Memory implementations
class InMemoryPermissionRepository implements PermissionRepository {
  private permissions: Map<string, any> = new Map();

  async savePermission(permission: any): Promise<void> {
    const key = `${permission.guardName}:${permission.name}`;
    this.permissions.set(key, permission);
  }

  async findPermission(name: string, guardName: string = 'web'): Promise<any | null> {
    const key = `${guardName}:${name}`;
    return this.permissions.get(key) || null;
  }

  async findAllPermissions(guardName: string = 'web'): Promise<any[]> {
    return Array.from(this.permissions.values())
      .filter(p => p.guardName === guardName);
  }

  async deletePermission(name: string, guardName: string = 'web'): Promise<void> {
    const key = `${guardName}:${name}`;
    this.permissions.delete(key);
  }
}

class InMemoryRoleRepository implements RoleRepository {
  private roles: Map<string, any> = new Map();

  async saveRole(role: any): Promise<void> {
    const key = `${role.guardName}:${role.name}`;
    this.roles.set(key, role);
  }

  async findRole(name: string, guardName: string = 'web'): Promise<any | null> {
    const key = `${guardName}:${name}`;
    return this.roles.get(key) || null;
  }

  async findAllRoles(guardName: string = 'web'): Promise<any[]> {
    return Array.from(this.roles.values())
      .filter(r => r.guardName === guardName);
  }

  async deleteRole(name: string, guardName: string = 'web'): Promise<void> {
    const key = `${guardName}:${name}`;
    this.roles.delete(key);
  }
}

class InMemoryGuardRepository implements GuardRepository {
  private guards: Map<string, any> = new Map();

  async saveGuard(guard: any): Promise<void> {
    this.guards.set(guard.name, guard);
  }

  async findGuard(name: string): Promise<any | null> {
    return this.guards.get(name) || null;
  }

  async findAllGuards(): Promise<any[]> {
    return Array.from(this.guards.values());
  }

  async deleteGuard(name: string): Promise<void> {
    this.guards.delete(name);
  }
}

class InMemoryCacheService implements CacheService {
  private cache: Map<string, { value: any; ttl: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    this.cache.set(key, {
      value,
      ttl: Date.now() + (ttl * 1000)
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

class InMemoryEventDispatcher implements EventDispatcher {
  private handlers: Map<string, ((data: any) => void)[]> = new Map();

  async dispatch(event: string, data: any): Promise<void> {
    const handlers = this.handlers.get(event) || [];
    for (const handler of handlers) {
      handler(data);
    }
  }

  subscribe(event: string, handler: (data: any) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  unsubscribe(event: string, handler: (data: any) => void): void {
    const handlers = this.handlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
}
