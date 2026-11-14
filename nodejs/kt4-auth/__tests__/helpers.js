const request = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../src/app')
const prisma = require('../src/db')
const { signAccessToken } = require('../src/utils/jwt')

const PASSWORD = 'secret123'

async function resetDb() {
  await prisma.$executeRawUnsafe('TRUNCATE "Post", "Tag", "User" RESTART IDENTITY CASCADE')
}

async function createUser(email, role = 'USER') {
  return prisma.user.create({
    data: { email, name: email.split('@')[0], role, password: await bcrypt.hash(PASSWORD, 4) },
  })
}

async function createUserWithToken(email, role) {
  const user = await createUser(email, role)
  return { user, token: signAccessToken(user) }
}

async function loginAs(email) {
  const res = await request(app).post('/auth/login').send({ email, password: PASSWORD })
  return res.body.accessToken
}

module.exports = { app, prisma, request, PASSWORD, resetDb, createUser, createUserWithToken, loginAs }
