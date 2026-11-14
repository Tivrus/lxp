const { app, prisma, request, resetDb, createUserWithToken } = require('./helpers')

let owner, other, moder, admin

beforeEach(async () => {
  await resetDb()
  owner = await createUserWithToken('owner@test.ru')
  other = await createUserWithToken('other@test.ru')
  moder = await createUserWithToken('moder@test.ru', 'MODERATOR')
  admin = await createUserWithToken('admin@test.ru', 'ADMIN')
})

const auth = (token) => ({ Authorization: `Bearer ${token}` })

async function createPost(token, body = { title: 'Пост', published: true }) {
  const res = await request(app).post('/api/posts').set(auth(token)).send(body)
  return res.body
}

describe('posts', () => {
  it('без токена список постов недоступен', async () => {
    const res = await request(app).get('/api/posts')
    expect(res.status).toBe(401)
  })

  it('создаёт пост от имени текущего пользователя с тегами', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set(auth(owner.token))
      .send({ title: 'Про Node', tags: ['node', 'Jest'] })

    expect(res.status).toBe(201)
    expect(res.body.authorId).toBe(owner.user.id)
    expect(res.body.tags.map((t) => t.name).sort()).toEqual(['jest', 'node'])
  })

  it('владелец удаляет свой пост', async () => {
    const post = await createPost(owner.token)

    const res = await request(app).delete(`/api/posts/${post.id}`).set(auth(owner.token))

    expect(res.status).toBe(204)
    expect(await prisma.post.count()).toBe(0)
  })

  it('другой пользователь получает 403 при удалении и изменении чужого поста', async () => {
    const post = await createPost(owner.token)

    const del = await request(app).delete(`/api/posts/${post.id}`).set(auth(other.token))
    const patch = await request(app).patch(`/api/posts/${post.id}`).set(auth(other.token)).send({ title: 'взлом' })

    expect(del.status).toBe(403)
    expect(patch.status).toBe(403)
    expect(await prisma.post.count()).toBe(1)
  })

  it('модератор может редактировать и удалять чужие посты', async () => {
    const post = await createPost(owner.token)

    const patch = await request(app).patch(`/api/posts/${post.id}`).set(auth(moder.token)).send({ published: false })
    const del = await request(app).delete(`/api/posts/${post.id}`).set(auth(moder.token))

    expect(patch.status).toBe(200)
    expect(del.status).toBe(204)
  })

  it('чужие черновики не видны обычному пользователю', async () => {
    const draft = await createPost(owner.token, { title: 'Черновик' })

    const list = await request(app).get('/api/posts').set(auth(other.token))
    const one = await request(app).get(`/api/posts/${draft.id}`).set(auth(other.token))

    expect(list.body.meta.total).toBe(0)
    expect(one.status).toBe(404)
  })
})

describe('users и admin', () => {
  it('USER не видит список пользователей, MODERATOR видит', async () => {
    const asUser = await request(app).get('/api/users').set(auth(owner.token))
    const asModer = await request(app).get('/api/users').set(auth(moder.token))

    expect(asUser.status).toBe(403)
    expect(asModer.status).toBe(200)
    expect(asModer.body.meta.total).toBe(4)
  })

  it('роль меняет только ADMIN', async () => {
    const byModer = await request(app)
      .patch(`/admin/users/${owner.user.id}/role`)
      .set(auth(moder.token))
      .send({ role: 'ADMIN' })
    const byAdmin = await request(app)
      .patch(`/admin/users/${owner.user.id}/role`)
      .set(auth(admin.token))
      .send({ role: 'MODERATOR' })

    expect(byModer.status).toBe(403)
    expect(byAdmin.status).toBe(200)
    expect(byAdmin.body.role).toBe('MODERATOR')
  })
})
