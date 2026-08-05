import { IsOptional, IsString } from 'class-validator';

export class UpdatePrescriptionDto {
  @IsOptional()
  @IsString()
  medicineName?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}
