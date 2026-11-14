const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const { authorize } = require('../middleware/rbac')
const HttpError = require('../utils/httpError')
const { idParams, pagination, meta } = require('./common')

const router = express.Router()

const userSelect = { id: true, email: true, name: true, role: true, createdAt: true }

const updateSchema = Joi.object({
  email: Joi.string().trim().lowercase().email(),
  name: Joi.string().trim().min(2).max(50),
}).min(1)

const listQuery = Joi.object(pagination)

router.use(authenticate)

router.get('/', authorize('MODERATOR', 'ADMIN'), validate(listQuery, 'query'), async (req, res) => {
  const { page, limit } = req.query

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      select: { ...userSelect, _count: { select: { posts: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'asc' },
    }),
    prisma.user.count(),
  ])

  res.json({ data, meta: meta(total, page, limit) })
})

router.get('/:id', validate(idParams, 'params'), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      ...userSelect,
      posts: {
        where: req.user.id === req.params.id ? {} : { published: true },
        orderBy: { createdAt: 'desc' },
        include: { tags: true },
      },
    },
  })

  if (!user) throw new HttpError(404, 'Пользователь не найден')
  res.json(user)
})

router.patch('/:id', validate(idParams, 'params'), validate(updateSchema), async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
    throw new HttpError(403, 'Можно менять только свой профиль')
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
    select: userSelect,
  })
  res.json(user)
})

router.delete('/:id', authorize('ADMIN'), validate(idParams, 'params'), async (req, res) => {
  await prisma.$transaction([
    prisma.post.deleteMany({ where: { authorId: req.params.id } }),
    prisma.user.delete({ where: { id: req.params.id } }),
  ])
  res.status(204).end()
})

module.exports = router
