
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const count = await prisma.category.count();
    console.log('Categories count:', count);
  } catch (e) {
    console.error('Error connecting to Prisma:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
