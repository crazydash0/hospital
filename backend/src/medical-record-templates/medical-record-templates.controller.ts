import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MedicalRecordTemplatesService } from './medical-record-templates.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CreateTemplateDto } from './dto/create-templates.dto';
import { UpdateTemplateDto } from './dto/update-templates.dto';

@ApiTags('Medical Record Templates')
@ApiBearerAuth()
@Controller('medical-record-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordTemplatesController {
  constructor(private readonly service: MedicalRecordTemplatesService) {}

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Post()
  create(@Req() req, @Body() dto: CreateTemplateDto) {
    return this.service.createTemplate(req.user.userId, req.user.role, dto);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Get()
  findAll(@Req() req) {
    return this.service.findAllVisible(req.user.userId, req.user.role);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.service.findOne(req.user.userId, req.user.role, Number(id));
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.updateTemplate(
      req.user.userId,
      req.user.role,
      Number(id),
      dto,
    );
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.service.removeTemplate(
      req.user.userId,
      req.user.role,
      Number(id),
    );
  }
}
