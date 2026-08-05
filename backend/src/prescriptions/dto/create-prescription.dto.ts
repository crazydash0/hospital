import { IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  medicineName!: string;

  @IsString()
  dosage!: string;

  @IsString()
  frequency!: string;

  @IsString()
  duration!: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}
