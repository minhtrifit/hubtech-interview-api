import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  GetAll(@Query('offset') offset: string, @Query('limit') limit: string) {
    return this.orderService.GetAll(
      !isNaN(+offset) ? +offset : null,
      !isNaN(+limit) ? +limit : null,
    );
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.orderService.getById(id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Patch(':id')
  @HttpCode(201)
  updateById(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.updateById(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(201)
  deleteById(@Param('id') id: string) {
    return this.orderService.deleteById(id);
  }
}
