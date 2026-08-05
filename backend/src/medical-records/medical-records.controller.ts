import { Controller, Post, Get, Body, Req, Param, Patch } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { Query } from '@nestjs/common';
import { GetMedicalRecordsDto } from './dto/get-medical-record.dto';
import { ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Medical Records')
@ApiBearerAuth()
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly service: MedicalRecordsService) {}

  @Roles(Role.DOCTOR)
  @Post()
  create(@Req() req, @Body() dto: CreateMedicalRecordDto) {
    return this.service.createRecord(req.user, dto);
  }

  @Roles(Role.DOCTOR)
  @Patch(':id')
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.service.updateRecord(req.user, Number(id), dto);
  }

  @Roles(Role.PATIENT)
  @Get('my-records')
  getMyRecords(@Req() req) {
    return this.service.getPatientRecords(req.user.userId);
  }

  @Get(':id')
  getRecord(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.getRecordById(req.user, Number(id));
  }

  @Roles(Role.DOCTOR)
  @Get()
  getDoctorRecords(@Req() req, @Query() query: GetMedicalRecordsDto) {
    return this.service.getDoctorRecords(req.user.userId, query);
  }

  @Roles(Role.DOCTOR)
  @Get('history/:patientId')
  getPatientHistory(
    @Req() req,
    @Param('patientId', ParseIntPipe) patientId: number,
  ) {
    return this.service.getPatientHistory(req.user.userId, patientId);
  }
}
