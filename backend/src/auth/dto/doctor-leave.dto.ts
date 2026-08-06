import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CreateLeaveDto {
  @ApiProperty({ example: '2026-08-25' })
  @IsDateString()
  date!: string;
}