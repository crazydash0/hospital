import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateDoctorDto } from '../auth/dto/create-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDoctor(userId: number, dto: CreateDoctorDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can create doctor profile');
    }

    const existingDoctor = await this.prisma.doctor.findUnique({
      where: {
        userId,
        
      },
    });

    if (existingDoctor) {
      throw new ForbiddenException('Doctor profile already exists');
    }

    return this.prisma.doctor.create({
      data: {
        userId,
        specialty: dto.specialty,
        price: dto.price,
        bio: dto.bio,
        fullName: dto.fullName,
      },
    });
  }
  async getAllDoctors() {
    return this.prisma.doctor.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
  }
  async getDoctorById(id: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        appointments: true,
      },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }
}
