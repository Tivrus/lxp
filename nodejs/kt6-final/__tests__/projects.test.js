const { prisma, createUser, api } = require('./helpers')

let owner, stranger, admin

beforeEach(async () => {
  owner = await createUser('owner@mail.ru')
  stranger = await createUser('stranger@mail.ru')
  admin = await createUser('admin@mail.ru', 'ADMIN')
})

const createProject = (user, title = 'Проект') =>
  api(user)
    .post('/api/projects', { title })
    .then((res) => res.body.data)

describe('проекты', () => {
  it('без токена создать проект нельзя', async () => {
    const res = await api().post('/api/projects', { title: 'Аноним' })
    expect(res.status).toBe(401)
  })

  it('создаёт проект, владелец = текущий пользователь', async () => {
    const res = await api(owner).post('/api/projects', { title: 'Сайт', description: 'лендинг' })

    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ title: 'Сайт', ownerId: owner.id, owner: { id: owner.id } })
  })

  it('список поддерживает поиск и пагинацию', async () => {
    for (const title of ['Сайт кофейни', 'Сайт пекарни', 'Бот', 'САЙТ барбершопа']) {
      await createProject(owner, title)
    }

    const res = await api(stranger).get('/api/projects?search=сайт&limit=2&page=2')

    expect(res.status).toBe(200)
    expect(res.body.meta).toEqual({ total: 3, page: 2, limit: 2, pages: 2 })
    expect(res.body.data).toHaveLength(1)
  })

  it('чужой проект нельзя изменить или удалить', async () => {
    const project = await createProject(owner)

    const patch = await api(stranger).patch(`/api/projects/${project.id}`, { title: 'Моё' })
    const del = await api(stranger).delete(`/api/projects/${project.id}`)

    expect(patch.status).toBe(403)
    expect(del.status).toBe(403)
  })

  it('владелец меняет и удаляет свой проект', async () => {
    const project = await createProject(owner)

    const patch = await api(owner).patch(`/api/projects/${project.id}`, { title: 'Новое имя' })
    const del = await api(owner).delete(`/api/projects/${project.id}`)

    expect(patch.status).toBe(200)
    expect(patch.body.data.title).toBe('Новое имя')
    expect(del.status).toBe(204)
    expect(await prisma.project.count()).toBe(0)
  })

  it('админ может удалить чужой проект', async () => {
    const project = await createProject(owner)

    const res = await api(admin).delete(`/api/projects/${project.id}`)

    expect(res.status).toBe(204)
  })

  it('несуществующий проект: 404, кривой id: 400', async () => {
    expect((await api(owner).get('/api/projects/999')).status).toBe(404)
    expect((await api(owner).get('/api/projects/abc')).status).toBe(400)
  })
})
