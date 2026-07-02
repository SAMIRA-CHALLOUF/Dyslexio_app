import { IsArray, IsNumber, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBulkPaymentIntentDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  eleveIds!: number[];

  @IsNumber()
  @Type(() => Number)
  etablissementId!: number;

  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}