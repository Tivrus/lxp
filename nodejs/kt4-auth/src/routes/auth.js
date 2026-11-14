const express = require('express')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const rateLimit = require('express-rate-limit')
const prisma = require('../db')
const config = require('../config')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const HttpError = require('../utils/httpError')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt')

const router = express.Router()

const REFRESH_COOKIE = 'refreshToken'

const registerSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  name: Joi.string().trim().min(2).max(50).required(),
  password: Joi.string().min(6).max(72).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа, попробуйте через 15 минут' },
})

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: config.env === 'production',
  path: '/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

function publicUser(user) {
  const { password, tokenVersion, ...rest } = user
  return rest
}

function sendTokens(res, user) {
  res.cookie(REFRESH_COOKIE, signRefreshToken(user), cookieOptions)
  return { accessToken: signAccessToken(user), user: publicUser(user) }
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, name, password } = req.body

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new HttpError(409, 'Пользователь с таким email уже есть')

  const user = await prisma.user.create({
    data: { email, name, password: await bcrypt.hash(password, config.bcryptRounds) },
  })

  res.status(201).json(publicUser(user))
})

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'Неверный email или пароль')
  }

  res.json(sendTokens(res, user))
})

router.post('/refresh', async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE]
  if (!token) throw new HttpError(401, 'Refresh token не передан')

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new HttpError(401, 'Refresh token недействителен или истёк')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user || user.tokenVersion !== payload.ver) {
    throw new HttpError(401, 'Refresh token отозван')
  }

  res.json(sendTokens(res, user))
})

router.post('/logout', async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE]

  if (token) {
    try {
      const { sub } = verifyRefreshToken(token)
      await prisma.user.update({ where: { id: sub }, data: { tokenVersion: { increment: 1 } } })
    } catch {}
  }

  const { maxAge, ...clearOptions } = cookieOptions
  res.clearCookie(REFRESH_COOKIE, clearOptions)
  res.status(204).end()
})

router.get('/me', authenticate, (req, res) => {
  res.json(req.user)
})

module.exports = router
