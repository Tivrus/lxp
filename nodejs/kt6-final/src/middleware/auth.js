const prisma = require('../db')
const { HttpError } = require('../utils/http')
const { verifyAccessToken } = require('../utils/jwt')

async function authenticate(req, res, next) {
  const [type, token] = (req.headers.authorization ?? '').split(' ')
  if (type !== 'Bearer' || !token) throw new HttpError(401, 'Нужна авторизация')

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw new HttpError(401, 'Токен недействителен или истёк')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true },
  })
  if (!user) throw new HttpError(401, 'Пользователь не найден')

  req.user = user
  next()
}

module.exports = authenticate
