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
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('Email already exists');
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.PATIENT,
        patient: { create: {
          fullName: dto.fullName.trim(),
          phone: dto.phone,
          gender: dto.gender,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          address: dto.address,
        }},
      },
      include: { patient: true },
    });
    return { message: 'User registered successfully', user: { id: user.id, email: user.email, role: user.role, patient: user.patient } };
  }

  async registerDoctor(dto: RegisterDoctorDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('Email already exists');
    const baseSlug = this.toSlug(dto.clinicSlug || dto.clinicName);
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const slug = await this.uniqueClinicSlug(tx, baseSlug);
      const clinic = await tx.clinic.create({ data: { name: dto.clinicName.trim(), slug, phone: dto.clinicPhone?.trim(), address: dto.clinicAddress?.trim() } });
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: Role.DOCTOR,
          doctor: { create: { fullName: dto.fullName.trim(), specialty: dto.specialty.trim(), price: dto.price, clinicId: clinic.id } },
        },
        include: { doctor: true },
      });
      await tx.clinicMembership.create({ data: { clinicId: clinic.id, userId: user.id, role: ClinicRole.OWNER } });
      const access_token = this.signClinicToken(user.id, user.email, clinic.id, ClinicRole.OWNER, user.role);
      return {
        message: 'Doctor and clinic registered successfully',
        access_token,
        user: { id: user.id, email: user.email, role: user.role, fullName: user.doctor?.fullName ?? null },
        clinic: { id: clinic.id, name: clinic.name, slug: clinic.slug, role: ClinicRole.OWNER },
      };
    });
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { patient: true, doctor: true, memberships: { include: { clinic: true } } },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('Invalid credentials');
    const activeMemberships = user.memberships.filter((membership) => membership.clinic.isActive);
    const firstMembership = activeMemberships[0];
    const access_token = this.signClinicToken(user.id, user.email, firstMembership?.clinicId, firstMembership?.role, user.role);
    const fullName = user.patient?.fullName ?? user.doctor?.fullName ?? null;
    return {
      access_token,
      user: { id: user.id, email: user.email, role: user.role, fullName },
      clinic: firstMembership ? { id: firstMembership.clinic.id, name: firstMembership.clinic.name, slug: firstMembership.clinic.slug, role: firstMembership.role } : null,
      clinics: activeMemberships.map((m) => ({ id: m.clinic.id, name: m.clinic.name, slug: m.clinic.slug, role: m.role })),
    };
  }

  async getClinicContext(userId: number, clinicId: number) {
    const membership = await this.prisma.clinicMembership.findUnique({ where: { clinicId_userId: { clinicId, userId } }, include: { clinic: true } });
    if (!membership || !membership.clinic.isActive) throw new UnauthorizedException('You do not belong to this clinic');
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return {
      access_token: this.signClinicToken(user.id, user.email, clinicId, membership.role, user.role),
      clinic: { id: membership.clinic.id, name: membership.clinic.name, slug: membership.clinic.slug, role: membership.role },
    };
  }

  private signClinicToken(userId: number, email: string, clinicId?: number, clinicRole?: ClinicRole, role?: Role) {
    return this.jwtService.sign({ userId, email, role, clinicId, clinicRole });
  }

  private toSlug(value: string): string {
    const slug = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return slug || `clinic-${Date.now()}`;
  }

  private async uniqueClinicSlug(tx: any, baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 2;
    while (await tx.clinic.findUnique({ where: { slug } })) slug = `${baseSlug}-${counter++}`;
    return slug;
  }
}
