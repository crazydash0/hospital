import {
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrescriptionDto } from './prescription.dto';

export class CreateMedicalRecordDto {
  @ApiProperty({
    example: 15,
  })
  @IsInt()
  appointmentId?: number;

  @ApiProperty({
    example: 'Acute Sinusitis',
  })
  @IsString()
  diagnosis!: string;

  @ApiPropertyOptional({
    example: 'Patient should drink plenty of water and rest.',
  })
  @IsOptional()
  @IsString()
  additionalInstructions?: string;

  @ApiPropertyOptional({
    example: 'Patient is stable.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [PrescriptionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionDto)
  prescriptions!: PrescriptionDto[];
}
