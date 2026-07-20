import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating HomeBanner table...');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "HomeBanner" (
          "id" TEXT NOT NULL,
          "imageUrl" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "subtitle" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "HomeBanner_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('HomeBanner table created successfully!');
  } catch (error) {
    console.error('Error creating HomeBanner table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
