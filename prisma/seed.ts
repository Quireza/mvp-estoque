import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clear existing data (optional but good for testing)
  await prisma.stockMovementItem.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.product.deleteMany()

  // Create products
  const p1 = await prisma.product.create({
    data: {
      sku: 'CH-MSL-100',
      name: 'Chai Masala Clássico 100g',
      costPrice: 15.0,
      salePrice: 45.0,
      minStock: 50
    }
  })

  const p2 = await prisma.product.create({
    data: {
      sku: 'CH-KAH-050',
      name: 'Kashmiri Kahwa 50g',
      costPrice: 12.0,
      salePrice: 38.0,
      minStock: 30
    }
  })

  const p3 = await prisma.product.create({
    data: {
      sku: 'ESP-CAR-050',
      name: 'Cardamomo Verde Premium 50g',
      costPrice: 20.0,
      salePrice: 65.0,
      minStock: 20
    }
  })

  // Create some initial batches
  const now = new Date()
  
  // Batch expiring in 10 days
  const b1Date = new Date()
  b1Date.setDate(now.getDate() + 10)
  
  await prisma.batch.create({
    data: {
      productId: p1.id,
      batchNumber: 'LOT-231',
      expirationDate: b1Date,
      quantity: 45
    }
  })

  // Batch expiring in 25 days
  const b2Date = new Date()
  b2Date.setDate(now.getDate() + 25)
  
  await prisma.batch.create({
    data: {
      productId: p2.id,
      batchNumber: 'LOT-098',
      expirationDate: b2Date,
      quantity: 12
    }
  })

  // Batch expiring in 40 days
  const b3Date = new Date()
  b3Date.setDate(now.getDate() + 40)
  
  await prisma.batch.create({
    data: {
      productId: p3.id,
      batchNumber: 'LOT-442',
      expirationDate: b3Date,
      quantity: 8
    }
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
