import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
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
      include: {
        patient: true,
      },
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

  async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
    include: { patient: true, doctor: true },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(dto.password, user.password);

  if (!isMatch) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const access_token = this.jwtService.sign({
    userId: user.id,
    email: user.email,
    role: user.role,
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
  };
}
}