import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment_method.service';
import { PaymentMethodController } from './payment_method.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment_method.entity';
import { PaymentMethodSeeder } from './helpers/payment_method.seeder';
import { HelpersService } from '@/helpers/helpers.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService, PaymentMethodSeeder, HelpersService],
})
export class PaymentMethodModule {}
