const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const { authorize } = require('../middleware/rbac')
const { pageParams, pageMeta } = require('../utils/http')
const { idParams, pagination } = require('./common')

const router = express.Router()

const select = { id: true, email: true, name: true, role: true, createdAt: true }

const listQuery = Joi.object({
  search: Joi.string().trim().max(100).allow(''),
  role: Joi.string().valid('USER', 'ADMIN'),
  ...pagination,
})

const roleSchema = Joi.object({
  role: Joi.string().valid('USER', 'ADMIN').required(),
})

router.use(authenticate, authorize('ADMIN'))

router.get('/', validate(listQuery, 'query'), async (req, res) => {
  const { search, role } = req.query

  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }],
    }),
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({ where, select, orderBy: { id: 'asc' }, ...pageParams(req.query) }),
    prisma.user.count({ where }),
  ])

  res.json({ data, meta: pageMeta(total, req.query) })
})

router.patch('/:id/role', validate(idParams, 'params'), validate(roleSchema), async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: req.body.role },
    select,
  })
  res.json({ data: user })
})

module.exports = router
