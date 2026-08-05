import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateDoctorDto } from '../auth/dto/create-doctor.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private service: AdminService) {}

  @Roles(Role.ADMIN)
  @Post('doctor')
  createDoctor(@Body() body: CreateDoctorDto) {
    return this.service.createDoctor(body);
  }
}