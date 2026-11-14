const http = require('node:http')
const app = require('./app')
const config = require('./config')
const prisma = require('./db')
const createSocketServer = require('./socket')

const server = http.createServer(app)
const io = createSocketServer(server)

server.listen(config.port, () => {
  console.log(`Сервер запущен: http://localhost:${config.port}`)
  console.log(`Чат для проверки: http://localhost:${config.port}/chat.html`)
})

async function shutdown() {
  io.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
