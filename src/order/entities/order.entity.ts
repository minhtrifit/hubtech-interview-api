import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/entities/base.entity';
import { Supplier } from '@/supplier/entities/supplier.entity';
import { Customer } from '@/customer/entities/customer.entity';
import { OrderStatus } from '@/order_status/entities/order_status.entity';

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

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;
}
