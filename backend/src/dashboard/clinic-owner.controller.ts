import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ClinicOwnerService } from './clinic-owner.service';

@ApiTags('Clinic Owner')
@ApiBearerAuth()
@Controller('clinic-owner')
export class ClinicOwnerController {
  constructor(private readonly service: ClinicOwnerService) {}

  @Roles(Role.DOCTOR)
  @Get('summary')
  summary(@Req() req) { return this.service.summary(req.user); }
}
