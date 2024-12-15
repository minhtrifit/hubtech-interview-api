import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  GetAll(@Query('offset') offset: string, @Query('limit') limit: string) {
    return this.productService.GetAll(
      !isNaN(+offset) ? +offset : null,
      !isNaN(+limit) ? +limit : null,
    );
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productService.getById(id);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.productService.deleteById(id);
  }
}
