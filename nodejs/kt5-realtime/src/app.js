const path = require('node:path')
const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const { notFound, errorHandler } = require('./middleware/errorHandler')
const authRouter = require('./routes/auth')
const adminRouter = require('./routes/admin')
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/posts')
const messagesRouter = require('./routes/messages')

const app = express()

app.set('trust proxy', 1)
app.use(helmet())
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')))

app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/api/users', usersRouter)
app.use('/api/posts', postsRouter)
app.use('/api/messages', messagesRouter)

app.use(notFound)
app.use(errorHandler)

module.exports = app
