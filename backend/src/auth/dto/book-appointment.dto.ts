import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class BookAppointmentDto {
  @ApiProperty({
    example: 1,
    description: 'Slot ID',
  })
  @IsInt()
  @Min(1)
  slotId!: number;
}
