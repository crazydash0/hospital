import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({
    example: 'doctor@test.com',
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

  @ApiProperty({
    example: 'Cardiology',
  })
  @IsString()
  specialty!: string;

  @ApiProperty({
    example: 300,
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    example: 'Specialist in heart diseases',
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
