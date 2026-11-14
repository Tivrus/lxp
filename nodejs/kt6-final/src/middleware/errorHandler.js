const { Prisma } = require('@prisma/client')
const config = require('../config')
const { HttpError } = require('../utils/http')

const prismaErrors = {
  P2002: [409, 'Запись с такими данными уже существует'],
  P2003: [400, 'Связанная запись не найдена'],
  P2025: [404, 'Запись не найдена'],
}

function toHttpError(err) {
  if (err instanceof HttpError) return err

  if (err instanceof Prisma.PrismaClientKnownRequestError && prismaErrors[err.code]) {
    return new HttpError(...prismaErrors[err.code])
  }

  if (err.type === 'entity.parse.failed') return new HttpError(400, 'Некорректный JSON в теле запроса')
  if (err.type === 'entity.too.large') return new HttpError(413, 'Тело запроса слишком большое')

  return null
}

function notFound(req, res) {
  res.status(404).json({ error: { message: `Маршрут ${req.method} ${req.path} не найден` } })
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  const known = toHttpError(err)
  if (known) {
    return res.status(known.status).json({
      error: { message: known.message, ...(known.details && { details: known.details }) },
    })
  }

  if (config.env !== 'test') console.error(err)

  res.status(500).json({
    error: {
      message: 'Внутренняя ошибка сервера',
      ...(!config.isProduction && { stack: err.stack }),
    },
  })
}

module.exports = { notFound, errorHandler }
