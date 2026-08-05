import { Role } from '@prisma/client';

export interface JwtUser {
  userId: number;
  role: Role;
}
