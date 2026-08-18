import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set and contain at least 32 characters');
}

function parseJwtExpiresIn(value: string | undefined): number {
  const raw = (value ?? '1d').trim().toLowerCase();
  if (/^\d+$/.test(raw)) {
    const seconds = Number(raw);
    if (Number.isSafeInteger(seconds) && seconds > 0) return seconds;
  }

  const match = raw.match(/^(\d+)\s*(s|m|h|d|w)$/);
  if (!match) {
    throw new Error('JWT_EXPIRES_IN must be a positive number of seconds or use s/m/h/d/w (for example: 1d)');
  }

  const amount = Number(match[1]);
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
    w: 7 * 24 * 60 * 60,
  };
  const seconds = amount * multipliers[match[2]];
  if (!Number.isSafeInteger(seconds) || seconds <= 0) {
    throw new Error('JWT_EXPIRES_IN is outside the supported range');
  }
  return seconds;
}

const jwtExpiresIn = parseJwtExpiresIn(process.env.JWT_EXPIRES_IN);

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
