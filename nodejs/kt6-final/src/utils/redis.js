const { createClient } = require('redis')
const config = require('../config')

const redis = createClient({ url: config.redisUrl })

redis.on('error', (err) => {
  if (config.env !== 'test') console.error('Redis:', err.message)
})

async function connectRedis() {
  if (!redis.isOpen) await redis.connect()
}

module.exports = { redis, connectRedis }
