import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '@/supplier/entities/supplier.entity';
import { Product } from '@/product/entities/product.entity';
import { Inventory } from './entities/inventory.entity';
import { InventoryItem } from './entities/inventory_item.entity';
import { HelpersService } from '@/helpers/helpers.service';
import { HttpStatusCodes } from '@/utils';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
    private readonly helpersService: HelpersService,
  ) {}

  async GetAll(offset: number | null, limit: number | null) {
    const skip = offset ?? 0;
    const take = limit ?? (offset !== null ? 1000 : 10);

    const [resData, total] = await this.inventoryRepository.findAndCount({
      skip: skip,
      take: take,
      order: {
        createdAt: 'DESC',
      },
      relations: ['supplier', 'items', 'items.product'],
    });

    return this.helpersService.createResponse(
      'Get all inventory successfully',
      {
        inventories: resData,
        total: resData?.length,
        offset: skip,
        limit: take,
      },
      null,
      HttpStatusCodes.OK,
    );
  }

  async findOne(id: string): Promise<Inventory> {
    const isValidUUID = this.helpersService.isValidUUID(id);

    if (!isValidUUID) {
      throw new BadRequestException(
        this.helpersService.createResponse(
          'Not valid id type',
          null,
          'Bad request',
          HttpStatusCodes.BAD_REQUEST,
        ),
      );
    }

    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['supplier', 'items', 'items.product'],
    });

    if (!inventory) throw new NotFoundException('Inventory not found');

    return inventory;
  }

  async getByInventoryId(id: string) {
    const isValidUUID = this.helpersService.isValidUUID(id);

    if (!isValidUUID) {
      throw new BadRequestException(
        this.helpersService.createResponse(
          'Not valid id type',
          null,
          'Bad request',
          HttpStatusCodes.BAD_REQUEST,
        ),
      );
    }

    const resData = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['supplier', 'items', 'items.product'],
    });

    if (!resData) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Inventory not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    return this.helpersService.createResponse(
      'Get inventory by id successfully',
      resData,
      null,
      HttpStatusCodes.OK,
    );
  }

  async getAllBySupplierId(
    id: string,
    offset: number | null,
    limit: number | null,
  ) {
    const isValidUUID = this.helpersService.isValidUUID(id);

    if (!isValidUUID) {
      throw new BadRequestException(
        this.helpersService.createResponse(
          'Not valid id type',
          null,
          'Bad request',
          HttpStatusCodes.BAD_REQUEST,
        ),
      );
    }

    const skip = offset ?? 0;
    const take = limit ?? (offset !== null ? 1000 : 10);

    const [resData, total] = await this.inventoryRepository.findAndCount({
      where: { supplier: { id: id } },
      skip: skip,
      take: take,
      relations: ['supplier', 'items', 'items.product'],
      order: {
        createdAt: 'DESC',
      },
    });

    return this.helpersService.createResponse(
      'Get all inventory by supplierId successfully',
      {
        inventories: resData,
        total: resData?.length,
        offset: skip,
        limit: take,
      },
      null,
      HttpStatusCodes.OK,
    );
  }

  async create(data: CreateInventoryDto) {
    const { supplierId, location, items } = data;

    // Check supplier
    const supplier = await this.supplierRepository.findOneBy({
      id: supplierId,
    });

    if (!supplier) throw new NotFoundException('Supplier not found');

    // Check products
    const products = await this.productRepository.find({
      where: items.map((item) => ({ id: item.productId })),
    });

    if (products.length !== items.length)
      throw new NotFoundException('One or more products not found');

    const inventoryItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new NotFoundException(`Product ${item.productId} not found`);

      return {
        inventory: null,
        product: { id: item.productId },
        quantity: item.quantity,
      };
    });

    // Create new inventory
    const inventory = this.inventoryRepository.create({
      supplier,
      location,
    });

    // Save inventory
    const newInventory = await this.inventoryRepository.save(inventory);

    // Save inventoryItems items
    inventoryItems.forEach(
      (inventoryItem) => (inventoryItem.inventory = newInventory),
    );

    await this.inventoryItemRepository.save(inventoryItems);

    const resData = await this.inventoryRepository.findOne({
      where: { id: newInventory.id },
      relations: ['supplier', 'items', 'items.product'],
    });

    return this.helpersService.createResponse(
      'Create new inventory successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }

  async updateById(id: string, data: UpdateInventoryDto) {
    const isValidUUID = this.helpersService.isValidUUID(id);

    if (!isValidUUID) {
      throw new BadRequestException(
        this.helpersService.createResponse(
          'Not valid id type',
          null,
          'Bad request',
          HttpStatusCodes.BAD_REQUEST,
        ),
      );
    }

    const { supplierId, location, items } = data;

    // Get inventory by id
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!inventory) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Inventory not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    // Check & update supplier
    if (supplierId) {
      const supplier = await this.supplierRepository.findOneBy({
        id: supplierId,
      });

      if (!supplier) {
        throw new NotFoundException(
          this.helpersService.createResponse(
            'Supplier not found',
            null,
            'Not found',
            HttpStatusCodes.NOT_FOUND,
          ),
        );
      }

      inventory.supplier = supplier;
    }

    // Check location
    if (location && location !== '') {
      inventory.location = location;
    }

    if (items && items?.length > 0) {
      // Delete old inventory items
      await this.inventoryItemRepository.delete({
        inventory: { id: inventory.id },
      });

      // Check products
      const products = await this.productRepository.find({
        where: items.map((item) => ({ id: item.productId })),
      });

      if (products.length !== items.length) {
        throw new NotFoundException('One or more products not found');
      }

      // Create new inventory items
      const newInventoryItems = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        return this.inventoryItemRepository.create({
          inventory,
          product,
          quantity: item.quantity,
        });
      });

      // Save new inventory items
      await this.inventoryItemRepository.save(newInventoryItems);

      inventory.items = newInventoryItems;
    }

    // Save new inventory
    await this.inventoryRepository.save(inventory);

    const resData = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['supplier', 'items', 'items.product'],
    });

    return this.helpersService.createResponse(
      'Update inventory by id successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }

  async deleteById(id: string) {
    const isValidUUID = this.helpersService.isValidUUID(id);

    if (!isValidUUID) {
      throw new BadRequestException(
        this.helpersService.createResponse(
          'Not valid id type',
          null,
          'Bad request',
          HttpStatusCodes.BAD_REQUEST,
        ),
      );
    }

    const inventory = await this.findOne(id);

    if (!inventory) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Inventory not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    // Delete inventory items
    await this.inventoryItemRepository.delete({ inventory: { id } });

    // Delete inventory
    const resData = await this.inventoryRepository.remove(inventory);

    return this.helpersService.createResponse(
      'Delete inventory by id successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }
}
