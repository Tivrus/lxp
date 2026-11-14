const path = require('node:path')
const dotenv = require('dotenv')

const root = path.resolve(__dirname, '../..')

dotenv.config({ path: path.join(root, '.env'), quiet: true })

module.exports = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  uploadDir: path.resolve(root, process.env.UPLOAD_DIR || 'uploads/products'),
  maxFileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 2) * 1024 * 1024,
}
