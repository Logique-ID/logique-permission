export class PermissionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionException';
  }
}

export class RoleNotFoundException extends PermissionException {
  constructor(roleName: string) {
    super(`Role "${roleName}" not found`);
    this.name = 'RoleNotFoundException';
  }
}

export class PermissionNotFoundException extends PermissionException {
  constructor(permissionName: string) {
    super(`Permission "${permissionName}" not found`);
    this.name = 'PermissionNotFoundException';
  }
}

export class GuardNotFoundException extends PermissionException {
  constructor(guardName: string) {
    super(`Guard "${guardName}" not found`);
    this.name = 'GuardNotFoundException';
  }
}
