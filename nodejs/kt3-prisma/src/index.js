const express = require('express')
const config = require('./config')
const prisma = require('./db')
const { notFound, errorHandler } = require('./middleware/errorHandler')
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/posts')

const app = express()

app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/posts', postsRouter)

app.use(notFound)
app.use(errorHandler)

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
