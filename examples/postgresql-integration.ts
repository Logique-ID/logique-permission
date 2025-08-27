import { Pool, PoolClient } from 'pg';
import { 
  Container, 
  PermissionServiceProvider, 
  PermissionManager,
  PermissionRepository,
  RoleRepository,
  GuardRepository,
  CacheService,
  EventDispatcher,
  Permission,
  Role,
  Guard
} from '../src/index';

// PostgreSQL Database Repository Implementation
class PostgreSQLPermissionRepository implements PermissionRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async savePermission(permission: Permission): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO permissions (id, name, guard_name, description, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name, guard_name) 
         DO UPDATE SET 
           description = $4, 
           updated_at = $6`,
        [
          permission.id,
          permission.name,
          permission.guardName,
          permission.description,
          permission.createdAt,
          permission.updatedAt
        ]
      );
    } finally {
      client.release();
    }
  }

  async findPermission(name: string, guardName: string = 'web'): Promise<Permission | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM permissions WHERE name = $1 AND guard_name = $2',
        [name, guardName]
      );
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return new Permission({
        id: row.id,
        name: row.name,
        guardName: row.guard_name,
        description: row.description,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    } finally {
      client.release();
    }
  }

  async findAllPermissions(guardName: string = 'web'): Promise<Permission[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM permissions WHERE guard_name = $1',
        [guardName]
      );
      
      return result.rows.map(row => new Permission({
        id: row.id,
        name: row.name,
        guardName: row.guard_name,
        description: row.description,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } finally {
      client.release();
    }
  }

  async deletePermission(name: string, guardName: string = 'web'): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        'DELETE FROM permissions WHERE name = $1 AND guard_name = $2',
        [name, guardName]
      );
    } finally {
      client.release();
    }
  }
}

class PostgreSQLRoleRepository implements RoleRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async saveRole(role: Role): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Save role
      await client.query(
        `INSERT INTO roles (id, name, guard_name, description, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name, guard_name) 
         DO UPDATE SET 
           description = $4, 
           updated_at = $6`,
        [
          role.id,
          role.name,
          role.guardName,
          role.description,
          role.createdAt,
          role.updatedAt
        ]
      );

      // Save role permissions
      await client.query(
        'DELETE FROM role_permissions WHERE role_id = $1',
        [role.id]
      );

      for (const permission of role.permissions) {
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id) 
           VALUES ($1, $2)`,
          [role.id, permission.id]
        );
      }
    } finally {
      client.release();
    }
  }

  async findRole(name: string, guardName: string = 'web'): Promise<Role | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM roles WHERE name = $1 AND guard_name = $2',
        [name, guardName]
      );
      
      if (result.rows.length === 0) return null;
      
      const roleRow = result.rows[0];
      
      // Get permissions for this role
      const permissionsResult = await client.query(
        `SELECT p.* FROM permissions p
         INNER JOIN role_permissions rp ON p.id = rp.permission_id
         WHERE rp.role_id = $1`,
        [roleRow.id]
      );
      
      const permissions = permissionsResult.rows.map(row => new Permission({
        id: row.id,
        name: row.name,
        guardName: row.guard_name,
        description: row.description,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
      
      return new Role({
        id: roleRow.id,
        name: roleRow.name,
        guardName: roleRow.guard_name,
        description: roleRow.description,
        permissions,
        createdAt: new Date(roleRow.created_at),
        updatedAt: new Date(roleRow.updated_at)
      });
    } finally {
      client.release();
    }
  }

  async findAllRoles(guardName: string = 'web'): Promise<Role[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM roles WHERE guard_name = $1',
        [guardName]
      );
      
      const roles: Role[] = [];
      
      for (const roleRow of result.rows) {
        // Get permissions for each role
        const permissionsResult = await client.query(
          `SELECT p.* FROM permissions p
           INNER JOIN role_permissions rp ON p.id = rp.permission_id
           WHERE rp.role_id = $1`,
          [roleRow.id]
        );
        
        const permissions = permissionsResult.rows.map(row => new Permission({
          id: row.id,
          name: row.name,
          guardName: row.guard_name,
          description: row.description,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        }));
        
        roles.push(new Role({
          id: roleRow.id,
          name: roleRow.name,
          guardName: roleRow.guard_name,
          description: roleRow.description,
          permissions,
          createdAt: new Date(roleRow.created_at),
          updatedAt: new Date(roleRow.updated_at)
        }));
      }
      
      return roles;
    } finally {
      client.release();
    }
  }

  async deleteRole(name: string, guardName: string = 'web'): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        'DELETE FROM roles WHERE name = $1 AND guard_name = $2',
        [name, guardName]
      );
    } finally {
      client.release();
    }
  }
}

class PostgreSQLGuardRepository implements GuardRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async saveGuard(guard: Guard): Promise<void> {
    // Guards are typically managed in memory, but we can store metadata
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO guards (name, created_at) 
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [guard.name, new Date()]
      );
    } finally {
      client.release();
    }
  }

  async findGuard(name: string): Promise<Guard | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM guards WHERE name = $1',
        [name]
      );
      
      if (result.rows.length === 0) return null;
      
      // Get permissions and roles for this guard
      const permissions = await this.getGuardPermissions(name);
      const roles = await this.getGuardRoles(name);
      
      return new Guard(name);
    } finally {
      client.release();
    }
  }

  async findAllGuards(): Promise<Guard[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM guards');
      return result.rows.map(row => new Guard(row.name));
    } finally {
      client.release();
    }
  }

  async deleteGuard(name: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('DELETE FROM guards WHERE name = $1', [name]);
    } finally {
      client.release();
    }
  }

  private async getGuardPermissions(guardName: string): Promise<Permission[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM permissions WHERE guard_name = $1',
        [guardName]
      );
      
      return result.rows.map(row => new Permission({
        id: row.id,
        name: row.name,
        guardName: row.guard_name,
        description: row.description,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } finally {
      client.release();
    }
  }

  private async getGuardRoles(guardName: string): Promise<Role[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM roles WHERE guard_name = $1',
        [guardName]
      );
      
      const roles: Role[] = [];
      
      for (const roleRow of result.rows) {
        const permissionsResult = await client.query(
          `SELECT p.* FROM permissions p
           INNER JOIN role_permissions rp ON p.id = rp.permission_id
           WHERE rp.role_id = $1`,
          [roleRow.id]
        );
        
        const permissions = permissionsResult.rows.map(row => new Permission({
          id: row.id,
          name: row.name,
          guardName: row.guard_name,
          description: row.description,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        }));
        
        roles.push(new Role({
          id: roleRow.id,
          name: roleRow.name,
          guardName: roleRow.guard_name,
          description: roleRow.description,
          permissions,
          createdAt: new Date(roleRow.created_at),
          updatedAt: new Date(roleRow.updated_at)
        }));
      }
      
      return roles;
    } finally {
      client.release();
    }
  }
}

// Redis Cache Service Implementation
class RedisCacheService implements CacheService {
  private redis: any; // You would use redis client here

  constructor(redisClient: any) {
    this.redis = redisClient;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
}

// Database Migration Script
async function createTables(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    // Create permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, guard_name)
      )
    `);

    // Create roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, guard_name)
      )
    `);

    // Create role_permissions junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id VARCHAR(255) NOT NULL,
        permission_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    // Create guards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS guards (
        name VARCHAR(255) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id VARCHAR(255) NOT NULL,
        role_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `);

    // Create user_permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id VARCHAR(255) NOT NULL,
        permission_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, permission_id),
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables created successfully');
  } finally {
    client.release();
  }
}

// Example usage
async function main() {
  console.log('=== PostgreSQL Integration Example ===');

  // Initialize PostgreSQL connection
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'logique_permission',
    password: 'your_password',
    port: 5432,
  });

  try {
    // Create database tables
    await createTables(pool);

    // Initialize DI container
    const container = new Container();

    // Register PostgreSQL repositories
    container.singleton('permission.repository', () => new PostgreSQLPermissionRepository(pool));
    container.singleton('role.repository', () => new PostgreSQLRoleRepository(pool));
    container.singleton('guard.repository', () => new PostgreSQLGuardRepository(pool));

    // Register cache service (you would use real Redis here)
    container.singleton('cache.service', () => new RedisCacheService(null));

    // Register event dispatcher
    container.singleton('event.dispatcher', () => ({
      dispatch: async (event: string, data: any) => {
        console.log(`Event dispatched: ${event}`, data);
      },
      subscribe: () => {},
      unsubscribe: () => {}
    }));

    // Register PermissionManager with database dependencies
    container.singleton('permission.manager', () => {
      const config = {
        defaultGuard: 'web',
        cacheEnabled: true,
        cacheTtl: 3600
      };

      return new PermissionManager(config, {
        permissionRepository: container.resolve('permission.repository'),
        roleRepository: container.resolve('role.repository'),
        guardRepository: container.resolve('guard.repository'),
        cacheService: container.resolve('cache.service'),
        eventDispatcher: container.resolve('event.dispatcher')
      });
    });

    // Resolve PermissionManager
    const manager = container.resolve<PermissionManager>('permission.manager');

    console.log('PermissionManager initialized with PostgreSQL repositories');

    // Create permissions and save to database
    const editPermission = manager.createPermission('edit-users');
    const deletePermission = manager.createPermission('delete-users');
    const viewPermission = manager.createPermission('view-users');

    await manager.savePermissionToRepository(editPermission);
    await manager.savePermissionToRepository(deletePermission);
    await manager.savePermissionToRepository(viewPermission);

    console.log('Permissions saved to database');

    // Create role and save to database
    const adminRole = manager.createRole('admin');
    adminRole.addPermission(editPermission);
    adminRole.addPermission(deletePermission);
    adminRole.addPermission(viewPermission);

    await manager.saveRoleToRepository(adminRole);

    console.log('Role saved to database');

    // Retrieve from database
    const retrievedPermission = await manager['permissionRepository']?.findPermission('edit-users');
    const retrievedRole = await manager['roleRepository']?.findRole('admin');

    console.log('Retrieved from database:');
    console.log('- Permission:', retrievedPermission?.name);
    console.log('- Role:', retrievedRole?.name);
    console.log('- Role permissions:', retrievedRole?.permissions.length);

    // Create user with database-stored permissions
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      roles: [retrievedRole!],
      permissions: []
    };

    // Add permission methods
    Object.assign(user, {
      hasPermission(permission: string | Permission, guardName: string = 'web'): boolean {
        const permissionName = typeof permission === 'string' ? permission : permission.name;
        
        if (this.permissions?.some((p: Permission) => p.name === permissionName)) {
          return true;
        }

        return this.roles?.some((role: Role) => 
          role.permissions?.some((p: Permission) => p.name === permissionName)
        ) || false;
      },

      hasRole(role: string | Role, guardName: string = 'web'): boolean {
        const roleName = typeof role === 'string' ? role : role.name;
        return this.roles?.some((r: Role) => r.name === roleName) || false;
      }
    });

    // Test permissions
    console.log('\nTesting permissions:');
    console.log('- Can edit users:', user.hasPermission('edit-users'));
    console.log('- Can delete users:', user.hasPermission('delete-users'));
    console.log('- Can view users:', user.hasPermission('view-users'));
    console.log('- Has admin role:', user.hasRole('admin'));

    console.log('\n=== PostgreSQL Integration Complete ===');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// Run the example
main().catch(console.error);
