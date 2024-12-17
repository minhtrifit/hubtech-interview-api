import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@/order/entities/order.entity';
import { HelpersService } from '@/helpers/helpers.service';
import { Payment } from './entities/payment.entity';
import { PaymentMethod } from '@/payment_method/entities/payment_method.entity';
import { HttpStatusCodes } from '@/utils';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    private readonly helpersService: HelpersService,
  ) {}

  async GetAll(offset: number | null, limit: number | null) {
    const skip = offset ?? 0;
    const take = limit ?? (offset !== null ? 1000 : 10);

    const [resData, total] = await this.paymentRepository.findAndCount({
      skip: skip,
      take: take,
      order: {
        createdAt: 'DESC',
      },
      relations: [
        'method',
        'order',
        'order.supplier',
        'order.customer',
        'order.status',
        'order.items',
        'order.items.product',
      ],
    });

    return this.helpersService.createResponse(
      'Get all payment successfully',
      {
        payments: resData,
        total: resData?.length,
        offset: skip,
        limit: take,
      },
      null,
      HttpStatusCodes.OK,
    );
  }

  async getByPaymentId(id: string) {
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

    const resData = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        'method',
        'order',
        'order.supplier',
        'order.customer',
        'order.status',
        'order.items',
        'order.items.product',
      ],
    });

    if (!resData) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Payment not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    return this.helpersService.createResponse(
      'Get payment by id successfully',
      resData,
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

    const resData = await this.paymentRepository.findOne({
      where: { order: { id: id } },
      relations: [
        'method',
        'order',
        'order.supplier',
        'order.customer',
        'order.status',
        'order.items',
        'order.items.product',
      ],
    });

    if (!resData) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Payment not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    return this.helpersService.createResponse(
      'Get payment by order id successfully',
      resData,
      null,
      HttpStatusCodes.OK,
    );
  }

  async findOne(id: string): Promise<Payment> {
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

    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        'method',
        'order',
        'order.supplier',
        'order.customer',
        'order.status',
        'order.items',
        'order.items.product',
      ],
    });

    if (!payment) throw new NotFoundException('Payment not found');

    return payment;
  }

  async create(data: CreatePaymentDto) {
    const { orderId, methodId, amount, isPaid } = data;

    // Check order
    const order = await this.orderRepository.findOneBy({
      id: orderId,
    });

    if (!order) throw new NotFoundException('Order not found');

    const existingOrder = await this.paymentRepository.findOneBy({
      order: { id: order.id },
    });

    if (existingOrder)
      throw new BadRequestException('Order payment is already exist');

    // Check payment method
    const paymentMethod = await this.paymentMethodRepository.findOneBy({
      id: methodId,
    });

    if (!paymentMethod) throw new NotFoundException('Payment method not found');

    // Create new payment
    const payment = this.paymentRepository.create({
      order: order,
      method: paymentMethod,
      isPaid: isPaid,
      amount: amount,
    });

    // Save payment
    const newPayment = await this.paymentRepository.save(payment);

    const resData = await this.paymentRepository.findOne({
      where: { id: newPayment.id },
      relations: [
        'method',
        'order',
        'order.supplier',
        'order.customer',
        'order.status',
        'order.items',
        'order.items.product',
      ],
    });

    return this.helpersService.createResponse(
      'Create new payment successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }

  async updateById(id: string, data: UpdatePaymentDto) {
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

    const { orderId, methodId, amount, isPaid } = data;

    // Check payment
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        'method',
        'order',
        'order.supplier',
        'order.customer',
        'order.status',
        'order.items',
        'order.items.product',
      ],
    });

    if (!payment) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Payment not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    // Check order
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
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

    const existingOrder = await this.paymentRepository.findOne({
      where: { id: id, order: { id: order.id } },
      relations: [
        'method',
        'order',
        'order.supplier',
        'order.customer',
        'order.status',
        'order.items',
        'order.items.product',
      ],
    });

    if (existingOrder)
      throw new BadRequestException('Order payment is already exist');

    // Check payment method
    const paymentMethod = await this.paymentMethodRepository.findOneBy({
      id: methodId,
    });

    if (!paymentMethod) throw new NotFoundException('Payment method not found');

    // Update new payment
    if (orderId) payment.order = order;
    if (methodId) payment.method = paymentMethod;
    if (amount) payment.amount = amount;
    if (isPaid) payment.isPaid = isPaid;

    // Save new payment
    await this.paymentRepository.save(payment);

    const resData = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        'method',
        'order',
        'order.supplier',
        'order.customer',
        'order.status',
        'order.items',
        'order.items.product',
      ],
    });

    return this.helpersService.createResponse(
      'Update payment by id successfully',
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

    const payment = await this.findOne(id);

    if (!payment) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Payment not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    // Delete payment
    const resData = await this.paymentRepository.remove(payment);

    return this.helpersService.createResponse(
      'Delete payment by id successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }
}
