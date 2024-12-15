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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  getAll(@Query('offset') offset: string, @Query('limit') limit: string) {
    return this.customerService.getAll(
      !isNaN(+offset) ? +offset : null,
      !isNaN(+limit) ? +limit : null,
    );
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.customerService.getById(id);
  }

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Patch(':id')
  updateById(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.updateById(id, updateCustomerDto);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.customerService.deleteById(id);
  }
}
