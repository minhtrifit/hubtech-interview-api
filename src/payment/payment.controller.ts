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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  GetAll(@Query('offset') offset: string, @Query('limit') limit: string) {
    return this.paymentService.GetAll(
      !isNaN(+offset) ? +offset : null,
      !isNaN(+limit) ? +limit : null,
    );
  }

  @Get('/payment-id/:id')
  getByPaymentId(@Param('id') id: string) {
    return this.paymentService.getByPaymentId(id);
  }

  @Get('/order-id/:id')
  getByOrderId(@Param('id') id: string) {
    return this.paymentService.getByOrderId(id);
  }

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Patch(':id')
  @HttpCode(201)
  updateById(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.updateById(id, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(201)
  deleteById(@Param('id') id: string) {
    return this.paymentService.deleteById(id);
  }
}
