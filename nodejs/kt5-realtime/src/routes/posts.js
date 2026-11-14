const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const { canModify } = require('../middleware/rbac')
const HttpError = require('../utils/httpError')
const { idParams, pagination, meta } = require('./common')

const router = express.Router()

const fields = {
  title: Joi.string().trim().min(1).max(200),
  content: Joi.string().allow('', null).max(10000),
  published: Joi.boolean(),
  tags: Joi.array().items(Joi.string().trim().lowercase().min(1).max(30)).max(10).unique(),
}

const createSchema = Joi.object({
  ...fields,
  title: fields.title.required(),
})

const updateSchema = Joi.object(fields).min(1)

const listQuery = Joi.object({
  search: Joi.string().trim().max(100).allow(''),
  published: Joi.boolean(),
  authorId: Joi.number().integer().min(1),
  ...pagination,
})

const withRelations = {
  author: { select: { id: true, name: true, email: true } },
  tags: true,
}

function connectTags(tags) {
  return tags.map((name) => ({ where: { name }, create: { name } }))
}

function visibleFor(user) {
  return user.role === 'USER' ? { OR: [{ published: true }, { authorId: user.id }] } : {}
}

async function findPost(id, user) {
  const post = await prisma.post.findFirst({
    where: { id, ...visibleFor(user) },
    include: withRelations,
  })
  if (!post) throw new HttpError(404, 'Пост не найден')
  return post
}

function checkAccess(user, post) {
  if (!canModify(user, post.authorId)) {
    throw new HttpError(403, 'Можно изменять только свои посты')
  }
}

router.use(authenticate)

router.get('/', validate(listQuery, 'query'), async (req, res) => {
  const { search, published, authorId, page, limit } = req.query

  const where = {
    ...visibleFor(req.user),
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
    ...(published !== undefined && { published }),
    ...(authorId && { authorId }),
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: withRelations,
    }),
    prisma.post.count({ where }),
  ])

  res.json({ data, meta: meta(total, page, limit) })
})

router.get('/:id', validate(idParams, 'params'), async (req, res) => {
  res.json(await findPost(req.params.id, req.user))
})

router.post('/', validate(createSchema), async (req, res) => {
  const { tags = [], ...data } = req.body

  const post = await prisma.post.create({
    data: {
      ...data,
      authorId: req.user.id,
      tags: { connectOrCreate: connectTags(tags) },
    },
    include: withRelations,
  })

  res.status(201).json(post)
})

router.patch('/:id', validate(idParams, 'params'), validate(updateSchema), async (req, res) => {
  checkAccess(req.user, await findPost(req.params.id, req.user))
  const { tags, ...data } = req.body

  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(tags && { tags: { set: [], connectOrCreate: connectTags(tags) } }),
    },
    include: withRelations,
  })

  res.json(post)
})

router.delete('/:id', validate(idParams, 'params'), async (req, res) => {
  checkAccess(req.user, await findPost(req.params.id, req.user))
  await prisma.post.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

module.exports = router
