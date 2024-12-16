import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@/entities/base.entity';
import { Inventory } from './inventory.entity';
import { Product } from '@/product/entities/product.entity';

@Entity()
export class InventoryItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inventory, (inventory) => inventory.id, { nullable: false })
  //   @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @ManyToOne(() => Product, (product) => product.id, { nullable: false })
  //   @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', nullable: false })
  quantity: number;
}
