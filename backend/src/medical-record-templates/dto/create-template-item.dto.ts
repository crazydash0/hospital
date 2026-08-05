import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  ValidateIf,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

import { FieldType } from '@prisma/client';

export class CreateTemplateItemDto {
  @IsString()
  label!: string;

  @IsString()
  key!: string;

  @IsEnum(FieldType)
  type!: FieldType;

  @IsBoolean()
  required!: boolean;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @ValidateIf((item) => item.type === FieldType.SELECT)
  @IsArray()
  @ArrayMinSize(1)
  options?: any;

  @IsInt()
  displayOrder!: number;
}
