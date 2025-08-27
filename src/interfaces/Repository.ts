import { Permission, Role, Guard } from '../types';

export interface PermissionRepository {
  savePermission(permission: Permission): Promise<void>;
  findPermission(name: string, guardName?: string): Promise<Permission | null>;
  findAllPermissions(guardName?: string): Promise<Permission[]>;
  deletePermission(name: string, guardName?: string): Promise<void>;
}

export interface RoleRepository {
  saveRole(role: Role): Promise<void>;
  findRole(name: string, guardName?: string): Promise<Role | null>;
  findAllRoles(guardName?: string): Promise<Role[]>;
  deleteRole(name: string, guardName?: string): Promise<void>;
}

export interface GuardRepository {
  saveGuard(guard: Guard): Promise<void>;
  findGuard(name: string): Promise<Guard | null>;
  findAllGuards(): Promise<Guard[]>;
  deleteGuard(name: string): Promise<void>;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface EventDispatcher {
  dispatch(event: string, data: any): Promise<void>;
  subscribe(event: string, handler: (data: any) => void): void;
  unsubscribe(event: string, handler: (data: any) => void): void;
}
