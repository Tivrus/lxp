const prisma = require('../db')
const { verifyAccessToken } = require('../utils/jwt')

async function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token

  if (!token) return next(new Error('Нужна авторизация'))

  try {
    const { sub } = verifyAccessToken(token)
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, name: true, role: true },
    })
    if (!user) return next(new Error('Пользователь не найден'))

    socket.data.user = user
    next()
  } catch {
    next(new Error('Токен недействителен или истёк'))
  }
}

module.exports = socketAuth
