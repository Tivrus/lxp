const path = require('node:path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true })

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`В .env не задан ${name}`)
  return value
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: required('DATABASE_URL'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  chat: {
    historyLimit: Number(process.env.CHAT_HISTORY_LIMIT) || 50,
    maxLength: Number(process.env.CHAT_MESSAGE_MAX_LENGTH) || 1000,
  },
  bcryptRounds: 10,
}
