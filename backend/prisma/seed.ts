import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: 'admin4@test.com',
    },
  });

  if (existingAdmin) {
    console.log('Admin already exists');
    return;
  }

  const hashed = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      email: 'admin4@test.com',
      password: hashed,
      role: Role.ADMIN,
    },
  });

  console.log('Admin created successfully');
} // <-- القوس الناقص كان هنا

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });