const { createUser, api } = require('./helpers')

let owner, worker, stranger, project

beforeEach(async () => {
  owner = await createUser('owner@mail.ru')
  worker = await createUser('worker@mail.ru')
  stranger = await createUser('stranger@mail.ru')
  project = (await api(owner).post('/api/projects', { title: 'Сайт' })).body.data
})

const createTask = (user, body) => api(user).post('/api/tasks', { projectId: project.id, ...body })

describe('задачи', () => {
  it('создаёт задачу с исполнителем', async () => {
    const res = await createTask(owner, { title: 'Сверстать шапку', priority: 'HIGH', assigneeId: worker.id })

    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({
      status: 'TODO',
      priority: 'HIGH',
      authorId: owner.id,
      assignee: { id: worker.id },
    })
  })

  it('не создаёт задачу в несуществующем проекте и с неверным статусом', async () => {
    const noProject = await api(owner).post('/api/tasks', { title: 'Задача', projectId: 999 })
    const badStatus = await createTask(owner, { title: 'Задача', status: 'SOMEDAY' })

    expect(noProject.status).toBe(400)
    expect(badStatus.status).toBe(400)
    expect(badStatus.body.error.details[0].field).toBe('status')
  })

  it('фильтрует по статусу и приоритету, считает meta', async () => {
    await createTask(owner, { title: 'Первая', status: 'TODO', priority: 'HIGH' })
    await createTask(owner, { title: 'Вторая', status: 'TODO', priority: 'LOW' })
    await createTask(owner, { title: 'Третья', status: 'DONE', priority: 'HIGH' })
    await createTask(owner, { title: 'Четвёртая', status: 'TODO', priority: 'HIGH' })

    const res = await api(stranger).get(`/api/tasks?projectId=${project.id}&status=TODO&priority=HIGH&limit=1`)

    expect(res.status).toBe(200)
    expect(res.body.meta).toEqual({ total: 2, page: 1, limit: 1, pages: 2 })
    expect(res.body.data[0].title).toBe('Четвёртая')
  })

  it('исполнитель может менять только статус', async () => {
    const task = (await createTask(owner, { title: 'Задача', assigneeId: worker.id })).body.data

    const status = await api(worker).patch(`/api/tasks/${task.id}`, { status: 'IN_PROGRESS' })
    const title = await api(worker).patch(`/api/tasks/${task.id}`, { title: 'Переименовал' })

    expect(status.status).toBe(200)
    expect(status.body.data.status).toBe('IN_PROGRESS')
    expect(title.status).toBe(403)
  })

  it('посторонний не может удалить задачу, владелец проекта может', async () => {
    const task = (await createTask(worker, { title: 'Задача от worker' })).body.data

    const byStranger = await api(stranger).delete(`/api/tasks/${task.id}`)
    const byOwner = await api(owner).delete(`/api/tasks/${task.id}`)

    expect(byStranger.status).toBe(403)
    expect(byOwner.status).toBe(204)
  })
})

describe('комментарии', () => {
  it('добавляет комментарий и показывает его в задаче', async () => {
    const task = (await createTask(owner, { title: 'Задача' })).body.data

    const created = await api(worker).post(`/api/tasks/${task.id}/comments`, { text: 'Возьму на себя' })
    const details = await api(owner).get(`/api/tasks/${task.id}`)

    expect(created.status).toBe(201)
    expect(details.body.data.comments).toHaveLength(1)
    expect(details.body.data.comments[0].author.id).toBe(worker.id)
  })

  it('чужой комментарий удалить нельзя', async () => {
    const task = (await createTask(owner, { title: 'Задача' })).body.data
    const comment = (await api(worker).post(`/api/tasks/${task.id}/comments`, { text: 'мой' })).body.data

    const byStranger = await api(stranger).delete(`/api/comments/${comment.id}`)
    const byAuthor = await api(worker).delete(`/api/comments/${comment.id}`)

    expect(byStranger.status).toBe(403)
    expect(byAuthor.status).toBe(204)
  })
})
