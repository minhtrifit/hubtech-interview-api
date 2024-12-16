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
import { OrderItem } from './entities/order_item.entity';

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
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
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
      relations: ['supplier', 'customer', 'status', 'items', 'items.product'],
    });

    return this.helpersService.createResponse(
      'Get all order successfully',
      {
        orders: resData,
        total: resData?.length,
        offset: skip,
        limit: take,
      },
      null,
      HttpStatusCodes.OK,
    );
  }

  async getByOrderId(id: string) {
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
      relations: ['supplier', 'customer', 'status', 'items', 'items.product'],
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

    const [resData, total] = await this.orderRepository.findAndCount({
      where: { supplier: { id: id } },
      skip: skip,
      take: take,
      relations: ['supplier', 'customer', 'status', 'items', 'items.product'],
      order: {
        createdAt: 'DESC',
      },
    });

    return this.helpersService.createResponse(
      'Get all order by supplierId successfully',
      {
        orders: resData,
        total: resData?.length,
        offset: skip,
        limit: take,
      },
      null,
      HttpStatusCodes.OK,
    );
  }

  async getAllByCustomerId(
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

    const [resData, total] = await this.orderRepository.findAndCount({
      where: { customer: { id: id } },
      skip: skip,
      take: take,
      relations: ['supplier', 'customer', 'status', 'items', 'items.product'],
      order: {
        createdAt: 'DESC',
      },
    });

    return this.helpersService.createResponse(
      'Get all order by customer successfully',
      {
        orders: resData,
        total: resData?.length,
        offset: skip,
        limit: take,
      },
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
      relations: ['supplier', 'customer', 'status', 'items', 'items.product'],
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async create(data: CreateOrderDto) {
    const { supplierId, customerId, statusId, address, items } = data;

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
      where: items.map((item) => ({ id: item.productId })),
    });

    if (products.length !== items.length)
      throw new NotFoundException('One or more products not found');

    let totalPrice = 0;

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new NotFoundException(`Product ${item.productId} not found`);

      const subTotal = product.price * item.quantity;
      totalPrice += subTotal;

      return {
        order: null,
        product: { id: item.productId },
        quantity: item.quantity,
        subtotal: subTotal,
      };
    });

    // Create new order
    const order = this.orderRepository.create({
      supplier,
      customer,
      status,
      address,
      totalPrice,
    });

    // Save order
    const newOrder = await this.orderRepository.save(order);

    // Save order items
    orderItems.forEach((orderItem) => (orderItem.order = newOrder));
    await this.orderItemRepository.save(orderItems);

    const resData = await this.orderRepository.findOne({
      where: { id: newOrder.id },
      relations: ['supplier', 'customer', 'status', 'items', 'items.product'],
    });

    return this.helpersService.createResponse(
      'Create new order successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
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

    const { supplierId, customerId, statusId, address, items } = data;

    // Get order by id
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

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

      order.supplier = supplier;
    }

    // Check & update customer
    if (customerId) {
      const customer = await this.customerRepository.findOneBy({
        id: customerId,
      });

      if (!customer) {
        throw new NotFoundException(
          this.helpersService.createResponse(
            'Customer not found',
            null,
            'Not found',
            HttpStatusCodes.NOT_FOUND,
          ),
        );
      }

      order.customer = customer;
    }

    // Check & update status
    if (statusId) {
      const status = await this.statusRepository.findOneBy({
        id: statusId,
      });

      if (!status) {
        throw new NotFoundException(
          this.helpersService.createResponse(
            'Status not found',
            null,
            'Not found',
            HttpStatusCodes.NOT_FOUND,
          ),
        );
      }

      order.status = status;
    }

    // Check address
    if (address && address !== '') {
      order.address = address;
    }

    if (items && items?.length > 0) {
      // Delete old order items
      await this.orderItemRepository.delete({ order: { id: order.id } });

      // Check products
      const products = await this.productRepository.find({
        where: items.map((item) => ({ id: item.productId })),
      });

      if (products.length !== items.length) {
        throw new NotFoundException('One or more products not found');
      }

      // Create new order items
      let totalPrice = 0;

      const newOrderItems = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        const subTotal = product.price * item.quantity;
        totalPrice += subTotal;

        return this.orderItemRepository.create({
          order,
          product,
          quantity: item.quantity,
          subtotal: subTotal,
        });
      });

      // Save new order items
      await this.orderItemRepository.save(newOrderItems);

      order.items = newOrderItems;
      order.totalPrice = totalPrice;
    }

    // Save new order
    await this.orderRepository.save(order);

    const resData = await this.orderRepository.findOne({
      where: { id },
      relations: ['supplier', 'customer', 'status', 'items', 'items.product'],
    });

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

    // Delete order items
    await this.orderItemRepository.delete({ order: { id } });

    // Delete order
    const resData = await this.orderRepository.remove(order);

    return this.helpersService.createResponse(
      'Delete order by id successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }
}
