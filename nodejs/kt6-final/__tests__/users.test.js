const { createUser, api } = require('./helpers')

describe('пользователи (RBAC)', () => {
  it('USER не видит список пользователей', async () => {
    const user = await createUser('user@mail.ru')

    const res = await api(user).get('/api/users')

    expect(res.status).toBe(403)
  })

  it('ADMIN видит список и меняет роль', async () => {
    const user = await createUser('user@mail.ru')
    const admin = await createUser('admin@mail.ru', 'ADMIN')

    const list = await api(admin).get('/api/users?role=USER')
    const promote = await api(admin).patch(`/api/users/${user.id}/role`, { role: 'ADMIN' })

    expect(list.body.meta.total).toBe(1)
    expect(promote.status).toBe(200)
    expect(promote.body.data.role).toBe('ADMIN')
  })
})
