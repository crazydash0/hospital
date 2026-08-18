import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsInt()
  appointmentId!: number;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;
}
