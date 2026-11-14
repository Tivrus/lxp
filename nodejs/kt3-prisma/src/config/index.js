const path = require('node:path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true })

if (!process.env.DATABASE_URL) {
  throw new Error('В .env не задан DATABASE_URL')
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
}
