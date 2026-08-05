import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

import { AttachmentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateMedicalAttachmentDto {
  @Type(() => Number)
  @IsInt()
  appointmentId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalRecordId?: number;

  @IsEnum(AttachmentType)
  type!: AttachmentType;

  @IsOptional()
  @IsString()
  notes?: string;
}
