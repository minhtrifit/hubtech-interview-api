import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { HelpersService } from '@/helpers/helpers.service';
import { HttpStatusCodes } from '@/utils';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly helpersService: HelpersService,
  ) {}

  async GetAll(offset: number | null, limit: number | null) {
    const skip = offset ?? 0;
    const take = limit ?? (offset !== null ? 1000 : 10);

    const [resData, total] = await this.productRepository.findAndCount({
      skip: skip,
      take: take,
      order: {
        createdAt: 'DESC',
      },
    });

    return this.helpersService.createResponse(
      'Get all product successfully',
      {
        products: resData,
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

    const resData = await this.productRepository.findOne({ where: { id } });

    if (!resData) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Product not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    return this.helpersService.createResponse(
      'Get product by id successfully',
      resData,
      null,
      HttpStatusCodes.OK,
    );
  }

  async create(data: CreateProductDto) {
    // Create new product
    const product = this.productRepository.create(data);
    const resData = await this.productRepository.save(product);

    return this.helpersService.createResponse(
      'Create new product successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }

  async update(id: string, data: UpdateProductDto) {
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

    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Product not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    await this.productRepository.update(id, data);
    const resData = await this.productRepository.findOne({ where: { id } });

    return this.helpersService.createResponse(
      'Update product by id successfully',
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

    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(
        this.helpersService.createResponse(
          'Product not found',
          null,
          'Not found',
          HttpStatusCodes.NOT_FOUND,
        ),
      );
    }

    const resData = await this.productRepository.delete(id);

    return this.helpersService.createResponse(
      'Delete product by id successfully',
      resData,
      null,
      HttpStatusCodes.CREATED,
    );
  }
}
