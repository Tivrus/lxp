const jwt = require('jsonwebtoken')
const config = require('../config')

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
  })
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, ver: user.tokenVersion }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires,
  })
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret)
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret)
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken }
