const prisma = require('../src/db')
const { redis, connectRedis } = require('../src/utils/redis')

beforeAll(connectRedis)

beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE "Comment", "Task", "Project", "User" RESTART IDENTITY CASCADE')
  await redis.flushDb()
})

afterAll(async () => {
  await prisma.$disconnect()
  await redis.quit()
})
