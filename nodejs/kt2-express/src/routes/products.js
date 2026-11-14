const express = require('express')
const Joi = require('joi')
const store = require('../data/products')
const validate = require('../middleware/validate')
const { upload, removeFile } = require('../middleware/upload')

const router = express.Router()

const categories = ['electronics', 'clothing', 'food', 'other']

const fields = {
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().allow('').max(500),
  price: Joi.number().positive().precision(2),
  category: Joi.string().valid(...categories),
  stock: Joi.number().integer().min(0),
}

const createSchema = Joi.object({
  ...fields,
  name: fields.name.required(),
  price: fields.price.required(),
  category: fields.category.required(),
})

const patchSchema = Joi.object(fields).min(1)

const querySchema = Joi.object({
  category: fields.category,
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number()
    .min(0)
    .when('minPrice', { is: Joi.exist(), then: Joi.number().min(Joi.ref('minPrice')) })
    .messages({ 'number.min': 'maxPrice должно быть не меньше minPrice и не меньше 0' }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
})

const idSchema = Joi.object({
  id: Joi.number().integer().min(1).required(),
})

function getProduct(req, res) {
  const product = store.findById(req.params.id)
  if (!product) {
    res.status(404).json({ error: `Товар с id ${req.params.id} не найден` })
    return null
  }
  return product
}

router.get('/', validate(querySchema, 'query'), (req, res) => {
  const { category, minPrice, maxPrice, page, limit } = req.query

  const filtered = store.products.filter(
    (product) =>
      (!category || product.category === category) &&
      (minPrice === undefined || product.price >= minPrice) &&
      (maxPrice === undefined || product.price <= maxPrice),
  )

  res.json({
    data: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page,
    limit,
  })
})

router.get('/:id', validate(idSchema, 'params'), (req, res) => {
  const product = getProduct(req, res)
  if (product) res.json(product)
})

router.post('/', validate(createSchema), (req, res) => {
  res.status(201).json(store.add(req.body))
})

router.put('/:id', validate(idSchema, 'params'), validate(createSchema), (req, res) => {
  const product = getProduct(req, res)
  if (!product) return
  const { description = '', stock = 0, ...rest } = req.body
  res.json(store.update(product, { ...rest, description, stock }))
})

router.patch('/:id', validate(idSchema, 'params'), validate(patchSchema), (req, res) => {
  const product = getProduct(req, res)
  if (product) res.json(store.update(product, req.body))
})

router.delete('/:id', validate(idSchema, 'params'), (req, res) => {
  const product = store.remove(req.params.id)
  if (!product) {
    return res.status(404).json({ error: `Товар с id ${req.params.id} не найден` })
  }
  removeFile(product.imageUrl?.split('/').pop())
  res.status(204).end()
})

router.post('/:id/image', validate(idSchema, 'params'), (req, res, next) => {
  if (!store.findById(req.params.id)) {
    return res.status(404).json({ error: `Товар с id ${req.params.id} не найден` })
  }

  upload.single('image')(req, res, (err) => {
    if (err) return next(err)
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не передан, поле формы должно называться image' })
    }

    const product = store.findById(req.params.id)
    removeFile(product.imageUrl?.split('/').pop())
    res.json(store.update(product, { imageUrl: `/uploads/products/${req.file.filename}` }))
  })
})

module.exports = router
