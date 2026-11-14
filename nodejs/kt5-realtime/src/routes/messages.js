const express = require('express')
const Joi = require('joi')
const config = require('../config')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const { getHistory } = require('../services/messages')

const router = express.Router()

const historyQuery = Joi.object({
  room: Joi.string().trim().pattern(/^[\p{L}\d_-]{1,30}$/u),
  before: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100).default(config.chat.historyLimit),
})

router.get('/', authenticate, validate(historyQuery, 'query'), async (req, res) => {
  res.json({ data: await getHistory(req.query) })
})

module.exports = router
