import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { HelpersService } from '@/helpers/helpers.service';
import { HttpStatusCodes } from '@/utils';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private readonly helpersService: HelpersService,
  ) {}

  async getAll(offset: number | null, limit: number | null) {
    const skip = offset ?? 0;
    const take = limit ?? (offset !== null ? 1000 : 10);

    const [resData, total] = await this.customerRepository.findAndCount({
      skip: skip,
      take: take,
      order: {
        createdAt: 'DESC',
      },
    });

    return this.helpersService.createResponse(
      'Get all customer successfully',
      {
        customers: resData,
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

    const resData = await this.customerRepository.findOne({ where: { id } });

    if (!resData) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Customer not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    return this.helpersService.createResponse(
      'Get customer by id successfully',
      resData,
      null,
      HttpStatusCodes.OK,
    );
  }

  async create(data: CreateCustomerDto) {
    // Check is unique
    const existingSupplier = await this.customerRepository.findOne({
      where: [{ email: data.email }, { phone: data.phone }],
    });

    if (existingSupplier) {
      throw new ConflictException(
        this.helpersService.createResponse(
          'Email or phone is already exist',
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    // Create new customer
    const customer = this.customerRepository.create(data);
    const resData = await this.customerRepository.save(customer);

    return this.helpersService.createResponse(
      'Create new customer successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }

  async updateById(id: string, data: UpdateCustomerDto) {
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

    const customer = await this.customerRepository.findOne({ where: { id } });

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

    // Check is unique
    const existingCustomer = await this.customerRepository.findOne({
      where: [{ email: data.email }, { phone: data.phone }],
    });

    if (existingCustomer) {
      throw new ConflictException(
        this.helpersService.createResponse(
          'Email or phone is already exist',
          null,
          'Conflict',
          HttpStatusCodes.CONFLICT,
        ),
      );
    }

    await this.customerRepository.update(id, data);
    const resData = await this.customerRepository.findOne({ where: { id } });

    return this.helpersService.createResponse(
      'Update customer by id successfully',
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

    const supplier = await this.customerRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Customer not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    const resData = await this.customerRepository.delete(id);

    return this.helpersService.createResponse(
      'Delete customer by id successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }
}
