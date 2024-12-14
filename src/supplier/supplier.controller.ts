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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  GetAll(@Query('offset') offset: string, @Query('limit') limit: string) {
    return this.supplierService.GetAll(
      !isNaN(+offset) ? +offset : null,
      !isNaN(+limit) ? +limit : null,
    );
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.supplierService.getById(id);
  }

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Patch(':id')
  updateById(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.updateById(id, updateSupplierDto);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.supplierService.deleteById(id);
  }
}
