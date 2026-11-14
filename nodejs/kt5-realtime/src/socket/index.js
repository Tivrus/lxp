const { Server } = require('socket.io')
const socketAuth = require('./auth')
const registerChat = require('./chat')

function createSocketServer(httpServer) {
  const io = new Server(httpServer)

  io.use(socketAuth)
  io.on('connection', (socket) => registerChat(io, socket))

  return io
}

module.exports = createSocketServer
