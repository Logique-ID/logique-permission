import { Guard as IGuard, Permission as IPermission, Role as IRole } from '../types';
import { Permission } from '../models/Permission';
import { Role } from '../models/Role';

export class Guard implements IGuard {
  public name: string;
  public permissions: Permission[];
  public roles: Role[];

  constructor(name: string) {
    this.name = name;
    this.permissions = [];
    this.roles = [];
  }

  public addPermission(permission: Permission | IPermission): void {
    const perm = permission instanceof Permission ? permission : new Permission(permission);
    if (!this.hasPermission(perm)) {
      this.permissions.push(perm);
    }
  }

  public removePermission(permission: Permission | IPermission): void {
    const perm = permission instanceof Permission ? permission : new Permission(permission);
    this.permissions = this.permissions.filter(p => !p.equals(perm));
  }

  public hasPermission(permission: Permission | IPermission): boolean {
    const perm = permission instanceof Permission ? permission : new Permission(permission);
    return this.permissions.some(p => p.equals(perm));
  }

  public getPermission(name: string): Permission | undefined {
    return this.permissions.find(p => p.name === name);
  }

  public addRole(role: Role | IRole): void {
    const roleInstance = role instanceof Role ? role : new Role(role);
    if (!this.hasRole(roleInstance)) {
      this.roles.push(roleInstance);
    }
  }

  public removeRole(role: Role | IRole): void {
    const roleInstance = role instanceof Role ? role : new Role(role);
    this.roles = this.roles.filter(r => !r.equals(roleInstance));
  }

  public hasRole(role: Role | IRole): boolean {
    const roleInstance = role instanceof Role ? role : new Role(role);
    return this.roles.some(r => r.equals(roleInstance));
  }

  public getRole(name: string): Role | undefined {
    return this.roles.find(r => r.name === name);
  }

  public toJSON(): IGuard {
    return {
      name: this.name,
      permissions: this.permissions.map(p => p.toJSON()),
      roles: this.roles.map(r => r.toJSON()),
    };
  }

  public static fromJSON(data: IGuard): Guard {
    const guard = new Guard(data.name);
    guard.permissions = data.permissions.map(p => new Permission(p));
    guard.roles = data.roles.map(r => new Role(r));
    return guard;
  }
}
