import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateDoctorDto } from '../auth/dto/create-doctor.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService) {}

  async createDoctor(userId: number, dto: CreateDoctorDto, clinicId?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.DOCTOR) throw new ForbiddenException('Only doctors can create doctor profile');
    if (!clinicId) throw new ForbiddenException('Clinic context is required');
    const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic || !clinic.isActive) throw new NotFoundException('Clinic not found');
    const existingDoctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (existingDoctor) throw new ForbiddenException('Doctor profile already exists');
    return this.prisma.doctor.create({ data: { userId, clinicId, specialty: dto.specialty, price: dto.price, bio: dto.bio, fullName: dto.fullName } });
  }

  async getAllDoctors() {
    const doctors = await this.prisma.doctor.findMany({
      include: { user: { select: { email: true, role: true } }, clinic: { select: { id: true, name: true, slug: true, phone: true, address: true } } },
      where: { clinic: { isActive: true } },
      orderBy: { fullName: 'asc' },
    });
    const doctorIds = doctors.map(d => d.id);
    const aggregates = doctorIds.length ? await this.prisma.review.groupBy({ by: ['doctorId'], where: { doctorId: { in: doctorIds }, isHidden: false }, _avg: { rating: true }, _count: true }) : [];
    const statsMap = new Map(aggregates.map(a => [a.doctorId, a]));
    return doctors.map(doctor => ({ ...doctor, averageRating: statsMap.get(doctor.id)?._avg.rating ?? null, totalReviews: statsMap.get(doctor.id)?._count ?? 0 }));
  }

  async getDoctorById(id: number) {
    const doctor = await this.prisma.doctor.findFirst({ where: { id, clinic: { isActive: true } }, include: { user: { select: { id: true, email: true, role: true, createdAt: true } }, clinic: { select: { id: true, name: true, slug: true, phone: true, address: true } } } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  private async getDoctorByUserId(userId: number) { const doctor = await this.prisma.doctor.findUnique({ where: { userId } }); if (!doctor) throw new NotFoundException('Doctor profile not found'); return doctor; }
  async getMyProfile(userId: number) { return this.getDoctorByUserId(userId); }

  async updateOwnProfile(userId: number, dto: UpdateDoctorProfileDto) {
    const doctor = await this.getDoctorByUserId(userId);
    return this.prisma.doctor.update({ where: { id: doctor.id }, data: { bio: dto.bio ?? undefined, specialty: dto.specialty ?? undefined, price: dto.price ?? undefined, facebookUrl: dto.facebookUrl ?? undefined, instagramUrl: dto.instagramUrl ?? undefined, whatsappUrl: dto.whatsappUrl ?? undefined, linkedinUrl: dto.linkedinUrl ?? undefined, websiteUrl: dto.websiteUrl ?? undefined } });
  }

  async updateOwnPhoto(userId: number, file: Express.Multer.File) {
    const doctor = await this.getDoctorByUserId(userId);
    const uploadResult = await this.cloudinary.uploadMedicalFile(file, 'doctor-photos');
    return this.prisma.doctor.update({ where: { id: doctor.id }, data: { photoUrl: uploadResult.secure_url } });
  }
}
