let nextId = 1

const products = []

function add(data) {
  const now = new Date().toISOString()
  const product = {
    id: nextId++,
    name: data.name,
    description: data.description ?? '',
    price: data.price,
    category: data.category,
    stock: data.stock ?? 0,
    imageUrl: null,
    createdAt: now,
    updatedAt: now,
  }
  products.push(product)
  return product
}

function findById(id) {
  return products.find((product) => product.id === id)
}

function update(product, data) {
  Object.assign(product, data, { updatedAt: new Date().toISOString() })
  return product
}

function remove(id) {
  const index = products.findIndex((product) => product.id === id)
  if (index === -1) return null
  return products.splice(index, 1)[0]
}

require('./products.json').forEach(add)

module.exports = { products, add, findById, update, remove }
