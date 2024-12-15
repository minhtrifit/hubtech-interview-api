import { IsNotEmpty, IsUUID, IsArray, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  supplierId: string;

  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @IsNotEmpty()
  @IsUUID()
  statusId: string;

  @IsArray()
  @IsUUID('all', { each: true })
  productIds: string[];

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;
}
