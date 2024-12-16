import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
import { Order } from '../../order/entities/order.entity';
import { Inventory } from '@/inventory/entities/inventory.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @OneToMany(() => Order, (order) => order.supplier)
  orders: Order[];

  @OneToMany(() => Inventory, (inventory) => inventory.supplier)
  inventories: Inventory[];
}
