import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class RegisterDoctorDto {
  @ApiProperty({ example: 'doctor@clinic.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'Dr. Ahmed Mohamed' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty({ example: 'Dermatology' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  specialty!: string;

  @ApiProperty({ example: 300 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'Al-Shifa Clinic' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  clinicName!: string;

  @ApiPropertyOptional({ example: 'al-shifa-clinic' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  clinicSlug?: string;

  @ApiPropertyOptional({ example: '01012345678' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  clinicPhone?: string;

  @ApiPropertyOptional({ example: 'Cairo, Egypt' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  clinicAddress?: string;
}
