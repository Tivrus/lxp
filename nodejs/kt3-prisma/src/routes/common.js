const Joi = require('joi')

const idParams = Joi.object({
  id: Joi.number().integer().min(1).required(),
})

const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}

function meta(total, page, limit) {
  return { total, page, limit, pages: Math.ceil(total / limit) }
}

module.exports = { idParams, pagination, meta }
