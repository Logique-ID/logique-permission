export interface Permission {
  id: string;
  name: string;
  guardName?: string;
  description?: string | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export interface Role {
  id: string;
  name: string;
  guardName?: string;
  description?: string | undefined;
  permissions?: Permission[];
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles?: Role[];
  permissions?: Permission[];
  [key: string]: any;
}

export interface Guard {
  name: string;
  permissions: Permission[];
  roles: Role[];
}

export interface PermissionManagerConfig {
  cacheEnabled?: boolean;
  cacheTtl?: number;
  defaultGuard?: string;
}

export interface HasPermissions {
  hasPermission(permission: string | Permission, guardName?: string): boolean;
  hasAnyPermission(permissions: (string | Permission)[], guardName?: string): boolean;
  hasAllPermissions(permissions: (string | Permission)[], guardName?: string): boolean;
}

export interface HasRoles {
  hasRole(role: string | Role, guardName?: string): boolean;
  hasAnyRole(roles: (string | Role)[], guardName?: string): boolean;
  hasAllRoles(roles: (string | Role)[], guardName?: string): boolean;
}

export interface PermissionUser extends User, HasPermissions, HasRoles {}

export type PermissionCheck = (user: PermissionUser, permission: string, guardName?: string) => boolean;
export type RoleCheck = (user: PermissionUser, role: string, guardName?: string) => boolean;
