import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '@/supplier/entities/supplier.entity';
import { Product } from '@/product/entities/product.entity';
import { Inventory } from './entities/inventory.entity';
import { InventoryItem } from './entities/inventory_item.entity';
import { HelpersService } from '@/helpers/helpers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier, Product, Inventory, InventoryItem]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, HelpersService],
})
export class InventoryModule {}
