const path = require('node:path')
const { execSync } = require('node:child_process')
const dotenv = require('dotenv')

module.exports = async () => {
  const root = path.resolve(__dirname, '..')
  const { parsed } = dotenv.config({ path: path.join(root, '.env.test'), quiet: true })
  execSync('npx prisma migrate deploy', { cwd: root, env: { ...process.env, ...parsed }, stdio: 'ignore' })
}
