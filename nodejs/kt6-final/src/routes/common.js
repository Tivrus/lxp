const Joi = require('joi')

const id = Joi.number().integer().min(1)

const idParams = Joi.object({ id: id.required() })

const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}

const userPreview = { select: { id: true, name: true, email: true } }

module.exports = { id, idParams, pagination, userPreview }
