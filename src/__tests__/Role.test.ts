import { Role } from '../models/Role';
import { Permission } from '../models/Permission';

describe('Role', () => {
  it('should create a role with default values', () => {
    const role = new Role({ name: 'test-role' });
    
    expect(role.name).toBe('test-role');
    expect(role.guardName).toBe('web');
    expect(role.id).toBeDefined();
    expect(role.permissions).toEqual([]);
    expect(role.createdAt).toBeInstanceOf(Date);
    expect(role.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a role with custom values', () => {
    const permission = new Permission({ name: 'test-permission' });
    const role = new Role({
      id: 'custom-id',
      name: 'custom-role',
      guardName: 'api',
      description: 'Test description',
      permissions: [permission]
    });
    
    expect(role.id).toBe('custom-id');
    expect(role.name).toBe('custom-role');
    expect(role.guardName).toBe('api');
    expect(role.description).toBe('Test description');
    expect(role.permissions).toHaveLength(1);
  });

  it('should add permission to role', () => {
    const role = new Role({ name: 'test-role' });
    const permission = new Permission({ name: 'test-permission' });
    
    role.addPermission(permission);
    
    expect(role.permissions).toHaveLength(1);
    expect(role.hasPermission(permission)).toBe(true);
  });

  it('should not add duplicate permission', () => {
    const role = new Role({ name: 'test-role' });
    const permission = new Permission({ name: 'test-permission' });
    
    role.addPermission(permission);
    role.addPermission(permission);
    
    expect(role.permissions).toHaveLength(1);
  });

  it('should remove permission from role', () => {
    const role = new Role({ name: 'test-role' });
    const permission = new Permission({ name: 'test-permission' });
    
    role.addPermission(permission);
    expect(role.hasPermission(permission)).toBe(true);
    
    role.removePermission(permission);
    expect(role.hasPermission(permission)).toBe(false);
    expect(role.permissions).toHaveLength(0);
  });

  it('should sync permissions', () => {
    const role = new Role({ name: 'test-role' });
    const permission1 = new Permission({ name: 'permission-1' });
    const permission2 = new Permission({ name: 'permission-2' });
    
    role.addPermission(permission1);
    role.syncPermissions([permission2]);
    
    expect(role.permissions).toHaveLength(1);
    expect(role.hasPermission(permission1)).toBe(false);
    expect(role.hasPermission(permission2)).toBe(true);
  });

  it('should convert to JSON', () => {
    const permission = new Permission({ name: 'test-permission' });
    const role = new Role({ name: 'test-role', permissions: [permission] });
    const json = role.toJSON();
    
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('name', 'test-role');
    expect(json).toHaveProperty('guardName', 'web');
    expect(json).toHaveProperty('permissions');
    expect(json.permissions).toHaveLength(1);
  });

  it('should create from JSON', () => {
    const data = {
      id: 'test-id',
      name: 'test-role',
      guardName: 'web',
      description: 'Test description',
      permissions: [{ id: '1', name: 'test-permission', guardName: 'web' }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const role = Role.fromJSON(data);
    
    expect(role.id).toBe(data.id);
    expect(role.name).toBe(data.name);
    expect(role.guardName).toBe(data.guardName);
    expect(role.description).toBe(data.description);
    expect(role.permissions).toHaveLength(1);
  });

  it('should check equality', () => {
    const role1 = new Role({ id: '1', name: 'test', guardName: 'web' });
    const role2 = new Role({ id: '1', name: 'test', guardName: 'web' });
    const role3 = new Role({ id: '2', name: 'test', guardName: 'web' });
    
    expect(role1.equals(role2)).toBe(true);
    expect(role1.equals(role3)).toBe(false);
  });
});
