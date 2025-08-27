import { Permission } from '../models/Permission';

describe('Permission', () => {
  it('should create a permission with default values', () => {
    const permission = new Permission({ name: 'test-permission' });
    
    expect(permission.name).toBe('test-permission');
    expect(permission.guardName).toBe('web');
    expect(permission.id).toBeDefined();
    expect(permission.createdAt).toBeInstanceOf(Date);
    expect(permission.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a permission with custom values', () => {
    const permission = new Permission({
      id: 'custom-id',
      name: 'custom-permission',
      guardName: 'api',
      description: 'Test description'
    });
    
    expect(permission.id).toBe('custom-id');
    expect(permission.name).toBe('custom-permission');
    expect(permission.guardName).toBe('api');
    expect(permission.description).toBe('Test description');
  });

  it('should convert to JSON', () => {
    const permission = new Permission({ name: 'test-permission' });
    const json = permission.toJSON();
    
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('name', 'test-permission');
    expect(json).toHaveProperty('guardName', 'web');
    expect(json).toHaveProperty('createdAt');
    expect(json).toHaveProperty('updatedAt');
  });

  it('should create from JSON', () => {
    const data = {
      id: 'test-id',
      name: 'test-permission',
      guardName: 'web',
      description: 'Test description',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const permission = Permission.fromJSON(data);
    
    expect(permission.id).toBe(data.id);
    expect(permission.name).toBe(data.name);
    expect(permission.guardName).toBe(data.guardName);
    expect(permission.description).toBe(data.description);
  });

  it('should check equality', () => {
    const permission1 = new Permission({ id: '1', name: 'test', guardName: 'web' });
    const permission2 = new Permission({ id: '1', name: 'test', guardName: 'web' });
    const permission3 = new Permission({ id: '2', name: 'test', guardName: 'web' });
    
    expect(permission1.equals(permission2)).toBe(true);
    expect(permission1.equals(permission3)).toBe(false);
  });
});
