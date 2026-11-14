const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express')
const prisma = require('./db')
const swaggerSpec = require('./config/swagger')
const { redis } = require('./utils/redis')
const { notFound, errorHandler } = require('./middleware/errorHandler')
const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')
const projectsRouter = require('./routes/projects')
const tasksRouter = require('./routes/tasks')
const commentsRouter = require('./routes/comments')

const app = express()

app.set('trust proxy', 1)
app.use(helmet())
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.json({ data: { name: 'TaskFlow API', docs: '/api/docs' } })
})

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    await redis.ping()
    res.json({ data: { status: 'ok' } })
  } catch {
    res.status(503).json({ error: { message: 'БД или Redis недоступны' } })
  }
})

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'TaskFlow API' }))
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec))

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/comments', commentsRouter)

app.use(notFound)
app.use(errorHandler)

module.exports = app
