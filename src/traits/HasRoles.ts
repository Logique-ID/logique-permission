import { Role as IRole, HasRoles } from '../types';
import { Role } from '../models/Role';

export class HasRolesTrait implements HasRoles {
  protected roles: Role[] = [];

  public hasRole(role: string | IRole, guardName: string = 'web'): boolean {
    const roleName = typeof role === 'string' ? role : role.name;
    return this.roles.some(r => r.name === roleName && r.guardName === guardName);
  }

  public hasAnyRole(roles: (string | IRole)[], guardName: string = 'web'): boolean {
    return roles.some(role => this.hasRole(role, guardName));
  }

  public hasAllRoles(roles: (string | IRole)[], guardName: string = 'web'): boolean {
    return roles.every(role => this.hasRole(role, guardName));
  }

  public assignRole(role: string | IRole, guardName: string = 'web'): void {
    const roleInstance = typeof role === 'string' 
      ? new Role({ name: role, guardName })
      : new Role(role);
    
    if (!this.hasRole(roleInstance, guardName)) {
      this.roles.push(roleInstance);
    }
  }

  public removeRole(role: string | IRole, guardName: string = 'web'): void {
    const roleName = typeof role === 'string' ? role : role.name;
    this.roles = this.roles.filter(r => 
      !(r.name === roleName && r.guardName === guardName)
    );
  }

  public syncRoles(roles: (string | IRole)[], guardName: string = 'web'): void {
    this.roles = this.roles.filter(r => r.guardName !== guardName);
    
    roles.forEach(role => {
      this.assignRole(role, guardName);
    });
  }

  public getRoles(guardName: string = 'web'): Role[] {
    return this.roles.filter(r => r.guardName === guardName);
  }

  public getAllRoles(): Role[] {
    return this.roles;
  }
}
