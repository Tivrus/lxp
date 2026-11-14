const prisma = require('../db')
const config = require('../config')

const include = { author: { select: { id: true, name: true } } }

function saveMessage({ text, room = null, authorId }) {
  return prisma.message.create({ data: { text, room, authorId }, include })
}

async function getHistory({ room = null, before, limit = config.chat.historyLimit }) {
  const messages = await prisma.message.findMany({
    where: { room, ...(before && { id: { lt: before } }) },
    orderBy: { id: 'desc' },
    take: limit,
    include,
  })
  return messages.reverse()
}

module.exports = { saveMessage, getHistory }
