import { Permission as IPermission, HasPermissions } from '../types';
import { Permission } from '../models/Permission';

export class HasPermissionsTrait implements HasPermissions {
  protected permissions: Permission[] = [];
  protected roles: any[] = [];

  public hasPermission(permission: string | IPermission, guardName: string = 'web'): boolean {
    const permissionName = typeof permission === 'string' ? permission : permission.name;
    
    // Check direct permissions
    if (this.permissions.some(p => p.name === permissionName && p.guardName === guardName)) {
      return true;
    }

    // Check permissions through roles
    return this.roles.some(role => 
      role.permissions?.some((p: IPermission) => 
        p.name === permissionName && p.guardName === guardName
      )
    );
  }

  public hasAnyPermission(permissions: (string | IPermission)[], guardName: string = 'web'): boolean {
    return permissions.some(permission => this.hasPermission(permission, guardName));
  }

  public hasAllPermissions(permissions: (string | IPermission)[], guardName: string = 'web'): boolean {
    return permissions.every(permission => this.hasPermission(permission, guardName));
  }

  public givePermissionTo(permission: string | IPermission, guardName: string = 'web'): void {
    const perm = typeof permission === 'string' 
      ? new Permission({ name: permission, guardName })
      : new Permission(permission);
    
    if (!this.hasPermission(perm, guardName)) {
      this.permissions.push(perm);
    }
  }

  public revokePermissionTo(permission: string | IPermission, guardName: string = 'web'): void {
    const permissionName = typeof permission === 'string' ? permission : permission.name;
    this.permissions = this.permissions.filter(p => 
      !(p.name === permissionName && p.guardName === guardName)
    );
  }

  public syncPermissions(permissions: (string | IPermission)[], guardName: string = 'web'): void {
    this.permissions = this.permissions.filter(p => p.guardName !== guardName);
    
    permissions.forEach(permission => {
      this.givePermissionTo(permission, guardName);
    });
  }

  public getDirectPermissions(guardName: string = 'web'): Permission[] {
    return this.permissions.filter(p => p.guardName === guardName);
  }

  public getAllPermissions(guardName: string = 'web'): Permission[] {
    const directPermissions = this.getDirectPermissions(guardName);
    const rolePermissions = this.roles.flatMap(role => 
      role.permissions?.filter((p: IPermission) => p.guardName === guardName) || []
    );

    const allPermissions = [...directPermissions, ...rolePermissions];
    const uniquePermissions = new Map<string, Permission>();
    
    allPermissions.forEach(permission => {
      uniquePermissions.set(permission.name, permission);
    });

    return Array.from(uniquePermissions.values());
  }
}
