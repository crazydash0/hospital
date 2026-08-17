import { Controller, Get, Post, Patch, Body, Req, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateDoctorDto } from '../auth/dto/create-doctor.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Post()
  createDoctor(@Req() req, @Body() dto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(req.user.userId, dto, req.user.clinicId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Get('me/profile')
  getMyProfile(@Req() req) { return this.doctorsService.getMyProfile(req.user.userId); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Patch('me/profile')
  updateMyProfile(@Req() req, @Body() dto: UpdateDoctorProfileDto) { return this.doctorsService.updateOwnProfile(req.user.userId, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Post('me/photo')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_PHOTO_SIZE_BYTES }, fileFilter: (req, file, callback) => { if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return callback(new BadRequestException('يُسمح فقط بصور JPEG أو PNG أو WEBP'), false); callback(null, true); } }))
  updateMyPhoto(@Req() req, @UploadedFile() file: Express.Multer.File) { if (!file) throw new BadRequestException('الصورة مطلوبة'); return this.doctorsService.updateOwnPhoto(req.user.userId, file); }

  @Get()
  getAllDoctors() { return this.doctorsService.getAllDoctors(); }

  @Get(':id')
  getDoctor(@Param('id', ParseIntPipe) id: number) { return this.doctorsService.getDoctorById(id); }
}
