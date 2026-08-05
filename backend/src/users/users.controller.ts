import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { patient: true, doctor: true },
    });

    const fullName = user!.patient?.fullName ?? user!.doctor?.fullName ?? null;

    return {
      id: user!.id,
      email: user!.email,
      role: user!.role,
      fullName,
    };
  }
}