import { Controller, Get, Post, Patch, Param, Body, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { BookAppointmentDto } from '../auth/dto/book-appointment.dto';
import { CreateSlotsDto } from '../auth/dto/create-slots.dto';
import { ParseIntPipe } from '@nestjs/common';

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
    );
  }
}