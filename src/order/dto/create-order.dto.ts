import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  IsNumber,
  IsPositive,
  IsInt,
  ValidateNested,
  IsString,
} from 'class-validator';

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

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}
