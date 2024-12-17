import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentMethodDto } from './dto/create-payment_method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment_method.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment_method.entity';
import { Repository } from 'typeorm';
import { HelpersService } from '@/helpers/helpers.service';
import { HttpStatusCodes } from '@/utils';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    private readonly helpersService: HelpersService,
  ) {}

  async GetAll(offset: number | null, limit: number | null) {
    const skip = offset ?? 0;
    const take = limit ?? (offset !== null ? 1000 : 10);

    const [resData, total] = await this.paymentMethodRepository.findAndCount({
      skip: skip,
      take: take,
      order: {
        createdAt: 'DESC',
      },
    });

    return this.helpersService.createResponse(
      'Get all payment method successfully',
      {
        order_status: resData,
        total: resData?.length,
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

    const resData = await this.paymentMethodRepository.findOne({
      where: { id },
    });

    if (!resData) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Payment method not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    return this.helpersService.createResponse(
      'Get payment method by id successfully',
      resData,
      null,
      HttpStatusCodes.OK,
    );
  }

  async create(data: CreatePaymentMethodDto) {
    // Check is unique
    const existingPaymentMethod = await this.paymentMethodRepository.findOne({
      where: [{ name: data.name }],
    });

    if (existingPaymentMethod) {
      throw new ConflictException(
        this.helpersService.createResponse(
          'Payment method is already exist',
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    // Check is init value
    if (this.helpersService.isInitOrderStatus(data.name, data.description)) {
      throw new ConflictException(
        this.helpersService.createResponse(
          `Cannot create init payment method: "${data.name}" - "${data.description}".`,
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    // Create new payment method
    const orderStatus = this.paymentMethodRepository.create(data);
    const resData = await this.paymentMethodRepository.save(orderStatus);

    return this.helpersService.createResponse(
      'Create new payment successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }

  async updateById(id: string, data: UpdatePaymentMethodDto) {
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

    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Payment method not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    // Check is unique
    if (data.name) {
      const existingPaymentMethod = await this.paymentMethodRepository.findOne({
        where: [{ name: data.name }],
      });

      if (existingPaymentMethod) {
        throw new ConflictException(
          this.helpersService.createResponse(
            'Payment method name is already exist',
            null,
            'Conflict',
            HttpStatusCodes.CONFLICT,
          ),
        );
      }
    }

    // Check is init value
    if (
      this.helpersService.isInitOrderStatus(
        paymentMethod.name,
        paymentMethod.description,
      )
    ) {
      throw new ConflictException(
        this.helpersService.createResponse(
          `Cannot update init payment method: "${paymentMethod.name}" - "${paymentMethod.description}".`,
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    await this.paymentMethodRepository.update(id, data);
    const resData = await this.paymentMethodRepository.findOne({
      where: { id },
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

    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Payment method not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    // Check is init value
    if (
      this.helpersService.isInitOrderStatus(
        paymentMethod.name,
        paymentMethod.description,
      )
    ) {
      throw new ConflictException(
        this.helpersService.createResponse(
          `Cannot delete init payment method: "${paymentMethod.name}" - "${paymentMethod.description}".`,
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    const resData = await this.paymentMethodRepository.delete(id);

    return this.helpersService.createResponse(
      'Delete payment method by id successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }
}
