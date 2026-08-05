import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

import { Gender } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    example: 'patient@test.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'Ahmed Mohamed',
  })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({
    example: '01012345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: '2000-05-15',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: 'Cairo, Egypt',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
