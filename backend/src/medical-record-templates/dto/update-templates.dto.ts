import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TemplateVisibility } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTemplateItemDto } from './create-template-item.dto';

export class UpdateTemplateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({ enum: TemplateVisibility, required: false })
  @IsOptional()
  @IsEnum(TemplateVisibility)
  visibility?: TemplateVisibility;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiProperty({ type: [CreateTemplateItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateItemDto)
  items?: CreateTemplateItemDto[];
}
