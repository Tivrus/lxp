const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const { assertOwner } = require('../middleware/rbac')
const { HttpError, pageParams, pageMeta } = require('../utils/http')
const { id, idParams, pagination, userPreview } = require('./common')

const router = express.Router()

const fields = {
  title: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(2000).allow('', null),
}

const createSchema = Joi.object({ ...fields, title: fields.title.required() })
const updateSchema = Joi.object(fields).min(1)

const listQuery = Joi.object({
  search: Joi.string().trim().max(100).allow(''),
  ownerId: id,
  mine: Joi.boolean(),
  ...pagination,
})

const include = {
  owner: userPreview,
  _count: { select: { tasks: true } },
}

async function findProject(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include })
  if (!project) throw new HttpError(404, 'Проект не найден')
  return project
}

router.use(authenticate)

router.get('/', validate(listQuery, 'query'), async (req, res) => {
  const { search, ownerId, mine } = req.query

  const where = {
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
    ...(ownerId && { ownerId }),
    ...(mine && { ownerId: req.user.id }),
  }

  const [data, total] = await prisma.$transaction([
    prisma.project.findMany({ where, include, orderBy: { createdAt: 'desc' }, ...pageParams(req.query) }),
    prisma.project.count({ where }),
  ])

  res.json({ data, meta: pageMeta(total, req.query) })
})

router.get('/:id', validate(idParams, 'params'), async (req, res) => {
  const project = await findProject(req.params.id)

  const groups = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId: project.id },
    _count: true,
  })
  const stats = { TODO: 0, IN_PROGRESS: 0, DONE: 0 }
  groups.forEach((group) => (stats[group.status] = group._count))

  res.json({ data: { ...project, stats } })
})

router.post('/', validate(createSchema), async (req, res) => {
  const project = await prisma.project.create({
    data: { ...req.body, ownerId: req.user.id },
    include,
  })
  res.status(201).json({ data: project })
})

router.patch('/:id', validate(idParams, 'params'), validate(updateSchema), async (req, res) => {
  const project = await findProject(req.params.id)
  assertOwner(req.user, project.ownerId)

  const updated = await prisma.project.update({ where: { id: project.id }, data: req.body, include })
  res.json({ data: updated })
})

router.delete('/:id', validate(idParams, 'params'), async (req, res) => {
  const project = await findProject(req.params.id)
  assertOwner(req.user, project.ownerId)

  await prisma.project.delete({ where: { id: project.id } })
  res.status(204).end()
})

module.exports = router
