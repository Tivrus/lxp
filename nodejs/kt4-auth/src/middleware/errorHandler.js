const { Prisma } = require('@prisma/client')
const config = require('../config')

function notFound(req, res) {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` })
}

function prismaError(err) {
  switch (err.code) {
    case 'P2002':
      return { status: 409, error: `Значение поля ${err.meta?.target ?? ''} уже занято` }
    case 'P2025':
      return { status: 404, error: 'Запись не найдена' }
    case 'P2003':
      return { status: 400, error: 'Связанная запись не найдена' }
    default:
      return null
  }
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = prismaError(err)
    if (mapped) return res.status(mapped.status).json({ error: mapped.error })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' })
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Тело запроса больше 10 КБ' })
  }

  const status = err.status || err.statusCode || 500
  if (status >= 500 && config.env !== 'test') console.error(err)

  res.status(status).json({
    error: status >= 500 ? 'Внутренняя ошибка сервера' : err.message,
    ...(config.env !== 'production' && status >= 500 && { stack: err.stack }),
  })
}

module.exports = { notFound, errorHandler }
