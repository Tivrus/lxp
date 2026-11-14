const prisma = require('../src/db')

afterAll(async () => {
  await prisma.$disconnect()
})
