import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Preparing production database defaults...')

  await prisma.promoCode.upsert({
    where: { code: 'WELCOME' },
    update: {},
    create: {
      code: 'WELCOME',
      type: 'percentage',
      value: 10,
      minOrder: 0,
      maxDiscount: null,
      usageLimit: null,
      isActive: false,
      campaignType: 'standard',
      bannerTitle: 'Welcome offer',
      bannerCopy: 'Activate this code when the client is ready to launch a welcome campaign.',
    },
  })

  console.log('Production defaults ready. No catalogue products were created.')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
