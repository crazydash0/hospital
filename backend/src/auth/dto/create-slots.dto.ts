import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Max, Min } from 'class-validator';

export class CreateSlotsDto {
  @ApiProperty({
    example: '2026-07-01',
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
}
