import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity.js';
import { StoreUser } from './store-user.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('stores')
export class Store extends BaseEntity {
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'receipt_footer_text', type: 'text', nullable: true })
  receiptFooterText: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @OneToMany(() => StoreUser, (storeUser) => storeUser.store)
  storeUsers: StoreUser[];
}
