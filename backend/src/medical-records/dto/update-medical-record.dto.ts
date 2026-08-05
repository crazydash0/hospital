import { IsOptional, IsString } from 'class-validator';
import { PrescriptionDto } from './prescription.dto';

export class UpdateMedicalRecordDto {
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  additionalInstructions?: string;

  prescriptions?: PrescriptionDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
