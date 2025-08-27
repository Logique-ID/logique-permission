# Logique Permission

A powerful Role-Based Access Control (RBAC) package for Node.js. This package provides a flexible and extensible permission system with dependency injection support.

## Features

- 🎯 **Role-Based Access Control** - Manage roles and permissions easily
- 🔧 **Dependency Injection** - Flexible architecture with DI container
- 🗄️ **Multiple Storage Backends** - In-memory, database, or custom storage
- 🛡️ **Multiple Guards** - Support for web, API, and custom guards
- 📦 **TypeScript Support** - Full type definitions and IntelliSense
- 🧪 **Comprehensive Testing** - 38+ test cases with Jest
- 🚀 **Production Ready** - MIT licensed and well documented

## Installation

```bash
npm install logique-permission
```

## Quick Start

### Basic Usage

```typescript
import { 
  PermissionManager, 
  Permission, 
  Role, 
  createPermission, 
  createRole 
} from 'logique-permission';

// Create permissions
const editUsersPermission = createPermission('edit-users');
const deleteUsersPermission = createPermission('delete-users');

// Create roles
const adminRole = createRole('admin');
const moderatorRole = createRole('moderator');

// Assign permissions to roles
adminRole.addPermission(editUsersPermission);
adminRole.addPermission(deleteUsersPermission);
moderatorRole.addPermission(editUsersPermission);

// Create user with permissions
const user = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  roles: [adminRole],
  permissions: []
};

// Add permission methods to user
Object.assign(user, {
  hasPermission(permission: string | Permission, guardName: string = 'web'): boolean {
    const permissionName = typeof permission === 'string' ? permission : permission.name;
    
    // Check direct permissions
    if (this.permissions?.some((p: Permission) => p.name === permissionName)) {
      return true;
    }

    // Check permissions through roles
    return this.roles?.some((role: Role) => 
      role.permissions?.some((p: Permission) => p.name === permissionName)
    ) || false;
  },

  hasRole(role: string | Role, guardName: string = 'web'): boolean {
    const roleName = typeof role === 'string' ? role : role.name;
    return this.roles?.some((r: Role) => r.name === roleName) || false;
  }
});

// Check permissions
console.log(user.hasPermission('edit-users')); // true
console.log(user.hasPermission('delete-users')); // true
console.log(user.hasRole('admin')); // true
```

### Using PermissionManager

```typescript
const manager = new PermissionManager({
  defaultGuard: 'web',
  cacheEnabled: true,
  cacheTtl: 3600
});

// Create permissions and roles
const permission = manager.createPermission('api-access', 'api');
const role = manager.createRole('api-user', 'api');

// Check permissions
const hasPermission = manager.checkPermission(user, 'edit-users');
const hasRole = manager.checkRole(user, 'admin');
```

## Package Structure

```
logique-permission/
├── src/
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces and types
│   ├── models/
│   │   ├── Permission.ts               # Permission model class
│   │   └── Role.ts                     # Role model class
│   ├── guards/
│   │   └── Guard.ts                    # Guard system for multiple contexts
│   ├── traits/
│   │   ├── HasPermissions.ts           # Trait for permission functionality
│   │   └── HasRoles.ts                 # Trait for role functionality
│   ├── exceptions/
│   │   └── PermissionException.ts      # Custom exception classes
│   ├── container/
│   │   └── Container.ts                # Dependency injection container
│   ├── providers/
│   │   └── PermissionServiceProvider.ts # Default service provider
│   ├── interfaces/
│   │   └── Repository.ts               # Repository pattern interfaces
│   ├── PermissionManager.ts            # Main permission manager class
│   └── index.ts                        # Package entry point and exports
├── dist/                               # Compiled JavaScript output
├── examples/
│   ├── basic-usage.ts                  # Basic usage examples
│   └── dependency-injection.ts         # DI usage examples
├── src/__tests__/                      # Test files
├── package.json                        # Package configuration
├── tsconfig.json                       # TypeScript configuration
├── jest.config.js                      # Jest testing configuration
├── .eslintrc.js                        # ESLint configuration
├── README.md                           # This documentation
├── LICENSE                             # MIT License
├── CHANGELOG.md                        # Version history
└── .npmignore                          # Files excluded from npm package
```

### File Descriptions

#### Core Classes
- **`PermissionManager.ts`** - Main class that orchestrates the entire permission system
- **`Permission.ts`** - Represents a single permission with metadata
- **`Role.ts`** - Represents a role that can have multiple permissions
- **`Guard.ts`** - Manages permissions and roles for different contexts (web, API, etc.)

#### Traits (Reusable Components)
- **`HasPermissions.ts`** - Adds permission checking methods to any class
- **`HasRoles.ts`** - Adds role checking methods to any class

#### Dependency Injection
- **`Container.ts`** - Simple DI container for service management
- **`PermissionServiceProvider.ts`** - Default service registration
- **`Repository.ts`** - Interfaces for different storage backends

#### Types and Exceptions
- **`types/index.ts`** - TypeScript interfaces and type definitions
- **`PermissionException.ts`** - Custom exception classes for error handling

## Dependency Injection

This package supports dependency injection for easy testing and customization:

### Basic DI Usage

```typescript
import { 
  Container, 
  PermissionServiceProvider, 
  PermissionManager 
} from 'logique-permission';

// Setup container
const container = new Container();
container.register(new PermissionServiceProvider());
await container.boot();

// Resolve PermissionManager
const manager = container.resolve<PermissionManager>('permission.manager');
```

### Custom Dependencies

```typescript
// Register custom cache service
container.singleton('cache.service', () => new RedisCacheService());

// Register custom repository
container.singleton('permission.repository', () => new DatabasePermissionRepository());

// Create manager with custom dependencies
const manager = new PermissionManager(config, {
  cacheService: customCache,
  permissionRepository: customRepo
});
```

### Service Providers

```typescript
class CustomPermissionServiceProvider implements ServiceProvider {
  register(container: Container): void {
    // Register custom services
    container.singleton('custom.service', () => new CustomService());
  }

  async boot(container: Container): Promise<void> {
    // Boot-time initialization
    console.log('Custom services initialized');
  }
}

container.register(new CustomPermissionServiceProvider());
```

## Multiple Guards

You can use different guards for different contexts:

```typescript
// Create permissions for different guards
const webPermission = createPermission('web-access', 'web');
const apiPermission = createPermission('api-access', 'api');

// Check permissions with specific guards
console.log(user.hasPermission('web-access', 'web')); // true
console.log(user.hasPermission('api-access', 'api')); // false
```

## Custom Permission Checks

Register custom logic for permission and role checking:

```typescript
const manager = new PermissionManager();

// Register custom permission check
manager.registerPermissionCheck('custom', (user, permission, guardName) => {
  // Custom logic for permission checking
  return user.someCustomCheck(permission);
});

// Register custom role check
manager.registerRoleCheck('custom', (user, role, guardName) => {
  // Custom logic for role checking
  return user.someCustomRoleCheck(role);
});
```

## Using Traits

Add permission and role functionality to your classes:

```typescript
import { HasPermissionsTrait, HasRolesTrait } from 'logique-permission';

class User {
  private permissionsTrait = new HasPermissionsTrait();
  private rolesTrait = new HasRolesTrait();

  constructor(public id: string, public name: string) {}

  // Delegate permission methods
  hasPermission(permission: string | Permission, guardName?: string): boolean {
    return this.permissionsTrait.hasPermission(permission, guardName);
  }

  hasRole(role: string | Role, guardName?: string): boolean {
    return this.rolesTrait.hasRole(role, guardName);
  }

  // Add more methods as needed
  givePermissionTo(permission: string | Permission, guardName?: string): void {
    this.permissionsTrait.givePermissionTo(permission, guardName);
  }

  assignRole(role: string | Role, guardName?: string): void {
    this.rolesTrait.assignRole(role, guardName);
  }
}
```

## API Reference

### PermissionManager

#### Constructor
```typescript
new PermissionManager(
  config?: PermissionManagerConfig, 
  dependencies?: PermissionManagerDependencies
)
```

#### Methods
- `createGuard(name: string): Guard`
- `getGuard(name: string): Guard`
- `createPermission(name: string, guardName?: string): Permission`
- `createRole(name: string, guardName?: string): Role`
- `checkPermission(user: PermissionUser, permission: string | Permission, guardName?: string): boolean`
- `checkRole(user: PermissionUser, role: string | Role, guardName?: string): boolean`
- `savePermissionToRepository(permission: Permission): Promise<void>`
- `saveRoleToRepository(role: Role): Promise<void>`
- `saveGuardToRepository(guard: Guard): Promise<void>`
- `dispatchEvent(event: string, data: any): Promise<void>`

### Permission

#### Constructor
```typescript
new Permission(data: Partial<Permission>)
```

#### Methods
- `equals(other: Permission): boolean`
- `toJSON(): Permission`

### Role

#### Constructor
```typescript
new Role(data: Partial<Role>)
```

#### Methods
- `addPermission(permission: Permission | IPermission): void`
- `removePermission(permission: Permission | IPermission): void`
- `hasPermission(permission: Permission | IPermission): boolean`
- `syncPermissions(permissions: (Permission | IPermission)[]): void`
- `equals(other: Role): boolean`
- `toJSON(): Role`

### HasPermissionsTrait

#### Methods
- `hasPermission(permission: string | Permission, guardName?: string): boolean`
- `hasAnyPermission(permissions: (string | Permission)[], guardName?: string): boolean`
- `hasAllPermissions(permissions: (string | Permission)[], guardName?: string): boolean`
- `givePermissionTo(permission: string | Permission, guardName?: string): void`
- `revokePermissionTo(permission: string | Permission, guardName?: string): void`
- `syncPermissions(permissions: (string | Permission)[], guardName?: string): void`

### HasRolesTrait

#### Methods
- `hasRole(role: string | Role, guardName?: string): boolean`
- `hasAnyRole(roles: (string | Role)[], guardName?: string): boolean`
- `hasAllRoles(roles: (string | Role)[], guardName?: string): boolean`
- `assignRole(role: string | Role, guardName?: string): void`
- `removeRole(role: string | Role, guardName?: string): void`
- `syncRoles(roles: (string | Role)[], guardName?: string): void`

### Dependency Injection

#### Container
```typescript
class Container {
  bind<T>(abstract: string, concrete: T | (() => T)): void
  singleton<T>(abstract: string, concrete: T | (() => T)): void
  resolve<T>(abstract: string): T
  has(abstract: string): boolean
  register(provider: ServiceProvider): void
  boot(): Promise<void>
  clear(): void
}
```

#### ServiceProvider
```typescript
interface ServiceProvider {
  register(container: Container): void
  boot?(container: Container): Promise<void>
}
```

#### Repository Interfaces
```typescript
interface PermissionRepository {
  savePermission(permission: Permission): Promise<void>
  findPermission(name: string, guardName?: string): Promise<Permission | null>
  findAllPermissions(guardName?: string): Promise<Permission[]>
  deletePermission(name: string, guardName?: string): Promise<void>
}

interface RoleRepository {
  saveRole(role: Role): Promise<void>
  findRole(name: string, guardName?: string): Promise<Role | null>
  findAllRoles(guardName?: string): Promise<Role[]>
  deleteRole(name: string, guardName?: string): Promise<void>
}

interface CacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
```

## Exception Handling

```typescript
import { 
  PermissionException, 
  RoleNotFoundException, 
  PermissionNotFoundException, 
  GuardNotFoundException 
} from 'logique-permission';

try {
  const role = manager.getRole('non-existent-role');
} catch (error) {
  if (error instanceof RoleNotFoundException) {
    console.log('Role not found');
  }
}
```

## Storage Options

### In-Memory (Default)
- Fastest performance
- Data lost on restart
- Perfect for testing and development

### Database Integration

#### PostgreSQL Example

Complete PostgreSQL integration example is available in `examples/database/`:

```typescript
import { Pool } from 'pg';
import { Container, PermissionManager } from 'logique-permission';

// Initialize PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'logique_permission',
  password: 'your_password',
  port: 5432,
});

// Setup DI container with PostgreSQL repositories
const container = new Container();
container.singleton('permission.repository', () => new PostgreSQLPermissionRepository(pool));
container.singleton('role.repository', () => new PostgreSQLRoleRepository(pool));

// Create PermissionManager with database dependencies
const manager = new PermissionManager(config, {
  permissionRepository: container.resolve('permission.repository'),
  roleRepository: container.resolve('role.repository')
});

// Save to database
await manager.savePermissionToRepository(permission);
await manager.saveRoleToRepository(role);
```

#### Custom Database Implementation

```typescript
// Implement custom repository
class DatabasePermissionRepository implements PermissionRepository {
  async savePermission(permission: Permission): Promise<void> {
    // Save to database
  }
  
  async findPermission(name: string, guardName?: string): Promise<Permission | null> {
    // Query from database
  }
}

// Use with DI
container.singleton('permission.repository', () => new DatabasePermissionRepository());
```

### Redis Cache
```typescript
class RedisCacheService implements CacheService {
  async get<T>(key: string): Promise<T | null> {
    // Get from Redis
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Set to Redis
  }
}
```

## Testing

```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Development

Build the package:
```bash
npm run build
```

Run linting:
```bash
npm run lint
npm run lint:fix
```

## Examples

Check the `examples/` directory for complete usage examples:

### Basic Examples
- `basic-usage.ts` - Basic permission and role management
- `dependency-injection.ts` - DI container usage

### Database Integration
- `database/postgresql-integration.ts` - Complete PostgreSQL integration
- `database/migration.sql` - Database schema and migrations
- `database/package.json` - PostgreSQL dependencies
- `database/README.md` - Detailed PostgreSQL setup guide

### Quick Start with PostgreSQL

1. **Install dependencies:**
```bash
cd examples/database
npm install
```

2. **Setup database:**
```bash
npm run setup-db
npm run migrate
```

3. **Run example:**
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.
