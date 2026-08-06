import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class SetWeeklyTemplateDto {
  @ApiProperty({ example: 0, description: '0=Sunday ... 6=Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: 9 })
  @IsInt()
  @Min(0)
  @Max(23)
  startHour!: number;

  @ApiProperty({ example: 17 })
  @IsInt()
  @Min(1)
  @Max(23)
  endHour!: number;

  @ApiProperty({ example: 30, required: false })
  @IsInt()
  @Min(5)
  @Max(240)
  duration!: number;
}