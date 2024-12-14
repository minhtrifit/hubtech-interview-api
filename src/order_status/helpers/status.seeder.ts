import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderStatus } from '../entities/order_status.entity';

@Injectable()
export class StatusSeeder implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    const repository = this.dataSource.getRepository(OrderStatus);

    const statuses = [
      {
        name: 'Nhận đơn',
        code: 'pending',
      },
      {
        name: 'Soạn hàng',
        code: 'preparing',
      },
      {
        name: 'Giao hàng',
        code: 'shipping',
      },
      {
        name: 'Hoàn thành',
        code: 'completed',
      },
    ];

    for (const status of statuses) {
      const exists = await repository.findOne({
        where: { name: status.name, code: status.code },
      });

      if (!exists) {
        const newStatus = repository.create({
          name: status.name,
          code: status.code,
        });

        await repository.save(newStatus);
      }
    }
  }
}
