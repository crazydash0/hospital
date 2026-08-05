import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateDoctorDto } from '../auth/dto/create-doctor.dto';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Post()
  createDoctor(@Req() req, @Body() dto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(req.user.userId, dto);
  }

  @Get()
  getAllDoctors() {
    return this.doctorsService.getAllDoctors();
  }

  @Get(':id')
  getDoctor(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.getDoctorById(id);
  }
}