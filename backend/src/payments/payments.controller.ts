import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { CreatePaymentDto } from './payments.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req) { return this.service.create(dto, req.user); }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Get('appointment/:appointmentId')
  list(@Param('appointmentId', ParseIntPipe) appointmentId: number, @Req() req) { return this.service.listForAppointment(appointmentId, req.user); }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id/refund')
  refund(@Param('id', ParseIntPipe) id: number, @Req() req) { return this.service.refund(id, req.user); }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Patch(':id/void')
  void(@Param('id', ParseIntPipe) id: number, @Req() req) { return this.service.void(id, req.user); }
}
