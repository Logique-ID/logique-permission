import { Role as IRole, Permission as IPermission } from '../types';
import { Permission } from './Permission';

export class Role implements IRole {
  public id: string;
  public name: string;
  public guardName: string;
  public description?: string | undefined;
  public permissions: Permission[];
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(data: Partial<IRole>) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.guardName = data.guardName || 'web';
    this.description = data.description || undefined;
    this.permissions = (data.permissions || []).map(p => 
      p instanceof Permission ? p : new Permission(p)
    );
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
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

  public syncPermissions(permissions: (Permission | IPermission)[]): void {
    this.permissions = permissions.map(p => 
      p instanceof Permission ? p : new Permission(p)
    );
  }

  public toJSON(): IRole {
    return {
      id: this.id,
      name: this.name,
      guardName: this.guardName,
      description: this.description || undefined,
      permissions: this.permissions.map(p => p.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromJSON(data: IRole): Role {
    return new Role(data);
  }

  public equals(other: Role): boolean {
    return this.id === other.id && this.name === other.name && this.guardName === other.guardName;
  }
}
