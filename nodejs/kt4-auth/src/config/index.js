const path = require('node:path')
const dotenv = require('dotenv')

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
dotenv.config({ path: path.resolve(__dirname, '../..', envFile), quiet: true })

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`В ${envFile} не задан ${name}`)
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
  bcryptRounds: process.env.NODE_ENV === 'test' ? 4 : 10,
}
