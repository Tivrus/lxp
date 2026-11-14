const app = require('./app')
const config = require('./config')
const prisma = require('./db')

const server = app.listen(config.port, () => {
  console.log(`Сервер запущен: http://localhost:${config.port}`)
})

async function shutdown() {
  server.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
