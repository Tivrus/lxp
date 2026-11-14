const path = require('node:path')
const { execSync } = require('node:child_process')
const dotenv = require('dotenv')

module.exports = async () => {
  const env = dotenv.config({ path: path.resolve(__dirname, '../.env.test'), quiet: true }).parsed
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, ...env },
    stdio: 'ignore',
  })
}
