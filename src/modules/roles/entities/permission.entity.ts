import { Column, Entity, OneToMany, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity.js';
import { RolePermission } from './role-permission.entity.js';
import { Channel } from '../../../common/enums/channel.enum.js';

@Entity('permissions')
@Unique(['name', 'channel'])
export class Permission extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: Channel, default: Channel.CLIENT })
  channel: Channel;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: Relation<RolePermission[]>;
}
