import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class RegisterDoctorDto {
  @ApiProperty({ example: 'doctor@clinic.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Dr. Ahmed Mohamed' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'Dermatology' })
  @IsString()
  specialty!: string;

  @ApiProperty({ example: 300 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'Al-Shifa Clinic' })
  @IsString()
  clinicName!: string;

  @ApiPropertyOptional({ example: 'al-shifa-clinic' })
  @IsOptional()
  @IsString()
  clinicSlug?: string;

  @ApiPropertyOptional({ example: '01012345678' })
  @IsOptional()
  @IsString()
  clinicPhone?: string;

  @ApiPropertyOptional({ example: 'Cairo, Egypt' })
  @IsOptional()
  @IsString()
  clinicAddress?: string;
}
