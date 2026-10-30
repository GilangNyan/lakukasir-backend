import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity.js';
import { Role } from './entities/role.entity.js';
import { RolePermission } from './entities/role-permission.entity.js';
import { RolesService } from './roles.service.js';
import { Channel } from '../../common/enums/channel.enum.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepositoryMock: {
    manager: { transaction: ReturnType<typeof vi.fn> };
    findOne: ReturnType<typeof vi.fn>;
  };
  let transactionRepositories: Map<unknown, Record<string, ReturnType<typeof vi.fn>>>;

  beforeEach(async () => {
    transactionRepositories = new Map();
    const manager = {
      getRepository: vi.fn((entity) => transactionRepositories.get(entity)),
    };
    roleRepositoryMock = {
      manager: {
        transaction: vi.fn((callback) => callback(manager)),
      },
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepositoryMock,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('permission lookups', () => {
    const relationOptions = {
      rolePermissions: { permission: true },
    };

    it('loads permission entities for a role', async () => {
      const permissions = [{ id: 'permission-1', name: 'sales.read' }];
      roleRepositoryMock.findOne.mockResolvedValue({
        rolePermissions: permissions.map((permission) => ({ permission })),
      });

      await expect(service.getPermissionByRole('role-1')).resolves.toEqual(
        permissions,
      );
      expect(roleRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        relations: relationOptions,
      });
    });

    it('loads permission names for a role', async () => {
      roleRepositoryMock.findOne.mockResolvedValue({
        rolePermissions: [
          { permission: { name: 'sales.read' } },
          { permission: { name: 'sales.write' } },
        ],
      });

      await expect(service.getPermissionNameByRole('role-1')).resolves.toEqual([
        'sales.read',
        'sales.write',
      ]);
      expect(roleRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        relations: relationOptions,
      });
    });
  });

  describe('create', () => {
    const permissionId = '0f8fad5b-d9cb-469f-a165-70867728950e';

    function setupTransaction(permissionRows: Permission[]) {
      const role = { id: 'role-1' } as Role;
      const roleRepository = {
        create: vi.fn((values) => values),
        save: vi.fn().mockResolvedValue(role),
        findOneOrFail: vi.fn().mockResolvedValue(role),
      };
      const permissionRepository = {
        findBy: vi.fn().mockResolvedValue(permissionRows),
      };
      const rolePermissionRepository = {
        insert: vi.fn().mockResolvedValue(undefined),
      };

      transactionRepositories.set(Role, roleRepository);
      transactionRepositories.set(Permission, permissionRepository);
      transactionRepositories.set(RolePermission, rolePermissionRepository);

      return { roleRepository, permissionRepository, rolePermissionRepository };
    }

    it('saves the role and its permissions in one transaction', async () => {
      const permission = { id: permissionId, channel: Channel.CLIENT } as Permission;
      const repositories = setupTransaction([permission]);

      await expect(
        service.create({
          name: 'Cashier',
          permission: [permissionId],
        }),
      ).resolves.toEqual({ id: 'role-1' });

      expect(roleRepositoryMock.manager.transaction).toHaveBeenCalledOnce();
      expect(repositories.roleRepository.save).toHaveBeenCalledWith({
        name: 'Cashier',
        description: undefined,
        channel: Channel.CLIENT,
        isActive: true,
      });
      expect(repositories.rolePermissionRepository.insert).toHaveBeenCalledWith([
        { roleId: 'role-1', permissionId },
      ]);
      expect(repositories.roleRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        relations: { rolePermissions: { permission: true } },
      });
    });

    it('rejects permissions from another channel before saving the role', async () => {
      const repositories = setupTransaction([
        { id: permissionId, channel: Channel.ADMIN } as Permission,
      ]);

      await expect(
        service.create({ name: 'Cashier', permission: [permissionId] }),
      ).rejects.toThrow();

      expect(repositories.roleRepository.save).not.toHaveBeenCalled();
      expect(repositories.rolePermissionRepository.insert).not.toHaveBeenCalled();
    });

    it('rejects permission IDs that do not exist', async () => {
      const repositories = setupTransaction([]);

      await expect(
        service.create({ name: 'Cashier', permission: [permissionId] }),
      ).rejects.toThrow();

      expect(repositories.roleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const existingPermissionId = '0f8fad5b-d9cb-469f-a165-70867728950e';
    const addedPermissionId = '1f8fad5b-d9cb-469f-a165-70867728950e';

    function setupTransaction(permissionIds: string[]) {
      const role = {
        id: 'role-1',
        name: 'Cashier',
        channel: Channel.CLIENT,
        isActive: true,
        rolePermissions: permissionIds.map((permissionId) => ({
          permissionId,
          permission: { id: permissionId, channel: Channel.CLIENT },
        })),
      } as Role;
      const roleRepository = {
        findOne: vi.fn().mockResolvedValue(role),
        save: vi.fn().mockResolvedValue(role),
        findOneOrFail: vi.fn().mockResolvedValue(role),
      };
      const permissionRepository = {
        findBy: vi.fn().mockImplementation(({ id }) =>
          permissionIdsForLookup(id, permissionIds),
        ),
      };
      const rolePermissionRepository = {
        delete: vi.fn().mockResolvedValue(undefined),
        insert: vi.fn().mockResolvedValue(undefined),
      };

      transactionRepositories.set(Role, roleRepository);
      transactionRepositories.set(Permission, permissionRepository);
      transactionRepositories.set(RolePermission, rolePermissionRepository);

      return { role, roleRepository, permissionRepository, rolePermissionRepository };
    }

    function permissionIdsForLookup(
      idFilter: { _value?: string[] },
      permissionIds: string[],
    ) {
      const requestedIds = idFilter._value ?? permissionIds;
      return requestedIds.map((id) => ({ id, channel: Channel.CLIENT }));
    }

    it('preserves existing permission links when permission is omitted', async () => {
      const repositories = setupTransaction([existingPermissionId]);

      await service.update('role-1', { name: 'Updated Cashier' });

      expect(repositories.rolePermissionRepository.delete).not.toHaveBeenCalled();
      expect(repositories.rolePermissionRepository.insert).not.toHaveBeenCalled();
      expect(repositories.role.name).toBe('Updated Cashier');
    });

    it('adds and removes links to match the submitted permission IDs', async () => {
      const repositories = setupTransaction([existingPermissionId]);

      await service.update('role-1', {
        permission: [addedPermissionId],
      } satisfies UpdateRoleDto);

      expect(repositories.rolePermissionRepository.delete).toHaveBeenCalledOnce();
      expect(repositories.rolePermissionRepository.insert).toHaveBeenCalledWith([
        { roleId: 'role-1', permissionId: addedPermissionId },
      ]);
    });

    it('removes all links when an empty permission list is submitted', async () => {
      const repositories = setupTransaction([existingPermissionId]);

      await service.update('role-1', { permission: [] });

      expect(repositories.rolePermissionRepository.delete).toHaveBeenCalledOnce();
      expect(repositories.rolePermissionRepository.insert).not.toHaveBeenCalled();
    });

    it('rejects a channel change that conflicts with existing permissions', async () => {
      const repositories = setupTransaction([existingPermissionId]);

      await expect(
        service.update('role-1', { channel: Channel.ADMIN }),
      ).rejects.toThrow();

      expect(repositories.roleRepository.save).not.toHaveBeenCalled();
    });
  });
});
