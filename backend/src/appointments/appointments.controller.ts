import { Controller, Get, Post, Patch, Delete, Param, Body, Req, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Roles } from '../auth/roles.decorator';
import { NotificationType, Role } from '@prisma/client';
import { BookAppointmentDto } from '../auth/dto/book-appointment.dto';
import { CreateSlotsDto } from '../auth/dto/create-slots.dto';
import { SetWeeklyTemplateDto, SetWeeklyRangeDto } from '../auth/dto/weekly-template.dto';
import { CreateLeaveDto } from '../auth/dto/doctor-leave.dto';
import { SetMeetingLinkDto } from '../auth/dto/set-meeting-link.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly service: AppointmentsService,
    private readonly notifications: NotificationsService,
  ) {}

  @Roles(Role.PATIENT)
  @Post()
  async book(@Req() req, @Body() body: BookAppointmentDto) {
    const appointment = await this.service.bookAppointment(req.user.userId, body.slotId, req.user);
    void this.notifications.notifyAppointmentEvent(appointment.id, NotificationType.APPOINTMENT_BOOKED).catch(() => undefined);
    return appointment;
  }

  @Roles(Role.DOCTOR)
  @Get('doctor')
  doctorAppointments(@Req() req) { return this.service.getDoctorAppointments(req.user.userId, req.user); }

  @Roles(Role.PATIENT)
  @Get('patient')
  patientAppointments(@Req() req) { return this.service.getPatientAppointments(req.user.userId, req.user); }

  @Roles(Role.DOCTOR)
  @Patch(':id/confirm')
  async confirmAppointment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const appointment = await this.service.confirmAppointment(id, req.user);
    void this.notifications.notifyAppointmentEvent(id, NotificationType.APPOINTMENT_CONFIRMED).catch(() => undefined);
    return appointment;
  }

  @Roles(Role.DOCTOR)
  @Patch(':id/complete')
  completeAppointment(@Param('id', ParseIntPipe) id: number, @Req() req) { return this.service.completeAppointment(id, req.user); }

  @Roles(Role.DOCTOR)
  @Patch(':id/no-show')
  noShowAppointment(@Param('id', ParseIntPipe) id: number, @Req() req) { return this.service.markNoShow(id, req.user); }

  @Roles(Role.PATIENT)
  @Patch(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const appointment = await this.service.cancelAppointment(id, req.user);
    void this.notifications.notifyAppointmentEvent(id, NotificationType.APPOINTMENT_CANCELLED).catch(() => undefined);
    return appointment;
  }

  @Roles(Role.PATIENT)
  @Patch(':id/reschedule')
  async reschedule(@Param('id', ParseIntPipe) id: number, @Req() req, @Body('slotId', ParseIntPipe) slotId: number) {
    const appointment = await this.service.rescheduleAppointment(id, slotId, req.user);
    void this.notifications.notifyAppointmentEvent(id, NotificationType.APPOINTMENT_RESCHEDULED).catch(() => undefined);
    return appointment;
  }

  @Roles(Role.DOCTOR)
  @Patch(':id/doctor-cancel')
  async cancelByDoctor(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const appointment = await this.service.cancelAppointmentByDoctor(id, req.user);
    void this.notifications.notifyAppointmentEvent(id, NotificationType.APPOINTMENT_CANCELLED).catch(() => undefined);
    return appointment;
  }

  @Roles(Role.DOCTOR)
  @Patch(':id/meeting-link')
  setMeetingLink(@Param('id', ParseIntPipe) id: number, @Req() req, @Body() body: SetMeetingLinkDto) { return this.service.setMeetingLink(id, req.user, body.meetingLink); }

  @Roles(Role.DOCTOR)
  @Post(':id/meeting-link/generate-zoom')
  generateZoomMeetingLink(@Param('id', ParseIntPipe) id: number, @Req() req) { return this.service.generateZoomMeetingLink(id, req.user); }

  @Roles(Role.DOCTOR)
  @Delete(':id/meeting-link')
  removeMeetingLink(@Param('id', ParseIntPipe) id: number, @Req() req) { return this.service.removeMeetingLink(id, req.user); }

  @Public()
  @Get('doctor/:doctorId/slots')
  getDoctorAvailableSlots(@Param('doctorId', ParseIntPipe) doctorId: number) { return this.service.getAvailableSlots(doctorId); }

  @Roles(Role.DOCTOR)
  @Post('slots')
  createSlots(@Req() req, @Body() body: CreateSlotsDto) { return this.service.createSlots(req.user.userId, body.date, body.startHour, body.endHour, body.duration, req.user); }

  @Roles(Role.DOCTOR)
  @Post('weekly-template')
  setWeeklyTemplate(@Req() req, @Body() body: SetWeeklyTemplateDto) { return this.service.setWeeklyTemplate(req.user.userId, body.dayOfWeek, body.startHour, body.endHour, body.duration, body.note, req.user); }

  @Roles(Role.DOCTOR)
  @Post('weekly-template/range')
  setWeeklyRange(@Req() req, @Body() body: SetWeeklyRangeDto) { return this.service.setWeeklyRange(req.user.userId, body.fromDay, body.toDay, body.startHour, body.endHour, body.duration, body.note, req.user); }

  @Roles(Role.DOCTOR)
  @Delete('weekly-template/:dayOfWeek')
  deleteWeeklyTemplateDay(@Req() req, @Param('dayOfWeek', ParseIntPipe) dayOfWeek: number) { return this.service.deleteWeeklyTemplateDay(req.user.userId, dayOfWeek, req.user); }

  @Roles(Role.DOCTOR)
  @Get('weekly-template')
  getWeeklyTemplate(@Req() req) { return this.service.getWeeklyTemplate(req.user.userId, req.user); }

  @Public()
  @Get('weekly-template/doctor/:doctorId')
  getPublicWeeklyTemplate(@Param('doctorId', ParseIntPipe) doctorId: number) { return this.service.getPublicWeeklyTemplate(doctorId); }

  @Roles(Role.DOCTOR)
  @Post('leaves')
  addLeave(@Req() req, @Body() body: CreateLeaveDto) { return this.service.addLeave(req.user.userId, body.date, req.user); }

  @Roles(Role.DOCTOR)
  @Get('leaves')
  getLeaves(@Req() req) { return this.service.getDoctorLeaves(req.user.userId, req.user); }

  @Roles(Role.DOCTOR)
  @Delete('leaves/:id')
  removeLeave(@Req() req, @Param('id', ParseIntPipe) id: number) { return this.service.removeLeaveById(req.user.userId, id, req.user); }
}
