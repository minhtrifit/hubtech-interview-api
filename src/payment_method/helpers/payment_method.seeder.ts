import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaymentMethod } from '../entities/payment_method.entity';
import { PAYMENT_METHODS } from '@/constants';

@Injectable()
export class PaymentMethodSeeder implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    const repository = this.dataSource.getRepository(PaymentMethod);

    for (const method of PAYMENT_METHODS) {
      const exists = await repository.findOne({
        where: { name: method.name, description: method.description },
      });

      if (!exists) {
        const newMethod = repository.create({
          name: method.name,
          description: method.description,
        });

        await repository.save(newMethod);
      }
    }
  }
}
