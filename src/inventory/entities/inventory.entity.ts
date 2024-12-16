import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@/entities/base.entity';
import { Supplier } from '@/supplier/entities/supplier.entity';
import { InventoryItem } from './inventory_item.entity';

@Entity('inventories')
export class Inventory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.inventories)
  supplier: Supplier;

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  location: string;

  @OneToMany(() => InventoryItem, (item) => item.inventory, { cascade: true })
  items: InventoryItem[];
}
