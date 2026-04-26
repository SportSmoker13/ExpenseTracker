import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { source: true, toSource: true }
  })
  console.log(JSON.stringify(transactions, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
