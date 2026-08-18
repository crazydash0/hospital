import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomInt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, ClinicRole, Role, VerificationType } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('Email already exists');
    if (dto.phone) await this.ensurePhoneAvailable(dto.phone);
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, phone: dto.phone?.trim(), role: Role.PATIENT, patient: { create: { fullName: dto.fullName.trim(), phone: dto.phone?.trim(), gender: dto.gender, birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined, address: dto.address } }, notificationPreference: { create: {} } },
      include: { patient: true },
    });
    await this.issueVerificationCode(user.id, email, VerificationType.EMAIL);
    return { message: 'Registration successful. Verify your email before logging in.', verificationRequired: true, user: { id: user.id, email: user.email, role: user.role, patient: user.patient } };
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
      const user = await tx.user.create({ data: { email, password: hashedPassword, role: Role.DOCTOR, doctor: { create: { fullName: dto.fullName.trim(), specialty: dto.specialty.trim(), price: dto.price, clinicId: clinic.id } }, notificationPreference: { create: {} } }, include: { doctor: true } });
      await tx.clinicMembership.create({ data: { clinicId: clinic.id, userId: user.id, role: ClinicRole.OWNER } });
      await this.issueVerificationCode(user.id, email, VerificationType.EMAIL, tx);
      return { message: 'Doctor and clinic registered. Verify your email before logging in.', verificationRequired: true, user: { id: user.id, email: user.email, role: user.role, fullName: user.doctor?.fullName ?? null }, clinic: { id: clinic.id, name: clinic.name, slug: clinic.slug, role: ClinicRole.OWNER } };
    });
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.verifyCode(email.trim().toLowerCase(), code, VerificationType.EMAIL);
    await this.prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
    return { message: 'Email verified successfully' };
  }

  async resendEmailVerification(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    if (!user || user.emailVerifiedAt) return { message: 'If the account exists and is not verified, a new code has been sent.' };
    await this.issueVerificationCode(user.id, normalized, VerificationType.EMAIL);
    return { message: 'If the account exists and is not verified, a new code has been sent.' };
  }

  async requestPhoneVerification(phone: string) {
    const normalized = this.normalizePhone(phone);
    let user = await this.prisma.user.findUnique({ where: { phone: normalized } });
    if (!user) user = await this.prisma.user.create({ data: { phone: normalized, role: Role.PATIENT, patient: { create: { fullName: 'New Patient', phone: normalized } }, notificationPreference: { create: {} } });
    if (user.phoneVerifiedAt) return { message: 'Phone is already verified' };
    await this.issueVerificationCode(user.id, normalized, VerificationType.PHONE);
    return { message: 'Verification code sent to your phone' };
  }

  async verifyPhone(phone: string, code: string, fullName?: string) {
    const normalized = this.normalizePhone(phone);
    const user = await this.verifyCode(normalized, code, VerificationType.PHONE);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date() } });
      if (fullName?.trim() && user.patient) await tx.patient.update({ where: { userId: user.id }, data: { fullName: fullName.trim(), phone: normalized } });
    });
    const fresh = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id }, include: { patient: true, doctor: true, memberships: { include: { clinic: true } } } });
    return this.buildLoginResponse(fresh);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email }, include: { patient: true, doctor: true, memberships: { include: { clinic: true } } } });
    if (!user || !user.password || !(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('Invalid credentials');
    if (!user.emailVerifiedAt) throw new UnauthorizedException('Please verify your email before logging in');
    return this.buildLoginResponse(user);
  }

  async getClinicContext(userId: number, clinicId: number) {
    const membership = await this.prisma.clinicMembership.findUnique({ where: { clinicId_userId: { clinicId, userId } }, include: { clinic: true } });
    if (!membership || !membership.clinic.isActive) throw new UnauthorizedException('You do not belong to this clinic');
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return { access_token: this.signClinicToken(user.id, user.email ?? undefined, clinicId, membership.role, user.role), clinic: { id: membership.clinic.id, name: membership.clinic.name, slug: membership.clinic.slug, role: membership.role } };
  }

  async createOAuthState(provider: AuthProvider) {
    const state = randomBytes(32).toString('hex');
    await this.prisma.oAuthState.create({ data: { state, provider, expiresAt: new Date(Date.now() + 10 * 60_000) } });
    return state;
  }

  async consumeOAuthState(state: string, provider: AuthProvider) {
    const record = await this.prisma.oAuthState.findUnique({ where: { state } });
    if (!record || record.provider !== provider || record.expiresAt < new Date()) throw new UnauthorizedException('Invalid OAuth state');
    await this.prisma.oAuthState.delete({ where: { state } });
  }

  async loginWithOAuth(provider: AuthProvider, providerId: string, email: string | null, fullName: string) {
    if (!email) throw new UnauthorizedException('This social account did not provide a verified email. Use phone verification or another sign-in method.');
    const normalizedEmail = email.trim().toLowerCase();
    let identity = await this.prisma.authIdentity.findUnique({ where: { provider_providerId: { provider, providerId } }, include: { user: { include: { patient: true, doctor: true, memberships: { include: { clinic: true } } } } } });
    if (!identity) {
      let user = await this.prisma.user.findUnique({ where: { email: normalizedEmail }, include: { patient: true, doctor: true, memberships: { include: { clinic: true } } } });
      if (user && !user.emailVerifiedAt) throw new UnauthorizedException('Verify this email before linking the social account.');
      if (!user) user = await this.prisma.user.create({ data: { email: normalizedEmail, emailVerifiedAt: new Date(), role: Role.PATIENT, patient: { create: { fullName: fullName.trim() } }, notificationPreference: { create: {} } }, include: { patient: true, doctor: true, memberships: { include: { clinic: true } } } });
      identity = await this.prisma.authIdentity.create({ data: { provider, providerId, userId: user.id }, include: { user: { include: { patient: true, doctor: true, memberships: { include: { clinic: true } } } } } });
    }
    if (!identity.user.emailVerifiedAt) throw new UnauthorizedException('Verify your email before using social sign-in.');
    return this.buildLoginResponse(identity.user);
  }

  private async issueVerificationCode(userId: number, target: string, type: VerificationType, client: any = this.prisma) {
    const latest = await client.verificationCode.findFirst({ where: { target, type }, orderBy: { createdAt: 'desc' } });
    if (latest && Date.now() - latest.createdAt.getTime() < 60_000) throw new BadRequestException('Please wait before requesting another verification code');
    const code = randomInt(100000, 1000000).toString();
    const codeHash = createHash('sha256').update(code).digest('hex');
    await client.verificationCode.deleteMany({ where: { target, type, consumedAt: null } });
    await client.verificationCode.create({ data: { userId, target, type, codeHash, expiresAt: new Date(Date.now() + 10 * 60_000) } });
    if (type === VerificationType.EMAIL) await this.sendEmailVerification(target, code);
    else await this.sendSmsVerification(target, `Your clinic verification code is ${code}. It expires in 10 minutes.`);
  }

  private async verifyCode(target: string, code: string, type: VerificationType) {
    const record = await this.prisma.verificationCode.findFirst({ where: { target, type, consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
    if (!record || record.attempts >= 5) throw new BadRequestException('Invalid or expired verification code');
    const hash = createHash('sha256').update(code.trim()).digest('hex');
    if (hash !== record.codeHash) {
      await this.prisma.verificationCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      throw new BadRequestException('Invalid or expired verification code');
    }
    await this.prisma.verificationCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    if (!record.userId) throw new BadRequestException('Verification is not linked to an account');
    return this.prisma.user.findUniqueOrThrow({ where: { id: record.userId }, include: { patient: true } });
  }

  private buildLoginResponse(user: any) {
    const activeMemberships = (user.memberships ?? []).filter((membership: any) => membership.clinic.isActive);
    const firstMembership = activeMemberships[0];
    return { access_token: this.signClinicToken(user.id, user.email ?? undefined, firstMembership?.clinicId, firstMembership?.role, user.role), user: { id: user.id, email: user.email, phone: user.phone, role: user.role, fullName: user.patient?.fullName ?? user.doctor?.fullName ?? null }, clinic: firstMembership ? { id: firstMembership.clinic.id, name: firstMembership.clinic.name, slug: firstMembership.clinic.slug, role: firstMembership.role } : null, clinics: activeMemberships.map((m: any) => ({ id: m.clinic.id, name: m.clinic.name, slug: m.clinic.slug, role: m.role })) };
  }

  private async ensurePhoneAvailable(phone: string) {
    const normalized = this.normalizePhone(phone);
    const existing = await this.prisma.user.findUnique({ where: { phone: normalized } });
    if (existing) throw new ConflictException('Phone number already exists');
  }

  private normalizePhone(phone: string) {
    const normalized = phone.replace(/[\s()-]/g, '');
    if (!/^\+?[1-9]\d{8,14}$/.test(normalized)) throw new BadRequestException('Phone must be in international format, for example +2010...');
    return normalized.startsWith('+') ? normalized : `+${normalized}`;
  }

  private async sendEmailVerification(to: string, code: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.NOTIFICATION_EMAIL_FROM;
    if (!apiKey || !from) throw new BadRequestException('Email verification provider is not configured');
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject: 'Verify your clinic account', text: `Your verification code is ${code}. It expires in 10 minutes.` }) });
    if (!response.ok) throw new BadRequestException('Unable to send verification email');
  }

  private async sendSmsVerification(to: string, body: string) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !from) throw new BadRequestException('SMS verification provider is not configured');
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const payload = new URLSearchParams({ To: to, From: from, Body: body });
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: payload });
    if (!response.ok) throw new BadRequestException('Unable to send verification SMS');
  }

  private signClinicToken(userId: number, email?: string, clinicId?: number, clinicRole?: ClinicRole, role?: Role) { return this.jwtService.sign({ userId, email, role, clinicId, clinicRole }); }
  private toSlug(value: string): string { const slug = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); return slug || `clinic-${Date.now()}`; }
  private async uniqueClinicSlug(tx: any, baseSlug: string): Promise<string> { let slug = baseSlug; let counter = 2; while (await tx.clinic.findUnique({ where: { slug } })) slug = `${baseSlug}-${counter++}`; return slug; }
}
