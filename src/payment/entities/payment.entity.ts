import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '@/entities/base.entity';
import { Order } from '@/order/entities/order.entity';
import { PaymentMethod } from '@/payment_method/entities/payment_method.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, (order) => order.id, { nullable: false })
  @JoinColumn()
  order: Order;

  @ManyToOne(() => PaymentMethod, (status) => status.id)
  method: PaymentMethod;

  @Column({ type: 'boolean', nullable: false, default: false })
  isPaid: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  amount: number;
}
