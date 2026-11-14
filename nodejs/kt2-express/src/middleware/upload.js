const fs = require('node:fs')
const path = require('node:path')
const multer = require('multer')
const config = require('../config')

fs.mkdirSync(config.uploadDir, { recursive: true })

const allowed = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
}

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (req, file, cb) => {
    cb(null, `product-${req.params.id}-${Date.now()}${allowed[file.mimetype]}`)
  },
})

function fileFilter(req, file, cb) {
  if (!allowed[file.mimetype]) {
    const error = new Error('Можно загружать только JPEG и PNG')
    error.status = 400
    return cb(error)
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSize, files: 1 },
})

function removeFile(filename) {
  if (!filename) return
  fs.promises.unlink(path.join(config.uploadDir, filename)).catch(() => {})
}

module.exports = { upload, removeFile }
