const multer = require('multer')
const config = require('../config')

function notFound(req, res) {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` })
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Файл больше ${config.maxFileSize / 1024 / 1024} МБ`
        : `Ошибка загрузки файла: ${err.message}`
    return res.status(400).json({ error: message })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' })
  }

  const status = err.status || err.statusCode || 500
  if (status >= 500) console.error(err)

  res.status(status).json({
    error: status >= 500 ? 'Внутренняя ошибка сервера' : err.message,
    ...(config.env === 'development' && status >= 500 && { stack: err.stack }),
  })
}

module.exports = { notFound, errorHandler }
