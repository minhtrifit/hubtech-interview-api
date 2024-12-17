import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@/order/entities/order.entity';
import { Supplier } from '@/supplier/entities/supplier.entity';
import { Customer } from '@/customer/entities/customer.entity';
import { OrderStatus } from '@/order_status/entities/order_status.entity';
import { Product } from '@/product/entities/product.entity';
import { OrderItem } from '@/order/entities/order_item.entity';
import { PaymentMethod } from '@/payment_method/entities/payment_method.entity';
import { HelpersService } from '@/helpers/helpers.service';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Supplier,
      Customer,
      OrderStatus,
      Product,
      OrderItem,
      Payment,
      PaymentMethod,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, HelpersService],
})
export class PaymentModule {}
