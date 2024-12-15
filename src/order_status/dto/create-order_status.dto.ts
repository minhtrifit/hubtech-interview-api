import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
