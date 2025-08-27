import { Container } from '../src/container/Container';
import { PermissionServiceProvider } from '../src/providers/PermissionServiceProvider';
import { PermissionManager } from '../src/PermissionManager';

// Contoh penggunaan Dependency Injection
async function main() {
  console.log('=== Dependency Injection Example ===');

  // 1. Buat container
  const container = new Container();

  // 2. Register service provider
  container.register(new PermissionServiceProvider());

  // 3. Boot semua providers
  await container.boot();

  // 4. Resolve PermissionManager dari container
  const permissionManager = container.resolve<PermissionManager>('permission.manager');

  console.log('PermissionManager resolved from container:', permissionManager);

  // 5. Gunakan permission manager
  const editPermission = permissionManager.createPermission('edit-users');
  const adminRole = permissionManager.createRole('admin');

  console.log('Created permission:', editPermission.name);
  console.log('Created role:', adminRole.name);

  // 6. Custom service registration
  console.log('\n=== Custom Service Registration ===');

  // Register custom config
  container.singleton('custom.config', () => ({
    defaultGuard: 'api',
    cacheEnabled: false,
    cacheTtl: 1800
  }));

  // Register custom cache service
  container.singleton('custom.cache', () => ({
    get: async (key: string) => {
      console.log(`Getting from custom cache: ${key}`);
      return null;
    },
    set: async (key: string, value: any) => {
      console.log(`Setting to custom cache: ${key}`, value);
    },
    delete: async (key: string) => {
      console.log(`Deleting from custom cache: ${key}`);
    },
    clear: async () => {
      console.log('Clearing custom cache');
    }
  }));

  // Resolve custom services
  const customConfig = container.resolve('custom.config');
  const customCache = container.resolve('custom.cache');

  console.log('Custom config:', customConfig);
  console.log('Custom cache service:', customCache);

  // 7. Service replacement example
  console.log('\n=== Service Replacement ===');

  // Replace default cache with custom one
  container.singleton('cache.service', () => customCache);

  // Create new manager with custom cache
  const customManager = new PermissionManager(customConfig as any, {
    cacheService: customCache as any
  });

  console.log('Custom manager created with custom cache:', customManager);

  // 8. Factory pattern example
  console.log('\n=== Factory Pattern ===');

  container.bind('permission.factory', () => {
    return {
      createManager: (config: any) => {
        return new PermissionManager(config);
      },
      createManagerWithCache: (config: any, cache: any) => {
        return new PermissionManager(config, { cacheService: cache });
      }
    };
  });

  const factory = container.resolve('permission.factory') as any;
  const factoryManager = factory.createManager({ defaultGuard: 'factory' });

  console.log('Factory created manager:', factoryManager);

  console.log('\n=== DI Example Complete ===');
}

// Run the example
main().catch(console.error);
