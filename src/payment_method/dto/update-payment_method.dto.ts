import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentMethodDto } from './create-payment_method.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePaymentMethodDto extends PartialType(
  CreatePaymentMethodDto,
) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;
}
