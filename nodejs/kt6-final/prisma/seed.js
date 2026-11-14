const bcrypt = require('bcrypt')
const prisma = require('../src/db')
const seed = require('./seed-data.json')

const day = 24 * 60 * 60 * 1000
const inDays = (n) => new Date(Date.now() + n * day)

async function main() {
  await prisma.comment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash(seed.password, 10)

  const users = {}
  for (const user of seed.users) {
    users[user.email] = (await prisma.user.create({ data: { ...user, password } })).id
  }

  const projects = {}
  for (const { owner, ...project } of seed.projects) {
    projects[project.title] = (await prisma.project.create({ data: { ...project, ownerId: users[owner] } })).id
  }

  const tasks = {}
  for (const { project, author, assignee, dueInDays, ...task } of seed.tasks) {
    const created = await prisma.task.create({
      data: {
        ...task,
        projectId: projects[project],
        authorId: users[author],
        assigneeId: assignee ? users[assignee] : null,
        dueDate: dueInDays === undefined ? null : inDays(dueInDays),
      },
    })
    tasks[task.title] = created.id
  }

  for (const { task, author, text } of seed.comments) {
    await prisma.comment.create({ data: { text, taskId: tasks[task], authorId: users[author] } })
  }

  console.log(`Тестовые данные добавлены. Пользователи: admin@, ivan@, olga@example.com, пароль ${seed.password}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
