import { Role } from '@prisma/client';

export interface CurrentUser {
  userId: number;
  role: Role;
}
