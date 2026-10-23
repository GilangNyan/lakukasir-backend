import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity.js';
import { StoreUser } from '../../stores/entities/store-user.entity.js';

@Entity('users')
@Index('idx_users_email_unique', ['email'], {
  unique: true,
  where: 'email IS NOT NULL',
})
@Index('idx_users_phone_unique', ['phone'], {
  unique: true,
  where: 'phone IS NOT NULL',
})
export class User extends BaseEntity {
  @Column({ name: 'firebase_uid', length: 128, unique: true, nullable: true })
  firebaseUid: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => StoreUser, (storeUser) => storeUser.user)
  storeUsers: StoreUser[];
}
