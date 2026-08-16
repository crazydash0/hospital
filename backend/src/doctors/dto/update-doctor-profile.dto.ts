import { IsOptional, IsString, IsNumber, MinLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'النبذة لازم تكون 10 أحرف على الأقل' })
  bio?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;
}
