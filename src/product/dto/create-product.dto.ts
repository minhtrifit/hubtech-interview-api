import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  price: number;

  @IsOptional()
  @IsString()
  description?: string;
}
