import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { BaseEntity } from '@/entities/base.entity';
import { Supplier } from '@/supplier/entities/supplier.entity';
import { Customer } from '@/customer/entities/customer.entity';
import { OrderStatus } from '@/order_status/entities/order_status.entity';
import { Product } from '@/product/entities/product.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.orders)
  supplier: Supplier;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer: Customer;

  @ManyToOne(() => OrderStatus, (status) => status.id)
  status: OrderStatus;

  @ManyToMany(() => Product, (product) => product.orders, { cascade: true })
  @JoinTable()
  products: Product[];

  @Column('bigint')
  totalAmount: number;
}
