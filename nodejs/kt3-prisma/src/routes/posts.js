const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const validate = require('../middleware/validate')
const { idParams, pagination, meta } = require('./common')

const router = express.Router()

const fields = {
  title: Joi.string().trim().min(1).max(200),
  content: Joi.string().allow('', null).max(10000),
  published: Joi.boolean(),
  authorId: Joi.number().integer().min(1),
  tags: Joi.array().items(Joi.string().trim().lowercase().min(1).max(30)).max(10).unique(),
}

const createSchema = Joi.object({
  ...fields,
  title: fields.title.required(),
  authorId: fields.authorId.required(),
})

const updateSchema = Joi.object(fields).min(1)

const listQuery = Joi.object({
  search: Joi.string().trim().max(100).allow(''),
  published: Joi.boolean(),
  authorId: fields.authorId,
  ...pagination,
})

const withRelations = {
  author: { select: { id: true, name: true, email: true } },
  tags: true,
}

function connectTags(tags) {
  return tags.map((name) => ({ where: { name }, create: { name } }))
}

async function checkAuthor(authorId) {
  const author = await prisma.user.findUnique({ where: { id: authorId } })
  if (!author) {
    const error = new Error(`Автор с id ${authorId} не найден`)
    error.status = 400
    throw error
  }
}

router.get('/', validate(listQuery, 'query'), async (req, res) => {
  const { search, published, authorId, page, limit } = req.query

  const where = {
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
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: withRelations,
  })

  if (!post) return res.status(404).json({ error: 'Пост не найден' })
  res.json(post)
})

router.post('/', validate(createSchema), async (req, res) => {
  const { tags = [], ...data } = req.body
  await checkAuthor(data.authorId)

  const post = await prisma.post.create({
    data: {
      ...data,
      tags: { connectOrCreate: connectTags(tags) },
    },
    include: withRelations,
  })

  res.status(201).json(post)
})

router.patch('/:id', validate(idParams, 'params'), validate(updateSchema), async (req, res) => {
  const { tags, ...data } = req.body
  if (data.authorId) await checkAuthor(data.authorId)

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
  await prisma.post.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

module.exports = router
