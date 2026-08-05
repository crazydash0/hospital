import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { Type } from 'class-transformer';

export class GetMedicalRecordsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 10;

  @IsOptional()
  @IsString()
  diagnosis?: string;
}
