import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ClinicRole, Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: Role.PATIENT,
        patient: {
          create: {
            fullName: dto.fullName,
            phone: dto.phone,
            gender: dto.gender,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            address: dto.address,
          },
        },
      },
      include: { patient: true },
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        patient: user.patient,
      },
    };
  }

  async registerDoctor(dto: RegisterDoctorDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const baseSlug = this.toSlug(dto.clinicSlug || dto.clinicName);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: Role.DOCTOR,
          doctor: {
            create: {
              fullName: dto.fullName,
              specialty: dto.specialty,
              price: dto.price,
            },
          },
        },
        include: { doctor: true },
      });

      const slug = await this.uniqueClinicSlug(tx, baseSlug);
      const clinic = await tx.clinic.create({
        data: {
          name: dto.clinicName,
          slug,
          phone: dto.clinicPhone,
          address: dto.clinicAddress,
          doctors: {
            connect: { id: user.doctor!.id },
          },
        },
      });

      await tx.clinicMembership.create({
        data: {
          clinicId: clinic.id,
          userId: user.id,
          role: ClinicRole.OWNER,
        },
      });

      const access_token = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
        clinicId: clinic.id,
        clinicRole: ClinicRole.OWNER,
      });

      return {
        message: 'Doctor and clinic registered successfully',
        access_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.doctor?.fullName ?? null,
        },
        clinic: {
          id: clinic.id,
          name: clinic.name,
          slug: clinic.slug,
        },
      };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { patient: true, doctor: true, memberships: { include: { clinic: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const firstMembership = user.memberships[0];
    const access_token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      clinicId: firstMembership?.clinicId,
      clinicRole: firstMembership?.role,
    });

    const fullName = user.patient?.fullName ?? user.doctor?.fullName ?? null;

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName,
      },
      clinic: firstMembership
        ? {
            id: firstMembership.clinic.id,
            name: firstMembership.clinic.name,
            slug: firstMembership.clinic.slug,
            role: firstMembership.role,
          }
        : null,
      clinics: user.memberships.map((membership) => ({
        id: membership.clinic.id,
        name: membership.clinic.name,
        slug: membership.clinic.slug,
        role: membership.role,
      })),
    };
  }

  private toSlug(value: string): string {
    const slug = value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || `clinic-${Date.now()}`;
  }

  private async uniqueClinicSlug(tx: any, baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 2;

    while (await tx.clinic.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }
}
