import { 
  PermissionManagerConfig, 
  Permission as IPermission, 
  Role as IRole, 
  PermissionUser,
  PermissionCheck,
  RoleCheck
} from './types';
import { Permission } from './models/Permission';
import { Role } from './models/Role';
import { Guard } from './guards/Guard';
import { GuardNotFoundException, PermissionNotFoundException, RoleNotFoundException } from './exceptions/PermissionException';
import { 
  PermissionRepository, 
  RoleRepository, 
  GuardRepository, 
  CacheService, 
  EventDispatcher 
} from './interfaces/Repository';

interface PermissionManagerDependencies {
  permissionRepository?: PermissionRepository;
  roleRepository?: RoleRepository;
  guardRepository?: GuardRepository;
  cacheService?: CacheService;
  eventDispatcher?: EventDispatcher;
}

export class PermissionManager {
  private guards: Map<string, Guard> = new Map();
  private config: PermissionManagerConfig;
  private customPermissionChecks: Map<string, PermissionCheck> = new Map();
  private customRoleChecks: Map<string, RoleCheck> = new Map();
  
  // Dependencies
  private permissionRepository?: PermissionRepository | undefined;
  private roleRepository?: RoleRepository | undefined;
  private guardRepository?: GuardRepository | undefined;
  private cacheService?: CacheService | undefined;
  private eventDispatcher?: EventDispatcher | undefined;

  constructor(
    config: PermissionManagerConfig = {}, 
    dependencies: PermissionManagerDependencies = {}
  ) {
    this.config = {
      cacheEnabled: false,
      cacheTtl: 3600,
      defaultGuard: 'web',
      ...config
    };

    // Inject dependencies
    this.permissionRepository = dependencies.permissionRepository;
    this.roleRepository = dependencies.roleRepository;
    this.guardRepository = dependencies.guardRepository;
    this.cacheService = dependencies.cacheService;
    this.eventDispatcher = dependencies.eventDispatcher;

    // Initialize default guard
    this.createGuard(this.config.defaultGuard!);
  }

  public createGuard(name: string): Guard {
    const guard = new Guard(name);
    this.guards.set(name, guard);
    return guard;
  }

  public getGuard(name: string): Guard {
    const guard = this.guards.get(name);
    if (!guard) {
      throw new GuardNotFoundException(name);
    }
    return guard;
  }

  public getDefaultGuard(): Guard {
    return this.getGuard(this.config.defaultGuard!);
  }

  public createPermission(name: string, guardName?: string): Permission {
    const guard = this.getGuard(guardName || this.config.defaultGuard!);
    const permission = new Permission({ name, guardName: guard.name });
    guard.addPermission(permission);
    return permission;
  }

  public createRole(name: string, guardName?: string): Role {
    const guard = this.getGuard(guardName || this.config.defaultGuard!);
    const role = new Role({ name, guardName: guard.name });
    guard.addRole(role);
    return role;
  }

  public getPermission(name: string, guardName?: string): Permission {
    const guard = this.getGuard(guardName || this.config.defaultGuard!);
    const permission = guard.getPermission(name);
    if (!permission) {
      throw new PermissionNotFoundException(name);
    }
    return permission;
  }

  public getRole(name: string, guardName?: string): Role {
    const guard = this.getGuard(guardName || this.config.defaultGuard!);
    const role = guard.getRole(name);
    if (!role) {
      throw new RoleNotFoundException(name);
    }
    return role;
  }

  public getAllPermissions(guardName?: string): Permission[] {
    const guard = this.getGuard(guardName || this.config.defaultGuard!);
    return guard.permissions;
  }

  public getAllRoles(guardName?: string): Role[] {
    const guard = this.getGuard(guardName || this.config.defaultGuard!);
    return guard.roles;
  }

  public registerPermissionCheck(name: string, check: PermissionCheck): void {
    this.customPermissionChecks.set(name, check);
  }

  public registerRoleCheck(name: string, check: RoleCheck): void {
    this.customRoleChecks.set(name, check);
  }

  public checkPermission(user: PermissionUser, permission: string | IPermission, guardName?: string): boolean {
    const guard = guardName || this.config.defaultGuard!;
    
    // Check custom permission checks first
    const customCheck = this.customPermissionChecks.get(guard);
    if (customCheck) {
      return customCheck(user, typeof permission === 'string' ? permission : permission.name, guard);
    }

    // Use default permission checking
    return user.hasPermission(permission, guard);
  }

  public checkRole(user: PermissionUser, role: string | IRole, guardName?: string): boolean {
    const guard = guardName || this.config.defaultGuard!;
    
    // Check custom role checks first
    const customCheck = this.customRoleChecks.get(guard);
    if (customCheck) {
      return customCheck(user, typeof role === 'string' ? role : role.name, guard);
    }

    // Use default role checking
    return user.hasRole(role, guard);
  }

  public forUser(user: PermissionUser): PermissionUser {
    return user;
  }

  public forGuard(guardName: string): PermissionManager {
    const manager = new PermissionManager(this.config);
    manager.guards = new Map(this.guards);
    manager.config.defaultGuard = guardName;
    return manager;
  }

  public clearCache(): void {
    // Implementation for cache clearing if cache is enabled
    if (this.config.cacheEnabled && this.cacheService) {
      this.cacheService.clear();
    }
  }

  // Method to use dependencies
  public async savePermissionToRepository(permission: Permission): Promise<void> {
    if (this.permissionRepository) {
      await this.permissionRepository.savePermission(permission);
    }
  }

  public async saveRoleToRepository(role: Role): Promise<void> {
    if (this.roleRepository) {
      await this.roleRepository.saveRole(role);
    }
  }

  public async saveGuardToRepository(guard: Guard): Promise<void> {
    if (this.guardRepository) {
      await this.guardRepository.saveGuard(guard);
    }
  }

  public async dispatchEvent(event: string, data: any): Promise<void> {
    if (this.eventDispatcher) {
      await this.eventDispatcher.dispatch(event, data);
    }
  }

  public toJSON(): any {
    return {
      config: this.config,
      guards: Array.from(this.guards.entries()).map(([name, guard]) => ({
        name,
        guard: guard.toJSON()
      }))
    };
  }
}
