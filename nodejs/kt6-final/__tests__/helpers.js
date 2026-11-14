const request = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../src/app')
const prisma = require('../src/db')
const { signAccessToken } = require('../src/utils/jwt')

const PASSWORD = 'secret123'

async function createUser(email, role = 'USER') {
  const user = await prisma.user.create({
    data: { email, name: email.split('@')[0], role, password: await bcrypt.hash(PASSWORD, 4) },
  })
  return { ...user, token: signAccessToken(user) }
}

function api(user) {
  const withAuth = (req) => (user ? req.set('Authorization', `Bearer ${user.token}`) : req)
  return {
    get: (url) => withAuth(request(app).get(url)),
    post: (url, body) => withAuth(request(app).post(url)).send(body),
    patch: (url, body) => withAuth(request(app).patch(url)).send(body),
    delete: (url) => withAuth(request(app).delete(url)),
  }
}

module.exports = { app, prisma, request, PASSWORD, createUser, api }
