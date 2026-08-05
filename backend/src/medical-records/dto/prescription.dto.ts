import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PrescriptionDto {
  @ApiProperty({
    example: 'Augmentin 1g',
  })
  @IsString()
  medicineName!: string;

  @ApiProperty({
    example: '1 Tablet',
  })
  @IsString()
  dosage!: string;

  @ApiProperty({
    example: 'Every 12 Hours',
  })
  @IsString()
  frequency!: string;

  @ApiProperty({
    example: '7 Days',
  })
  @IsString()
  duration!: string;

  @ApiPropertyOptional({
    example: 'Take after meals',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}
