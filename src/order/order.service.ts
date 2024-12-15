import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpersService } from '@/helpers/helpers.service';
import { Supplier } from '@/supplier/entities/supplier.entity';
import { Customer } from '@/customer/entities/customer.entity';
import { OrderStatus } from '@/order_status/entities/order_status.entity';
import { Product } from '@/product/entities/product.entity';
import { HttpStatusCodes } from '@/utils';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(OrderStatus)
    private statusRepository: Repository<OrderStatus>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private readonly helpersService: HelpersService,
  ) {}

  async GetAll(offset: number | null, limit: number | null) {
    const skip = offset ?? 0;
    const take = limit ?? (offset !== null ? 1000 : 10);

    const [resData, total] = await this.orderRepository.findAndCount({
      skip: skip,
      take: take,
      order: {
        createdAt: 'DESC',
      },
      relations: ['supplier', 'customer', 'status', 'products'],
    });

    return this.helpersService.createResponse(
      'Get all order successfully',
      {
        orders: resData,
        total,
        offset: skip,
        limit: take,
      },
      null,
      HttpStatusCodes.OK,
    );
  }

  async getById(id: string) {
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

    const resData = await this.orderRepository.findOne({
      where: { id },
      relations: ['supplier', 'customer', 'status', 'products'],
    });

    if (!resData) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Order not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    return this.helpersService.createResponse(
      'Get order by id successfully',
      resData,
      null,
      HttpStatusCodes.OK,
    );
  }

  async findOne(id: string): Promise<Order> {
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

    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['supplier', 'customer', 'status', 'products'],
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async create(data: CreateOrderDto) {
    const { supplierId, customerId, statusId, productIds, totalAmount } = data;

    // Check supplier
    const supplier = await this.supplierRepository.findOneBy({
      id: supplierId,
    });

    if (!supplier) throw new NotFoundException('Supplier not found');

    // Check customer
    const customer = await this.customerRepository.findOneBy({
      id: customerId,
    });

    if (!customer) throw new NotFoundException('Customer not found');

    // Check status
    const status = await this.statusRepository.findOneBy({ id: statusId });

    if (!status) throw new NotFoundException('Status not found');

    // Check products
    const products = await this.productRepository.find({
      where: productIds.map((id) => ({ id })),
    });

    if (products.length !== productIds.length)
      throw new NotFoundException('One or more products not found');

    const order = this.orderRepository.create({
      supplier,
      customer,
      status,
      products,
      totalAmount,
    });

    return this.orderRepository.save(order);
  }

  async updateById(id: string, data: UpdateOrderDto) {
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

    const { supplierId, customerId, statusId, productIds, totalAmount } = data;
    const order = await this.findOne(id);

    // Check supplier
    if (supplierId) {
      const supplier = await this.supplierRepository.findOneBy({
        id: supplierId,
      });

      if (!supplier) throw new NotFoundException('Supplier not found');

      order.supplier = supplier;
    }

    // Check customer
    if (supplierId) {
      const customer = await this.customerRepository.findOneBy({
        id: customerId,
      });

      if (!customer) throw new NotFoundException('Customer not found');

      order.customer = customer;
    }

    // Check status
    if (statusId) {
      const status = await this.statusRepository.findOneBy({
        id: statusId,
      });

      if (!status) throw new NotFoundException('Order status not found');

      order.status = status;
    }

    // Check products
    if (productIds) {
      const products = await this.productRepository.find({
        where: productIds.map((id) => ({ id })),
      });

      if (products.length !== productIds.length)
        throw new NotFoundException('Some products not found');

      order.products = products;
    }

    // Check totalAmount
    if (totalAmount !== undefined) {
      order.totalAmount = totalAmount;
    }

    const resData = await this.orderRepository.save(order);

    return this.helpersService.createResponse(
      'Update order by id successfully',
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

    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Order not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    const resData = await this.orderRepository.remove(order);

    return this.helpersService.createResponse(
      'Delete order by id successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }
}
