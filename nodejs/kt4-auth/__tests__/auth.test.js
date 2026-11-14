const { app, request, PASSWORD, resetDb, createUser, loginAs } = require('./helpers')

beforeEach(resetDb)

describe('POST /auth/register', () => {
  it('регистрирует пользователя и не отдаёт пароль', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'new@test.ru', name: 'Новый', password: 'qwerty123' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ email: 'new@test.ru', role: 'USER' })
    expect(res.body.password).toBeUndefined()
  })

  it('возвращает 409 для занятого email', async () => {
    await createUser('taken@test.ru')

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'taken@test.ru', name: 'Другой', password: 'qwerty123' })

    expect(res.status).toBe(409)
  })

  it('возвращает 400 при невалидных данных', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'nope', password: '1' })

    expect(res.status).toBe(400)
    expect(res.body.details.map((d) => d.field)).toEqual(expect.arrayContaining(['email', 'name', 'password']))
  })
})

describe('POST /auth/login', () => {
  it('выдаёт access token и refresh token в httpOnly cookie', async () => {
    await createUser('user@test.ru')

    const res = await request(app).post('/auth/login').send({ email: 'user@test.ru', password: PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toEqual(expect.any(String))
    const cookie = res.headers['set-cookie'].join(';')
    expect(cookie).toMatch(/refreshToken=/)
    expect(cookie).toMatch(/HttpOnly/)
  })

  it('возвращает 401 при неверном пароле', async () => {
    await createUser('user@test.ru')

    const res = await request(app).post('/auth/login').send({ email: 'user@test.ru', password: 'wrong-pass' })

    expect(res.status).toBe(401)
    expect(res.body.accessToken).toBeUndefined()
  })
})

describe('GET /auth/me', () => {
  it('возвращает текущего пользователя по токену', async () => {
    await createUser('me@test.ru')
    const token = await loginAs('me@test.ru')

    const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('me@test.ru')
  })

  it('возвращает 401 без токена', async () => {
    const res = await request(app).get('/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('refresh и logout', () => {
  it('обновляет access token по cookie, после logout cookie больше не работает', async () => {
    await createUser('r@test.ru')
    const agent = request.agent(app)
    await agent.post('/auth/login').send({ email: 'r@test.ru', password: PASSWORD })

    const refreshed = await agent.post('/auth/refresh')
    expect(refreshed.status).toBe(200)
    expect(refreshed.body.accessToken).toEqual(expect.any(String))

    const oldCookie = refreshed.headers['set-cookie'][0].split(';')[0]
    const logout = await agent.post('/auth/logout')
    expect(logout.status).toBe(204)

    const reused = await request(app).post('/auth/refresh').set('Cookie', oldCookie)
    expect(reused.status).toBe(401)
  })
})

describe('безопасность', () => {
  it('helmet выставляет защитные заголовки', async () => {
    const res = await request(app).get('/auth/me')

    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('режет тело запроса больше 10kb', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'big@test.ru', name: 'x'.repeat(11 * 1024), password: 'qwerty123' })

    expect(res.status).toBe(413)
  })

  it('после 10 попыток входа отвечает 429', async () => {
    const statuses = []
    for (let i = 0; i < 12; i++) {
      const res = await request(app).post('/auth/login').send({ email: 'x@test.ru', password: 'bad' })
      statuses.push(res.status)
    }

    expect(statuses.at(-1)).toBe(429)
  })
})
