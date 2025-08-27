import { PermissionManager } from '../PermissionManager';
import { GuardNotFoundException, PermissionNotFoundException, RoleNotFoundException } from '../exceptions/PermissionException';

describe('PermissionManager', () => {
  let manager: PermissionManager;

  const createTestUser = (overrides: any = {}) => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    hasPermission: jest.fn(),
    hasAnyPermission: jest.fn(),
    hasAllPermissions: jest.fn(),
    hasRole: jest.fn(),
    hasAnyRole: jest.fn(),
    hasAllRoles: jest.fn(),
    ...overrides
  });

  beforeEach(() => {
    manager = new PermissionManager();
  });

  describe('Constructor', () => {
    it('should create with default config', () => {
      expect(manager).toBeInstanceOf(PermissionManager);
    });

    it('should create with custom config', () => {
      const customManager = new PermissionManager({
        defaultGuard: 'api',
        cacheEnabled: true,
        cacheTtl: 1800
      });
      
      expect(customManager).toBeInstanceOf(PermissionManager);
    });
  });

  describe('Guard Management', () => {
    it('should create a new guard', () => {
      const guard = manager.createGuard('api');
      
      expect(guard.name).toBe('api');
    });

    it('should get existing guard', () => {
      manager.createGuard('api');
      const guard = manager.getGuard('api');
      
      expect(guard.name).toBe('api');
    });

    it('should throw error for non-existent guard', () => {
      expect(() => manager.getGuard('non-existent')).toThrow(GuardNotFoundException);
    });

    it('should get default guard', () => {
      const guard = manager.getDefaultGuard();
      
      expect(guard.name).toBe('web');
    });
  });

  describe('Permission Management', () => {
    it('should create permission', () => {
      const permission = manager.createPermission('test-permission');
      
      expect(permission.name).toBe('test-permission');
      expect(permission.guardName).toBe('web');
    });

    it('should create permission with custom guard', () => {
      manager.createGuard('api');
      const permission = manager.createPermission('test-permission', 'api');
      
      expect(permission.name).toBe('test-permission');
      expect(permission.guardName).toBe('api');
    });

    it('should get existing permission', () => {
      manager.createPermission('test-permission');
      const permission = manager.getPermission('test-permission');
      
      expect(permission.name).toBe('test-permission');
    });

    it('should throw error for non-existent permission', () => {
      expect(() => manager.getPermission('non-existent')).toThrow(PermissionNotFoundException);
    });

    it('should get all permissions', () => {
      manager.createPermission('permission-1');
      manager.createPermission('permission-2');
      
      const permissions = manager.getAllPermissions();
      
      expect(permissions).toHaveLength(2);
      expect(permissions.some(p => p.name === 'permission-1')).toBe(true);
      expect(permissions.some(p => p.name === 'permission-2')).toBe(true);
    });
  });

  describe('Role Management', () => {
    it('should create role', () => {
      const role = manager.createRole('test-role');
      
      expect(role.name).toBe('test-role');
      expect(role.guardName).toBe('web');
    });

    it('should create role with custom guard', () => {
      manager.createGuard('api');
      const role = manager.createRole('test-role', 'api');
      
      expect(role.name).toBe('test-role');
      expect(role.guardName).toBe('api');
    });

    it('should get existing role', () => {
      manager.createRole('test-role');
      const role = manager.getRole('test-role');
      
      expect(role.name).toBe('test-role');
    });

    it('should throw error for non-existent role', () => {
      expect(() => manager.getRole('non-existent')).toThrow(RoleNotFoundException);
    });

    it('should get all roles', () => {
      manager.createRole('role-1');
      manager.createRole('role-2');
      
      const roles = manager.getAllRoles();
      
      expect(roles).toHaveLength(2);
      expect(roles.some(r => r.name === 'role-1')).toBe(true);
      expect(roles.some(r => r.name === 'role-2')).toBe(true);
    });
  });

  describe('Permission Checking', () => {
    it('should check permission for user', () => {
      const user = createTestUser({
        hasPermission: jest.fn().mockReturnValue(true)
      });

      const result = manager.checkPermission(user, 'test-permission');
      
      expect(result).toBe(true);
      expect(user.hasPermission).toHaveBeenCalledWith('test-permission', 'web');
    });

    it('should check role for user', () => {
      const user = createTestUser({
        hasRole: jest.fn().mockReturnValue(true)
      });

      const result = manager.checkRole(user, 'test-role');
      
      expect(result).toBe(true);
      expect(user.hasRole).toHaveBeenCalledWith('test-role', 'web');
    });
  });

  describe('Custom Checks', () => {
    it('should register custom permission check', () => {
      const customCheck = jest.fn().mockReturnValue(true);
      manager.registerPermissionCheck('custom', customCheck);
      
      const user = createTestUser();
      const result = manager.checkPermission(user, 'test-permission', 'custom');
      
      expect(result).toBe(true);
      expect(customCheck).toHaveBeenCalledWith(user, 'test-permission', 'custom');
    });

    it('should register custom role check', () => {
      const customCheck = jest.fn().mockReturnValue(true);
      manager.registerRoleCheck('custom', customCheck);
      
      const user = createTestUser();
      const result = manager.checkRole(user, 'test-role', 'custom');
      
      expect(result).toBe(true);
      expect(customCheck).toHaveBeenCalledWith(user, 'test-role', 'custom');
    });
  });

  describe('Utility Methods', () => {
    it('should return user for forUser method', () => {
      const user = createTestUser();
      const result = manager.forUser(user);
      
      expect(result).toBe(user);
    });

    it('should create manager for specific guard', () => {
      const guardManager = manager.forGuard('api');
      
      expect(guardManager).toBeInstanceOf(PermissionManager);
    });

    it('should clear cache', () => {
      expect(() => manager.clearCache()).not.toThrow();
    });

    it('should convert to JSON', () => {
      const json = manager.toJSON();
      
      expect(json).toHaveProperty('config');
      expect(json).toHaveProperty('guards');
    });
  });
});
