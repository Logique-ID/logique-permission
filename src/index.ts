// Main exports
export { PermissionManager } from './PermissionManager';
export { Permission } from './models/Permission';
export { Role } from './models/Role';
export { Guard } from './guards/Guard';

// Traits
export { HasPermissionsTrait } from './traits/HasPermissions';
export { HasRolesTrait } from './traits/HasRoles';

// Exceptions
export { 
  PermissionException, 
  RoleNotFoundException, 
  PermissionNotFoundException, 
  GuardNotFoundException 
} from './exceptions/PermissionException';

// Types
export * from './types';

// Dependency Injection
export { Container, ServiceProvider } from './container/Container';
export { PermissionServiceProvider } from './providers/PermissionServiceProvider';
export * from './interfaces/Repository';

// Default instance
import { PermissionManager } from './PermissionManager';

// Create a default instance
export const permissionManager = new PermissionManager();

// Helper functions
export const createPermission = (name: string, guardName?: string) => 
  permissionManager.createPermission(name, guardName);

export const createRole = (name: string, guardName?: string) => 
  permissionManager.createRole(name, guardName);

export const checkPermission = (user: any, permission: string | any, guardName?: string) => 
  permissionManager.checkPermission(user, permission, guardName);

export const checkRole = (user: any, role: string | any, guardName?: string) => 
  permissionManager.checkRole(user, role, guardName);
