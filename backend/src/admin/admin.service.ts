import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createDoctor(data: {
    email: string;
    password: string;
    specialty: string;
    price: number;
    bio?: string;
    fullName: string;
  }, clinicId?: number) {
    if (!clinicId) throw new ForbiddenException('Clinic context is required');
    const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic || !clinic.isActive) throw new ForbiddenException('Clinic not found');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: Role.DOCTOR,
        doctor: {
          create: {
            clinic: { connect: { id: clinicId } },
            specialty: data.specialty,
            price: data.price,
            bio: data.bio,
            fullName: data.fullName,
          },
        },
      },
    });
  }
}
