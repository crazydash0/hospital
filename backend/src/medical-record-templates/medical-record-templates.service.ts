import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { CreateTemplateDto } from './dto/create-templates.dto';
import { UpdateTemplateDto } from './dto/update-templates.dto';

@Injectable()
export class MedicalRecordTemplatesService {
  constructor(private prisma: PrismaService) {}

  private assertNoDuplicateKeys(items: { key: string }[] | undefined) {
    if (!items) return;

    const keys = items.map((item) => item.key);
    const uniqueKeys = new Set(keys);

    if (uniqueKeys.size !== keys.length) {
      throw new BadRequestException('Template items must have unique keys');
    }
  }

  private async getDoctorByUserId(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async createTemplate(userId: number, role: Role, dto: CreateTemplateDto) {
    this.assertNoDuplicateKeys(dto.items);

    if (dto.isSystem && role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can create system templates');
    }

    let doctorId: number | null = null;

    if (!dto.isSystem) {
      const doctor = await this.getDoctorByUserId(userId);
      doctorId = doctor.id;
    }

    return this.prisma.medicalRecordTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        specialty: dto.specialty,
        visibility: dto.visibility,
        isSystem: dto.isSystem ?? false,
        doctorId,
        items: {
          create: (dto.items ?? []).map((item) => ({
            label: item.label,
            key: item.key,
            type: item.type,
            required: item.required,
            unit: item.unit,
            placeholder: item.placeholder,
            options: item.options,
            displayOrder: item.displayOrder,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAllVisible(userId: number, role: Role) {
    if (role === Role.ADMIN) {
      return this.prisma.medicalRecordTemplate.findMany({
        include: { items: true },
      });
    }

    const doctor = await this.getDoctorByUserId(userId);

    return this.prisma.medicalRecordTemplate.findMany({
      where: {
        OR: [
          { doctorId: doctor.id },
          { visibility: 'PUBLIC' },
          { isSystem: true },
        ],
      },
      include: { items: true },
    });
  }

  async findOne(userId: number, role: Role, id: number) {
    const template = await this.prisma.medicalRecordTemplate.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (role === Role.ADMIN) {
      return template;
    }

    const doctor = await this.getDoctorByUserId(userId);

    const isOwner = template.doctorId === doctor.id;
    const isVisible = template.visibility === 'PUBLIC' || template.isSystem;

    if (!isOwner && !isVisible) {
      throw new ForbiddenException('You cannot access this template');
    }

    return template;
  }

  private async getOwnedTemplate(userId: number, role: Role, id: number) {
    const template = await this.prisma.medicalRecordTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (role === Role.ADMIN) {
      return template;
    }

    const doctor = await this.getDoctorByUserId(userId);

    if (template.doctorId !== doctor.id) {
      throw new ForbiddenException('You cannot modify this template');
    }

    return template;
  }

  async updateTemplate(
    userId: number,
    role: Role,
    id: number,
    dto: UpdateTemplateDto,
  ) {
    this.assertNoDuplicateKeys(dto.items);

    await this.getOwnedTemplate(userId, role, id);

    return this.prisma.medicalRecordTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        specialty: dto.specialty,
        visibility: dto.visibility,
        isSystem: dto.isSystem,
        ...(dto.items
          ? {
              items: {
                deleteMany: {},
                create: dto.items.map((item) => ({
                  label: item.label,
                  key: item.key,
                  type: item.type,
                  required: item.required,
                  unit: item.unit,
                  placeholder: item.placeholder,
                  options: item.options,
                  displayOrder: item.displayOrder,
                })),
              },
            }
          : {}),
      },
      include: { items: true },
    });
  }

  async removeTemplate(userId: number, role: Role, id: number) {
    await this.getOwnedTemplate(userId, role, id);

    await this.prisma.medicalRecordTemplate.delete({
      where: { id },
    });

    return { message: 'Template deleted successfully' };
  }
}
