import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateSlotsDto {
  @ApiProperty({
    example: '2026-08-20',
    description: 'Date for slots',
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    example: 9,
    description: 'Working day start hour',
  })
  @IsInt()
  @Min(0)
  @Max(23)
  startHour!: number;

  @ApiProperty({
    example: 17,
    description: 'Working day end hour',
  })
  @IsInt()
  @Min(1)
  @Max(23)
  endHour!: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Appointment duration in minutes (default 30)',
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  duration?: number;
}