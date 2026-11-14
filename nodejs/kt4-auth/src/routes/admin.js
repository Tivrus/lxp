const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/auth')
const { authorize } = require('../middleware/rbac')
const { idParams } = require('./common')

const router = express.Router()

const roleSchema = Joi.object({
  role: Joi.string().valid('USER', 'MODERATOR', 'ADMIN').required(),
})

router.use(authenticate, authorize('ADMIN'))

router.patch('/users/:id/role', validate(idParams, 'params'), validate(roleSchema), async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: req.body.role },
    select: { id: true, email: true, name: true, role: true },
  })
  res.json(user)
})

module.exports = router
