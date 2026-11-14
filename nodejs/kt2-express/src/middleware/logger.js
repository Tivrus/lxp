function logger(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const time = new Date().toLocaleTimeString('ru-RU')
    console.log(`[${time}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start} ms`)
  })

  next()
}

module.exports = logger
