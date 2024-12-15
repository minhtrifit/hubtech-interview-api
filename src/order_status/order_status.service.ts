import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderStatusDto } from './dto/create-order_status.dto';
import { UpdateOrderStatusDto } from './dto/update-order_status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from './entities/order_status.entity';
import { Repository } from 'typeorm';
import { HelpersService } from '@/helpers/helpers.service';
import { HttpStatusCodes } from '@/utils';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(OrderStatus)
    private orderStatusRepository: Repository<OrderStatus>,
    private readonly helpersService: HelpersService,
  ) {}

  async GetAll(offset: number | null, limit: number | null) {
    const skip = offset ?? 0;
    const take = limit ?? (offset !== null ? 1000 : 10);

    const [resData, total] = await this.orderStatusRepository.findAndCount({
      skip: skip,
      take: take,
      order: {
        createdAt: 'DESC',
      },
    });

    return this.helpersService.createResponse(
      'Get all order status successfully',
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

    const resData = await this.orderStatusRepository.findOne({ where: { id } });

    if (!resData) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Order status not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    return this.helpersService.createResponse(
      'Get order status by id successfully',
      resData,
      null,
      HttpStatusCodes.OK,
    );
  }

  async create(data: CreateOrderStatusDto) {
    // Check is unique
    const existingOrderStatus = await this.orderStatusRepository.findOne({
      where: [{ code: data.code }],
    });

    if (existingOrderStatus) {
      throw new ConflictException(
        this.helpersService.createResponse(
          'Code is already exist',
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    // Check is init value
    if (this.helpersService.isInitOrderStatus(data.name, data.code)) {
      throw new ConflictException(
        this.helpersService.createResponse(
          `Cannot create init order status: "${data.name}" - "${data.code}".`,
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    // Create new order status
    const orderStatus = this.orderStatusRepository.create(data);
    const resData = await this.orderStatusRepository.save(orderStatus);

    return this.helpersService.createResponse(
      'Create new order status successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }

  async updateById(id: string, data: UpdateOrderStatusDto) {
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

    const orderStatus = await this.orderStatusRepository.findOne({
      where: { id },
    });

    if (!orderStatus) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Order status not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    // Check is unique
    if (data.code) {
      const existingOrderStatus = await this.orderStatusRepository.findOne({
        where: [{ code: data.code }],
      });

      if (existingOrderStatus) {
        throw new ConflictException(
          this.helpersService.createResponse(
            'Code is already exist',
            null,
            'Conflict',
            HttpStatusCodes.CONFLICT,
          ),
        );
      }
    }

    // Check is init value
    if (
      this.helpersService.isInitOrderStatus(orderStatus.name, orderStatus.code)
    ) {
      throw new ConflictException(
        this.helpersService.createResponse(
          `Cannot update init order status: "${orderStatus.name}" - "${orderStatus.code}".`,
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    await this.orderStatusRepository.update(id, data);
    const resData = await this.orderStatusRepository.findOne({ where: { id } });

    return this.helpersService.createResponse(
      'Update order status by id successfully',
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

    const orderStatus = await this.orderStatusRepository.findOne({
      where: { id },
    });

    if (!orderStatus) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Order status not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    // Check is init value
    if (
      this.helpersService.isInitOrderStatus(orderStatus.name, orderStatus.code)
    ) {
      throw new ConflictException(
        this.helpersService.createResponse(
          `Cannot delete init order status: "${orderStatus.name}" - "${orderStatus.code}".`,
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    const resData = await this.orderStatusRepository.delete(id);

    return this.helpersService.createResponse(
      'Delete order status by id successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }
}
