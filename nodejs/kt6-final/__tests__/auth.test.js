const { app, request, PASSWORD, createUser, api } = require('./helpers')

const cookieFrom = (res) => res.headers['set-cookie']?.find((c) => c.startsWith('refreshToken='))

describe('регистрация', () => {
  it('создаёт пользователя с ролью USER и не возвращает пароль', async () => {
    const res = await api().post('/api/auth/register', { email: 'New@Mail.ru', name: 'Новый', password: 'qwerty1' })

    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ email: 'new@mail.ru', role: 'USER' })
    expect(res.body.data.password).toBeUndefined()
  })

  it('не даёт зарегистрироваться на занятый email', async () => {
    await createUser('busy@mail.ru')

    const res = await api().post('/api/auth/register', { email: 'busy@mail.ru', name: 'Двойник', password: 'qwerty1' })

    expect(res.status).toBe(409)
    expect(res.body.error.message).toMatch(/уже зарегистрирован/)
  })

  it('проверяет входные данные', async () => {
    const res = await api().post('/api/auth/register', { email: 'плохой', password: '1', role: 'ADMIN' })

    expect(res.status).toBe(400)
    expect(res.body.error.details.map((d) => d.field).sort()).toEqual(['email', 'name', 'password', 'role'])
  })
})

describe('логин', () => {
  it('возвращает access token и ставит httpOnly cookie с refresh token', async () => {
    await createUser('ivan@mail.ru')

    const res = await api().post('/api/auth/login', { email: 'ivan@mail.ru', password: PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toEqual(expect.any(String))
    expect(cookieFrom(res)).toMatch(/HttpOnly/)
  })

  it('отвечает 401 на неверный пароль', async () => {
    await createUser('ivan@mail.ru')

    const res = await api().post('/api/auth/login', { email: 'ivan@mail.ru', password: 'не тот' })

    expect(res.status).toBe(401)
    expect(cookieFrom(res)).toBeUndefined()
  })
})

describe('токены', () => {
  it('GET /api/auth/me работает с токеном и без него отдаёт 401', async () => {
    const user = await createUser('me@mail.ru')

    const withToken = await api(user).get('/api/auth/me')
    const without = await api().get('/api/auth/me')

    expect(withToken.status).toBe(200)
    expect(withToken.body.data.email).toBe('me@mail.ru')
    expect(without.status).toBe(401)
  })

  it('refresh выдаёт новые токены, а старый refresh больше не принимается', async () => {
    await createUser('r@mail.ru')
    const login = await api().post('/api/auth/login', { email: 'r@mail.ru', password: PASSWORD })
    const oldCookie = cookieFrom(login).split(';')[0]

    const first = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie)
    const reused = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie)

    expect(first.status).toBe(200)
    expect(first.body.data.accessToken).toEqual(expect.any(String))
    expect(reused.status).toBe(401)
  })

  it('после logout refresh token отозван', async () => {
    await createUser('out@mail.ru')
    const login = await api().post('/api/auth/login', { email: 'out@mail.ru', password: PASSWORD })
    const cookie = cookieFrom(login).split(';')[0]

    const logout = await request(app).post('/api/auth/logout').set('Cookie', cookie)
    const refresh = await request(app).post('/api/auth/refresh').set('Cookie', cookie)

    expect(logout.status).toBe(204)
    expect(refresh.status).toBe(401)
  })
})

describe('безопасность', () => {
  it('helmet добавляет заголовки', async () => {
    const res = await api().get('/')

    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('неизвестный маршрут отдаёт 404 в общем формате', async () => {
    const res = await api().get('/api/nothing')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { message: expect.any(String) } })
  })
})
