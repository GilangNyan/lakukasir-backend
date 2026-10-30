import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { In, Repository } from 'typeorm';
import type { FindOptionsRelations } from 'typeorm';
import { t } from '../../utils/i18n.util.js';
import { Permission } from './entities/permission.entity.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { Channel } from '../../common/enums/channel.enum.js';
import { RolePermission } from './entities/role-permission.entity.js';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findById(id: string): Promise<Role> {
    return this.findRole(id);
  }

  private async findRole(
    id: string,
    relations?: FindOptionsRelations<Role>,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations,
    });
    if (!role)
      throw new NotFoundException(
        t('NOT_FOUND', { args: { item: t('field.ROLE') } }),
      );

    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const {
      name,
      description,
      channel = Channel.CLIENT,
      isActive = true,
      permission: permissionIds,
    } = createRoleDto;

    if (
      !permissionIds.length ||
      new Set(permissionIds).size !== permissionIds.length
    ) {
      throw new BadRequestException(
        t('validation.FORMAT_INVALID', {
          args: { field: t('field.PERMISSION') },
        }),
      );
    }

    return this.roleRepository.manager.transaction(async (manager) => {
      const roleRepository = manager.getRepository(Role);
      const permissionRepository = manager.getRepository(Permission);
      const rolePermissionRepository = manager.getRepository(RolePermission);

      const permissions = await permissionRepository.findBy({
        id: In(permissionIds),
      });

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException(
          t('NOT_FOUND', { args: { item: t('field.PERMISSION') } }),
        );
      }

      if (permissions.some((item) => item.channel !== channel)) {
        throw new BadRequestException(
          t('validation.FORMAT_INVALID', {
            args: { field: t('field.PERMISSION') },
          }),
        );
      }

      const role = await roleRepository.save(
        roleRepository.create({
          name,
          description,
          channel,
          isActive,
        }),
      );

      await rolePermissionRepository.insert(
        permissions.map((item) => ({
          roleId: role.id,
          permissionId: item.id,
        })),
      );

      return roleRepository.findOneOrFail({
        where: { id: role.id },
        relations: { rolePermissions: { permission: true } },
      });
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { name, description, channel, isActive, permission: permissionIds } =
      updateRoleDto;

    if (
      permissionIds !== undefined &&
      new Set(permissionIds).size !== permissionIds.length
    ) {
      throw new BadRequestException(
        t('validation.FORMAT_INVALID', {
          args: { field: t('field.PERMISSION') },
        }),
      );
    }

    return this.roleRepository.manager.transaction(async (manager) => {
      const roleRepository = manager.getRepository(Role);
      const permissionRepository = manager.getRepository(Permission);
      const rolePermissionRepository = manager.getRepository(RolePermission);
      const role = await roleRepository.findOne({
        where: { id },
        relations: { rolePermissions: { permission: true } },
      });

      if (!role) {
        throw new NotFoundException(
          t('NOT_FOUND', { args: { item: t('field.ROLE') } }),
        );
      }

      const targetChannel = channel ?? role.channel;
      const currentPermissionIds = (role.rolePermissions ?? []).map(
        (rolePermission) => rolePermission.permissionId,
      );
      const desiredPermissionIds = permissionIds ?? currentPermissionIds;
      const permissions = desiredPermissionIds.length
        ? await permissionRepository.findBy({
            id: In(desiredPermissionIds),
          })
        : [];

      if (permissions.length !== desiredPermissionIds.length) {
        throw new NotFoundException(
          t('NOT_FOUND', { args: { item: t('field.PERMISSION') } }),
        );
      }

      if (permissions.some((item) => item.channel !== targetChannel)) {
        throw new BadRequestException(
          t('validation.FORMAT_INVALID', {
            args: { field: t('field.PERMISSION') },
          }),
        );
      }

      if (name !== undefined) role.name = name;
      if (description !== undefined) role.description = description;
      if (channel !== undefined) role.channel = channel;
      if (isActive !== undefined) role.isActive = isActive;

      await roleRepository.save(role);

      if (permissionIds !== undefined) {
        const desiredPermissionIdSet = new Set(permissionIds);
        const currentPermissionIdSet = new Set(currentPermissionIds);
        const removedPermissionIds = currentPermissionIds.filter(
          (permissionId) => !desiredPermissionIdSet.has(permissionId),
        );
        const addedPermissions = permissions.filter(
          (permission) => !currentPermissionIdSet.has(permission.id),
        );

        if (removedPermissionIds.length) {
          await rolePermissionRepository.delete({
            roleId: role.id,
            permissionId: In(removedPermissionIds),
          });
        }

        if (addedPermissions.length) {
          await rolePermissionRepository.insert(
            addedPermissions.map((permission) => ({
              roleId: role.id,
              permissionId: permission.id,
            })),
          );
        }
      }

      return roleRepository.findOneOrFail({
        where: { id: role.id },
        relations: { rolePermissions: { permission: true } },
      });
    });
  }

  async delete(id: string): Promise<null> {
    const role = await this.findById(id);

    return this.roleRepository.delete(role).then(() => null);
  }

  async getAllPermissions(): Promise<Permission[]> {
    const permission = await this.permissionRepository.find();
    return permission;
  }

  async getPermissionByRole(roleId: string): Promise<Permission[]> {
    const role = await this.findRole(roleId, {
      rolePermissions: { permission: true },
    });
    return role.rolePermissions.map((rolePermission) => rolePermission.permission);
  }

  async getPermissionNameByRole(roleId: string): Promise<string[]> {
    const role = await this.findRole(roleId, {
      rolePermissions: { permission: true },
    });
    return role.rolePermissions.map(
      (rolePermission) => rolePermission.permission.name,
    );
  }

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const { name, channel } = createPermissionDto;

    const permission = this.permissionRepository.create();
    Object.assign(permission, {
      name,
      channel: channel || undefined,
    });

    return this.permissionRepository.save(permission);
  }

  async deletePermission(id: string): Promise<null> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(
        t('NOT_FOUND', { args: { item: t('field.PERMISSION') } }),
      );
    }

    return this.permissionRepository.remove(permission).then(() => null);
  }
}
