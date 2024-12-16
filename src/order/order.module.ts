import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { HelpersService } from '@/helpers/helpers.service';
import { Supplier } from '@/supplier/entities/supplier.entity';
import { Customer } from '@/customer/entities/customer.entity';
import { OrderStatus } from '@/order_status/entities/order_status.entity';
import { Product } from '@/product/entities/product.entity';
import { OrderItem } from './entities/order_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Supplier,
      Customer,
      OrderStatus,
      Product,
      OrderItem,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, HelpersService],
})
export class OrderModule {}
