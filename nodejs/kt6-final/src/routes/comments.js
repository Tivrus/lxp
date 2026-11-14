const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const { assertOwner } = require('../middleware/rbac')
const { HttpError } = require('../utils/http')
const { idParams, userPreview } = require('./common')

const router = express.Router()

const updateSchema = Joi.object({
  text: Joi.string().trim().min(1).max(2000).required(),
})

async function findComment(commentId) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) throw new HttpError(404, 'Комментарий не найден')
  return comment
}

router.use(authenticate)

router.patch('/:id', validate(idParams, 'params'), validate(updateSchema), async (req, res) => {
  const comment = await findComment(req.params.id)
  assertOwner(req.user, comment.authorId)

  const updated = await prisma.comment.update({
    where: { id: comment.id },
    data: { text: req.body.text },
    include: { author: userPreview },
  })
  res.json({ data: updated })
})

router.delete('/:id', validate(idParams, 'params'), async (req, res) => {
  const comment = await findComment(req.params.id)
  assertOwner(req.user, comment.authorId)

  await prisma.comment.delete({ where: { id: comment.id } })
  res.status(204).end()
})

module.exports = router
