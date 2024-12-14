import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';
import { CustomerModule } from './customer/customer.module';
import { SupplierModule } from './supplier/supplier.module';
import { OrderStatusModule } from './order_status/order_status.module';
import entities from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: entities,
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
        migrations: ['dist/migrations/*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    OrderModule,
    CustomerModule,
    SupplierModule,
    OrderStatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
