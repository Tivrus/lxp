const express = require('express')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const rateLimit = require('express-rate-limit')
const prisma = require('../db')
const config = require('../config')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const { HttpError } = require('../utils/http')
const {
  refreshTtl,
  signAccessToken,
  issueRefreshToken,
  consumeRefreshToken,
  revokeRefreshToken,
} = require('../utils/jwt')

const router = express.Router()

const COOKIE = 'refreshToken'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: config.isProduction,
  path: '/api/auth',
}

const registerSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(100).required(),
  name: Joi.string().trim().min(2).max(50).required(),
  password: Joi.string().min(6).max(72).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
})

const loginLimiter = rateLimit({
  ...config.loginRateLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: { message: 'Слишком много попыток входа, попробуйте позже' } })
  },
})

function toPublic({ password, ...user }) {
  return user
}

async function sendSession(res, user) {
  res.cookie(COOKIE, await issueRefreshToken(user), { ...cookieOptions, maxAge: refreshTtl * 1000 })
  res.json({ data: { accessToken: signAccessToken(user), user: toPublic(user) } })
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, name, password } = req.body

  if (await prisma.user.findUnique({ where: { email } })) {
    throw new HttpError(409, 'Пользователь с таким email уже зарегистрирован')
  }

  const user = await prisma.user.create({
    data: { email, name, password: await bcrypt.hash(password, config.bcryptRounds) },
  })

  res.status(201).json({ data: toPublic(user) })
})

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } })

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new HttpError(401, 'Неверный email или пароль')
  }

  await sendSession(res, user)
})

router.post('/refresh', async (req, res) => {
  const token = req.cookies[COOKIE]
  if (!token) throw new HttpError(401, 'Refresh token не передан')

  let payload
  try {
    payload = await consumeRefreshToken(token)
  } catch {
    res.clearCookie(COOKIE, cookieOptions)
    throw new HttpError(401, 'Refresh token недействителен')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) throw new HttpError(401, 'Пользователь не найден')

  await sendSession(res, user)
})

router.post('/logout', async (req, res) => {
  const token = req.cookies[COOKIE]
  if (token) await revokeRefreshToken(token)

  res.clearCookie(COOKIE, cookieOptions)
  res.status(204).end()
})

router.get('/me', authenticate, (req, res) => {
  res.json({ data: req.user })
})

module.exports = router
