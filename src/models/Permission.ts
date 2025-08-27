import { Permission as IPermission } from '../types';

export class Permission implements IPermission {
  public id: string;
  public name: string;
  public guardName: string;
  public description?: string | undefined;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(data: Partial<IPermission>) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.guardName = data.guardName || 'web';
    this.description = data.description || undefined;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public toJSON(): IPermission {
    return {
      id: this.id,
      name: this.name,
      guardName: this.guardName,
      description: this.description || undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromJSON(data: IPermission): Permission {
    return new Permission(data);
  }

  public equals(other: Permission): boolean {
    return this.id === other.id && this.name === other.name && this.guardName === other.guardName;
  }
}
