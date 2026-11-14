const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const validate = require('../middleware/validate')
const { idParams, pagination, meta } = require('./common')

const router = express.Router()

const fields = {
  email: Joi.string().trim().lowercase().email(),
  name: Joi.string().trim().min(2).max(50),
  role: Joi.string().valid('USER', 'ADMIN'),
}

const createSchema = Joi.object({
  ...fields,
  email: fields.email.required(),
  name: fields.name.required(),
})

const updateSchema = Joi.object(fields).min(1)

const listQuery = Joi.object(pagination)

router.get('/', validate(listQuery, 'query'), async (req, res) => {
  const { page, limit } = req.query

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'asc' },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.user.count(),
  ])

  res.json({ data, meta: meta(total, page, limit) })
})

router.get('/:id', validate(idParams, 'params'), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
        include: { tags: true },
      },
    },
  })

  if (!user) return res.status(404).json({ error: 'Пользователь не найден' })
  res.json(user)
})

router.post('/', validate(createSchema), async (req, res) => {
  const user = await prisma.user.create({ data: req.body })
  res.status(201).json(user)
})

router.patch('/:id', validate(idParams, 'params'), validate(updateSchema), async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(user)
})

router.delete('/:id', validate(idParams, 'params'), async (req, res) => {
  await prisma.$transaction([
    prisma.post.deleteMany({ where: { authorId: req.params.id } }),
    prisma.user.delete({ where: { id: req.params.id } }),
  ])
  res.status(204).end()
})

module.exports = router
