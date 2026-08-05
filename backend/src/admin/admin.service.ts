import { Injectable } from '@nestjs/common';
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
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: Role.DOCTOR,

        doctor: {
          create: {
            specialty: data.specialty,
            price: data.price,
            bio: data.bio,
            fullName : data.fullName,
          },
        },
      },
    });

    return user;
  }
}
