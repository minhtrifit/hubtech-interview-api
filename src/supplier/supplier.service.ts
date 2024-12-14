import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { Repository } from 'typeorm';
import { HelpersService } from '@/helpers/helpers.service';
import { HttpStatusCodes } from '@/utils';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    private readonly helpersService: HelpersService,
  ) {}

  async GetAll(offset: number | null, limit: number | null) {
    const skip = offset ?? 0;
    const take = limit ?? (offset !== null ? 1000 : 10);

    const [resData, total] = await this.supplierRepository.findAndCount({
      skip: skip,
      take: take,
      order: {
        createdAt: 'DESC',
      },
    });

    return this.helpersService.createResponse(
      'Get all supplier successfully',
      {
        data: resData,
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

    const resData = await this.supplierRepository.findOne({ where: { id } });

    if (!resData) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Supplier not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    return this.helpersService.createResponse(
      'Get supplier by id successfully',
      resData,
      null,
      HttpStatusCodes.OK,
    );
  }

  async create(data: CreateSupplierDto) {
    // Check is unique
    const existingSupplier = await this.supplierRepository.findOne({
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

    // Create new supplier
    const supplier = this.supplierRepository.create(data);
    const resData = await this.supplierRepository.save(supplier);

    return this.helpersService.createResponse(
      'Create new supplier successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }

  async updateById(id: string, updateSupplierDto: UpdateSupplierDto) {
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

    const supplier = await this.supplierRepository.findOne({ where: { id } });

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

    await this.supplierRepository.update(id, updateSupplierDto);
    const resData = await this.supplierRepository.findOne({ where: { id } });

    return this.helpersService.createResponse(
      'Update supplier by id successfully',
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

    const supplier = await this.supplierRepository.findOne({ where: { id } });

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

    const resData = await this.supplierRepository.delete(id);

    return this.helpersService.createResponse(
      'Delete new supplier successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }
}
