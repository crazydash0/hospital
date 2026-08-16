import { Controller, Get, Post, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { BookAppointmentDto } from '../auth/dto/book-appointment.dto';
import { CreateSlotsDto } from '../auth/dto/create-slots.dto';
import { ParseIntPipe } from '@nestjs/common';
import { SetWeeklyTemplateDto, SetWeeklyRangeDto } from '../auth/dto/weekly-template.dto';
import { CreateLeaveDto } from '../auth/dto/doctor-leave.dto';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  // Patient books appointment
  @Roles(Role.PATIENT)
  @Post()
  book(@Req() req, @Body() body: BookAppointmentDto) {
    return this.service.bookAppointment(req.user.userId, body.slotId);
  }

  // Doctor sees his appointments
  @Roles(Role.DOCTOR)
  @Get('doctor')
  doctorAppointments(@Req() req) {
    return this.service.getDoctorAppointments(req.user.userId);
  }

  // Patient sees his appointments
  @Roles(Role.PATIENT)
  @Get('patient')
  patientAppointments(@Req() req) {
    return this.service.getPatientAppointments(req.user.userId);
  }

  // Doctor confirms appointment
  @Roles(Role.DOCTOR)
  @Patch(':id/confirm')
  confirmAppointment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.service.confirmAppointment(id, req.user);
  }

  @Roles(Role.DOCTOR)
  @Patch(':id/complete')
  completeAppointment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.service.completeAppointment(id, req.user);
  }

  @Roles(Role.PATIENT)
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.service.cancelAppointment(id, req.user);
  }

  // Doctor cancels appointment
  @Roles(Role.DOCTOR)
  @Patch(':id/doctor-cancel')
  cancelByDoctor(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.service.cancelAppointmentByDoctor(id, req.user);
  }

  @Get('doctor/:doctorId/slots')
  getDoctorAvailableSlots(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.service.getAvailableSlots(doctorId);
  }

 @Roles(Role.DOCTOR)
@Post('slots')
createSlots(@Req() req, @Body() body: CreateSlotsDto) {
  return this.service.createSlots(
    req.user.userId,
    body.date,
    body.startHour,
    body.endHour,
    body.duration,
  );
}
@Roles(Role.DOCTOR)
  @Post('weekly-template')
  setWeeklyTemplate(@Req() req, @Body() body: SetWeeklyTemplateDto) {
    return this.service.setWeeklyTemplate(
      req.user.userId,
      body.dayOfWeek,
      body.startHour,
      body.endHour,
      body.duration,
      body.note,
    );
  }

  @Roles(Role.DOCTOR)
  @Post('weekly-template/range')
  setWeeklyRange(@Req() req, @Body() body: SetWeeklyRangeDto) {
    return this.service.setWeeklyRange(
      req.user.userId,
      body.fromDay,
      body.toDay,
      body.startHour,
      body.endHour,
      body.duration,
      body.note,
    );
  }

  @Roles(Role.DOCTOR)
  @Delete('weekly-template/:dayOfWeek')
  deleteWeeklyTemplateDay(
    @Req() req,
    @Param('dayOfWeek', ParseIntPipe) dayOfWeek: number,
  ) {
    return this.service.deleteWeeklyTemplateDay(req.user.userId, dayOfWeek);
  }

  @Roles(Role.DOCTOR)
  @Get('weekly-template')
  getWeeklyTemplate(@Req() req) {
    return this.service.getWeeklyTemplate(req.user.userId);
  }

  // جدول دكتور معين، متاح لأي مستخدم مسجل دخول (مريض يشوفه قبل الحجز)
  @Get('weekly-template/doctor/:doctorId')
  getPublicWeeklyTemplate(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.service.getPublicWeeklyTemplate(doctorId);
  }

  @Roles(Role.DOCTOR)
  @Post('leaves')
  addLeave(@Req() req, @Body() body: CreateLeaveDto) {
    return this.service.addLeave(req.user.userId, body.date);
  }

  @Roles(Role.DOCTOR)
  @Get('leaves')
  getLeaves(@Req() req) {
    return this.service.getLeaves(req.user.userId);
  }

  @Roles(Role.DOCTOR)
  @Delete('leaves/:id')
  removeLeave(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.removeLeave(req.user.userId, id);
  }

  @Roles(Role.DOCTOR)
  @Post('generate-week')
  generateWeek(@Req() req) {
    return this.service.generateWeek(req.user.userId);
  }
}