import { Controller, Patch, Delete, Post, Body, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly service: PrescriptionsService) {}

  @Roles(Role.DOCTOR)
  @Patch(':id')
  update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePrescriptionDto) { return this.service.updatePrescription(req.user, id, dto); }

  @Roles(Role.DOCTOR)
  @Delete(':id')
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) { return this.service.deletePrescription(req.user, id); }

  @Roles(Role.DOCTOR)
  @Post('medical-record/:recordId')
  addPrescription(@Req() req, @Param('recordId', ParseIntPipe) recordId: number, @Body() dto: CreatePrescriptionDto) { return this.service.addPrescription(req.user, recordId, dto); }
}
