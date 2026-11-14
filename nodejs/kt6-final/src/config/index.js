const path = require('node:path')
const dotenv = require('dotenv')

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
dotenv.config({ path: path.resolve(__dirname, '../..', envFile), quiet: true })

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Не задана переменная окружения ${name}`)
  return value
}

const env = process.env.NODE_ENV || 'development'

module.exports = {
  env,
  isProduction: env === 'production',
  port: Number(process.env.PORT) || 3000,
  databaseUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 7,
  },
  bcryptRounds: env === 'test' ? 4 : 10,
  loginRateLimit: {
    windowMs: 15 * 60 * 1000,
    limit: 10,
  },
}
