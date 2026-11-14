const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const { isAdmin } = require('../middleware/rbac')
const { HttpError, pageParams, pageMeta } = require('../utils/http')
const { id, idParams, pagination, userPreview } = require('./common')

const router = express.Router()

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

const fields = {
  title: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().max(5000).allow('', null),
  status: Joi.string().valid(...STATUSES),
  priority: Joi.string().valid(...PRIORITIES),
  dueDate: Joi.date().iso().allow(null),
  assigneeId: id.allow(null),
}

const createSchema = Joi.object({
  ...fields,
  title: fields.title.required(),
  projectId: id.required(),
})

const updateSchema = Joi.object(fields).min(1)

const listQuery = Joi.object({
  projectId: id,
  status: fields.status,
  priority: fields.priority,
  assigneeId: id,
  search: Joi.string().trim().max(100).allow(''),
  overdue: Joi.boolean(),
  sort: Joi.string().valid('createdAt', 'dueDate', 'priority').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  ...pagination,
})

const commentSchema = Joi.object({
  text: Joi.string().trim().min(1).max(2000).required(),
})

const include = {
  project: { select: { id: true, title: true, ownerId: true } },
  author: userPreview,
  assignee: userPreview,
  _count: { select: { comments: true } },
}

const commentInclude = { author: userPreview }

async function findTask(taskId) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include })
  if (!task) throw new HttpError(404, 'Задача не найдена')
  return task
}

async function checkAssignee(assigneeId) {
  if (!assigneeId) return
  const exists = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true } })
  if (!exists) throw new HttpError(400, `Пользователь с id ${assigneeId} не найден`)
}

function canManage(user, task) {
  return isAdmin(user) || user.id === task.authorId || user.id === task.project.ownerId
}

router.use(authenticate)

router.get('/', validate(listQuery, 'query'), async (req, res) => {
  const { projectId, status, priority, assigneeId, search, overdue, sort, order } = req.query

  const where = {
    ...(projectId && { projectId }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assigneeId && { assigneeId }),
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
    ...(overdue && { dueDate: { lt: new Date() }, status: { not: 'DONE' } }),
  }

  const orderBy =
    sort === 'dueDate'
      ? [{ dueDate: { sort: order, nulls: 'last' } }, { id: 'asc' }]
      : [{ [sort]: order }, { id: 'asc' }]

  const [data, total] = await prisma.$transaction([
    prisma.task.findMany({ where, include, orderBy, ...pageParams(req.query) }),
    prisma.task.count({ where }),
  ])

  res.json({ data, meta: pageMeta(total, req.query) })
})

router.get('/:id', validate(idParams, 'params'), async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: {
      ...include,
      comments: { include: commentInclude, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!task) throw new HttpError(404, 'Задача не найдена')

  res.json({ data: task })
})

router.post('/', validate(createSchema), async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.body.projectId } })
  if (!project) throw new HttpError(400, `Проект с id ${req.body.projectId} не найден`)
  await checkAssignee(req.body.assigneeId)

  const task = await prisma.task.create({
    data: { ...req.body, authorId: req.user.id },
    include,
  })
  res.status(201).json({ data: task })
})

router.patch('/:id', validate(idParams, 'params'), validate(updateSchema), async (req, res) => {
  const task = await findTask(req.params.id)

  if (!canManage(req.user, task)) {
    const onlyStatus = Object.keys(req.body).every((key) => key === 'status')
    if (task.assigneeId !== req.user.id || !onlyStatus) {
      throw new HttpError(403, 'Исполнитель может менять только статус задачи')
    }
  }

  await checkAssignee(req.body.assigneeId)

  const updated = await prisma.task.update({ where: { id: task.id }, data: req.body, include })
  res.json({ data: updated })
})

router.delete('/:id', validate(idParams, 'params'), async (req, res) => {
  const task = await findTask(req.params.id)
  if (!canManage(req.user, task)) {
    throw new HttpError(403, 'Удалить задачу может автор, владелец проекта или администратор')
  }

  await prisma.task.delete({ where: { id: task.id } })
  res.status(204).end()
})

router.get(
  '/:id/comments',
  validate(idParams, 'params'),
  validate(Joi.object(pagination), 'query'),
  async (req, res) => {
    await findTask(req.params.id)
    const where = { taskId: req.params.id }

    const [data, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        include: commentInclude,
        orderBy: { createdAt: 'asc' },
        ...pageParams(req.query),
      }),
      prisma.comment.count({ where }),
    ])

    res.json({ data, meta: pageMeta(total, req.query) })
  },
)

router.post('/:id/comments', validate(idParams, 'params'), validate(commentSchema), async (req, res) => {
  await findTask(req.params.id)

  const comment = await prisma.comment.create({
    data: { text: req.body.text, taskId: req.params.id, authorId: req.user.id },
    include: commentInclude,
  })
  res.status(201).json({ data: comment })
})

module.exports = router
