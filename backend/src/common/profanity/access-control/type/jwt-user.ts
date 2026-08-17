import { ClinicRole, Role } from '@prisma/client';

export interface JwtUser {
  userId: number;
  role: Role;
  clinicId?: number;
  clinicRole?: ClinicRole;
}
