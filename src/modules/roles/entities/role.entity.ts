import { Column, Entity, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity.js';
import { StoreUser } from '../../stores/entities/store-user.entity.js';
import { RolePermission } from './role-permission.entity.js';
import { Channel } from '../../../common/enums/channel.enum.js';
import { AdminUser } from '../../users/entities/admin-user.entity.js';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: Channel, default: Channel.CLIENT })
  channel: Channel;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => StoreUser, (storeUser) => storeUser.role)
  storeUsers: Relation<StoreUser[]>;
  
  @OneToMany(() => AdminUser, (adminUser) => adminUser.role)
  adminRoles: Relation<AdminUser[]>;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: Relation<RolePermission[]>;
}
