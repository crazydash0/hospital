import { IsOptional, IsString, IsNumber, MinLength, MaxLength, Min } from 'class-validator';
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

  @IsOptional()
  @IsString()
  @MaxLength(300)
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  whatsappUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  websiteUrl?: string;
}
