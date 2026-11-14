const app = require('./app')
const config = require('./config')
const prisma = require('./db')
const { redis, connectRedis } = require('./utils/redis')

async function start() {
  await connectRedis()
  await prisma.$connect()

  const server = app.listen(config.port, () => {
    console.log(`TaskFlow API: http://localhost:${config.port}, документация: /api/docs`)
  })

  async function shutdown() {
    server.close()
    await prisma.$disconnect()
    await redis.quit()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((err) => {
  console.error('Не удалось запустить сервер:', err.message)
  process.exit(1)
})
