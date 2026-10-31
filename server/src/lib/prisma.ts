import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (err) {
  console.warn('Prisma client initialization notice:', err);
  prisma = {} as PrismaClient;
}

export { prisma };
