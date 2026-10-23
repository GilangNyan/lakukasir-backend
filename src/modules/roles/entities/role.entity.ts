import { BaseEntity, Column, Entity, OneToMany } from 'typeorm';
import { StoreUser } from '../../stores/entities/store-user.entity.js';
import { RolePermission } from './role-permission.entity.js';
import { Channel } from '../enums/channel.enum.js';

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
  storeUsers: StoreUser[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];
}
