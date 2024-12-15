import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  supplierId?: string;
  customerId?: string;
  statusId?: string;
  productIds?: string[];
  totalAmount?: number;
}
