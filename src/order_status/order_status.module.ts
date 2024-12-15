import { Module } from '@nestjs/common';
import { OrderStatusService } from './order_status.service';
import { OrderStatusController } from './order_status.controller';
import { StatusSeeder } from './helpers/status.seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderStatus } from './entities/order_status.entity';
import { HelpersService } from '@/helpers/helpers.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderStatus])],
  controllers: [OrderStatusController],
  providers: [OrderStatusService, StatusSeeder, HelpersService],
})
export class OrderStatusModule {}
