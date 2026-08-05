import { Controller, Get, Param, Req, Patch, Body } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Roles(Role.DOCTOR)
  @Get(':id/profile')
  getProfile(@Req() req, @Param('id') id: string) {
    return this.service.getProfile(
      req.user, // ✅ بدل req.user.userId
      Number(id),
    );
  }

  @Roles(Role.PATIENT)
  @Patch('profile')
  updateProfile(@Req() req, @Body() dto: UpdatePatientDto) {
    return this.service.updateProfile(req.user.userId, dto);
  }

  @Roles(Role.PATIENT)
  @Get('profile')
  getMyProfile(@Req() req) {
    return this.service.getMyProfile(req.user.userId);
  }

  @Roles(Role.DOCTOR)
  @Get()
  getPatients(@Req() req) {
    return this.service.getDoctorPatients(req.user.userId);
  }
}
