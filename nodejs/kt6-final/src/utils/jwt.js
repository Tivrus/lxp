const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { redis } = require('./redis')

const refreshTtl = config.jwt.refreshDays * 24 * 60 * 60

const refreshKey = (jti) => `refresh:${jti}`

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
  })
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret)
}

async function issueRefreshToken(user) {
  const jti = crypto.randomUUID()
  await redis.set(refreshKey(jti), String(user.id), { EX: refreshTtl })
  return jwt.sign({ sub: user.id, jti }, config.jwt.refreshSecret, { expiresIn: refreshTtl })
}

async function consumeRefreshToken(token) {
  const payload = jwt.verify(token, config.jwt.refreshSecret)
  const stored = await redis.getDel(refreshKey(payload.jti))
  if (stored !== String(payload.sub)) {
    throw new jwt.JsonWebTokenError('refresh token revoked')
  }
  return payload
}

async function revokeRefreshToken(token) {
  const payload = jwt.decode(token)
  if (payload?.jti) await redis.del(refreshKey(payload.jti))
}

module.exports = {
  refreshTtl,
  signAccessToken,
  verifyAccessToken,
  issueRefreshToken,
  consumeRefreshToken,
  revokeRefreshToken,
}
