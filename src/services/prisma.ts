import { PrismaClient } from "@prisma/client";

type PrismaGlobal = {
  prisma?: PrismaClient;
};

const globalForPrisma: PrismaGlobal = globalThis as PrismaGlobal;

export const prisma: PrismaClient = globalForPrisma.prisma ??
  new PrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
