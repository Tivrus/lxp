const messages = require('../config/joi-messages.json')

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source] ?? {}, {
      abortEarly: false,
      stripUnknown: source === 'query',
      messages,
      errors: { wrap: { label: false } },
    })

    if (error) {
      return res.status(400).json({
        error: {
          message: 'Ошибка валидации',
          details: error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
          })),
        },
      })
    }

    Object.defineProperty(req, source, { value })
    next()
  }
}

module.exports = validate
