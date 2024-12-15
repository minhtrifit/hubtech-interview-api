import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderStatus } from '../entities/order_status.entity';
import { STATUSES } from '@/constants';

@Injectable()
export class StatusSeeder implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    const repository = this.dataSource.getRepository(OrderStatus);

    for (const status of STATUSES) {
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
