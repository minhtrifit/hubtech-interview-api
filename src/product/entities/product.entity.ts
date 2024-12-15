import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Order } from '@/order/entities/order.entity';
import { BaseEntity } from '@/entities/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'decimal', nullable: false })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Order, (order) => order.products)
  orders: Order[];
}
