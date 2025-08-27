import { 
  PermissionManager, 
  Permission, 
  Role, 
  createPermission, 
  createRole
} from '../src/index';

// Contoh penggunaan dasar
console.log('=== Contoh Penggunaan Dasar ===');

// 1. Membuat permission
const editUsersPermission = createPermission('edit-users');
const deleteUsersPermission = createPermission('delete-users');
const viewUsersPermission = createPermission('view-users');
const createUsersPermission = createPermission('create-users');

console.log('Permissions created:', {
  editUsers: editUsersPermission.name,
  deleteUsers: deleteUsersPermission.name,
  viewUsers: viewUsersPermission.name,
  createUsers: createUsersPermission.name
});

// 2. Membuat role
const adminRole = createRole('admin');
const moderatorRole = createRole('moderator');
const userRole = createRole('user');

console.log('Roles created:', {
  admin: adminRole.name,
  moderator: moderatorRole.name,
  user: userRole.name
});

// 3. Menambahkan permission ke role
adminRole.addPermission(editUsersPermission);
adminRole.addPermission(deleteUsersPermission);
adminRole.addPermission(viewUsersPermission);
adminRole.addPermission(createUsersPermission);

moderatorRole.addPermission(viewUsersPermission);
moderatorRole.addPermission(editUsersPermission);

userRole.addPermission(viewUsersPermission);

console.log('Permissions assigned to roles');

// 4. Membuat user dengan permission
const adminUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  roles: [adminRole],
  permissions: [viewUsersPermission]
};

const moderatorUser = {
  id: '2',
  name: 'Moderator User',
  email: 'moderator@example.com',
  roles: [moderatorRole],
  permissions: []
};

const regularUser = {
  id: '3',
  name: 'Regular User',
  email: 'user@example.com',
  roles: [userRole],
  permissions: []
};

// 5. Menambahkan method permission ke user
function addPermissionMethods(user: any) {
  Object.assign(user, {
    hasPermission(permission: string | Permission, _guardName: string = 'web'): boolean {
      const permissionName = typeof permission === 'string' ? permission : permission.name;
      
      // Check direct permissions
      if (user.permissions?.some((p: Permission) => p.name === permissionName)) {
        return true;
      }

      // Check permissions through roles
      return user.roles?.some((role: Role) => 
        role.permissions?.some((p: Permission) => p.name === permissionName)
      ) || false;
    },

    hasRole(role: string | Role, _guardName: string = 'web'): boolean {
      const roleName = typeof role === 'string' ? role : role.name;
      return user.roles?.some((r: Role) => r.name === roleName) || false;
    },

    hasAnyPermission: function(permissions: (string | Permission)[], guardName?: string): boolean {
      return permissions.some(permission => this.hasPermission(permission, guardName));
    },

    hasAllPermissions: function(permissions: (string | Permission)[], guardName?: string): boolean {
      return permissions.every(permission => this.hasPermission(permission, guardName));
    },

    hasAnyRole: function(roles: (string | Role)[], guardName?: string): boolean {
      return roles.some(role => this.hasRole(role, guardName));
    },

    hasAllRoles: function(roles: (string | Role)[], guardName?: string): boolean {
      return roles.every(role => this.hasRole(role, guardName));
    }
  });
}

addPermissionMethods(adminUser);
addPermissionMethods(moderatorUser);
addPermissionMethods(regularUser);

// 6. Testing permissions
console.log('\n=== Testing Permissions ===');

console.log('Admin User:');
console.log('- Can edit users:', (adminUser as any).hasPermission('edit-users'));
console.log('- Can delete users:', (adminUser as any).hasPermission('delete-users'));
console.log('- Can view users:', (adminUser as any).hasPermission('view-users'));
console.log('- Can create users:', (adminUser as any).hasPermission('create-users'));
console.log('- Has admin role:', (adminUser as any).hasRole('admin'));

console.log('\nModerator User:');
console.log('- Can edit users:', (moderatorUser as any).hasPermission('edit-users'));
console.log('- Can delete users:', (moderatorUser as any).hasPermission('delete-users'));
console.log('- Can view users:', (moderatorUser as any).hasPermission('view-users'));
console.log('- Can create users:', (moderatorUser as any).hasPermission('create-users'));
console.log('- Has moderator role:', (moderatorUser as any).hasRole('moderator'));

console.log('\nRegular User:');
console.log('- Can edit users:', (regularUser as any).hasPermission('edit-users'));
console.log('- Can delete users:', (regularUser as any).hasPermission('delete-users'));
console.log('- Can view users:', (regularUser as any).hasPermission('view-users'));
console.log('- Can create users:', (regularUser as any).hasPermission('create-users'));
console.log('- Has user role:', (regularUser as any).hasRole('user'));

// 7. Menggunakan PermissionManager
console.log('\n=== Menggunakan PermissionManager ===');

const manager = new PermissionManager({
  defaultGuard: 'web',
  cacheEnabled: true,
  cacheTtl: 3600
});

// Membuat guard baru
manager.createGuard('api');

// Membuat permission dan role untuk API
const apiAccessPermission = manager.createPermission('api-access', 'api');
const apiUserRole = manager.createRole('api-user', 'api');

console.log('API Guard created with:', {
  permission: apiAccessPermission.name,
  role: apiUserRole.name
});

// 8. Testing dengan manager
console.log('\n=== Testing dengan Manager ===');

const hasEditPermission = manager.checkPermission(adminUser as any, 'edit-users');
const hasAdminRole = manager.checkRole(adminUser as any, 'admin');

console.log('Admin has edit permission (via manager):', hasEditPermission);
console.log('Admin has admin role (via manager):', hasAdminRole);

// 9. Multiple guards example
console.log('\n=== Multiple Guards Example ===');

const webPermission = createPermission('web-access', 'web');
const apiPermission = manager.createPermission('api-access', 'api');

const multiGuardUser = {
  id: '4',
  name: 'Multi Guard User',
  email: 'multi@example.com',
  roles: [adminRole],
  permissions: [webPermission, apiPermission]
};

addPermissionMethods(multiGuardUser);

console.log('Multi Guard User:');
console.log('- Web access:', (multiGuardUser as any).hasPermission('web-access', 'web'));
console.log('- API access:', (multiGuardUser as any).hasPermission('api-access', 'api'));
console.log('- Web access in API guard:', (multiGuardUser as any).hasPermission('web-access', 'api'));

console.log('\n=== Contoh Selesai ===');
