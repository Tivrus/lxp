const Joi = require('joi')
const config = require('../config')
const HttpError = require('../utils/httpError')
const messages = require('../config/joi-messages.json')
const { saveMessage, getHistory } = require('../services/messages')
const presence = require('./presence')

const roomName = Joi.string()
  .trim()
  .pattern(/^[\p{L}\d_-]{1,30}$/u)
  .required()
  .messages({ 'string.pattern.base': 'название комнаты: до 30 букв, цифр, - или _' })
const text = Joi.string().trim().min(1).max(config.chat.maxLength).required()

const schemas = {
  send: Joi.object({ text }),
  room: Joi.object({ room: roomName }),
  roomMessage: Joi.object({ room: roomName, text }),
}

const roomKey = (room) => `room:${room}`

function handler(schema, fn) {
  return async (payload, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {}
    const { error, value } = schema.validate(payload ?? {}, {
      messages,
      errors: { wrap: { label: false } },
    })
    if (error) return reply({ ok: false, error: error.details[0].message })

    try {
      reply({ ok: true, ...(await fn(value)) })
    } catch (err) {
      if (err instanceof HttpError) return reply({ ok: false, error: err.message })
      console.error(err)
      reply({ ok: false, error: 'Ошибка сервера' })
    }
  }
}

function registerChat(io, socket) {
  const { user } = socket.data

  if (presence.addConnection(user)) {
    socket.broadcast.emit('user:online', user)
  }
  socket.emit('users:list', presence.onlineUsers())

  socket.on(
    'message:send',
    handler(schemas.send, async ({ text }) => {
      const message = await saveMessage({ text, authorId: user.id })
      io.emit('message:new', message)
      return { message }
    }),
  )

  socket.on(
    'room:join',
    handler(schemas.room, async ({ room }) => {
      await socket.join(roomKey(room))
      socket.to(roomKey(room)).emit('room:joined', { room, user })
      return { room, history: await getHistory({ room }) }
    }),
  )

  socket.on(
    'room:leave',
    handler(schemas.room, async ({ room }) => {
      await socket.leave(roomKey(room))
      socket.to(roomKey(room)).emit('room:left', { room, user })
      return { room }
    }),
  )

  socket.on(
    'room:message',
    handler(schemas.roomMessage, async ({ room, text }) => {
      if (!socket.rooms.has(roomKey(room))) {
        throw new HttpError(403, 'Сначала нужно войти в комнату')
      }
      const message = await saveMessage({ text, room, authorId: user.id })
      io.to(roomKey(room)).emit('room:message', message)
      return { message }
    }),
  )

  socket.on('disconnect', () => {
    if (presence.removeConnection(user)) {
      io.emit('user:offline', user)
    }
  })
}

module.exports = registerChat
